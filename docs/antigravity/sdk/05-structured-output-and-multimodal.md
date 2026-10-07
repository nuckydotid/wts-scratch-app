# Structured Outputs & Multimodal Inputs in Python SDK

Enforce strict Pydantic schema validation on agent responses and process multimodal inputs including images, PDFs, and audio.

---

## 1. Pydantic Structured Outputs

Enforce typed JSON structures for automated downstream pipeline ingestion:

```python
from pydantic import BaseModel, Field
from typing import List
from antigravity import Agent

class SecurityVulnerability(BaseModel):
    cve_id: str = Field(description="CVE identifier or custom vulnerability code")
    severity: str = Field(description="LOW, MEDIUM, HIGH, or CRITICAL")
    affected_file: str
    line_number: int
    recommendation: str

class SecurityAuditReport(BaseModel):
    summary: str
    vulnerabilities: List[SecurityVulnerability]
    passed_audit: bool

agent = Agent(model="gemini-3.7-flash")

report: SecurityAuditReport = agent.run_structured(
    "Perform security audit of src/auth/jwt.py",
    response_schema=SecurityAuditReport
)

print(f"Audit Passed: {report.passed_audit}, Issues Found: {len(report.vulnerabilities)}")
```

---

## 2. Multimodal Inputs & Attachments

Pass UI screenshots, architecture diagrams, or PDF design specs directly to the agent:

```python
from antigravity import Agent, Attachment

agent = Agent(model="gemini-3.7-flash")

response = agent.run(
    "Implement the responsive header and nav menu shown in the design mockup.",
    attachments=[
        Attachment.from_file("./designs/header-mockup.png"),
        Attachment.from_file("./specs/api-spec.pdf")
    ]
)
```
