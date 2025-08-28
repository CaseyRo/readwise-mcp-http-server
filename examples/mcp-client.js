#!/usr/bin/env node
/** @format */

// Example MCP HTTP Client
// This demonstrates how to properly interact with the MCP HTTP server
//
// Network connectivity examples:
// - Local: http://localhost:3000
// - Network: http://192.168.1.100:3000 (replace with your server's IP)
// - Docker: http://host.docker.internal:3000

import fetch from "node-fetch";

class McpHttpClient {
    constructor(baseUrl = "http://localhost:3000") {
        this.baseUrl = baseUrl;
        this.requestId = 1;
    }

    async makeRequest(method, params = null) {
        const request = {
            jsonrpc: "2.0",
            id: this.requestId++,
            method,
            params
        };

        const response = await fetch(`${this.baseUrl}/mcp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });

        return await response.json();
    }

    async initialize() {
        console.log("🔧 Initializing MCP connection...");
        const result = await this.makeRequest("initialize");
        console.log("✅ Initialization result:", result);
        return result;
    }

    async listTools() {
        console.log("📋 Listing available tools...");
        const result = await this.makeRequest("tools/list");
        console.log("✅ Available tools:", result);
        return result;
    }

    async callTool(name, args) {
        console.log(`🔧 Calling tool: ${name}`);
        const result = await this.makeRequest("tools/call", { name, arguments: args });
        console.log("✅ Tool result:", result);
        return result;
    }

    async streamToolCall(name, args) {
        console.log(`📡 Streaming tool call: ${name}`);

        const request = {
            jsonrpc: "2.0",
            id: this.requestId++,
            method: "tools/call",
            params: { name, arguments: args }
        };

        const response = await fetch(`${this.baseUrl}/mcp/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });

        const reader = response.body;
        let buffer = "";

        for await (const chunk of reader) {
            buffer += chunk.toString();

            // Process complete JSON objects
            const lines = buffer.split("\n");
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const result = JSON.parse(line);
                        console.log("📡 Stream chunk:", result);
                    } catch (e) {
                        console.log("⚠️  Invalid JSON:", line);
                    }
                }
            }
        }
    }
}

// Example usage
async function main() {
    const client = new McpHttpClient();

    try {
        // Initialize the connection
        await client.initialize();

        // List available tools
        await client.listTools();

        // Call tool with vector search
        await client.callTool("search_readwise_highlights", {
            vector_search_term: "machine learning"
        });

        // Call tool with full-text queries
        await client.callTool("search_readwise_highlights", {
            full_text_queries: [
                {
                    field_name: "highlight_plaintext",
                    search_term: "artificial intelligence"
                }
            ]
        });

        // Stream tool call
        await client.streamToolCall("search_readwise_highlights", {
            vector_search_term: "programming"
        });
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run the example
main();
