#!/bin/bash

# KritakAI Mac Setup Script
# This script helps Mac users set up Ollama and prepare for running KritakAI

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BOLD}KritakAI Setup for Mac${NC}"
echo "=============================="
echo ""
echo "This script will help you set up Ollama and prepare your Mac for running KritakAI."
echo ""

# Check if Homebrew is installed
check_brew() {
  echo -e "${BOLD}Checking for Homebrew...${NC}"
  if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH if needed
    if [[ $(uname -m) == 'arm64' ]]; then
      echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    echo -e "${GREEN}Homebrew installed successfully!${NC}"
  else
    echo -e "${GREEN}Homebrew is already installed.${NC}"
  fi
}

# Install Docker if not present
install_docker() {
  echo -e "${BOLD}Checking for Docker...${NC}"
  if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    brew install --cask docker
    echo -e "${GREEN}Docker installed successfully!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop from your Applications folder.${NC}"
    echo "Press any key when Docker is running..."
    read -n 1
  else
    echo -e "${GREEN}Docker is already installed.${NC}"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
      echo -e "${YELLOW}Docker is not running. Please start Docker Desktop from your Applications folder.${NC}"
      echo "Press any key when Docker is running..."
      read -n 1
    fi
  fi
}

# Install and configure Ollama
install_ollama() {
  echo -e "${BOLD}Checking for Ollama...${NC}"
  if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}Ollama not found. Installing Ollama...${NC}"
    brew install ollama
    echo -e "${GREEN}Ollama installed successfully!${NC}"
  else
    echo -e "${GREEN}Ollama is already installed.${NC}"
  fi
  
  # Start Ollama server if not running
  echo "Starting Ollama server..."
  if ! curl -s http://localhost:11434/api/version &> /dev/null; then
    ollama serve &> /dev/null &
    sleep 2
    echo -e "${GREEN}Ollama server started!${NC}"
  else
    echo -e "${GREEN}Ollama server is already running.${NC}"
  fi
  
  # Pull required models
  echo -e "${BOLD}Installing required models...${NC}"
  echo "This might take a while depending on your internet connection."
  echo ""
  
  echo "Installing gemma3:1b model..."
  ollama pull gemma3:1b
  
  echo -e "${YELLOW}Would you like to install additional models? (recommended for experimentation) [y/N]${NC}"
  read -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing llama3 model..."
    ollama pull llama3
    
    echo "Installing mistral model..."
    ollama pull mistral
  fi
  
  echo -e "${GREEN}Models installed successfully!${NC}"
}

# Create directories for KritakAI
prepare_directories() {
  echo -e "${BOLD}Preparing directories for KritakAI...${NC}"
  mkdir -p sessions data
  chmod -R 777 sessions data
  echo -e "${GREEN}Directories created and permissions set.${NC}"
}

# Main script execution
check_brew
install_docker
install_ollama
prepare_directories

# Final instructions
echo ""
echo -e "${BOLD}Setup Complete!${NC}"
echo "================================"
echo ""
echo -e "You can now run KritakAI using Docker with: ${BOLD}./run.sh${NC}"
echo ""
echo "Or use Docker Compose directly:"
echo -e "${BOLD}docker compose up -d${NC}"
echo ""
echo -e "Access KritakAI at: ${BOLD}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}Note: If you encounter any issues, please check the troubleshooting section in the README.${NC}" 