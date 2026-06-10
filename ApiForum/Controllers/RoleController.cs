using ApiForum.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiForum.Controllers
{
    // Contrôleur de gestion des utilisateurs et rôles (Admin uniquement)
    // Route : /api/admin
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

        // ── GET /api/admin/users ───────────────────────────────────────────
        // Retourne tous les utilisateurs avec leurs rôles
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<object>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(new { u.Id, u.Email, u.FirstName, u.LastName, roles });
            }
            return Ok(result);
        }

        // ── GET /api/admin/users/{userId} ──────────────────────────────────
        // Retourne un utilisateur spécifique avec ses rôles
        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new { user.Id, user.Email, user.FirstName, user.LastName, roles });
        }

        // ── POST /api/admin/users ──────────────────────────────────────────
        // Crée un utilisateur avec un rôle défini (User par défaut si non précisé)
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, string.IsNullOrEmpty(dto.Role) ? "User" : dto.Role);
            return Ok(new { user.Id, user.Email, user.FirstName, user.LastName });
        }

        // ── PUT /api/admin/users/{userId} ──────────────────────────────────
        // Met à jour les infos d'un utilisateur
        // Si NewPassword est fourni, réinitialise le mot de passe via token
        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            user.UserName = dto.Email;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // Changement de mot de passe optionnel
            if (!string.IsNullOrEmpty(dto.NewPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var pwResult = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
                if (!pwResult.Succeeded) return BadRequest(pwResult.Errors);
            }

            return Ok(new { user.Id, user.Email, user.FirstName, user.LastName });
        }

        // ── DELETE /api/admin/users/{userId} ──────────────────────────────
        // Supprime un utilisateur définitivement
        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            await _userManager.DeleteAsync(user);
            return NoContent();
        }

        // ── POST /api/admin/users/{userId}/roles/{roleName} ────────────────
        // Assigne un rôle à un utilisateur (vérifie que le rôle existe et n'est pas déjà attribué)
        [HttpPost("users/{userId}/roles/{roleName}")]
        public async Task<IActionResult> AssignRole(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            if (!await _roleManager.RoleExistsAsync(roleName)) return NotFound("Rôle introuvable.");
            if (await _userManager.IsInRoleAsync(user, roleName)) return BadRequest("Rôle déjà attribué.");
            await _userManager.AddToRoleAsync(user, roleName);
            return Ok();
        }

        // ── DELETE /api/admin/users/{userId}/roles/{roleName} ──────────────
        // Retire un rôle d'un utilisateur
        [HttpDelete("users/{userId}/roles/{roleName}")]
        public async Task<IActionResult> RemoveRole(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            if (!await _userManager.IsInRoleAsync(user, roleName)) return BadRequest("L'utilisateur ne possède pas ce rôle.");
            await _userManager.RemoveFromRoleAsync(user, roleName);
            return Ok();
        }

        // ── GET /api/admin/roles ───────────────────────────────────────────
        // Retourne la liste de tous les rôles disponibles
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
            return Ok(roles);
        }
    }

    // DTO pour la création d'un utilisateur par un Admin
    public class CreateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }

    // DTO pour la modification d'un utilisateur existant
    public class UpdateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string NewPassword { get; set; } // Optionnel : laisser vide pour ne pas changer
    }
}
