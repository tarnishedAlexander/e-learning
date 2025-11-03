#!/bin/bash

echo "Installing Docker..."

sudo apt update
sudo apt install -y docker.io docker-compose git

sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -aG docker $USER

echo "✅ Done! Run: newgrp docker"
