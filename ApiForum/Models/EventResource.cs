namespace ApiForum.Models
{
    public class EventResource
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public Event Event { get; set; }
        public string ResourceName { get; set; }  // ex: "Table", "Chaise", "Ordinateur"
        public int Quantity { get; set; }
    }
}
