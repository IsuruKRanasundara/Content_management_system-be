namespace CMS.Models
{
    public class ContentTag
    {
        public int ContentId { get; set; }
        public int TagId { get; set; }

        // Navigation
        public Content Content { get; set; }
        public Tag Tag { get; set; }
    }
}
