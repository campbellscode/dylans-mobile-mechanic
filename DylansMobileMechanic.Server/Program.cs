using System.Threading.RateLimiting;
using DylansMobileMechanic.Server.Options;
using DylansMobileMechanic.Server.Services;
using Microsoft.AspNetCore.RateLimiting;

namespace DylansMobileMechanic.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.Configure<ServiceAreaOptions>(builder.Configuration.GetSection("ServiceArea"));
            builder.Services.Configure<GoogleMapsOptions>(builder.Configuration.GetSection("GoogleMaps"));

            builder.Services.AddHttpClient<IRouteDistanceService, GoogleRouteDistanceService>(client =>
            {
                client.Timeout = TimeSpan.FromSeconds(12);
            });

            // "Check My Address" is a public, anonymous, low-cost-per-call
            // endpoint (billed Google Routes API usage) — keep it modest.
            builder.Services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddFixedWindowLimiter("service-area-check", limiterOptions =>
                {
                    limiterOptions.PermitLimit = 10;
                    limiterOptions.Window = TimeSpan.FromMinutes(1);
                    limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                    limiterOptions.QueueLimit = 0;
                });
            });

            var app = builder.Build();

            app.UseDefaultFiles();
            app.MapStaticAssets();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.UseRateLimiter();

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
