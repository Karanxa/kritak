# kritak CTF - AI Security Challenge

An interactive web-based Capture The Flag challenge focused on AI security vulnerabilities.

## Docker Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- [Ollama](https://ollama.com/download) running locally

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd kritak-ctf
```

2. Ensure Ollama is running and pull a model:
```bash
# Pull the default model
ollama pull gemma3:1b
```

3. Start the application with Docker Compose:
```bash
docker-compose up -d
```

4. Access the CTF in your browser at `http://localhost:8080`

### Docker Configuration

The Docker setup automatically:
- Builds the kritak container from the provided Dockerfile
- Maps port 8080 for web access
- Connects to your local Ollama instance
- Persists data through volume mounts for sessions and app data

### Environment Variables

You can customize the Docker deployment by modifying the environment variables in `docker-compose.yml`:

- `OLLAMA_HOST`: URL to your Ollama instance (default: http://host.docker.internal:11434)
- `OLLAMA_MODEL`: Default model to use (default: gemma3:1b)
- `FLASK_ENV`: Application environment (production/development)

### Troubleshooting Docker Setup

- **Cannot connect to Ollama**: Ensure Ollama is running before starting the container
- **Model not found**: Make sure you've pulled the model specified in OLLAMA_MODEL
- **Permission issues**: The container needs write access to ./sessions and ./data directories
- **Linux specific**: The docker-compose.yml includes the needed host mapping for Linux users

## Direct Installation (Alternative to Docker)

If you encounter issues with Docker or prefer to run the application directly, you can use Flask:

### Prerequisites

- Python 3.8+ installed
- [Ollama](https://ollama.com/download) running locally

### Quick Start

1. Set up a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit the `.env` file if needed (defaults should work on most systems):
```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:1b
```

5. Run the Flask application:
```bash
python app.py
```

6. Access the CTF in your browser at `http://localhost:5001`

## Game Overview

The game consists of six levels of increasing difficulty that teach different aspects of AI security and prompt engineering. 