# syntax=docker/dockerfile:1
FROM node:18-alpine AS build
WORKDIR /app

# Install root deps
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy entire repo (Vite config is at repo root; project root contains client/)
COPY . .

# Pass-through Vite env if provided (optional)
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

# Build frontend with Vite directly (avoid server bundling in package build script)
RUN npx vite build

FROM node:18-alpine AS runtime
WORKDIR /app
RUN npm i -g serve@14.2.3
# Vite outDir is dist/public per vite.config.ts
COPY --from=build /app/dist/public ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]


