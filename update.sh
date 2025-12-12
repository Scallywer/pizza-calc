#!/bin/bash
# Update script for pizza-dough-calc
# Run this manually or via cron to pull latest image and restart

set -e

echo "Updating pizza-dough-calc..."

# Navigate to compose file directory
cd "$(dirname "$0")"

# Pull latest image
docker-compose -f docker-compose.prod.yml pull

# Restart container
docker-compose -f docker-compose.prod.yml up -d

echo "Update complete!"

# Show current image
docker images ghcr.io/scallywer/pizza-calc:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"


