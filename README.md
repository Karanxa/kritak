# kritak CTF - GenAI Security Challenge

An interactive web-based Capture The Flag challenge focused on GenAI security vulnerabilities.

## Table of Contents

- [Overview](#overview)
- [Docker Installation](#docker-installation)
- [Direct Installation](#direct-installation-alternative-to-docker)
- [Game Levels](#game-levels)
- [Troubleshooting](#troubleshooting-docker-setup)

## Overview

Kritak CTF is a hands-on learning platform designed to teach GenAI security concepts through practical challenges. Each level explores a different vulnerability in large language models, gradually increasing in complexity.

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

## Game Levels

The game consists of six progressive levels, each focusing on a specific GenAI security vulnerability:

1. **Basic Prompt Injection** - Learn to bypass an AI's primary instructions by directly manipulating prompts.
   - *Technical focus*: Direct instruction override techniques
   - *Flag*: kritak{b4s1c_pr0mpt_1nj3ct10n}

2. **Role Confusion** - Master the art of convincing an AI to assume different identities with elevated permissions.
   - *Technical focus*: Identity and authorization manipulation
   - *Flag*: kritak{r0l3_c0nfus10n_4tt4ck}

3. **Delimiter Bypass** - Exploit formatting and special characters to bypass security filters.
   - *Technical focus*: Escaping security boundaries using formatting techniques
   - *Flag*: kritak{d3l1m1t3r_byp4ss_m4st3r}

4. **Indirect Prompt Injection** - Extract sensitive information through indirect questioning.
   - *Technical focus*: Pattern completion and implicit information extraction
   - *Flag*: kritak{1nd1r3ct_pr0mpt_1nj3ct10n_pr0}

5. **Chain-of-Thought Exploitation** - Lead an AI through reasoning processes that reveal protected information.
   - *Technical focus*: Exploiting guided reasoning vulnerabilities
   - *Flag*: kritak{ch41n_0f_th0ught_3xpl01t}

6. **Context Window Exploitation** - Access protected information by manipulating how LLMs process context.
   - *Technical focus*: Context boundary manipulation and memory exploitation
   - *Flag*: kritak{c0nt3xt_w1nd0w_m4st3ry}

## Troubleshooting Docker Setup

- **Cannot connect to Ollama**: Ensure Ollama is running before starting the container
- **Model not found**: Make sure you've pulled the model specified in OLLAMA_MODEL
- **Permission issues**: The container needs write access to ./sessions and ./data directories
- **Linux specific**: The docker-compose.yml includes the needed host mapping for Linux users
