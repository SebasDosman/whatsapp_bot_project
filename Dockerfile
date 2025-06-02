# Use Node.js base image with Alpine Linux for a lightweight container
FROM node:18-alpine

# Environment variables to avoid warnings and set up Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Create app directory and set it as the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Configure Puppeteer to use the system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install dependencies and clean up cache
RUN npm ci --only=production && npm cache clean --force

# Create a non-root user and group for running the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S whatsappbot -u 1001

# Copy the rest of the application code
COPY --chown=whatsappbot:nodejs . .

# Create necessary directories and set permissions
RUN mkdir -p /app/.wwebjs_auth /app/logs /app/public && \
    chown -R whatsappbot:nodejs /app

# Change to the non-root user
USER whatsappbot

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "src/bot/index.js"]