# E-learning Platform

Plataforma de educación online con autenticación, cursos, videos en S3 y dashboards.

## Stack

- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React + Vite + TypeScript + Tailwind
- **DevOps**: Docker + Nginx + AWS (EC2, RDS, S3)

## Local Dev

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

Accede a `http://localhost:5173`

## Deployment a EC2

```bash
# 1. Copiar a EC2
scp -i key.pem -r . ubuntu@IP:~/e-learning

# 2. SSH a EC2
ssh -i key.pem ubuntu@IP

# 3. En EC2
cd ~/e-learning
./setup-ec2.sh  # Instala Docker
newgrp docker   # Aplica cambios
./deploy.sh     # Lanza todo
```

Accede a `http://IP`

## Config (.env)

```env
DB_HOST=your-rds.rds.amazonaws.com
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true

AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=secret
AWS_S3_BUCKET_NAME=bucket
AWS_S3_ACCESS_POINT_ALIAS=alias

NODE_ENV=production
PORT=3001
VITE_API_URL=/api
```

## Commands

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener
docker-compose -f docker-compose.prod.yml down

# Redeploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## Endpoints

- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `GET /api/enrollments/courses/available` - Cursos
- `POST /api/enrollments/enroll` - Enrolarse
- `GET /api/videos/url?s3Key=...` - URL video
- `GET /api/admin/students` - Admin: estudiantes

## Troubleshooting

```bash
# Health check
curl http://IP/api/health

# Ver logs
docker-compose -f docker-compose.prod.yml logs backend

# Reiniciar
docker-compose -f docker-compose.prod.yml restart
```
