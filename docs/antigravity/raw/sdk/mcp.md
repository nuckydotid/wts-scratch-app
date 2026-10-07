# Model Context Protocol (MCP) integration

Connect external Model Context Protocol (MCP) servers to your Antigravity SDK agents.

In Python applications built using the Antigravity SDK, MCP servers (`stdio` or `Streamable HTTP`) are connected programmatically under a unified execution pipeline alongside built-in tools and custom Python functions.

## Programmatic MCP server setup

You can define MCP servers programmatically in your application’s `LocalAgentConfig` using `McpStdioServer` or `McpStreamableHttpServer`.

For example, you can configure an agent to connect to an external SQLite MCP server via `stdio`:

```
import asyncio
from google.antigravity import Agent, LocalAgentConfig
from google.antigravity.types import McpStdioServer

config = LocalAgentConfig(
    mcp_servers=[
        McpStdioServer(
            name="sqlite-explorer",
            command="node",
            args=["/usr/local/bin/sqlite-mcp-server.js"],
            env={"SQLITE_DB_PATH": "/var/data/app.db"},
        )
    ]
)

async def main():
    async with Agent(config) as agent:
        response = await agent.chat("Query database metrics.")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
```

For more details on MCP protocol capabilities across the Antigravity suite, see the central [Model Context Protocol guide](/docs/mcp).

## Sample code

For full working code examples, see the GitHub repository:

- [`mcp_tools.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/mcp_tools.py)
