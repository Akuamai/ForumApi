namespace ApiForum.Models
{
    // Représente une prestation proposée lors d'un événement
    public class Presta
    {
        public int Id { get; set; }
        public string Name { get; set; }        // Nom de la prestation
        public string Description { get; set; } // Description détaillée
        public decimal Price { get; set; }      // Prix de la prestation
        public string CreatedBy { get; set; }   // Id de l'utilisateur qui a créé la prestation
    }
}
