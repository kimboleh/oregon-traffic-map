using Microsoft.AspNetCore.Mvc;

namespace OdotTrafficIncidentMap.Controllers;

public class OdotMapController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}