FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port (Angular default)
EXPOSE 4200

# Start command
# --host 0.0.0.0 is crucial for Docker
# CHOKIDAR_USEPOLLING=true env var (set in compose) usually helps, but we can also add --poll just in case if needed.
# For now, standard serving:
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--disable-host-check"]
