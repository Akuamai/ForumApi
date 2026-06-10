namespace ApiForum.Models
{
    // Modèle représentant un événement du forum
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; } // Description de l'événement et des prestations
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ICollection<EventResource> Resources { get; set; } = new List<EventResource>();       // Ressources matérielles de l'événement
        public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>(); // Inscriptions des participants
    }
}
