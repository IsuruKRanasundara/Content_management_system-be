using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class Category : BaseEntity
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        public string Name { get; set; }

        public string Slug { get; set; }

        public int? ParentCategoryId { get; set; }

        // Navigation
        public Category ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; }
        public ICollection<Content> Contents { get; set; }
    }
}
