using ApiForum.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ApiForum.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "Admin")] // 🔐 Seuls les admins peuvent gérer les rôles
public class RolesController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RolesController(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    // ============================
    // CREATE ROLE
    // ============================
    [HttpPost("create")]
    public async Task<IActionResult> CreateRole(string roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
            return BadRequest("Nom du rôle invalide");

        if (await _roleManager.RoleExistsAsync(roleName))
            return BadRequest("Le rôle existe déjà");

        var result = await _roleManager.CreateAsync(new IdentityRole(roleName));

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok($"Rôle '{roleName}' créé ✅");
    }

    // ============================
    // ASSIGN ROLE TO USER
    // ============================
    [HttpPost("assign")]
    public async Task<IActionResult> AssignRoleToUser(
        string userId,
        string roleName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("Utilisateur introuvable");

        if (!await _roleManager.RoleExistsAsync(roleName))
            return NotFound("Rôle introuvable");

        if (await _userManager.IsInRoleAsync(user, roleName))
            return BadRequest("L'utilisateur a déjà ce rôle");

        var result = await _userManager.AddToRoleAsync(user, roleName);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok($"Rôle '{roleName}' assigné à l'utilisateur ✅");
    }
}
