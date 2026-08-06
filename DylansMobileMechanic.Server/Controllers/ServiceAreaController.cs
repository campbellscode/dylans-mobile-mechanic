using DylansMobileMechanic.Server.Options;
using DylansMobileMechanic.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace DylansMobileMechanic.Server.Controllers
{
    public record ServiceAreaCheckRequest(double Latitude, double Longitude);

    public record ServiceAreaCheckResponse(
        bool WithinServiceArea,
        double DistanceMiles,
        int DurationMinutes,
        double RadiusMiles);

    public record ServiceAreaErrorResponse(string Error);

    [ApiController]
    [Route("api/service-area")]
    [EnableRateLimiting("service-area-check")]
    public class ServiceAreaController : ControllerBase
    {
        private readonly IRouteDistanceService _routeDistanceService;
        private readonly ServiceAreaOptions _serviceArea;
        private readonly ILogger<ServiceAreaController> _logger;

        public ServiceAreaController(
            IRouteDistanceService routeDistanceService,
            IOptions<ServiceAreaOptions> serviceArea,
            ILogger<ServiceAreaController> logger)
        {
            _routeDistanceService = routeDistanceService;
            _serviceArea = serviceArea.Value;
            _logger = logger;
        }

        /// <summary>
        /// Checks real driving distance from the configured service base to the
        /// visitor's coordinates. Anonymous and rate-limited (public homepage
        /// feature). Coordinates are used only for this one calculation — never
        /// logged, stored, or echoed back.
        /// </summary>
        [HttpPost("check")]
        public async Task<IActionResult> Check(
            [FromBody] ServiceAreaCheckRequest? request,
            CancellationToken cancellationToken)
        {
            if (request is null ||
                !IsValidCoordinate(request.Latitude, -90, 90) ||
                !IsValidCoordinate(request.Longitude, -180, 180))
            {
                return BadRequest(new ServiceAreaErrorResponse("invalid_coordinates"));
            }

            // Distinguish "we're not configured" from "the provider failed" —
            // both look identical to a visitor, but they need different fixes.
            // Logged as booleans only: never the key, never the address.
            var apiKeyConfigured = _routeDistanceService.IsConfigured;
            var originConfigured = !string.IsNullOrWhiteSpace(_serviceArea.OriginAddress);

            if (!apiKeyConfigured || !originConfigured)
            {
                _logger.LogError(
                    "Service area configuration missing: ApiKeyConfigured={ApiKeyConfigured}, OriginConfigured={OriginConfigured}.",
                    apiKeyConfigured, originConfigured);
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ServiceAreaErrorResponse("route_configuration_unavailable"));
            }

            var result = await _routeDistanceService.GetDrivingDistanceAsync(
                _serviceArea.OriginAddress,
                request.Latitude,
                request.Longitude,
                cancellationToken);

            if (result is null)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new ServiceAreaErrorResponse("route_service_unavailable"));
            }

            var response = new ServiceAreaCheckResponse(
                WithinServiceArea: result.DistanceMiles <= _serviceArea.RadiusMiles,
                DistanceMiles: result.DistanceMiles,
                DurationMinutes: result.DurationMinutes,
                RadiusMiles: _serviceArea.RadiusMiles);

            return Ok(response);
        }

        private static bool IsValidCoordinate(double value, double min, double max) =>
            !double.IsNaN(value) && !double.IsInfinity(value) && value >= min && value <= max;
    }
}
