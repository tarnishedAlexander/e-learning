#!/bin/bash

# Script para debuggear URLs de S3

BACKEND_URL="http://localhost:3001"

echo "🔍 Debugging S3 Video URLs"
echo "================================"
echo ""

# Endpoint de debug
echo "📍 Llamando a: $BACKEND_URL/api/debug/video?s3Key=videos/test-video.mp4"
echo ""

curl -s "$BACKEND_URL/api/debug/video?s3Key=videos/test-video.mp4" | jq '.'

echo ""
echo "================================"
echo "📍 Para un s3Key específico:"
echo "curl '$BACKEND_URL/api/debug/video?s3Key=YOUR_S3_KEY'"
echo ""

# Si tienes un s3Key actual, puedes probarlo:
if [ ! -z "$1" ]; then
  echo "📍 Probando con tu s3Key: $1"
  echo ""
  curl -s "$BACKEND_URL/api/debug/video?s3Key=$1" | jq '.'
fi
