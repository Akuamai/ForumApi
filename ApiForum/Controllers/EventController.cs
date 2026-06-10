using ApiForum.Data;
using ApiForum.DTO;
using ApiForum.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace ApiForum.Controllers
{
    // Contrôleur principal pour la gestion des événements
    // Route : /api/event
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Supprime toutes les balises HTML d'une chaîne (ex: <p class="text-muted">)
        private static string StripHtml(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return input;
            return Regex.Replace(input, "<[^>]*>", string.Empty).Trim();
        }

        // ── GET /api/event ─────────────────────────────────────────────────
        // Retourne tous les événements avec leurs ressources et inscrits
        // Accessible publiquement (pas de [Authorize])
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var events = await _context.Events
                .Include(e => e.Resources)
                .Include(e => e.Registrations)
                .ToListAsync();
            return Ok(events);
        }

        // ── GET /api/event/{id} ────────────────────────────────────────────
        // Retourne un événement par son id avec ressources et inscrits
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

        // ── POST /api/event ────────────────────────────────────────────────
        // Crée un nouvel événement avec ses ressources (Admin uniquement)
        // La description est nettoyée des balises HTML avant sauvegarde
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EventDTO dto)
        {
            var evt = new Event
            {
                Title = dto.Title,
                Description = StripHtml(dto.Description),
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

        // ── PUT /api/event/{id} ────────────────────────────────────────────
        // Met à jour un événement existant (Admin uniquement)
        // Supprime et recrée les ressources pour simplifier la mise à jour
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EventDTO dto)
        {
            var evt = await _context.Events.Include(e => e.Resources).FirstOrDefaultAsync(e => e.Id == id);
            if (evt == null) return NotFound();

            evt.Title = dto.Title;
            evt.Description = StripHtml(dto.Description);
            evt.StartDate = dto.StartDate;
            evt.EndDate = dto.EndDate;

            // Suppression des anciennes ressources avant de les remplacer
            _context.EventResources.RemoveRange(evt.Resources);
            evt.Resources = dto.Resources.Select(r => new EventResource
            {
                ResourceName = r.ResourceName,
                Quantity = r.Quantity
            }).ToList();

            await _context.SaveChangesAsync();
            return Ok(evt);
        }

        // ── DELETE /api/event/{id} ─────────────────────────────────────────
        // Supprime un événement et toutes ses données liées (Admin uniquement)
        // Les ressources et inscriptions sont supprimées manuellement
        // pour éviter les erreurs de contrainte de clé étrangère
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var evt = await _context.Events
                .Include(e => e.Resources)
                .Include(e => e.Registrations)
                .FirstOrDefaultAsync(e => e.Id == id);
            if (evt == null) return NotFound();
            _context.EventResources.RemoveRange(evt.Resources);
            _context.EventRegistrations.RemoveRange(evt.Registrations);
            _context.Events.Remove(evt);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ── POST /api/event/{id}/register ──────────────────────────────────
        // Inscrit l'utilisateur connecté à un événement
        // Vérifie qu'il n'est pas déjà inscrit avant d'ajouter
        [Authorize(Roles = "Admin,User")]
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

        // ── DELETE /api/event/{id}/register ───────────────────────────────
        // Désinscrit l'utilisateur connecté d'un événement
        [Authorize(Roles = "Admin,User")]
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

        // ── GET /api/event/{id}/registrations ─────────────────────────────
        // Retourne la liste des utilisateurs inscrits à un événement (Admin uniquement)
        [Authorize(Roles = "Admin")]
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
