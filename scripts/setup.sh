#!/bin/bash

# Arena Debate Platform - Setup Script
# This script helps you set up the development environment

set -e

echo "🎯 Arena Debate Platform - Setup Script"
echo "========================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check npm version
echo "Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo "❌ Error: npm 9 or higher is required"
    echo "Current version: $(npm -v)"
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your credentials"
else
    echo ""
    echo "⚠️  .env file already exists, skipping..."
fi

# Check for Docker
echo ""
echo "Checking for Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed: $(docker --version)"

    # Ask if user wants to use Docker
    read -p "Do you want to start services with Docker? (PostgreSQL, Redis) [y/N]: " use_docker

    if [[ $use_docker == "y" || $use_docker == "Y" ]]; then
        echo "Starting Docker services..."
        docker-compose up -d postgres redis
        echo "✅ Docker services started"

        # Wait for PostgreSQL
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
    fi
else
    echo "⚠️  Docker not found. You'll need to install PostgreSQL and Redis manually."
fi

# Setup database
echo ""
read -p "Do you want to set up the database? [y/N]: " setup_db

if [[ $setup_db == "y" || $setup_db == "Y" ]]; then
    echo "Setting up database..."
    npm run db:push
    echo "✅ Database schema created"

    read -p "Do you want to seed the database with sample data? [y/N]: " seed_db
    if [[ $seed_db == "y" || $seed_db == "Y" ]]; then
        npm run db:seed
        echo "✅ Database seeded"
    fi
fi

echo ""
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials (especially AWS keys)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see the app"
echo ""
echo "Demo users (if you seeded the database):"
echo "  - alex@arena.dev / demo123"
echo "  - sam@arena.dev / demo123"
echo "  - taylor@arena.dev / demo123"
echo ""
echo "Happy debating! 🎯"
