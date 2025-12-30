# Multi-stage Dockerfile for CMS API
# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (cached layer)
COPY ["content_management_system-be/content_management_system-be.csproj", "content_management_system-be/"]
RUN dotnet restore "content_management_system-be/content_management_system-be.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/content_management_system-be"
RUN dotnet build "content_management_system-be.csproj" -c Release -o /app/build

# Stage 2: Publish the application
FROM build AS publish
RUN dotnet publish "content_management_system-be.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user for security
RUN groupadd -r cmsapp && useradd -r -g cmsapp cmsapp

# Copy published app
COPY --from=publish /app/publish .

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R cmsapp:cmsapp /app

# Switch to non-root user
USER cmsapp

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "content_management_system-be.dll"]
