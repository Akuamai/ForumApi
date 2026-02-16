using ApiForum.DTO;
using ApiForum.Models;
using ApiForum.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using static ApiForum.DTO.LoginDTO;
using static ApiForum.DTO.RegisterDTO;

namespace ApiForum.Controller
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IConfiguration config)
        {
            _userManager = userManager;
            _config = config;
        }

    // register / login ici


        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "User");

            return Ok("Utilisateur créé");
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized();

            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);
            var token = JwtTokenService.Generate(user, roles, _config);

            return Ok(new { token });
        }
        //[HttpPost("create-admin")]
        //public async Task<IActionResult> CreateAdmin()
        //{
        //    var user = new ApplicationUser
        //    {
        //        UserName = "admin@forum.com",
        //        Email = "admin@forum.com"
        //    };

        //    var result = await _userManager.CreateAsync(user, "Admin123!");

        //    if (!result.Succeeded)
        //        return BadRequest(result.Errors);

        //    await _userManager.AddToRoleAsync(user, "Admin");

        //    return Ok("Admin créé");
        //}
    }
}
