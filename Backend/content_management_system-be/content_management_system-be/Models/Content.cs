using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Models
{
    public class Content : BaseEntity
    {
        [Key]
        public int ContentId { get; set; }

        [Required]
        public string Title { get; set; }

        public string Slug { get; set; }

        [Required]
        public string Body { get; set; }

        public string Status { get; set; } = "Draft";

        public DateTime? PublishedAt { get; set; }

        // Foreign Keys
        public int UserId { get; set; }
        public int CategoryId { get; set; }

        // Navigation
        public User User { get; set; }
        public Category Category { get; set; }

        public ICollection<ContentTag> ContentTags { get; set; }
        public ICollection<Comment> Comments { get; set; }
        public ICollection<Media> MediaFiles { get; set; }
    }
}
