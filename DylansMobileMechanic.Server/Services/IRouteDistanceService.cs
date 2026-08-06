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
        /// <summary>True when this service has everything it needs (the API
        /// key) to attempt a call. Lets the controller report a
        /// configuration problem distinctly from a provider failure.</summary>
        bool IsConfigured { get; }

        Task<RouteDistanceResult?> GetDrivingDistanceAsync(
            string originAddress,
            double destinationLatitude,
            double destinationLongitude,
            CancellationToken cancellationToken);
    }
}
