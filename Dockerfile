FROM node:22-slim

# Install Python, curl, and ffmpeg (required for yt-dlp merging)
RUN apt-get update && \
    apt-get install -y python3 curl ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Download latest linux yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy package files first for better Docker caching
COPY package.json package-lock.json ./

# Install dependencies with increased memory
RUN npm install --ignore-scripts && \
    npx --yes allow-scripts 2>/dev/null || true

# Copy all source code
COPY . ./

# Build the React Frontend with increased Node memory for large WASM/AI bundles
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

EXPOSE 3001

# Start the full stack server
CMD ["node", "server/api.js"]
