#!/bin/bash
set -e

# Configuration
REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"
IMAGE_NAME="say-cheese"
VERSION="${VERSION:-latest}"
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${VERSION}"

echo "🐳 Building Docker image..."
docker build -t "${FULL_IMAGE}" .

echo "📤 Pushing to registry ${REGISTRY}..."
docker push "${FULL_IMAGE}"

echo "✅ Deployed: ${FULL_IMAGE}"
echo ""
echo "To run on your server:"
echo "  docker pull ${FULL_IMAGE}"
echo "  docker run -d -p 7070:7070 -v ./data:/app/data ${FULL_IMAGE}"
echo ""
echo "Or with docker-compose:"
echo "  Update image: in docker-compose.yml to: ${FULL_IMAGE}"
echo "  docker-compose up -d"
