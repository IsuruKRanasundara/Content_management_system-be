using System;
using CMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly CmsDbContext _context;

        public HealthController(CmsDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("database")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                return canConnect
                    ? Ok(new { status = "Healthy", message = "Database connection successful." })
                    : StatusCode(503, new { status = "Unhealthy", message = "Database connection failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(503, new { status = "Unhealthy", message = ex.Message });
            }
        }
    }
}
