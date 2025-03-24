FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV FLASK_ENV=production
ENV OLLAMA_HOST=https://trout-unified-heartily.ngrok-free.app
ENV OLLAMA_MODEL=gemma3:1b

# Expose port for Railway
EXPOSE 8080
ENV PORT=8080

# Create directories for sessions and data
RUN mkdir -p sessions data

# Start the application with gunicorn
CMD gunicorn --bind 0.0.0.0:8080 --workers 2 --threads 4 --timeout 120 "app:app" 