namespace DylansMobileMechanic.Server.Services
{
    public enum RouteDistanceFailure
    {
        None,
        InvalidRequest,
        Unauthorized,
        RateLimited,
        Unavailable,
        Timeout,
        RouteNotFound,
        InvalidResponse,
    }

    public sealed record RouteDistanceResult(
        bool Success,
        double? DistanceMiles,
        int? DurationMinutes,
        RouteDistanceFailure Failure)
    {
        public static RouteDistanceResult Ok(double distanceMiles, int durationMinutes) =>
            new(true, distanceMiles, durationMinutes, RouteDistanceFailure.None);

        public static RouteDistanceResult Fail(RouteDistanceFailure failure) =>
            new(false, null, null, failure);
    }

    /// <summary>
    /// Resolves real driving distance/time between two points. Never falls back
    /// to straight-line distance — a failed result means the caller must tell
    /// the visitor the automatic check is unavailable, not silently estimate.
    /// </summary>
    public interface IRouteDistanceService
    {
        /// <summary>True when this service has everything it needs (the API
        /// key) to attempt a call. Lets the controller report a
        /// configuration problem distinctly from a provider failure.</summary>
        bool IsConfigured { get; }

        Task<RouteDistanceResult> GetDrivingDistanceAsync(
            string originAddress,
            double destinationLatitude,
            double destinationLongitude,
            string traceId,
            CancellationToken cancellationToken);

        /// <summary>Same computation, but the destination is a street address
        /// (the customer's entered service address) rather than coordinates —
        /// used by the quote workflow, never by Check My Address.</summary>
        Task<RouteDistanceResult> GetDrivingDistanceToAddressAsync(
            string originAddress,
            string destinationAddress,
            string traceId,
            CancellationToken cancellationToken);
    }
}
