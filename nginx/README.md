# Nginx Configuration

This directory contains the Nginx reverse proxy configuration for the E-learning platform.

## Configuration

The `nginx.conf` file configures:

1. **Main Server (Port 80)**: 
   - Routes `/` to frontend (port 8080)
   - Routes `/api/*` to backend (port 3001)

2. **API Server (Port 80)**:
   - Routes `api.elearning.local` to backend (port 3001)

## DNS Setup

### For Local Testing:
Edit `/etc/hosts`:
```
your-ec2-ip  elearning.local
your-ec2-ip  api.elearning.local
```

### For Production:
Configure DNS records:
- A record: `elearning.local` → EC2 IP
- A record: `api.elearning.local` → EC2 IP

## Testing Configuration

```bash
# Test Nginx config syntax
docker-compose exec nginx nginx -t

# Reload Nginx
docker-compose exec nginx nginx -s reload
```

