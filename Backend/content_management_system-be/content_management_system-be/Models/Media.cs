using System.ComponentModel.DataAnnotations;

namespace CMS.Models
{
    public class Media : BaseEntity
    {
        [Key]
        public int MediaId { get; set; }

        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FileUrl { get; set; }

        public int? ContentId { get; set; }
        public int UploadedBy { get; set; }

        // Navigation
        public Content Content { get; set; }
        public User User { get; set; }
    }
}
