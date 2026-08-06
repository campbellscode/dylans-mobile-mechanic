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
    /// distance/time. Every failure path (missing key, timeout, non-success
    /// response, unparsable body, no route) returns null — callers must not
    /// substitute an estimate.
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

        public async Task<RouteDistanceResult?> GetDrivingDistanceAsync(
            string originAddress,
            double destinationLatitude,
            double destinationLongitude,
            CancellationToken cancellationToken)
        {
            if (!IsConfigured)
            {
                _logger.LogError("Google Routes API key is not configured; cannot compute driving distance.");
                return null;
            }

            var requestBody = new ComputeRoutesRequest
            {
                Origin = new OriginWaypoint { Address = originAddress },
                Destination = new DestinationWaypoint { Location = new RouteLocation { LatLng = new RouteLatLng { Latitude = destinationLatitude, Longitude = destinationLongitude } } },
                TravelMode = "DRIVE",
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, ComputeRoutesUrl)
            {
                Content = JsonContent.Create(requestBody),
            };
            request.Headers.Add("X-Goog-Api-Key", _googleMaps.RoutesApiKey);
            request.Headers.Add("X-Goog-FieldMask", "routes.distanceMeters,routes.duration");

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.SendAsync(request, cancellationToken);
            }
            catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Google Routes API request timed out.");
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, "Google Routes API request failed.");
                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Google Routes API returned a non-success status: {StatusCode}.", response.StatusCode);
                return null;
            }

            ComputeRoutesResponse? parsed;
            try
            {
                parsed = await response.Content.ReadFromJsonAsync<ComputeRoutesResponse>(cancellationToken: cancellationToken);
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to parse Google Routes API response.");
                return null;
            }

            var route = parsed?.Routes?.FirstOrDefault();
            if (route is null || route.DistanceMeters <= 0)
            {
                _logger.LogWarning("Google Routes API returned no usable route.");
                return null;
            }

            var distanceMiles = Math.Round(route.DistanceMeters / 1609.344, 1);
            var durationMinutes = ParseDurationMinutes(route.Duration);

            return new RouteDistanceResult(distanceMiles, durationMinutes);
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
            public required OriginWaypoint Origin { get; set; }

            [JsonPropertyName("destination")]
            public required DestinationWaypoint Destination { get; set; }

            [JsonPropertyName("travelMode")]
            public required string TravelMode { get; set; }
        }

        /// <summary>Dylan's configured service-base address — geocoded by
        /// Google, not resolved to lat/lng on our side.</summary>
        private class OriginWaypoint
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
    }
}
