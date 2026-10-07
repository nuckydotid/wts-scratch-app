# Google Antigravity SDK

The Google Antigravity SDK is a Python SDK for building autonomous AI agents powered by Antigravity and Gemini. It provides a secure, stateful runtime harness that handles tool execution, context management, safety policies, and subagent delegation.

If you’re looking for the managed cloud REST/gRPC API instead of the local Python SDK runtime, see the [Gemini API Antigravity Agent documentation](https://ai.google.dev/gemini-api/docs/antigravity-agent).

## Quickstart

Install the SDK package using `pip` and configure your API key to get started:

```
pip install google-antigravity
```

Set your Gemini API key in your environment:

```
export GEMINI_API_KEY="your_api_key_here"
```

Initialize an `Agent` and start a conversation:

```
import asyncio
from google.antigravity import Agent, LocalAgentConfig

async def main():
    config = LocalAgentConfig()
    async with Agent(config) as agent:
        response = await agent.chat("What files are in the current directory?")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
```

## Gemini Enterprise Agent Platform

To connect the SDK to Gemini Enterprise Agent Platform (formerly Vertex AI), set `vertex=True` in `LocalAgentConfig` alongside your GCP `project` and `location`:

```
from google.antigravity import Agent, LocalAgentConfig

config = LocalAgentConfig(
    vertex=True,
    project="your-gcp-project",
    location="us-central1",
)

async with Agent(config) as agent:
    response = await agent.chat("Hello!")
    print(await response.text())
```

Environment variables are also supported:

```
export GOOGLE_GENAI_USE_VERTEXAI=True
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
gcloud auth application-default login
```

## Core agent foundations

The `Agent` class manages binary discovery, tool execution, and session lifecycles behind an async context manager.

For example, you can configure an agent with custom system instructions to interact using a specific persona:

```
import asyncio
from google.antigravity import Agent, LocalAgentConfig

async def main():
    config = LocalAgentConfig(
        system_instructions=(
            "You are a helpful pirate assistant. Speak like a pirate."
        ),
    )
    async with Agent(config) as agent:
        response = await agent.chat("Explain the repository layout.")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
```

## Next steps

Explore the guides below to learn more about building and customizing agents with the Python SDK:

- **[Personas](/docs/sdk/personas)**: Customize agent identity using templated or custom system instructions.
- **[Tools & skills](/docs/sdk/tools)**: Register custom Python functions, use built-in tools, and load skills.
- **[MCP](/docs/sdk/mcp)**: Connect external Model Context Protocol (MCP) servers to your agents.
- **[Policies](/docs/sdk/policies)**: Enforce explicit tool execution policies and interactive approval flows.
- **[Subagents](/docs/sdk/subagents)**: Build multi-agent systems using dynamic self-cloning or static subagents.
- **[Structured output](/docs/sdk/structured-output)**: Handle multimodal input, stream model thoughts, and validate output.
- **[Lifecycle & hooks](/docs/sdk/lifecycle)**: Manage background event triggers, session persistence, and custom hooks.

## Sample code and examples

You can find full, runnable Python scripts for each SDK feature in the [getting\_started directory](https://github.com/google-antigravity/antigravity-sdk-python/tree/main/examples/getting_started) on GitHub:

- [`hello_world.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/hello_world.py): Basic agent setup and single-turn chat.
- [`streaming.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/streaming.py): Token streaming and reasoning thoughts.
- [`persona_config.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/persona_config.py): Templated and custom system instructions.
- [`policies.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/policies.py): Declarative tool access policies.
- [`human_in_the_loop.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/human_in_the_loop.py): Interactive user approval.
- [`multimodal.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/multimodal.py): Image and PDF attachment handling.
- [`structured_output.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/structured_output.py): Pydantic schema validation.
- [`custom_tools.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/custom_tools.py): Custom Python function tools.
- [`agent_skills.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/agent_skills.py): Filesystem SKILL.md integration.
- [`mcp_tools.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/mcp_tools.py): Model Context Protocol tools.
- [`subagents.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/subagents.py): Multi-agent delegation and isolation.
- [`web_tools.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/web_tools.py): Web search and URL context.
- [`hooks.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/hooks.py): Lifecycle and error handling hooks.
- [`triggers.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/triggers.py): Background event triggers.
- [`persistence.py`](https://github.com/google-antigravity/antigravity-sdk-python/blob/main/examples/getting_started/persistence.py): Saving and restoring session state.
