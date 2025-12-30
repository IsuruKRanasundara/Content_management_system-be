# 🐳 Docker Deployment Guide for CMS with RabbitMQ

Complete Docker setup for the Content Management System with RabbitMQ background processing.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Running the System](#running-the-system)
- [Development vs Production](#development-vs-production)
- [Scaling](#scaling)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## 🚀 Quick Start

### 1. Clone and Navigate to Project
```bash
cd Backend/content_management_system-be
```

### 2. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your secure credentials
# Windows: notepad .env
# Linux/Mac: nano .env
```

### 3. Build and Run
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access Services
- **CMS API**: http://localhost:5000
- **RabbitMQ Management UI**: http://localhost:15672 (login: cmsadmin/CmsSecurePassword123!)
- **MongoDB**: mongodb://localhost:27017

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   RabbitMQ   │  │   MongoDB    │  │  CMS API  │ │
│  │   (Broker)   │◄─┤  (Database)  │◄─┤  (3 inst) │ │
│  │              │  │              │  │           │ │
│  └──────┬───────┘  └──────────────┘  └───────────┘ │
│         │                                            │
│         ▼                                            │
│  ┌──────────────┐                                   │
│  │ CMS Workers  │                                   │
│  │  (2 replicas)│                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
         │                    │
    Port 5672            Port 15672
         │                    │
    ┌────▼────────────────────▼─────┐
    │      Host Machine              │
    └────────────────────────────────┘
```

### Services

1. **RabbitMQ** - Message broker for async processing
2. **MongoDB** - Database for CMS data
3. **CMS API** - REST API (can scale to N instances)
4. **CMS Workers** - Background job processors (can scale independently)

---

## 📦 Prerequisites

### Required Software
- **Docker Desktop** 20.10+ or Docker Engine 20.10+
- **Docker Compose** 2.0+
- **4GB+ RAM** available for containers
- **10GB+ Disk Space**

### Verify Installation
```bash
docker --version
# Docker version 24.0.0 or higher

docker-compose --version
# Docker Compose version v2.20.0 or higher
```

### Windows Users
- Enable WSL 2 (Windows Subsystem for Linux)
- Docker Desktop should use WSL 2 backend

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# RabbitMQ Configuration
RABBITMQ_USER=cmsadmin
RABBITMQ_PASSWORD=YourStrongPassword123!
RABBITMQ_VHOST=/cms

# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=YourMongoPassword123!

# JWT Configuration - GENERATE A SECURE KEY!
JWT_SECRET_KEY=Your-Super-Secret-Key-At-Least-32-Chars-Long!
JWT_ISSUER=CMS-API
JWT_AUDIENCE=CMS-Clients

# Environment
ASPNETCORE_ENVIRONMENT=Production
```

### Generate Secure JWT Key
```bash
# Linux/Mac
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### appsettings.json (Already configured)
The application will use environment variables to override settings in `appsettings.json`.

---

## 🎮 Running the System

### Development Mode

**Option 1: Just RabbitMQ & MongoDB (Run API locally)**
```bash
# Start only infrastructure services
docker-compose -f docker-compose.dev.yml up -d

# Run API from Visual Studio or CLI
dotnet run --project content_management_system-be

# API connects to containerized RabbitMQ and MongoDB
```

**Option 2: Full Stack in Docker**
```bash
# Start everything including API and Workers
docker-compose up -d

# Watch logs for all services
docker-compose logs -f

# Watch specific service logs
docker-compose logs -f cms-api
docker-compose logs -f cms-worker
```

### Production Mode

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check health status
docker-compose -f docker-compose.prod.yml ps

# View production logs
docker-compose -f docker-compose.prod.yml logs --tail=100 -f
```

### Stop Services

```bash
# Stop all services (preserves data)
docker-compose down

# Stop and remove volumes (DELETE ALL DATA!)
docker-compose down -v

# Stop specific service
docker-compose stop cms-api
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart cms-api

# Rebuild and restart (after code changes)
docker-compose up -d --build
```

---

## 🔄 Scaling

### Scale Workers
```bash
# Scale to 5 worker instances
docker-compose up -d --scale cms-worker=5

# Scale API instances
docker-compose up -d --scale cms-api=3

# Check running instances
docker-compose ps
```

### Production Scaling (docker-compose.prod.yml)
```yaml
# Already configured in docker-compose.prod.yml
cms-api:
  deploy:
    replicas: 3  # 3 API instances

cms-worker:
  deploy:
    replicas: 3  # 3 worker instances
```

### Resource Limits
```yaml
# Set in docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

## 📊 Monitoring

### Check Service Health
```bash
# View all service status
docker-compose ps

# Check specific service health
docker inspect cms-api --format='{{.State.Health.Status}}'

# View health check logs
docker inspect cms-api --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f cms-api
docker-compose logs -f cms-worker
docker-compose logs -f rabbitmq

# Last 100 lines
docker-compose logs --tail=100 cms-api

# Since specific time
docker-compose logs --since 30m cms-api
```

### RabbitMQ Management UI
Access: http://localhost:15672
- Monitor queues and exchanges
- View message rates
- Check consumer connections
- Inspect messages in queues

### Resource Usage
```bash
# Container resource usage
docker stats

# Specific container
docker stats cms-api

# Disk usage
docker system df
```

### Access Container Shell
```bash
# API container
docker-compose exec cms-api bash

# Worker container
docker-compose exec cms-worker bash

# MongoDB shell
docker-compose exec mongodb mongosh
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: port is already allocated

# Windows - Find process using port
netstat -ano | findstr :5672
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5672 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "5673:5672"  # Use different host port
```

#### 2. Services Won't Start
```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs rabbitmq
docker-compose logs mongodb

# Restart services
docker-compose restart

# Full rebuild
docker-compose down
docker-compose up -d --build
```

#### 3. RabbitMQ Connection Failed
```bash
# Verify RabbitMQ is healthy
docker-compose ps rabbitmq

# Check RabbitMQ logs
docker-compose logs rabbitmq

# Test connection
docker-compose exec rabbitmq rabbitmq-diagnostics ping

# Verify virtual host exists
docker-compose exec rabbitmq rabbitmqctl list_vhosts
```

#### 4. Database Connection Issues
```bash
# Check MongoDB status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 5. API Returns 502/503 Errors
```bash
# Check API health
curl http://localhost:5000/api/health

# View API logs
docker-compose logs cms-api

# Check dependencies
docker-compose ps

# Restart API
docker-compose restart cms-api
```

#### 6. Out of Memory
```bash
# Check memory usage
docker stats

# Increase Docker Desktop memory
# Docker Desktop > Settings > Resources > Memory

# Or reduce replicas in docker-compose.prod.yml
```

#### 7. Build Fails
```bash
# Clear build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check .dockerignore
cat .dockerignore
```

### Debug Commands

```bash
# View all containers (including stopped)
docker-compose ps -a

# Inspect container details
docker inspect cms-api

# Check network connectivity
docker-compose exec cms-api ping rabbitmq
docker-compose exec cms-api ping mongodb

# View environment variables
docker-compose exec cms-api env

# Execute commands in container
docker-compose exec cms-api ls -la /app
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
✅ **DO:**
- Use `.env` file for local development
- Use secrets management in production (Docker Secrets, Kubernetes Secrets)
- Generate strong, unique passwords
- Rotate credentials regularly

❌ **DON'T:**
- Commit `.env` to version control
- Use default passwords in production
- Hardcode credentials in Dockerfile or compose files

### 2. Network Security
```yaml
# Services communicate only within Docker network
networks:
  cms-network:
    driver: bridge
    internal: false  # Set to true if no external access needed
```

### 3. User Permissions
```dockerfile
# Run as non-root user (already configured)
RUN groupadd -r cmsapp && useradd -r -g cmsapp cmsapp
USER cmsapp
```

### 4. Secure MongoDB
```bash
# In production, use authentication
MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

# Don't expose MongoDB port publicly
# Remove: - "27017:27017"
```

### 5. HTTPS/SSL
```yaml
# Add SSL certificate volumes
volumes:
  - ./certs:/app/certs:ro

environment:
  ASPNETCORE_URLS: https://+:8081;http://+:8080
  ASPNETCORE_Kestrel__Certificates__Default__Path: /app/certs/cert.pfx
  ASPNETCORE_Kestrel__Certificates__Default__Password: ${CERT_PASSWORD}
```

### 6. Image Security
```bash
# Scan images for vulnerabilities
docker scan cms-api:latest

# Use minimal base images (already using alpine/slim)
# Keep base images updated
docker pull mcr.microsoft.com/dotnet/aspnet:9.0
```

---

## 📝 Docker Commands Cheat Sheet

```bash
# Build & Start
docker-compose up -d                    # Start in background
docker-compose up -d --build           # Rebuild and start

# Stop & Remove
docker-compose down                     # Stop all services
docker-compose down -v                  # Stop and remove volumes

# Logs
docker-compose logs -f                  # Follow all logs
docker-compose logs -f cms-api         # Follow specific service

# Scale
docker-compose up -d --scale cms-worker=3

# Restart
docker-compose restart                  # Restart all
docker-compose restart cms-api         # Restart specific

# Status
docker-compose ps                       # Show all services
docker-compose ps rabbitmq             # Show specific service

# Execute Commands
docker-compose exec cms-api bash       # Shell into container
docker-compose exec rabbitmq sh        # Alpine uses sh

# Cleanup
docker-compose down --rmi all          # Remove images too
docker system prune -a                 # Clean everything
```

---

## 🚢 Deploying to Cloud

### AWS (ECS/Fargate)
1. Push images to ECR
2. Create ECS task definitions
3. Configure service discovery
4. Use AWS Secrets Manager for credentials

### Azure (Container Instances/AKS)
1. Push images to ACR
2. Create container instances
3. Use Azure Key Vault for secrets
4. Configure virtual network

### Google Cloud (Cloud Run/GKE)
1. Push images to GCR
2. Deploy to Cloud Run or GKE
3. Use Secret Manager
4. Configure VPC

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [RabbitMQ Docker Guide](https://www.rabbitmq.com/docker.html)
- [ASP.NET Core Docker](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)

---

## 🎯 Next Steps

1. ✅ Setup complete with `docker-compose up -d`
2. ✅ Test API at http://localhost:5000
3. ✅ Monitor RabbitMQ at http://localhost:15672
4. 🔄 Configure production secrets
5. 🔄 Set up CI/CD pipeline
6. 🔄 Configure monitoring (Prometheus/Grafana)
7. 🔄 Set up log aggregation (ELK Stack)

---

**Need Help?** Check the [Troubleshooting](#troubleshooting) section or open an issue.
