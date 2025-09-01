# AGENTS.md - Development Notes & Ideas

## Project Overview
- **Readwise MCP HTTP Server**: Node.js server providing MCP (Model Context Protocol) over HTTP access to Readwise highlights
- **Tech Stack**: TypeScript, Express, MCP SDK, Readwise API
- **Containerization**: Docker with Node.js 22 (stable) Alpine base

## Development Environment Tips
- Use `docker-compose -f docker-compose.dev.yml up -d` for development with hot reloading
- Development server runs on port 3456 (mapped from container port 3000)
- Production server runs on port 3000
- Source code is mounted as volumes in dev mode for instant reloading
- Use `docker-compose logs -f` to tail logs in real-time

## Docker Workflow
- **Development**: `docker-compose -f docker-compose.dev.yml up -d` (hot reloading)
- **Production**: `docker-compose up -d` (optimized build)
- **Build test**: `docker build -t test-image .` to verify builds work
- **Cleanup**: `docker-compose down` or `docker-compose -f docker-compose.dev.yml down`

## Environment Configuration
- All environment variables are now centralized in `.env` file
- No duplicate environment variables in docker-compose files
- Required: `ACCESS_TOKEN` (Readwise API token)
- Optional: `PORT`, `NODE_ENV`, `DEBUG`, `BASE_URL`
- Copy `.env.example` to `.env` and configure

## Code Structure Notes
- Main server: `src/mcp-http-server.ts`
- TypeScript config: `tsconfig.json`
- Package scripts: `build`, `start`, `dev`, `watch`
- Health check endpoint: `/health`
- MCP endpoints: `/mcp`, `/mcp/stream`, `/mcp/info`

## Testing & Validation
- Health checks built into Docker containers
- MCP protocol validation via official SDK
- Error handling with retry logic for API failures
- Debug logging when `DEBUG=true`

## Security Considerations
- Non-root user (UID 1001) in containers
- Alpine Linux base for minimal attack surface
- Environment variable isolation
- Separate networks for dev/prod

## Performance Optimizations
- Multi-stage Docker builds (install all deps, build, prune dev deps)
- Volume mounting for development hot reloading
- Health check monitoring
- Automatic container restart policies

## Future Ideas
- [ ] Add metrics collection (Prometheus/Grafana)
- [ ] Implement rate limiting
- [ ] Add authentication middleware
- [ ] Support for multiple Readwise accounts
- [ ] Caching layer for API responses
- [ ] Webhook support for real-time updates
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline with automated testing

## Troubleshooting Notes
- If container won't start: check port availability and .env file
- Build failures: ensure TypeScript and all dependencies are available
- Permission issues: containers run as non-root user
- Health check failures: verify /health endpoint implementation

## API Integration Notes
- Uses official `@readwise/readwise-mcp` package
- Vector search and full-text search capabilities
- Streaming responses for real-time results
- Automatic retry logic for API failures
- CORS support for cross-origin requests
