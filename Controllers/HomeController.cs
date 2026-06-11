using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using OdotTrafficIncidentMap.Models;

namespace OdotTrafficIncidentMap.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
    
    [Route("privacy")]
    public IActionResult Privacy()
    {
        return View();
    }

    [Route("changelog")]
    public IActionResult Changelog()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
