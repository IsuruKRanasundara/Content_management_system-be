using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class Comment : BaseEntity
    {
        [Key]
        public int CommentId { get; set; }

        [Required]
        public string Text { get; set; }

        public bool IsApproved { get; set; } = false;

        // Foreign Keys
        public int ContentId { get; set; }
        public int UserId { get; set; }

        // Navigation
        public Content Content { get; set; }
        public User User { get; set; }
    }
}
