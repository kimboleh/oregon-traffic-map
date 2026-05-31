using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using OdotTrafficIncidentMap.Models;
using OdotTrafficIncidentMap.Services;

namespace OdotTrafficIncidentMap.Controllers;

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
            var incidents = await _incidentService.GetActiveIncidentsAsync();
            return Ok(incidents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve incidents");
            return StatusCode(500, "Failed to retrieve incident data");
        }
    }
}