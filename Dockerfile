# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built application from builder stage
COPY --from=builder /app/dist/Angular-Test/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
