namespace ApiForum.DTO
{
    // DTO pour la création et la mise à jour d'un événement
    public class EventDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<EventResourceDTO> Resources { get; set; } = new(); // Ressources matérielles associées
    }
}
