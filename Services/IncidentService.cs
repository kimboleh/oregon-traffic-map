using System.Text.Json;
using OdotTrafficIncidentMap.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace OdotTrafficIncidentMap.Services;

public class IncidentService : IIncidentService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IncidentService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "active_incidents";
    private record CachedResult(List<Incident> Incidents, DateTime CachedAt);

    public IncidentService(IHttpClientFactory httpClientFactory, ILogger<IncidentService> logger, IConfiguration configuration, IMemoryCache cache)
    {
        _httpClient = httpClientFactory.CreateClient("TripCheck");
        _logger = logger;
        _configuration = configuration;
        _cache = cache;
    }

    /// <summary>
    /// Gets the active incidents either from the cache, or, if the cache is out of
    /// date or empty, calls the FetchFromTripCheckAsync method.
    /// </summary>
    public async Task<IncidentResponse> GetActiveIncidentsAsync()
    {
        List<Incident> incidents;
        DateTime cachedAt;
        
        // if the cache key is still valid and cache isn't empty, grab incidents from cache
        if (_cache.TryGetValue(CacheKey, out CachedResult? cached) && cached != null)
        {
            _logger.LogInformation("Returning cached incidents");
            incidents = cached.Incidents;
            cachedAt = cached.CachedAt;
        }
        // otherwise, make the fetch request and reset the cache key
        else 
        {
            incidents = await FetchFromTripCheckAsync();
            cachedAt = DateTime.UtcNow;

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

            _cache.Set(CacheKey, new CachedResult(incidents, cachedAt), cacheOptions);
            _logger.LogInformation("Cached {Count} incidents", incidents.Count);
            _logger.LogInformation("Cached at {cachedAt}", cachedAt);
        }

        return new IncidentResponse {
            Incidents = incidents,
            CachedAt = cachedAt,
            Count = incidents.Count
        };
    }

    /// <summary>
    /// Makes an HTTP request from the ODOT TripCheck data and returns an array
    /// of Incidents. Should only be called if the cache is empty or out of date.
    /// </summary>
    private async Task<List<Incident>> FetchFromTripCheckAsync()
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