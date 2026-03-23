using ApiForum.Data;
using ApiForum.DTO;
using ApiForum.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApiForum.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ── FRONT : liste publique ──────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var events = await _context.Events
                .Include(e => e.Resources)
                .Include(e => e.Registrations)
                .ToListAsync();
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var evt = await _context.Events
                .Include(e => e.Resources)
                .Include(e => e.Registrations)
                .FirstOrDefaultAsync(e => e.Id == id);
            if (evt == null) return NotFound();
            return Ok(evt);
        }

        // ── BACK : création (Admin / Manager) ──────────────────────────────
        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EventDTO dto)
        {
            var evt = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Resources = dto.Resources.Select(r => new EventResource
                {
                    ResourceName = r.ResourceName,
                    Quantity = r.Quantity
                }).ToList()
            };
            _context.Events.Add(evt);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = evt.Id }, evt);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EventDTO dto)
        {
            var evt = await _context.Events.Include(e => e.Resources).FirstOrDefaultAsync(e => e.Id == id);
            if (evt == null) return NotFound();

            evt.Title = dto.Title;
            evt.Description = dto.Description;
            evt.StartDate = dto.StartDate;
            evt.EndDate = dto.EndDate;

            _context.EventResources.RemoveRange(evt.Resources);
            evt.Resources = dto.Resources.Select(r => new EventResource
            {
                ResourceName = r.ResourceName,
                Quantity = r.Quantity
            }).ToList();

            await _context.SaveChangesAsync();
            return Ok(evt);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt == null) return NotFound();
            _context.Events.Remove(evt);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ── FRONT : inscription / désinscription utilisateur ───────────────
        [Authorize(Roles = "Admin,User,Manager")]
        [HttpPost("{id}/register")]
        public async Task<IActionResult> Register(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var evt = await _context.Events.FindAsync(id);
            if (evt == null) return NotFound();

            var already = await _context.EventRegistrations
                .AnyAsync(r => r.EventId == id && r.UserId == userId);
            if (already) return BadRequest("Déjà inscrit à cet événement.");

            _context.EventRegistrations.Add(new EventRegistration
            {
                EventId = id,
                UserId = userId
            });
            await _context.SaveChangesAsync();
            return Ok("Inscription confirmée.");
        }

        [Authorize(Roles = "Admin,User,Manager")]
        [HttpDelete("{id}/register")]
        public async Task<IActionResult> Unregister(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var reg = await _context.EventRegistrations
                .FirstOrDefaultAsync(r => r.EventId == id && r.UserId == userId);
            if (reg == null) return NotFound("Inscription introuvable.");

            _context.EventRegistrations.Remove(reg);
            await _context.SaveChangesAsync();
            return Ok("Désinscription effectuée.");
        }

        // ── BACK : liste des inscrits à un événement (Admin / Manager) ─────
        [Authorize(Roles = "Admin,Manager")]
        [HttpGet("{id}/registrations")]
        public async Task<IActionResult> GetRegistrations(int id)
        {
            var regs = await _context.EventRegistrations
                .Where(r => r.EventId == id)
                .Include(r => r.User)
                .Select(r => new { r.User.Id, r.User.Email, r.User.FirstName, r.User.LastName, r.RegisteredAt })
                .ToListAsync();
            return Ok(regs);
        }
    }
}
