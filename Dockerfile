FROM ollama/ollama:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy model file
COPY susan.model /susan.model

# Create and run Susan model
RUN ollama serve & \
    sleep 5 && \
    ollama create susan -f /susan.model && \
    pkill ollama

# Expose Ollama port
EXPOSE 11434

# Start Ollama server
CMD ["serve"]