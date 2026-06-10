namespace OdotTrafficIncidentMap.Models;

public class IncidentResponse
{
    public List<Incident> Incidents { get; set; } = new();
    public DateTime CachedAt { get; set; }
    public int Count { get; set; }
}