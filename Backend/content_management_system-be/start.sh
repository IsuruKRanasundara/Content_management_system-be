#!/bin/bash
# Startup script for CMS Docker environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Check if Docker is running
check_docker() {
    print_message "$BLUE" "🔍 Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_message "$RED" "❌ Error: Docker is not running!"
        print_message "$YELLOW" "Please start Docker Desktop and try again."
        exit 1
    fi
    print_message "$GREEN" "✓ Docker is running"
}

# Check if .env file exists
check_env() {
    print_message "$BLUE" "🔍 Checking environment configuration..."
    if [ ! -f .env ]; then
        print_message "$YELLOW" "⚠️  .env file not found. Creating from .env.example..."
        cp .env.example .env
        print_message "$YELLOW" "⚠️  Please edit .env file with your credentials before continuing!"
        print_message "$YELLOW" "Press Enter after editing .env, or Ctrl+C to cancel..."
        read
    fi
    print_message "$GREEN" "✓ Environment configuration found"
}

# Clean up old containers
cleanup() {
    print_message "$BLUE" "🧹 Cleaning up old containers..."
    docker-compose down > /dev/null 2>&1 || true
    print_message "$GREEN" "✓ Cleanup complete"
}

# Build images
build_images() {
    print_message "$BLUE" "🔨 Building Docker images..."
    docker-compose build
    print_message "$GREEN" "✓ Images built successfully"
}

# Start services
start_services() {
    print_message "$BLUE" "🚀 Starting services..."
    docker-compose up -d
    print_message "$GREEN" "✓ Services started"
}

# Wait for services to be healthy
wait_for_services() {
    print_message "$BLUE" "⏳ Waiting for services to be healthy..."
    
    # Wait for RabbitMQ
    print_message "$YELLOW" "   Waiting for RabbitMQ..."
    timeout=60
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose exec -T rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; then
            print_message "$GREEN" "   ✓ RabbitMQ is ready"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    # Wait for MongoDB
    print_message "$YELLOW" "   Waiting for MongoDB..."
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            print_message "$GREEN" "   ✓ MongoDB is ready"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    # Wait for API
    print_message "$YELLOW" "   Waiting for CMS API..."
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
            print_message "$GREEN" "   ✓ CMS API is ready"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
}

# Print access information
print_access_info() {
    print_message "$GREEN" "
╔═══════════════════════════════════════════════════════════╗
║          🎉 CMS is ready!                                 ║
╚═══════════════════════════════════════════════════════════╝"
    
    print_message "$BLUE" "
📍 Access URLs:
   API:              http://localhost:5000
   API Health:       http://localhost:5000/api/health
   RabbitMQ UI:      http://localhost:15672
   MongoDB:          mongodb://localhost:27017
"
    
    print_message "$YELLOW" "
🔑 Default Credentials (from .env):
   RabbitMQ:         cmsadmin / CmsSecurePassword123!
   MongoDB:          admin / MongoSecurePassword123!
"
    
    print_message "$BLUE" "
📊 Useful Commands:
   View logs:        docker-compose logs -f
   Stop services:    docker-compose down
   Restart:          docker-compose restart
   Service status:   docker-compose ps
   Scale workers:    docker-compose up -d --scale cms-worker=5
"
}

# Main execution
main() {
    print_message "$GREEN" "
╔═══════════════════════════════════════════════════════════╗
║     CMS Docker Startup Script                             ║
║     Content Management System with RabbitMQ               ║
╚═══════════════════════════════════════════════════════════╝
"
    
    check_docker
    check_env
    cleanup
    build_images
    start_services
    wait_for_services
    print_access_info
    
    print_message "$GREEN" "✓ Startup complete!"
    print_message "$YELLOW" "
💡 Tip: Run 'docker-compose logs -f' to view real-time logs
"
}

# Handle script arguments
case "${1:-}" in
    --dev)
        print_message "$BLUE" "Starting in development mode..."
        docker-compose -f docker-compose.dev.yml up -d
        print_message "$GREEN" "Development environment started!"
        ;;
    --prod)
        print_message "$BLUE" "Starting in production mode..."
        check_env
        docker-compose -f docker-compose.prod.yml up -d
        print_message "$GREEN" "Production environment started!"
        ;;
    --stop)
        print_message "$BLUE" "Stopping services..."
        docker-compose down
        print_message "$GREEN" "Services stopped!"
        ;;
    --clean)
        print_message "$YELLOW" "⚠️  This will remove all containers, volumes, and data!"
        print_message "$YELLOW" "Are you sure? (yes/no)"
        read -r response
        if [ "$response" = "yes" ]; then
            docker-compose down -v --rmi all
            print_message "$GREEN" "Cleanup complete!"
        else
            print_message "$BLUE" "Cleanup cancelled."
        fi
        ;;
    --help)
        print_message "$BLUE" "
CMS Docker Startup Script

Usage: ./start.sh [option]

Options:
    (no option)    Start in default mode
    --dev          Start in development mode
    --prod         Start in production mode
    --stop         Stop all services
    --clean        Remove all containers and volumes
    --help         Show this help message
"
        ;;
    *)
        main
        ;;
esac
