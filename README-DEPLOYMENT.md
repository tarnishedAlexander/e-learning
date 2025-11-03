# 🚀 Deployment Guide - E-learning Platform

## Configuración de Nginx y DNS en EC2

Esta guía explica cómo desplegar la plataforma E-learning en una instancia EC2 usando Docker y Nginx como reverse proxy.

## 📋 Arquitectura

```
Internet (Puerto 80)
   ↓
EC2 Instance
   ↓
Nginx Reverse Proxy (Puerto 80)
   ├─→ Frontend Container (Puerto 8080)
   └─→ Backend Container (Puerto 3001)
```

## 🔧 Configuración DNS

### Opción 1: Path-based (Recomendado)
- **Frontend**: `http://elearning.local/` o `http://tu-ip-ec2/`
- **Backend API**: `http://elearning.local/api` o `http://api.elearning.local`

### Opción 2: Solo Subdominio para API
- **Frontend**: `http://elearning.local/`
- **Backend API**: `http://api.elearning.local`

## 🛠️ Instalación en EC2

### 1. Instalar Docker y Docker Compose

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y docker.io docker-compose

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker (opcional, evita usar sudo)
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar para aplicar cambios
```

### 2. Subir Proyecto a EC2

```bash
# En tu máquina local, comprimir el proyecto (excluyendo node_modules)
tar --exclude='node_modules' --exclude='.git' \
    -czf elearning.tar.gz .

# Subir a EC2 usando SCP
scp -i tu-key.pem elearning.tar.gz ubuntu@tu-ec2-ip:~/

# En EC2, extraer
ssh -i tu-key.pem ubuntu@tu-ec2-ip
cd ~
tar -xzf elearning.tar.gz -C ~/elearning
cd ~/elearning
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env

# Agregar tus credenciales:
DB_HOST=tu-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=elearning_db
DB_USER=postgres
DB_PASSWORD=tu-password
DB_SSL=true

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_S3_BUCKET_NAME=thetarnisheds3
```

### 4. Configurar DNS Local (para pruebas)

Si no tienes un dominio real, puedes usar DNS local:

**En tu máquina local**, edita `/etc/hosts`:
```bash
sudo nano /etc/hosts

# Agregar:
tu-ip-ec2  elearning.local
tu-ip-ec2  api.elearning.local
```

### 5. Desplegar

```bash
# Dar permisos al script
chmod +x deploy.sh

# Ejecutar deployment
./deploy.sh

# O manualmente:
docker-compose up -d --build
```

### 6. Ejecutar Migraciones

```bash
# Ejecutar migraciones de base de datos
docker-compose exec backend npm run db:migrate

# Ejecutar seed (opcional)
docker-compose exec backend npm run db:seed
```

### 7. Configurar Security Group de EC2

En la consola de AWS:
- **Inbound Rules**:
  - Puerto 80 (HTTP) desde `0.0.0.0/0` o tu IP
  - Puerto 443 (HTTPS) si usas SSL (recomendado)

## ✅ Verificación

```bash
# Verificar contenedores
docker-compose ps

# Ver logs
docker-compose logs -f

# Probar endpoints
curl http://localhost/api/health
curl http://localhost
```

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build

# Acceder a contenedor backend
docker-compose exec backend sh

# Verificar configuración de Nginx
docker-compose exec nginx nginx -t

# Recargar Nginx sin reiniciar
docker-compose exec nginx nginx -s reload
```

## 🔒 Configuración SSL/HTTPS (Opcional pero Recomendado)

### Usando Let's Encrypt (Certbot)

```bash
# Instalar Certbot en el host (no en contenedor)
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --standalone -d elearning.local -d api.elearning.local

# Actualizar nginx.conf para usar SSL
# (Ver DEPLOYMENT.md para configuración SSL completa)
```

## 🐛 Troubleshooting

### Error: Cannot connect to backend
```bash
# Verificar que los contenedores están en la misma red
docker network ls
docker network inspect elearning-network
```

### Error: Nginx 502 Bad Gateway
```bash
# Verificar que backend está corriendo
docker-compose ps backend

# Verificar logs
docker-compose logs backend

# Verificar conectividad desde nginx
docker-compose exec nginx ping backend
```

### Error: CORS en frontend
- Verificar que `VITE_API_URL` está configurado correctamente
- Verificar headers CORS en nginx.conf

### Error: Database connection failed
- Verificar que RDS Security Group permite conexiones desde EC2 Security Group
- Verificar credenciales en .env
- Verificar que DB_SSL está configurado correctamente

## 📊 Estructura de Archivos

```
E-learning/
├── nginx/
│   └── nginx.conf          # Configuración del reverse proxy
├── backend/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf          # Configuración Nginx para SPA
│   └── ...
├── docker-compose.yml      # Configuración de servicios
├── .env                    # Variables de entorno (NO commiteado)
└── deploy.sh               # Script de deployment
```

## 🌐 URLs Finales

- **Frontend**: `http://elearning.local/` o `http://tu-ip/`
- **Backend API**: `http://elearning.local/api` o `http://api.elearning.local`

## 📚 Notas Importantes

1. El archivo `.env` NO debe ser commiteado (está en .gitignore)
2. Los contenedores se comunican por nombre de servicio (`frontend`, `backend`)
3. Nginx expone solo el puerto 80 al exterior
4. Frontend y Backend solo están accesibles internamente en la red Docker

