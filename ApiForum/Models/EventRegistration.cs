namespace ApiForum.Models
{
    // Représente l'inscription d'un utilisateur à un événement (table de jonction)
    public class EventRegistration
    {
        public int Id { get; set; }

        public string UserId { get; set; }          // Clé étrangère vers AspNetUsers
        public ApplicationUser User { get; set; }   // Navigation vers l'utilisateur

        public int EventId { get; set; }            // Clé étrangère vers Events
        public Event Event { get; set; }            // Navigation vers l'événement

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow; // Date d'inscription (auto)
    }
}
