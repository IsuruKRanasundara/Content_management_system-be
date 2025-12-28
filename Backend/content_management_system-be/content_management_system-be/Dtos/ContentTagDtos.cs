namespace CMS.DTOs
{
    public class ContentTagCreateDto
    {
        public int ContentId { get; set; }
        public int TagId { get; set; }
    }

    public class ContentTagReadDto
    {
        public int ContentId { get; set; }
        public int TagId { get; set; }
    }
}
