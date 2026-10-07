# Custom Tools, Skills & MCP Integration in Python SDK

Learn how to expose custom Python functions as agent tools and connect programmatic Model Context Protocol (MCP) clients.

---

## 1. Exposing Python Functions as Agent Tools

Decorate standard Python functions with `@tool`. Type hints and docstrings are automatically parsed into tool schemas:

```python
from antigravity import Agent, tool
from typing import List, Dict

@tool
def calculate_code_complexity(file_path: str) -> Dict[str, float]:
    """Calculates cyclomatic complexity and maintainability index for a given source file.

    Args:
        file_path: Relative path to the target source file.
    """
    # Custom analysis implementation
    return {"cyclomatic_complexity": 4.2, "maintainability_index": 87.5}

agent = Agent(
    tools=[calculate_code_complexity],
    workspace_dir="./"
)
```

---

## 2. Connecting Model Context Protocol (MCP) Servers

Connect external MCP servers directly in Python code:

```python
from antigravity import Agent, McpServerConfig

agent = Agent(
    mcp_servers=[
        McpServerConfig(
            name="postgres-db",
            command="npx",
            args=["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost:5432/app"]
        )
    ]
)
```
