using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using OdotTrafficIncidentMap.Models;
using OdotTrafficIncidentMap.Services;

namespace OdotTrafficIncidentMap.Controllers;

/**
  * Creates an API endpoint at /api/incidents for the app to pull incidents
  * from.
  */
[ApiController]
[Route("api/incidents")]
public class IncidentApiController : ControllerBase
{
    private readonly ILogger<IncidentApiController> _logger;
    private readonly IIncidentService _incidentService;

    public IncidentApiController(IIncidentService incidentService, ILogger<IncidentApiController> logger)
    {
        _incidentService = incidentService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetIncidents()
    {
        try
        {
            // fetch active incidents using the IncidentService class
            var result = await _incidentService.GetActiveIncidentsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve incidents");
            return StatusCode(500, "Failed to retrieve incident data");
        }
    }
}