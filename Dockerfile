# Build stage for frontend
FROM oven/bun:1 AS frontend-builder
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile
COPY web/ ./
RUN bun run build

# Build stage for backend
FROM nixos/nix:latest AS backend-builder
WORKDIR /app

# Enable Nix experimental features
RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf

COPY flake.nix flake.lock ./
RUN nix develop --command echo "Nix environment ready"
COPY . .
RUN nix develop --command sh -c 'CGO_ENABLED=0 go build -ldflags="-w -s" -o server ./cmd/server'

# Final runtime stage
FROM debian:bookworm-slim
WORKDIR /app

# Install ca-certificates for HTTPS
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy backend binary
COPY --from=backend-builder /app/server /app/server

# Copy frontend build
COPY --from=frontend-builder /app/web/dist /app/web/dist

# Create data directory for photos, thumbnails and database
RUN mkdir -p /app/data/photos/thumbs

# Environment variables
ENV DATA_DIR=/app/data
ENV PORT=7070

# Expose port
EXPOSE 7070

# Volume for persistent data
VOLUME ["/app/data"]

# Run server
CMD ["/app/server"]
