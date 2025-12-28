namespace CMS.DTOs
{
    public class ContentCreateDto
    {
        public string Title { get; set; }
        public string Body { get; set; }
        public int CategoryId { get; set; }
    }

    public class ContentReadDto
    {
        public int ContentId { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string Status { get; set; }
    }
}
