using Microsoft.AspNetCore.Identity;

namespace ApiForum.Models
{
    // Étend IdentityUser avec le prénom et le nom de l'utilisateur
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; set; } // Prénom
        public string? LastName { get; set; }  // Nom de famille
    }
}
