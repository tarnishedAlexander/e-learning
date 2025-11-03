# Deployment Guide - E-learning Platform

## EC2 Deployment with Nginx Reverse Proxy

This guide explains how to deploy the E-learning platform on an EC2 instance using Docker and Nginx.

## Prerequisites

- EC2 instance running Ubuntu/Debian
- Docker and Docker Compose installed
- Domain name configured (optional, can use IP or local domain)

## Architecture

```
Internet
   ↓
EC2 Instance (Port 80)
   ↓
Nginx Reverse Proxy
   ├─→ Frontend (React App) - Port 8080
   └─→ Backend (Node.js API) - Port 3001
```

## DNS Configuration

### Option 1: Using Path-based Routing (Default)
- **Frontend**: `http://elearning.local/` or `http://your-ec2-ip/`
- **Backend API**: `http://elearning.local/api` or `http://api.elearning.local`

### Option 2: Using Subdomain Routing
- **Frontend**: `http://elearning.local/`
- **Backend API**: `http://api.elearning.local`

## Setup Instructions

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

### 2. Clone/Upload Project

```bash
# Create project directory
mkdir -p ~/elearning
cd ~/elearning

# Upload your project files or clone from git
# Make sure you have:
# - backend/
# - frontend/
# - nginx/
# - docker-compose.yml
```

### 3. Configure Environment Variables

Create `.env` file in the project root:

```bash
# Database Configuration (RDS)
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=elearning_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_SSL=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=thetarnisheds3
```

### 4. Configure DNS (if using domain)

#### For Local Testing (EC2 with local domain):

Edit `/etc/hosts` on your local machine:
```
your-ec2-ip  elearning.local
your-ec2-ip  api.elearning.local
```

#### For Production (with real domain):

Configure your DNS provider:
- A record: `elearning.local` → EC2 IP
- A record: `api.elearning.local` → EC2 IP

### 5. Configure Nginx

The Nginx configuration is in `nginx/nginx.conf`. It's already configured to:
- Route `/` to frontend
- Route `/api` to backend
- Route `api.elearning.local` to backend

### 6. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### 7. Run Database Migrations

```bash
# Enter backend container
docker-compose exec backend sh

# Run migrations
npm run db:migrate

# Run seed (optional)
npm run db:seed

# Exit container
exit
```

### 8. Configure EC2 Security Group

Ensure your EC2 security group allows:
- **Inbound Rule**: Port 80 (HTTP) from `0.0.0.0/0` (or your IP)
- **Inbound Rule**: Port 443 (HTTPS) if using SSL (recommended)

### 9. Verify Deployment

```bash
# Check if services are running
curl http://localhost/api/health

# Test frontend
curl http://localhost

# Test backend API
curl http://localhost/api/admin/students
```

## Accessing the Application

- **Frontend**: `http://your-ec2-ip/` or `http://elearning.local/`
- **Backend API**: `http://your-ec2-ip/api` or `http://api.elearning.local`

## Useful Commands

```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Access backend container
docker-compose exec backend sh

# Access frontend container
docker-compose exec frontend sh

# Access nginx container
docker-compose exec nginx sh
```

## SSL/HTTPS Configuration (Optional but Recommended)

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Configure SSL:
```bash
sudo certbot --nginx -d elearning.local -d api.elearning.local
```

3. Update Nginx config to redirect HTTP to HTTPS (add to nginx.conf):
```nginx
server {
    listen 80;
    server_name elearning.local api.elearning.local;
    return 301 https://$server_name$request_uri;
}
```

## Troubleshooting

### Check Nginx configuration:
```bash
docker-compose exec nginx nginx -t
```

### Restart Nginx:
```bash
docker-compose restart nginx
```

### Check service connectivity:
```bash
# From nginx container
docker-compose exec nginx ping backend
docker-compose exec nginx ping frontend
```

### View error logs:
```bash
docker-compose logs nginx | grep error
docker-compose logs backend | grep error
docker-compose logs frontend | grep error
```

## Environment-Specific Configuration

### Development:
- Uses `VITE_API_URL=http://localhost:3001/api` in frontend

### Production (Docker):
- Uses `VITE_API_URL=http://api.elearning.local/api` in frontend

Update the environment variable in `docker-compose.yml` if using a different domain.

