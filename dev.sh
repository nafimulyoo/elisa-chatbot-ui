#!/bin/bash

# Script to stop, remove, rebuild, and run a Docker container for Next.js

IMAGE_NAME="elisa-frontend-dev"
CONTAINER_NAME="elisa-frontend-dev-container"
PORT_DEV=3000
PORT=3030

# Function to stop and remove the container
stop_and_remove() {
  if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo "Stopping and removing container: $CONTAINER_NAME"
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
  else
    echo "Container $CONTAINER_NAME not found."
  fi
}

# Function to build the Docker image
build_image() {
  echo "Building Docker image: $IMAGE_NAME"
  docker build -t "$IMAGE_NAME":latest -f Dockerfile.dev . 
}

# Function to run the Docker container
run_container() {
  echo "Running Docker container: $CONTAINER_NAME"
  docker run -d --name "$CONTAINER_NAME" -p "$PORT:$PORT_DEV" "$IMAGE_NAME":latest
}

# Main execution
stop_and_remove
build_image
run_container

echo "Next.js application running in Docker container $CONTAINER_NAME on port $PORT"
