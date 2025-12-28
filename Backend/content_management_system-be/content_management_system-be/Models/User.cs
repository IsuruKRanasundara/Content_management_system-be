using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class User : BaseEntity
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string Username { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string Role { get; set; } = "User";

        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<Content> Contents { get; set; }
        public ICollection<Comment> Comments { get; set; }
        public ICollection<Media> MediaFiles { get; set; }
    }
}
