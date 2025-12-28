using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class Tag
    {
        [Key]
        public int TagId { get; set; }

        [Required]
        public string Name { get; set; }

        public string Slug { get; set; }

        // Navigation
        public ICollection<ContentTag> ContentTags { get; set; }
    }
}
