# Frontend Distroless Dockerfile for Development/Demo
# Multi-stage build for React/Vite application

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development)
RUN npm install

# Copy source code
COPY . .

# Build the application for development
RUN npm run build

# Stage 2: Create a simple static server
FROM node:18-alpine AS server-setup

WORKDIR /app

# Install serve package for static file serving
RUN npm install -g serve

# Stage 3: Final distroless runtime with Node.js
FROM gcr.io/distroless/nodejs18-debian11:latest

WORKDIR /app

# Copy the built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy serve from server-setup stage
COPY --from=server-setup /usr/local/lib/node_modules ./node_modules

# Set environment to development
ENV NODE_ENV=development

# Expose port
EXPOSE 3001

# Start the static server
CMD ["node_modules/serve/bin/serve.js", "-s", "dist", "-l", "3001"]
