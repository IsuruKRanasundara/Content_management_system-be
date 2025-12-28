namespace CMS.DTOs
{
    public class RegisterUserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginUserDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UserReadDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; }
        public UserReadDto User { get; set; }
    }

    public class UserUpdateDto
    {
        public string Username { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }
}
