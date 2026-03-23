using ApiForum.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiForum.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public RolesController(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        // ── Liste tous les utilisateurs ────────────────────────────────────
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .Select(u => new { u.Id, u.Email, u.FirstName, u.LastName })
                .ToListAsync();
            return Ok(users);
        }

        // ── Détail d'un utilisateur avec ses rôles ─────────────────────────
        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new { user.Id, user.Email, user.FirstName, user.LastName, roles });
        }

        // ── Assigner un rôle ───────────────────────────────────────────────
        [HttpPost("users/{userId}/roles/{roleName}")]
        public async Task<IActionResult> AssignRole(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Utilisateur introuvable.");

            if (!await _roleManager.RoleExistsAsync(roleName))
                return NotFound("Rôle introuvable.");

            if (await _userManager.IsInRoleAsync(user, roleName))
                return BadRequest("L'utilisateur possède déjà ce rôle.");

            await _userManager.AddToRoleAsync(user, roleName);
            return Ok($"Rôle '{roleName}' assigné.");
        }

        // ── Retirer un rôle ────────────────────────────────────────────────
        [HttpDelete("users/{userId}/roles/{roleName}")]
        public async Task<IActionResult> RemoveRole(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Utilisateur introuvable.");

            if (!await _userManager.IsInRoleAsync(user, roleName))
                return BadRequest("L'utilisateur ne possède pas ce rôle.");

            await _userManager.RemoveFromRoleAsync(user, roleName);
            return Ok($"Rôle '{roleName}' retiré.");
        }

        // ── Créer un rôle ──────────────────────────────────────────────────
        [HttpPost("roles/{roleName}")]
        public async Task<IActionResult> CreateRole(string roleName)
        {
            if (await _roleManager.RoleExistsAsync(roleName))
                return BadRequest("Le rôle existe déjà.");

            await _roleManager.CreateAsync(new IdentityRole(roleName));
            return Ok($"Rôle '{roleName}' créé.");
        }

        // ── Liste tous les rôles ───────────────────────────────────────────
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
            return Ok(roles);
        }
    }
}
