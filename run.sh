#!/bin/bash

# KritakAI Docker Runner Script
# This script helps run KritakAI with various configuration options

# Default values
PORT=8080
OLLAMA_HOST="http://host.docker.internal:11434"
OLLAMA_MODEL="gemma3:1b"
CONTAINER_NAME="kritak"

# Display help
show_help() {
  echo "KritakAI Docker Runner"
  echo "======================"
  echo ""
  echo "Usage: ./run.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help              Show this help message"
  echo "  -p, --port PORT         Port to run on (default: 8080)"
  echo "  -o, --ollama URL        Ollama host URL (default: http://host.docker.internal:11434)"
  echo "  -m, --model MODEL       Model to use (default: gemma3:1b)"
  echo "  -n, --name NAME         Container name (default: kritak)"
  echo "  -r, --remote URL        Use a remote Ollama instance at URL"
  echo "  -b, --build             Force rebuild the Docker image"
  echo "  -d, --down              Stop and remove the container"
  echo ""
  echo "Examples:"
  echo "  ./run.sh                        # Run with default settings"
  echo "  ./run.sh -p 3000                # Run on port 3000"
  echo "  ./run.sh -m llama3              # Use llama3 model"
  echo "  ./run.sh -r https://my-ollama-server.com  # Use remote Ollama instance"
  echo "  ./run.sh -d                     # Stop and remove the container"
  echo ""
}

# Parse arguments
REBUILD=false
DOWN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -o|--ollama)
      OLLAMA_HOST="$2"
      shift 2
      ;;
    -r|--remote)
      OLLAMA_HOST="$2"
      shift 2
      ;;
    -m|--model)
      OLLAMA_MODEL="$2"
      shift 2
      ;;
    -n|--name)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    -b|--build)
      REBUILD=true
      shift
      ;;
    -d|--down)
      DOWN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Stop and remove the container if requested
if $DOWN; then
  echo "Stopping and removing KritakAI container..."
  docker stop $CONTAINER_NAME >/dev/null 2>&1
  docker rm $CONTAINER_NAME >/dev/null 2>&1
  echo "Container removed."
  exit 0
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed. Please install Docker first."
  exit 1
fi

# Create directories if they don't exist
mkdir -p sessions data

# Build the Docker image if necessary or requested
if $REBUILD || [ -z "$(docker images -q kritak 2>/dev/null)" ]; then
  echo "Building KritakAI Docker image..."
  docker build -t kritak .
fi

# Check if container already exists and is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
  echo "KritakAI is already running!"
  echo "To restart, run: ./run.sh -d && ./run.sh"
  exit 0
fi

# Remove container if it exists but is not running
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  docker rm $CONTAINER_NAME >/dev/null
fi

# Run the container
echo "Starting KritakAI..."
echo "Ollama host: $OLLAMA_HOST"
echo "Model: $OLLAMA_MODEL"
echo "Port: $PORT"

docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:8080 \
  -e OLLAMA_HOST=$OLLAMA_HOST \
  -e OLLAMA_MODEL=$OLLAMA_MODEL \
  -v "$(pwd)"/sessions:/app/sessions \
  -v "$(pwd)"/data:/app/data \
  kritak

echo ""
echo "KritakAI is now running!"
echo "Access it at: http://localhost:$PORT"
echo ""
echo "To stop KritakAI, run: ./run.sh -d" 