FROM node:22-slim

# Install Python, curl, and ffmpeg (required for yt-dlp merging)
RUN apt-get update && \
    apt-get install -y python3 curl ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Download latest linux yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy all files
COPY . ./

# Install dependencies
RUN npm install

# Build the React Frontend (Vite)
RUN npm run build

EXPOSE 3001

# Start the full stack server (serves both API and Frontend)
CMD ["node", "server/api.js"]
