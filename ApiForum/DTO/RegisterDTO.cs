namespace ApiForum.DTO
{
    public class RegisterDTO
    {
        public record RegisterDto(string FirstName, string LastName, string Email, string Password);
    }
}
