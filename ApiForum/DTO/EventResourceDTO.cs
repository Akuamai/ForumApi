namespace ApiForum.DTO
{
    // DTO représentant une ressource matérielle dans le formulaire d'événement
    public class EventResourceDTO
    {
        public string ResourceName { get; set; } // Nom de la ressource (ex: "Table")
        public int Quantity { get; set; }        // Quantité demandée
    }
}
