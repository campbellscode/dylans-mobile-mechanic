using System.Text.RegularExpressions;
using DylansMobileMechanic.Server.Options;
using DylansMobileMechanic.Server.Pricing;
using DylansMobileMechanic.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace DylansMobileMechanic.Server.Controllers
{
    public record QuoteCalculateRequest(
        string? ServiceCode,
        string? StreetAddress,
        string? City,
        string? State,
        string? PostalCode);

    /// <summary>
    /// A preliminary, non-binding estimate — never returns Dylan's origin
    /// address or the customer's normalized address, only the numbers
    /// derived from them.
    /// </summary>
    public record QuoteCalculateResponse(
        string ServiceCode,
        string ServiceName,
        string PricingType,
        string PricingGuidance,
        double OneWayDistanceMiles,
        int OneWayDurationMinutes,
        double? RoundTripBillableMiles,
        decimal? TravelFee,
        double ServiceAreaRadiusMiles,
        bool WithinStandardServiceArea,
        bool CustomTravelQuoteRequired,
        decimal StandardLaborRatePerHour,
        bool PartsQuotedSeparately,
        decimal? EstimatedStartingSubtotal,
        string? Disclaimer,
        string? Message);

    public record QuoteErrorResponse(string Error, string? TraceId = null);

    [ApiController]
    [Route("api/quote")]
    [EnableRateLimiting("quote-calculate")]
    public class QuoteController : ControllerBase
    {
        private const string DisclaimerText =
            "Parts are quoted separately. Final pricing depends on the vehicle, parts required, accessibility, rust or corrosion, and actual repair requirements.";

        private static readonly Regex ZipRegex = new(@"^\d{5}$", RegexOptions.Compiled);
        private static readonly Regex RepeatedWhitespaceRegex = new(@"\s{2,}", RegexOptions.Compiled);

        private readonly IRouteDistanceService _routeDistanceService;
        private readonly ServiceAreaOptions _serviceArea;
        private readonly ILogger<QuoteController> _logger;

        public QuoteController(
            IRouteDistanceService routeDistanceService,
            IOptions<ServiceAreaOptions> serviceArea,
            ILogger<QuoteController> logger)
        {
            _routeDistanceService = routeDistanceService;
            _serviceArea = serviceArea.Value;
            _logger = logger;
        }

        /// <summary>
        /// Runs the quote algorithm: Dylan's configured origin to the
        /// customer-entered service address, via Google Routes, priced
        /// against the server-side catalog. Anonymous and rate-limited
        /// separately from Check My Address. The service address is used
        /// only to build the one outbound Google request — never logged,
        /// stored, or echoed back.
        /// </summary>
        [HttpPost("calculate")]
        public async Task<IActionResult> Calculate(
            [FromBody] QuoteCalculateRequest? request,
            CancellationToken cancellationToken)
        {
            var traceId = HttpContext.TraceIdentifier;

            var serviceCode = NormalizeField(request?.ServiceCode, 64);
            var street = NormalizeField(request?.StreetAddress, 200);
            var city = NormalizeField(request?.City, 100);
            var state = NormalizeField(request?.State, 2)?.ToUpperInvariant();
            var postalCode = NormalizeField(request?.PostalCode, 10);

            if (string.IsNullOrEmpty(serviceCode) || !ServicePricingCatalog.TryGet(serviceCode, out var service))
            {
                return BadRequest(new QuoteErrorResponse("invalid_service_code", traceId));
            }

            var addressValid =
                !string.IsNullOrEmpty(street) &&
                !string.IsNullOrEmpty(city) &&
                !string.IsNullOrEmpty(state) && state.Length == 2 && state.All(char.IsAsciiLetter) &&
                !string.IsNullOrEmpty(postalCode) && ZipRegex.IsMatch(postalCode);

            if (!addressValid)
            {
                return BadRequest(new QuoteErrorResponse("invalid_address", traceId));
            }

            // Same configuration gate as Check My Address, own copy so the
            // two endpoints stay independent (no shared mutable state).
            var apiKeyConfigured = _routeDistanceService.IsConfigured;
            var originConfigured = !string.IsNullOrWhiteSpace(_serviceArea.OriginAddress);
            var radiusConfigured = double.IsFinite(_serviceArea.RadiusMiles) && _serviceArea.RadiusMiles > 0;

            if (!apiKeyConfigured || !originConfigured || !radiusConfigured)
            {
                _logger.LogError(
                    "Quote configuration missing: TraceId={TraceId}, ApiKeyConfigured={ApiKeyConfigured}, OriginConfigured={OriginConfigured}, RadiusConfigured={RadiusConfigured}.",
                    traceId, apiKeyConfigured, originConfigured, radiusConfigured);
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new QuoteErrorResponse("route_configuration_unavailable", traceId));
            }

            // Built only to pass to Google — never logged, never returned.
            var destinationAddress = $"{street}, {city}, {state} {postalCode}";

            var result = await _routeDistanceService.GetDrivingDistanceToAddressAsync(
                _serviceArea.OriginAddress,
                destinationAddress,
                traceId,
                cancellationToken);

            if (!result.Success)
            {
                var (statusCode, errorCode) = MapFailure(result.Failure);
                return StatusCode(statusCode, new QuoteErrorResponse(errorCode, traceId));
            }

            var oneWayMiles = result.DistanceMiles!.Value;
            var withinStandardServiceArea = oneWayMiles <= _serviceArea.RadiusMiles;
            var customTravelQuoteRequired = !withinStandardServiceArea;

            double? roundTripBillableMilesOut = null;
            decimal? travelFeeOut = null;
            decimal? subtotalOut = null;
            string? message = null;
            string? disclaimer = null;

            if (withinStandardServiceArea)
            {
                var roundTripBillableMiles = decimal.Round(Convert.ToDecimal(oneWayMiles * 2d), 2, MidpointRounding.AwayFromZero);
                var rawTravelFee = roundTripBillableMiles * ServicePricingCatalog.TravelRatePerRoundTripMile;
                var travelFee = decimal.Round(Math.Max(ServicePricingCatalog.MinimumMobileServiceFee, rawTravelFee), 2, MidpointRounding.AwayFromZero);

                roundTripBillableMilesOut = (double)roundTripBillableMiles;
                travelFeeOut = travelFee;
                subtotalOut = CalculateSubtotal(service, travelFee);
                disclaimer = DisclaimerText;
            }
            else
            {
                message = $"This address is outside our standard {_serviceArea.RadiusMiles:0.#}-mile service area. Availability and travel pricing require a custom quote.";
            }

            var response = new QuoteCalculateResponse(
                ServiceCode: service.Code,
                ServiceName: service.Name,
                PricingType: ToCamelCase(service.PricingType.ToString()),
                PricingGuidance: BuildPricingGuidance(service),
                OneWayDistanceMiles: oneWayMiles,
                OneWayDurationMinutes: result.DurationMinutes ?? 0,
                RoundTripBillableMiles: roundTripBillableMilesOut,
                TravelFee: travelFeeOut,
                ServiceAreaRadiusMiles: _serviceArea.RadiusMiles,
                WithinStandardServiceArea: withinStandardServiceArea,
                CustomTravelQuoteRequired: customTravelQuoteRequired,
                StandardLaborRatePerHour: ServicePricingCatalog.StandardLaborRatePerHour,
                PartsQuotedSeparately: true,
                EstimatedStartingSubtotal: subtotalOut,
                Disclaimer: disclaimer,
                Message: message);

            return Ok(response);
        }

        private static decimal? CalculateSubtotal(ServicePricingDefinition service, decimal travelFee) => service.PricingType switch
        {
            ServicePricingType.Flat => service.Amount!.Value + travelFee,
            ServicePricingType.StartingPrice => service.Amount!.Value + travelFee,
            ServicePricingType.StartingLabor => service.Amount!.Value + travelFee,
            _ => null, // Hourly and ManualReview never get an invented subtotal.
        };

        private static string BuildPricingGuidance(ServicePricingDefinition service) => service.PricingType switch
        {
            ServicePricingType.Flat => $"${service.Amount:0.##}",
            ServicePricingType.StartingPrice => $"Starting at ${service.Amount:0.##}",
            ServicePricingType.StartingLabor => $"Starting at ${service.Amount:0.##} labor",
            ServicePricingType.Hourly => $"${service.Amount:0.##}/hour plus the mobile service fee and separately quoted parts",
            _ => "Manual review required plus the applicable mobile service fee",
        };

        private static (int StatusCode, string ErrorCode) MapFailure(RouteDistanceFailure failure) => failure switch
        {
            RouteDistanceFailure.InvalidRequest => (StatusCodes.Status503ServiceUnavailable, "route_provider_invalid_request"),
            RouteDistanceFailure.Unauthorized => (StatusCodes.Status503ServiceUnavailable, "route_provider_unauthorized"),
            RouteDistanceFailure.RateLimited => (StatusCodes.Status503ServiceUnavailable, "route_provider_rate_limited"),
            RouteDistanceFailure.Timeout => (StatusCodes.Status504GatewayTimeout, "route_service_timeout"),
            RouteDistanceFailure.RouteNotFound => (StatusCodes.Status503ServiceUnavailable, "route_not_found"),
            RouteDistanceFailure.InvalidResponse => (StatusCodes.Status503ServiceUnavailable, "route_provider_invalid_response"),
            _ => (StatusCodes.Status503ServiceUnavailable, "route_service_unavailable"),
        };

        /// <summary>Trims, strips control characters, collapses repeated
        /// whitespace, and caps length. Returns null for anything left empty.</summary>
        private static string? NormalizeField(string? value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var noControlChars = new string(value.Where(c => !char.IsControl(c)).ToArray());
            var cleaned = RepeatedWhitespaceRegex.Replace(noControlChars, " ").Trim();

            if (cleaned.Length == 0)
            {
                return null;
            }

            return cleaned.Length > maxLength ? cleaned[..maxLength] : cleaned;
        }

        private static string ToCamelCase(string pascalCase) =>
            string.IsNullOrEmpty(pascalCase) ? pascalCase : char.ToLowerInvariant(pascalCase[0]) + pascalCase[1..];
    }
}
