namespace DylansMobileMechanic.Server.Services
{
    public record RouteDistanceResult(double DistanceMiles, int DurationMinutes);

    /// <summary>
    /// Resolves real driving distance/time between two points. Never falls back
    /// to straight-line distance — a null result means the caller must tell the
    /// visitor the automatic check is unavailable, not silently estimate.
    /// </summary>
    public interface IRouteDistanceService
    {
        Task<RouteDistanceResult?> GetDrivingDistanceAsync(
            double originLatitude,
            double originLongitude,
            double destinationLatitude,
            double destinationLongitude,
            CancellationToken cancellationToken);
    }
}
