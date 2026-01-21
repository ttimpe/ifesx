FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start command (using dev script for hot reload)
# Note: For production you would build and run node dist/app.js
CMD ["npm", "run", "dev"]
