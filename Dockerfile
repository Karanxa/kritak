FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set default environment variables
ENV FLASK_ENV=production
# Default connection to Ollama - will be overriden in Railway by environment variables
ENV OLLAMA_HOST=http://host.docker.internal:11434
ENV OLLAMA_MODEL=gemma3:1b
ENV PORT=8080
# Set this to true in Railway
ENV DISABLE_OLLAMA_CHECKS=false

# Create directories for sessions and data
RUN mkdir -p sessions data
RUN chmod -R 777 sessions data

# Expose port
EXPOSE 8080

# Remove the healthcheck for Railway deployment
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#  CMD curl -f http://localhost:8080/ || exit 1

# Start the application with gunicorn
CMD gunicorn --bind 0.0.0.0:${PORT} --workers 2 --threads 4 --timeout 120 "app:app" 