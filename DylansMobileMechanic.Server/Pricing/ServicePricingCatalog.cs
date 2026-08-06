namespace DylansMobileMechanic.Server.Pricing
{
    public enum ServicePricingType
    {
        ManualReview,
        Flat,
        StartingPrice,
        StartingLabor,
        Hourly,
    }

    public sealed record ServicePricingDefinition(
        string Code,
        string Name,
        ServicePricingType PricingType,
        decimal? Amount);

    /// <summary>
    /// The one authoritative source for service pricing. React's dropdown
    /// (SERVICE_CATALOG in Contact.jsx) exists only to render option labels
    /// in the right order — it is never trusted for a price, a pricing
    /// type, or a subtotal. Everything money-related is calculated here.
    /// </summary>
    public static class ServicePricingCatalog
    {
        public const decimal StandardLaborRatePerHour = 100.00m;
        public const decimal TravelRatePerRoundTripMile = 1.00m;
        public const decimal MinimumMobileServiceFee = 25.00m;
        public const string NotSureYetCode = "not-sure-yet";

        public static readonly IReadOnlyList<ServicePricingDefinition> All = new List<ServicePricingDefinition>
        {
            new(NotSureYetCode, "Not sure yet", ServicePricingType.ManualReview, null),
            new("diagnostic", "Diagnostic", ServicePricingType.Flat, 100m),
            new("brake-service", "Brake Service", ServicePricingType.StartingPrice, 150m),
            new("oil-changes", "Oil Changes", ServicePricingType.StartingPrice, 89.99m),
            new("tune-ups", "Tune-Ups", ServicePricingType.StartingPrice, 150m),
            new("ac-service", "A/C Service", ServicePricingType.StartingPrice, 125m),
            new("battery-replacement", "Battery Replacement", ServicePricingType.StartingLabor, 50m),
            new("alternator-replacement", "Alternator Replacement", ServicePricingType.StartingLabor, 200m),
            new("starter-replacement", "Starter Replacement", ServicePricingType.StartingLabor, 200m),
            new("cooling-system-repairs", "Cooling System Repairs", ServicePricingType.StartingPrice, 100m),
            new("suspension-repairs", "Suspension Repairs", ServicePricingType.StartingPrice, 150m),
            new("electrical-diagnosis", "Electrical Diagnosis", ServicePricingType.Hourly, 100m),
            // Not in the original spec list — added so selecting "Other" in
            // the dropdown (which does exist in React's catalog) resolves
            // to a valid code instead of failing validation. Treated the
            // same as "Not sure yet".
            new("other", "Other", ServicePricingType.ManualReview, null),
        };

        private static readonly IReadOnlyDictionary<string, ServicePricingDefinition> ByCode =
            All.ToDictionary(d => d.Code, d => d, StringComparer.OrdinalIgnoreCase);

        public static bool TryGet(string? code, out ServicePricingDefinition definition)
        {
            if (code is not null && ByCode.TryGetValue(code, out var found))
            {
                definition = found;
                return true;
            }

            definition = null!;
            return false;
        }
    }
}
