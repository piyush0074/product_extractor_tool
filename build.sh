#!/bin/bash

# Build script for BharatX Price Comparison API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
IMAGE_NAME="bharatx-price-comparison"
TAG="latest"
BUILD_TYPE="production"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -d|--dev)
            BUILD_TYPE="development"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -t, --tag TAG     Set image tag (default: latest)"
            echo "  -d, --dev         Build for development"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Building BharatX Price Comparison API..."

# Build the Docker image
if [ "$BUILD_TYPE" = "development" ]; then
    print_status "Building development image..."
    docker build -t "${IMAGE_NAME}:${TAG}-dev" .
    print_status "Development image built successfully: ${IMAGE_NAME}:${TAG}-dev"
else
    print_status "Building production image..."
    docker build -t "${IMAGE_NAME}:${TAG}" .
    print_status "Production image built successfully: ${IMAGE_NAME}:${TAG}"
fi

print_status "Build completed successfully!"

# Show available commands
echo ""
print_status "Available commands:"
echo "  Run with Docker:"
echo "    docker run -p 3000:3000 ${IMAGE_NAME}:${TAG}"
echo ""
echo "  Run with Docker Compose:"
if [ "$BUILD_TYPE" = "development" ]; then
    echo "    docker-compose --profile dev up"
else
    echo "    docker-compose up"
fi
echo ""
echo "  Stop containers:"
echo "    docker-compose down"
echo ""
echo "  View logs:"
echo "    docker-compose logs -f" 