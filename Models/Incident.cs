namespace OdotTrafficIncidentMap.Models;

public class Incident
{
    public string IncidentId { get; set; }
    public string? EventTypeId { get; set; }
    public string? Headline { get; set; }
    public string? Category { get; set; }
    public string? Severity { get; set; }
    public string? Route { get; set; }
    public double? Milepost { get; set; }
    public string? LocationName { get; set; }
    public string? Direction { get; set; }
    public string? Comments { get; set; }
    public double? Longitude { get; set; }
    public double? Latitude { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? UpdateTime { get; set; }
    public bool IsActive { get; set; }
}