# Personas & Safety Policies in Python SDK

Configure custom agent personas, system instructions, and enforce declarative human-in-the-loop safety policies.

---

## 1. Defining Personas & System Instructions

You can configure agents with custom system instructions and persona profiles:

```python
from antigravity import Agent, Persona

security_auditor = Persona(
    name="Security Auditor",
    system_instruction="""
    You are a Senior Application Security Engineer.
    When analyzing code:
    1. Check for OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF).
    2. Flag insecure deserialization and unescaped shell inputs.
    3. Provide remediation diffs following least-privilege principles.
    """
)

agent = Agent(
    persona=security_auditor,
    model="gemini-3.7-flash"
)
```

---

## 2. Declarative Safety Policies & Approval Callbacks

Enforce fine-grained safety boundaries on agent tool executions:

```python
from antigravity import Agent, Policy, ActionType

def ask_human_approval(action):
    print(f"[SECURITY ALERT] Agent requests: {action.type} -> {action.target}")
    decision = input("Approve action? (y/n): ")
    return decision.lower() == 'y'

policy = Policy(
    allow_actions=[ActionType.READ_FILE, ActionType.GREP_SEARCH],
    require_approval=[ActionType.RUN_COMMAND, ActionType.WRITE_FILE],
    approval_callback=ask_human_approval
)

agent = Agent(
    policy=policy,
    workspace_dir="./src"
)
```
