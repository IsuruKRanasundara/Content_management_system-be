# Makefile for CMS Docker Operations
# Usage: make [target]

.PHONY: help build up down restart logs ps clean rebuild dev prod scale-workers health

# Default target
help:
	@echo "CMS Docker Commands:"
	@echo "  make build         - Build all Docker images"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make restart       - Restart all services"
	@echo "  make logs          - View all logs"
	@echo "  make ps            - Show service status"
	@echo "  make clean         - Remove containers and volumes"
	@echo "  make rebuild       - Rebuild and restart"
	@echo "  make dev           - Start development environment"
	@echo "  make prod          - Start production environment"
	@echo "  make scale-workers - Scale workers to 5 instances"
	@echo "  make health        - Check service health"

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start services
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started! Access:"
	@echo "  API: http://localhost:5000"
	@echo "  RabbitMQ UI: http://localhost:15672"

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down

# Restart services
restart:
	@echo "Restarting services..."
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Show service status
ps:
	docker-compose ps

# Clean up everything
clean:
	@echo "Cleaning up containers, volumes, and images..."
	docker-compose down -v --rmi all
	@echo "Cleanup complete!"

# Rebuild and restart
rebuild:
	@echo "Rebuilding and restarting..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "Rebuild complete!"

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "RabbitMQ UI: http://localhost:15672 (guest/guest)"

# Production environment
prod:
	@echo "Starting production environment..."
	@if [ ! -f .env ]; then echo "Error: .env file not found! Copy .env.example to .env first."; exit 1; fi
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"

# Scale workers
scale-workers:
	@echo "Scaling workers to 5 instances..."
	docker-compose up -d --scale cms-worker=5

# Check health
health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "API Health:"
	@curl -f http://localhost:5000/api/health 2>/dev/null && echo "✓ API is healthy" || echo "✗ API is not responding"
	@echo ""
	@echo "RabbitMQ Health:"
	@docker-compose exec rabbitmq rabbitmq-diagnostics -q ping && echo "✓ RabbitMQ is healthy" || echo "✗ RabbitMQ is not responding"
