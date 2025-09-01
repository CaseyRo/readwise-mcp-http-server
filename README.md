# Readwise MCP HTTP Server

A Node.js HTTP server that provides **proper MCP (Model Context Protocol) over HTTP** access to Readwise highlights and documents, using the official `@readwise/readwise-mcp` module.

## Features

- 🔍 **Search Highlights**: Vector and full-text search through your Readwise highlights (using official Readwise MCP module)
- 📡 **Streaming Responses**: Real-time streaming of search results
- 🏥 **Health Checks**: Server health monitoring
- 🔄 **Automatic Retries**: Built-in retry logic for API failures
- 🛡️ **CORS Support**: Cross-origin request support
- 🔍 **Comprehensive Debugging**: Detailed logging for development and troubleshooting
- 🌐 **Network Access**: Accessible from all network interfaces
- ✅ **Official Module**: Uses the same tool implementation as the official Readwise MCP module



## Installation

### Option 1: Local Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your Readwise access token to `.env`:
```
ACCESS_TOKEN=your_readwise_access_token_here
PORT=3000
```

### Option 2: Docker Installation (Recommended)

1. Create environment file:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
```
ACCESS_TOKEN=your_readwise_access_token_here
PORT=3000
NODE_ENV=production
DEBUG=false
BASE_URL=https://readwise.io
```

3. Run with Docker Compose:
```bash
# Production
docker-compose up -d

# Development (with hot reloading)
docker-compose -f docker-compose.dev.yml up -d
```

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md).

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Watch Mode
```bash
npm run watch
```

### Docker Usage

#### Production Mode
```bash
# Start the production container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

#### Development Mode (with hot reloading)
```bash
# Start the development container
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop the service
docker-compose -f docker-compose.dev.yml down
```

### Debug Mode

Enable detailed debugging by setting the `DEBUG` environment variable:

```bash
# Enable debug mode
DEBUG=true npm run dev

# Or set in .env file
DEBUG=true
```

Debug mode provides detailed logging for:
- Connection attempts
- Request/response details
- Tool execution steps
- API calls to Readwise
- Error details

## API Endpoints

### MCP Protocol Endpoint
```http
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_readwise_highlights",
    "arguments": {
      "vector_search_term": "machine learning"
    }
  }
}
```

### MCP Streaming Endpoint
```http
POST /mcp/stream
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_readwise_highlights",
    "arguments": {
      "vector_search_term": "machine learning"
    }
  }
}
```

### Server Info
```http
GET /mcp/info
```

### Health Check
```http
GET /health
```

## Available Tools

The server provides the same tools as the official Readwise MCP module:

### `search_readwise_highlights`
Search through your Readwise highlights using vector search and full-text queries.

**Parameters:**
- `vector_search_term` (required): Semantic search term for vector search
- `full_text_queries` (required): Array of field-specific searches

**Note:** Both parameters are required. Empty arguments will result in a validation error.

**Search Field Types:**
- `document_author` - Author of the source document
- `document_title` - Title of the source document
- `highlight_note` - Notes you've added to highlights
- `highlight_plaintext` - The actual highlighted text
- `highlight_tags` - Tags you've applied to highlights

## Example Usage

### Initialize MCP Connection
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize"
  }'
```

### List Available Tools
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

### Search Highlights (MCP Protocol)
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "search_readwise_highlights",
      "arguments": {
        "vector_search_term": "machine learning"
      }
    }
  }'
```

### Stream Search Results (MCP Protocol)
```bash
curl -X POST http://localhost:3000/mcp/stream \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "search_readwise_highlights",
      "arguments": {
        "vector_search_term": "machine learning",
        "full_text_queries": [
          {
            "field_name": "highlight_plaintext",
            "search_term": "artificial intelligence"
          }
        ]
      }
    }
  }'
```

### Invalid Arguments Example
```bash
# This will return an error because both parameters are required
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "search_readwise_highlights",
      "arguments": {}
    }
  }'
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "error": {
    "code": -32602,
    "message": "Invalid arguments: Required, Required"
  }
}
```

## Environment Variables

- `ACCESS_TOKEN` (required): Your Readwise access token
- `PORT` (optional): Server port (default: 3000)
- `BASE_URL` (optional): Readwise API base URL (default: https://readwise.io)
- `DEBUG` (optional): Enable debug logging (set to `true` for detailed logs)
- `NODE_ENV` (optional): Set to `development` to enable debug mode automatically

## Network Connectivity

The servers are configured to bind to all network interfaces (`0.0.0.0`), making them accessible from:

- **Localhost**: `http://localhost:3000`
- **Local Network**: `http://YOUR_IP_ADDRESS:3000`
- **Docker**: `http://host.docker.internal:3000`

To find your server's IP address:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

## Error Handling

The server includes comprehensive error handling:
- Input validation using Zod schemas
- Automatic retry logic for failed API calls
- Proper HTTP status codes
- Detailed error messages
- Comprehensive logging for debugging

## Debugging

The server provides extensive debugging capabilities:

### Debug Logs
When debug mode is enabled, you'll see detailed logs for:
- **Connection tracking**: Every incoming request with IP and user agent
- **Request processing**: Step-by-step MCP request handling
- **Tool execution**: Detailed tool call processing
- **API interactions**: Readwise API calls and responses
- **Streaming**: Real-time streaming progress
- **Error details**: Full error stack traces and context

### Debug Output Example
```
[2024-01-15T10:30:00.000Z] ℹ️  INFO: Initializing Readwise MCP HTTP Server
[2024-01-15T10:30:00.000Z] 🔍 DEBUG: Port: 3000, Debug: true, NodeEnv: development
[2024-01-15T10:30:00.000Z] 🔗 CONNECTION: POST /mcp from 127.0.0.1
[2024-01-15T10:30:00.000Z] 🔍 DEBUG: Request body: {"jsonrpc":"2.0","id":1,"method":"tools/call"...}
[2024-01-15T10:30:00.000Z] 🔍 DEBUG: Processing MCP method: tools/call
[2024-01-15T10:30:00.000Z] 🔍 DEBUG: Tool call requested: search_readwise_highlights
[2024-01-15T10:30:00.000Z] 🔍 DEBUG: Calling Readwise API: {"vector_search_term":"machine learning"}
[2024-01-15T10:30:00.000Z] 🔍 DEBUG: Readwise API response received: 5 results
```

## Development

### Project Structure
```
src/
  index.ts          # Main server file
dist/               # Compiled JavaScript (generated)
node_modules/       # Dependencies
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm run watch` - Watch for changes and restart
- `npm start` - Run compiled JavaScript

## License

MIT
