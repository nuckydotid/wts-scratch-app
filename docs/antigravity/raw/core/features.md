# Antigravity 2.0 features

### Projects

In Antigravity 2.0, agents work in **Projects** (previously in Agent Manager, agents were strictly mapped to a single workspace folder).

- **Worktree support**: Projects natively support Git worktrees, allowing agents to operate in isolated background folders.
- **Scoped settings**: Settings are scoped, allowing you to have different security settings per project. This means you can have a more permissive setting for a trusted project and a more restrictive security setting for an untrusted folder. The main three presets are “Default”, “Full machine” and “Unrestricted” (see the settings tab for the full list).
- **Scoped permissions**: Attach permission grants to projects to control what the agents are allowed to access. Permissions manually granted during a conversation can persist, allowing the agent to learn trusted actions and enabling a more seamless experience over time.
- **Multi-folder access**: A project can be configured to work in multiple folders, allowing agents to operate across different codebases within the same conversation.

### Conversations outside of projects

Start quick, one-off conversations outside of any Project. These sessions run in an isolated local scratch folder. They have their own settings, and they also have their own permissions in addition to inheriting from global permissions.

### Scheduled tasks

We’re introducing scheduled tasks, allowing users to plan ahead with their projects. Utilizing the newest Gemini 3.5 Flash model, users can schedule messages to be sent to their agents while they’re away.

- **Repeatable**: Set up time-based triggers to start conversations periodically.
- Tasks will be set to repeat on the minute you’ve set them.

### Secure by default

We put you in the driver’s seat with robust security controls:

- **Interactive approvals**: By default, agents will request your explicit permission before running any terminal commands.
- **Bounded access**: By default, your agent can only read and write within the provided folders of a project. If you change your security preset to “Full machine” or “Unrestricted”, the agent will have read and write access over your full machine.

### Voice transcription

Antigravity features a built-in live voice transcription, allowing you to prompt agents and leave feedback using natural speech.

**How to use**:

- **Start/stop**: Click the mic button next to the text input box to start recording, click it again to stop.
- **Live view**: As you speak, your words are transcribed in real-time directly into the input field.
- **Shortcut**: You can start recording by pressing Ctrl + M. Once you’re done, press Ctrl + M to stop recording.

**Key features**

- **Smart cleanup**: Speak naturally without worrying about pauses or perfect phrasing. Once you stop recording, the system automatically cleans up the transcription, resolving self-corrections, repetitions, and filler words into a cohesive prompt.
- **Conversational awareness**: The model will have context to your conversation, you can use project-specific terminology and expect accurate results.

**Availability** Voice input is available across all primary interaction surfaces:

- **Agent input**: For starting conversations and sending prompt updates.
- **Artifact comments**: For leaving precise, inline feedback on plans, code diffs, and deliverables.

### JSON hooks

JSON hooks allow you to execute custom local shell scripts at critical stages of an Antigravity agent’s execution cycle. You can intercept and control the agent’s behavior before tool calls, after model responses, or at loop stopping conditions—configured globally or per-workspace via simple JSON files.

[Explore the JSON hooks & rules documentation](/docs/hooks)

### Browser

We reworked the browser subagent in Antigravity 2.0.

- **On-demand**: Can be invoked through the `/browser` command.
- **Chrome DevTools integration**: The browser subagent also integrates natively with Chrome DevTools MCP.
- **Video recording**: Now supports recordings as webm videos.

### Remote Control

Antigravity 2.0 Remote Control allows you to drive and monitor your desktop agent sessions across multiple machines from any web browser:

- **Untethered Mobility**: Launch long-running agent workflows on your desktop workstation and continue monitoring or approving actions from a mobile device or laptop.
- **Local Context Retained**: Keep full access to your workstation’s local filesystem, toolchains, credentials, and Git worktrees without duplicating environments.
- **Proactive Push Notifications**: Receive browser push notifications when tasks complete or when user input is needed.

[Learn more about Antigravity 2.0 Remote Control](/docs/remote-control)

### Integrated terminal

Antigravity 2.0 provides terminal support directly from the sidebar. Access the terminal at any time by clicking the terminal button () or by using the Ctrl/Cmd + \` keyboard shortcut.

### Version control system (VCS) panel

Antigravity 2.0 provides a Git-native VCS review panel directly from the sidebar. Access the panel at any time by clicking the version control button () to perform the following actions:

- **Review panel diffs**:
  - **Uncommitted diffs**: View all staged and unstaged working tree changes.
  - **Branch diffs**: Review changes made on the current branch.
  - **Agent edits**: Inspect diffs originating specifically from agent tool edits.
- **File actions**: Stage, unstage, or discard changes per file.
- **Repo actions**:
  - **Commit**: Create local commits with the option to automatically generate commit messages.
  - **Push**: Send branch commits to a remote repository.
