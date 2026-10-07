# Architecture & Core Features of Antigravity 2.0

Antigravity 2.0 is engineered from the ground up as an agent-centric development environment where the AI agent is a first-class collaborator with autonomous tool execution, persistent memory, and parallel execution capabilities.

---

## 1. Projects vs. Workspaces

Understanding the distinction between Projects and Workspaces is central to Antigravity's architectural model:

| Concept       | Scope                                             | Key Capabilities                                                                                                                                | Persistence                                                                                       |
| :------------ | :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **Workspace** | Single local filesystem directory                 | Direct file reads, writes, terminal command execution, git repo tracking.                                                                       | File changes persist to disk directly.                                                            |
| **Project**   | Organizational layer binding 1 or more workspaces | Shared conversation history, knowledge indexing, persistent agent memory, project-level rules (`.agentrules`), skills, and scheduled cron jobs. | Project metadata, transcripts, and artifacts persist across restarts in `~/.gemini/antigravity/`. |

### Global Conversations vs. Project Conversations

- **Global Conversations**: One-off chats disconnected from any single project. Ideal for quick questions, scratch scripts, or general coding queries.
- **Project Conversations**: Context-aware sessions that automatically load project rules (`AGENTS.md`), MCP server definitions, and previous conversation artifacts.

---

## 2. Multi-Pane Workspace Layout

Antigravity 2.0 divides the screen into four dedicated interactive zones:

1. **Code Editor / Navigation Pane (Left/Center)**: Full-featured code editor with syntax highlighting, language servers, inline diff views, and multi-tab management.
2. **Agent Chat Canvas (Right)**: Main interactive dialogue stream showing user requests, agent thinking chains, tool invocations, and live progress indicators.
3. **Auxiliary Artifacts & Review Pane**: Dedicated surface for rendering interactive artifacts, Markdown previews, Mermaid diagrams, and KaTeX math.
4. **Terminal & Process Dock (Bottom)**: Integrated terminal for monitoring daemon commands, test runners, background tasks, and interactive command shells.

---

## 3. Scheduled Tasks & Cron Automation

Antigravity 2.0 supports background scheduled tasks and cron triggers that execute without manual intervention:

```text
/schedule "Run security vulnerability audit on dependencies every weekday at 9 AM"
```

- **One-Shot Timers**: Pause or wait for specific duration/events before waking the agent.
- **Recurring Cron Jobs**: Standard 5-field cron syntax (`0 9 * * 1-5`) for daily health checks, dependency updates, and issue triage.
- **Daemon vs Task Scheduling**: Daemon jobs continue running independently even after conversation completion.

---

## 4. Security & Isolation Architecture

Antigravity operates with a **Secure by Default** posture:

- **Workspace Confinement**: Agents are restricted to your project workspace directory unless explicit non-workspace file access permissions are granted.
- **Human-in-the-Loop Safeguards**: High-impact actions (e.g. destructive shell commands, git force pushes, external network requests) require explicit user approval.
- **Sandboxed Execution**: Background tasks and terminal runs can be sandboxed to prevent unapproved system modifications.
