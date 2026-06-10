using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ApiForum.Models;

namespace ApiForum.Data
{
    // Contexte EF Core — point d'entrée vers la base de données
    // Hérite de IdentityDbContext pour inclure les tables ASP.NET Identity (users, roles...)
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

        public DbSet<Event> Events { get; set; }                         // Table des événements
        public DbSet<EventRegistration> EventRegistrations { get; set; } // Table des inscriptions
        public DbSet<Presta> Prestas { get; set; }                       // Table des prestations
        public DbSet<EventResource> EventResources { get; set; }         // Table des ressources matérielles
    }
}
