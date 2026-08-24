FROM node:20-slim

# Install Python and curl (required for yt-dlp)
RUN apt-get update && \
    apt-get install -y python3 curl && \
    rm -rf /var/lib/apt/lists/*

# Download latest linux yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy server code
COPY server/ ./server/

EXPOSE 3001

# Start the Express server
CMD ["node", "server/api.js"]
