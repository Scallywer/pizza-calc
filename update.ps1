# PowerShell update script for pizza-dough-calc
# Run this manually or via Task Scheduler to pull latest image and restart

Write-Host "Updating pizza-dough-calc..." -ForegroundColor Green

# Navigate to compose file directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Pull latest image
docker-compose -f docker-compose.prod.yml pull

# Restart container
docker-compose -f docker-compose.prod.yml up -d

Write-Host "Update complete!" -ForegroundColor Green

# Show current image
docker images ghcr.io/scallywer/pizza-calc:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"

