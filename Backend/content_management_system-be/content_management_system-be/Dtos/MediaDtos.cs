namespace CMS.DTOs
{
    public class MediaCreateDto
    {
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FileUrl { get; set; }
        public int? ContentId { get; set; }
        public int UploadedBy { get; set; }
    }

    public class MediaUpdateDto
    {
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FileUrl { get; set; }
        public int? ContentId { get; set; }
    }

    public class MediaReadDto
    {
        public int MediaId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FileUrl { get; set; }
        public int? ContentId { get; set; }
        public int UploadedBy { get; set; }
    }
}
