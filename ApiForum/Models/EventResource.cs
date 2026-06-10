namespace ApiForum.Models
{
    // Représente une ressource matérielle associée à un événement (ex: tables, chaises)
    public class EventResource
    {
        public int Id { get; set; }
        public int EventId { get; set; }            // Clé étrangère vers Events
        public Event Event { get; set; }            // Navigation vers l'événement
        public string ResourceName { get; set; }    // Nom de la ressource (ex: "Table", "Chaise")
        public int Quantity { get; set; }           // Quantité disponible
    }
}
