FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set default environment variables
ENV FLASK_ENV=production
# Default to host.docker.internal for Docker Desktop (Mac/Windows)
# Linux users may need to override with --add-host or environment variables
ENV OLLAMA_HOST=https://trout-unified-heartily.ngrok-free.app
ENV OLLAMA_MODEL=gemma3:1b
ENV PORT=8080

# Create directories for sessions and data
RUN mkdir -p sessions data
RUN chmod -R 777 sessions data

# Expose port
EXPOSE 8080

# Health check to verify the app is running properly
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--threads", "4", "--timeout", "120", "app:app"] 
