#!/bin/bash

# E-learning Platform Deployment Script
# This script helps deploy the platform on EC2

set -e

echo "🚀 Starting E-learning Platform Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your credentials before continuing!${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check backend
if curl -f http://localhost/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, but continuing...${NC}"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run db:migrate || {
    echo -e "${YELLOW}⚠️  Migration failed. You may need to run it manually.${NC}"
}

# Show running containers
echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://elearning.local/ or http://$(curl -s ifconfig.me)/"
echo "   Backend API: http://api.elearning.local or http://$(curl -s ifconfig.me)/api"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""

