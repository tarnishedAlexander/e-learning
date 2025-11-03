#!/bin/bash

DOMAIN="elearning.local"
IP="127.0.0.1"

echo "Setting up DNS for $DOMAIN..."

# Agregar a /etc/hosts
if grep -q "$DOMAIN" /etc/hosts; then
    echo "✅ $DOMAIN ya existe en /etc/hosts"
else
    echo "$IP $DOMAIN" | sudo tee -a /etc/hosts > /dev/null
    echo "✅ Agregado $DOMAIN a /etc/hosts"
fi

echo "✅ DNS configurado!"
echo "Accede a: http://$DOMAIN"
