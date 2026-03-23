namespace ApiForum.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ICollection<EventResource> Resources { get; set; } = new List<EventResource>();
        public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    }
}
