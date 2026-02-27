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
    public class PrestaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PrestaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var prestas = await _context.Prestas.ToListAsync();
            return Ok(prestas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var presta = await _context.Prestas.FindAsync(id);
            if (presta == null) return NotFound();
            return Ok(presta);
        }

        [Authorize(Roles = "Admin,User,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PrestaDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var presta = new Presta
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CreatedBy = userId
            };
            _context.Prestas.Add(presta);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = presta.Id }, presta);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var presta = await _context.Prestas.FindAsync(id);
            if (presta == null) return NotFound();
            _context.Prestas.Remove(presta);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
