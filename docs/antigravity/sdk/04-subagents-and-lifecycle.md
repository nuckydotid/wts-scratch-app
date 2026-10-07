# Subagent Delegation & Lifecycle Hooks in Python SDK

Orchestrate complex multi-agent workflows, self-cloning agent swarms, and track token usage via lifecycle hooks.

---

## 1. Multi-Agent Delegation & Swarms

```python
from antigravity import CoordinatorAgent, SubagentConfig, WorkspaceMode

coordinator = CoordinatorAgent(
    subagents=[
        SubagentConfig(
            name="researcher",
            role="Codebase Research Specialist",
            workspace_mode=WorkspaceMode.INHERIT
        ),
        SubagentConfig(
            name="tester",
            role="Automated Unit Test Specialist",
            workspace_mode=WorkspaceMode.BRANCH
        )
    ]
)

result = coordinator.run("Refactor user billing logic and generate full unit test suite.")
```

---

## 2. Lifecycle Hooks & Cost Auditing

Monitor execution milestones, token consumption, and compute costs:

```python
from antigravity import Agent, LifecycleHook

class CostAuditor(LifecycleHook):
    def on_step_start(self, step_index: int, prompt: str):
        print(f"--- Step {step_index} starting ---")

    def on_tool_executed(self, tool_name: str, duration_ms: float):
        print(f"Tool {tool_name} completed in {duration_ms}ms")

    def on_step_complete(self, tokens_used: int, estimated_cost_usd: float):
        print(f"Step consumed {tokens_used} tokens (${estimated_cost_usd:.4f})")

agent = Agent(
    hooks=[CostAuditor()],
    workspace_dir="./"
)
```
