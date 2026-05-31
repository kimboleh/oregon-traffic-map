using OdotTrafficIncidentMap.Models;

namespace OdotTrafficIncidentMap.Services;

public interface IIncidentService
{
    Task<List<Incident>> GetActiveIncidentsAsync();
}