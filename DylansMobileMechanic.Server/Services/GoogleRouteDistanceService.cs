using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DylansMobileMechanic.Server.Options;
using Microsoft.Extensions.Options;

namespace DylansMobileMechanic.Server.Services
{
    /// <summary>
    /// Calls Google Maps Platform Routes API (computeRoutes) for real driving
    /// distance/time. Every failure path returns a typed RouteDistanceResult
    /// with a specific RouteDistanceFailure — never null, never a bare bool —
    /// so callers (and the logs) can tell a bad key apart from a timeout
    /// apart from "no route exists." Both public methods (coordinate
    /// destination for Check My Address, address destination for the quote
    /// workflow) share one HTTP/parsing/classification path.
    /// </summary>
    public class GoogleRouteDistanceService : IRouteDistanceService
    {
        private const string ComputeRoutesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";

        private readonly HttpClient _httpClient;
        private readonly GoogleMapsOptions _googleMaps;
        private readonly ILogger<GoogleRouteDistanceService> _logger;

        public GoogleRouteDistanceService(
            HttpClient httpClient,
            IOptions<GoogleMapsOptions> googleMaps,
            ILogger<GoogleRouteDistanceService> logger)
        {
            _httpClient = httpClient;
            _googleMaps = googleMaps.Value;
            _logger = logger;
        }

        public bool IsConfigured => !string.IsNullOrWhiteSpace(_googleMaps.RoutesApiKey);

        public Task<RouteDistanceResult> GetDrivingDistanceAsync(
            string originAddress,
            double destinationLatitude,
            double destinationLongitude,
            string traceId,
            CancellationToken cancellationToken)
        {
            var requestBody = new ComputeRoutesRequest
            {
                Origin = new AddressWaypoint { Address = originAddress },
                Destination = new DestinationWaypoint { Location = new RouteLocation { LatLng = new RouteLatLng { Latitude = destinationLatitude, Longitude = destinationLongitude } } },
                TravelMode = "DRIVE",
            };

            return ExecuteComputeRoutesAsync(requestBody, "latLng", traceId, cancellationToken);
        }

        public Task<RouteDistanceResult> GetDrivingDistanceToAddressAsync(
            string originAddress,
            string destinationAddress,
            string traceId,
            CancellationToken cancellationToken)
        {
            var requestBody = new ComputeRoutesRequest
            {
                Origin = new AddressWaypoint { Address = originAddress },
                Destination = new AddressWaypoint { Address = destinationAddress },
                TravelMode = "DRIVE",
            };

            return ExecuteComputeRoutesAsync(requestBody, "address", traceId, cancellationToken);
        }

        private async Task<RouteDistanceResult> ExecuteComputeRoutesAsync(
            ComputeRoutesRequest requestBody,
            string destinationType,
            string traceId,
            CancellationToken cancellationToken)
        {
            if (!IsConfigured)
            {
                // Both controllers already gate on IsConfigured before calling,
                // so reaching this normally shouldn't happen — defensive only.
                _logger.LogError("Google Routes API key is not configured. TraceId={TraceId}.", traceId);
                return RouteDistanceResult.Fail(RouteDistanceFailure.Unavailable);
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, ComputeRoutesUrl)
            {
                Content = JsonContent.Create(requestBody),
            };
            request.Headers.Add("X-Goog-Api-Key", _googleMaps.RoutesApiKey);
            request.Headers.Add("X-Goog-FieldMask", "routes.distanceMeters,routes.duration");
            var fieldMaskPresent = request.Headers.Contains("X-Goog-FieldMask");

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.SendAsync(request, cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                // The caller's request was aborted — not a provider failure.
                // Preserve normal ASP.NET Core cancellation behavior.
                throw;
            }
            catch (OperationCanceledException)
            {
                // Cancelled, but not by the caller's token — this is the
                // HttpClient's own configured Timeout firing.
                _logger.LogWarning(
                    "Google Routes request timed out. TraceId={TraceId}, Failure={Failure}, OriginType=address, DestinationType={DestinationType}.",
                    traceId, RouteDistanceFailure.Timeout, destinationType);
                return RouteDistanceResult.Fail(RouteDistanceFailure.Timeout);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(
                    "Google Routes network/TLS failure. TraceId={TraceId}, ExceptionType={ExceptionType}, Failure={Failure}, OriginType=address, DestinationType={DestinationType}.",
                    traceId, ex.GetType().Name, RouteDistanceFailure.Unavailable, destinationType);
                return RouteDistanceResult.Fail(RouteDistanceFailure.Unavailable);
            }

            if (!response.IsSuccessStatusCode)
            {
                // Only code/status are extracted — error.message is never read
                // into a variable, since Google can echo request details
                // (e.g. the origin or destination address) back inside it.
                string? googleStatus = null;
                try
                {
                    var errorEnvelope = await response.Content.ReadFromJsonAsync<GoogleErrorEnvelope>(cancellationToken: cancellationToken);
                    googleStatus = errorEnvelope?.Error?.Status;
                }
                catch (JsonException)
                {
                    // Error body wasn't the expected shape — proceed with just the HTTP status.
                }

                var failure = ClassifyFailure(response.StatusCode, googleStatus);
                _logger.LogWarning(
                    "Google Routes request failed. TraceId={TraceId}, HttpStatus={HttpStatus}, GoogleStatus={GoogleStatus}, Failure={Failure}, FieldMaskPresent={FieldMaskPresent}, OriginType={OriginType}, DestinationType={DestinationType}",
                    traceId, (int)response.StatusCode, googleStatus ?? "(none)", failure, fieldMaskPresent, "address", destinationType);
                return RouteDistanceResult.Fail(failure);
            }

            ComputeRoutesResponse? parsed;
            try
            {
                parsed = await response.Content.ReadFromJsonAsync<ComputeRoutesResponse>(cancellationToken: cancellationToken);
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(
                    "Failed to parse Google Routes response JSON. TraceId={TraceId}, ExceptionType={ExceptionType}, Failure={Failure}.",
                    traceId, ex.GetType().Name, RouteDistanceFailure.InvalidResponse);
                return RouteDistanceResult.Fail(RouteDistanceFailure.InvalidResponse);
            }

            var route = parsed?.Routes?.FirstOrDefault();
            if (route is null)
            {
                _logger.LogWarning("Google Routes response contained no routes. TraceId={TraceId}, Failure={Failure}.", traceId, RouteDistanceFailure.RouteNotFound);
                return RouteDistanceResult.Fail(RouteDistanceFailure.RouteNotFound);
            }

            if (route.DistanceMeters <= 0)
            {
                _logger.LogWarning("Google Routes response had an invalid distance. TraceId={TraceId}, Failure={Failure}.", traceId, RouteDistanceFailure.InvalidResponse);
                return RouteDistanceResult.Fail(RouteDistanceFailure.InvalidResponse);
            }

            var distanceMiles = Math.Round(route.DistanceMeters / 1609.344, 1);
            var durationMinutes = ParseDurationMinutes(route.Duration);

            return RouteDistanceResult.Ok(distanceMiles, durationMinutes);
        }

        private static RouteDistanceFailure ClassifyFailure(System.Net.HttpStatusCode httpStatus, string? googleStatus)
        {
            var code = (int)httpStatus;

            if (code == 400 || googleStatus == "INVALID_ARGUMENT")
            {
                return RouteDistanceFailure.InvalidRequest;
            }
            if (code is 401 or 403 || googleStatus is "UNAUTHENTICATED" or "PERMISSION_DENIED")
            {
                return RouteDistanceFailure.Unauthorized;
            }
            if (code == 429 || googleStatus == "RESOURCE_EXHAUSTED")
            {
                return RouteDistanceFailure.RateLimited;
            }
            if (code >= 500)
            {
                return RouteDistanceFailure.Unavailable;
            }

            return RouteDistanceFailure.Unavailable;
        }

        /// <summary>Google returns duration as a string like "1830s".</summary>
        private static int ParseDurationMinutes(string? duration)
        {
            if (string.IsNullOrEmpty(duration))
            {
                return 0;
            }

            var span = duration.AsSpan().TrimEnd('s');
            return double.TryParse(span, NumberStyles.Float, CultureInfo.InvariantCulture, out var seconds)
                ? (int)Math.Round(seconds / 60.0)
                : 0;
        }

        private class ComputeRoutesRequest
        {
            [JsonPropertyName("origin")]
            public required AddressWaypoint Origin { get; set; }

            // Either an AddressWaypoint (quote workflow) or a
            // DestinationWaypoint carrying latLng (Check My Address).
            // System.Text.Json serializes object-typed members using the
            // runtime type's own [JsonPropertyName] attributes, so both
            // shapes come out correctly without a shared base type.
            [JsonPropertyName("destination")]
            public required object Destination { get; set; }

            [JsonPropertyName("travelMode")]
            public required string TravelMode { get; set; }
        }

        /// <summary>An address-only waypoint — used for Dylan's origin
        /// always, and for the customer's destination in the quote
        /// workflow. Geocoded by Google, never resolved to lat/lng here.</summary>
        private class AddressWaypoint
        {
            [JsonPropertyName("address")]
            public required string Address { get; set; }
        }

        private class DestinationWaypoint
        {
            [JsonPropertyName("location")]
            public required RouteLocation Location { get; set; }
        }

        private class RouteLocation
        {
            [JsonPropertyName("latLng")]
            public required RouteLatLng LatLng { get; set; }
        }

        private class RouteLatLng
        {
            [JsonPropertyName("latitude")]
            public double Latitude { get; set; }

            [JsonPropertyName("longitude")]
            public double Longitude { get; set; }
        }

        private class ComputeRoutesResponse
        {
            [JsonPropertyName("routes")]
            public List<ComputeRoutesRoute>? Routes { get; set; }
        }

        private class ComputeRoutesRoute
        {
            [JsonPropertyName("distanceMeters")]
            public long DistanceMeters { get; set; }

            [JsonPropertyName("duration")]
            public string? Duration { get; set; }
        }

        /// <summary>Google's standard error envelope: { "error": { "code", "message", "status" } }.</summary>
        private class GoogleErrorEnvelope
        {
            [JsonPropertyName("error")]
            public GoogleErrorDetail? Error { get; set; }
        }

        private class GoogleErrorDetail
        {
            [JsonPropertyName("code")]
            public int Code { get; set; }

            // Intentionally no "message" property — Google's human-readable
            // error message can echo request details (e.g. an address), so
            // it's never deserialized, held, or logged.

            [JsonPropertyName("status")]
            public string? Status { get; set; }
        }
    }
}
