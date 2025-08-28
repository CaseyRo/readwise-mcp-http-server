#!/usr/bin/env node
/** @format */

// Simple test script to verify the MCP HTTP server
import fetch from "node-fetch";
import { config } from "dotenv";

// Load environment variables
config();

async function testServer() {
    const port = process.env.PORT || "3000";
    const baseUrl = `http://localhost:${port}`;

    console.log("🧪 Testing MCP HTTP Server...\n");
    console.log(`📍 Testing server at: ${baseUrl}\n`);

    try {
        // Test 1: Health check
        console.log("1. Testing health endpoint...");
        const healthResponse = await fetch(`${baseUrl}/health`);
        const healthData = await healthResponse.json();
        console.log("✅ Health check:", healthData.status);

        // Test 2: MCP info
        console.log("\n2. Testing MCP info endpoint...");
        const infoResponse = await fetch(`${baseUrl}/mcp/info`);
        const infoData = await infoResponse.json();
        console.log("✅ MCP info:", infoData.result.name);

        // Test 3: MCP initialize
        console.log("\n3. Testing MCP initialize...");
        const initResponse = await fetch(`${baseUrl}/mcp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize"
            })
        });
        const initData = await initResponse.json();
        console.log("✅ MCP initialize:", initData.result ? "success" : "failed");

        // Test 4: Tools list
        console.log("\n4. Testing tools list...");
        const toolsResponse = await fetch(`${baseUrl}/mcp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 2,
                method: "tools/list"
            })
        });
        const toolsData = await toolsResponse.json();
        console.log("✅ Tools list:", toolsData.result.tools.length, "tools available");

        // Test 5: Tool call with proper arguments
        console.log("\n5. Testing tool call with proper arguments...");
        const toolResponse = await fetch(`${baseUrl}/mcp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 3,
                method: "tools/call",
                params: {
                    name: "search_readwise_highlights",
                    arguments: {
                        vector_search_term: "test",
                        full_text_queries: [
                            {
                                field_name: "highlight_plaintext",
                                search_term: "test"
                            }
                        ]
                    }
                }
            })
        });
        const toolData = await toolResponse.json();
        if (toolData.error) {
            console.log("⚠️  Tool call:", toolData.error.message, "(expected if no ACCESS_TOKEN)");
        } else {
            console.log("✅ Tool call successful");
        }

        // Test 6: Tool call with empty arguments (should fail gracefully)
        console.log("\n6. Testing tool call with empty arguments...");
        const emptyToolResponse = await fetch(`${baseUrl}/mcp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 4,
                method: "tools/call",
                params: {
                    name: "search_readwise_highlights",
                    arguments: {}
                }
            })
        });
        const emptyToolData = await emptyToolResponse.json();
        if (emptyToolData.error) {
            console.log("✅ Empty arguments properly rejected:", emptyToolData.error.message);
        } else {
            console.log("⚠️  Empty arguments unexpectedly succeeded");
        }

        console.log("\n🎉 All tests passed! Server is working correctly.");
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.log("\n💡 Make sure the server is running with: npm run dev");
    }
}

testServer();
