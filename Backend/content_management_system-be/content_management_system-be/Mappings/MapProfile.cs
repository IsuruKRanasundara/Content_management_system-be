using AutoMapper;
using CMS.Models;
using CMS.DTOs;

namespace CMS.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Content, ContentReadDto>();
            CreateMap<ContentCreateDto, Content>();

            CreateMap<Tag, TagReadDto>();
            CreateMap<TagCreateDto, Tag>();

            CreateMap<ContentTag, ContentTagReadDto>();
            CreateMap<ContentTagCreateDto, ContentTag>();

            CreateMap<Media, MediaReadDto>();
            CreateMap<MediaCreateDto, Media>();

            CreateMap<User, UserReadDto>();


            CreateMap<RegisterUserDto, User>()
                .ForMember(dest => dest.PasswordHash,
                    opt => opt.MapFrom(src => BCrypt.Net.BCrypt.HashPassword(src.Password)));
        }
    }
}
