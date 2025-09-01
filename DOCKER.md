# Docker Setup for Readwise MCP HTTP Server

This project is now containerized with Docker for easy deployment and development.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Readwise access token

## Quick Start

### 1. Set up environment variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your Readwise access token:

```bash
ACCESS_TOKEN=your_readwise_access_token_here
PORT=3000
NODE_ENV=production
DEBUG=false
BASE_URL=https://readwise.io
```

### 2. Run with Docker Compose

#### Production Mode
```bash
# Build and start the production container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

#### Development Mode
```bash
# Build and start the development container with hot reloading
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop the service
docker-compose -f docker-compose.dev.yml down
```

## Manual Docker Commands

### Build the image
```bash
# Production build
docker build -t readwise-mcp-http-server .

# Development build
docker build -f Dockerfile.dev -t readwise-mcp-http-server:dev .
```

### Run the container
```bash
# Production
docker run -d \
  --name readwise-mcp-server \
  -p 3000:3000 \
  --env-file .env \
  readwise-mcp-http-server

# Development
docker run -d \
  --name readwise-mcp-server-dev \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/package.json:/app/package.json \
  -v $(pwd)/tsconfig.json:/app/tsconfig.json \
  readwise-mcp-http-server:dev
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ACCESS_TOKEN` | Your Readwise API access token | - | Yes |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment mode | production | No |
| `DEBUG` | Enable debug logging | false | No |
| `BASE_URL` | Readwise API base URL | https://readwise.io | No |

## Health Checks

The container includes health checks that verify the `/health` endpoint is responding:

- **Interval**: 30 seconds
- **Timeout**: 3 seconds (production) / 10 seconds (development)
- **Retries**: 3
- **Start period**: 5 seconds (production) / 40 seconds (development)

## Volumes

### Production
- `./logs:/app/logs` - Persistent log storage

### Development
- `./src:/app/src` - Source code mounting for hot reloading
- `./package.json:/app/package.json` - Package file mounting
- `./tsconfig.json:/app/tsconfig.json` - TypeScript config mounting
- `./logs:/app/logs` - Persistent log storage

## Networks

The containers use custom bridge networks:
- **Production**: `readwise-network`
- **Development**: `readwise-network-dev`

## Troubleshooting

### Container won't start
1. Check if port 3000 is available
2. Verify your `.env` file exists and has the required `ACCESS_TOKEN`
3. Check container logs: `docker-compose logs`

### Permission issues
The container runs as a non-root user (UID 1001). If you encounter permission issues with mounted volumes, ensure proper ownership.

### Build failures
1. Ensure all source files are present
2. Check that `package.json` and `tsconfig.json` are valid
3. Verify Docker has sufficient resources

### Health check failures
1. Ensure the application is properly starting
2. Check if the `/health` endpoint is implemented
3. Verify the container can bind to port 3000

## Development Workflow

1. **Start development container**: `docker-compose -f docker-compose.dev.yml up -d`
2. **Make code changes** in your local `src/` directory
3. **Changes auto-reload** thanks to volume mounting and tsx watch mode
4. **View logs**: `docker-compose -f docker-compose.dev.yml logs -f`
5. **Stop development**: `docker-compose -f docker-compose.dev.yml down`

## Production Deployment

1. **Build production image**: `docker build -t readwise-mcp-http-server .`
2. **Set production environment variables** in `.env`
3. **Run with docker-compose**: `docker-compose up -d`
4. **Monitor health**: `docker-compose ps`

## Security Features

- **Non-root user**: Container runs as `nodejs` user (UID 1001)
- **Minimal base image**: Uses Alpine Linux for smaller attack surface
- **Health checks**: Built-in monitoring for container health
- **Environment isolation**: Separate networks for production and development
