# Antigravity Python SDK: Overview & Quickstart

The **Google Antigravity SDK** (`antigravity-sdk`) is the official Python library for programmatically orchestrating autonomous coding agents, custom developer tools, multi-agent swarms, and enterprise software pipelines.

---

## 1. Installation & Client Setup

Install the SDK via `pip` or `uv`:

```bash
pip install antigravity-sdk
```

### Basic Initialization

```python
import os
from antigravity import Agent, Model

# Initialize the autonomous agent
agent = Agent(
    model=Model.GEMINI_3_7_FLASH,
    api_key=os.environ.get("ANTIGRAVITY_API_KEY"),
    workspace_dir="./my-project"
)

# Run a prompt to completion
response = agent.run("Analyze src/api.py and add type annotations to all exported endpoints.")
print(response.summary)
```

---

## 2. Gemini Enterprise Agent Platform Integration

For enterprise environments using private Google Cloud VPCs and Vertex AI:

```python
from antigravity import EnterpriseAgent, GoogleCloudConfig

config = GoogleCloudConfig(
    project_id="my-gcp-enterprise-project",
    location="us-central1",
    vpc_network="projects/my-gcp/global/networks/internal-vpc"
)

agent = EnterpriseAgent(
    model="gemini-3.7-flash",
    cloud_config=config,
    audit_logging=True
)
```
