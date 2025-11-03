#!/bin/bash

echo "🚀 Deploying..."

if [ ! -f .env ]; then
    echo "❌ .env not found"
    exit 1
fi

echo "🛑 Stopping..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null

echo "🔨 Building..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting..."
sleep 10

echo "📊 Status:"
docker-compose -f docker-compose.prod.yml ps

read -p "Run migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate
fi

echo "✅ Done! Access: http://your-ec2-ip"
