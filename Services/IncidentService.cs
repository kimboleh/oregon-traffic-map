using System.Text.Json;
using OdotTrafficIncidentMap.Models;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace OdotTrafficIncidentMap.Services;

public class IncidentService : IIncidentService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IncidentService> _logger;
    private readonly IConfiguration _configuration;

    public IncidentService(IHttpClientFactory httpClientFactory, ILogger<IncidentService> logger, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient("TripCheck");
        _logger = logger;
        _configuration = configuration;
    }

    /**
      * Makes an HTTP request from the ODOT TripCheck data and returns an array
      * of Incidents.
      */
    public async Task<List<Incident>> GetActiveIncidentsAsync()
    {
        var apiKey = _configuration["TripCheck:ApiKey"];
        var request = new HttpRequestMessage(HttpMethod.Get,
            "https://api.odot.state.or.us/tripcheck/Incidents?IsActive=true");
        request.Headers.Add("Ocp-Apim-Subscription-Key", apiKey);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var root = JsonSerializer.Deserialize<JsonElement>(json);

        var incidents = new List<Incident>();

        foreach (var item in root.GetProperty("incidents").EnumerateArray())
        {
            var location = item.GetProperty("location");
            var startLocation = location.GetProperty("start-location");

            incidents.Add(new Incident
            {
                IncidentId = GetString(item, "incident-id"),
                EventTypeId = GetString(item, "event-type-id"),
                Headline = GetString(item, "headline"),
                Severity = GetString(item, "impact-desc"),
                SeverityId = GetString(item, "severity-id"),
                Comments = GetString(item, "comments"),
                IsActive = GetString(item, "is-active") == "true",
                StartTime = GetDateTime(item, "create-time"),
                UpdateTime = GetDateTime(item, "update-time"),
                Route = GetString(location, "route-id"),
                LocationName = GetString(location, "location-name"),
                Direction = GetString(location, "direction"),
                Latitude = GetDouble(startLocation, "start-lat"),
                Longitude = GetDouble(startLocation, "start-long"),
                Milepost = GetDouble(startLocation, "start-milepost")
            });
        }
        
        return incidents;
    }

    // Helper Methods
    private static string? GetString(JsonElement el, string field) =>
        el.TryGetProperty(field, out var val) && val.ValueKind != JsonValueKind.Null
            ? val.GetString() : null;

    private static double? GetDouble(JsonElement el, string field) =>
        el.TryGetProperty(field, out var val) && val.ValueKind == JsonValueKind.Number
            ? val.GetDouble() : null;

    private static DateTime? GetDateTime(JsonElement el, string field) =>
        el.TryGetProperty(field, out var val) && val.ValueKind != JsonValueKind.Null
            ? DateTime.Parse(val.GetString()!) : null;
}