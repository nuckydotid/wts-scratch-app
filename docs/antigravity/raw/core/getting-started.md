# Getting Started with Antigravity 2.0

### Download

Visit [antigravity.google/download](https://antigravity.google/download) to download Google Antigravity 2.0. Select your operating system below:

| Platform                                                                                                                                                                                                                                                                                   | Download |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **macOS**                                                                                                                                                                                                                                                                                  |
| [Download for Apple Silicon](https://storage.googleapis.com/antigravity-public/antigravity-hub/2.5.0-5471848641724416/darwin-arm/Antigravity.dmg)[Download for Intel](https://storage.googleapis.com/antigravity-public/antigravity-hub/2.5.0-5471848641724416/darwin-x64/Antigravity.dmg) |

**Requirements:** macOS versions with Apple security update support. This is typically the current and two previous versions. Min Version 12 (Monterey), X86 is not supported.

|
| **Windows** |

[Download for x64](https://storage.googleapis.com/antigravity-public/antigravity-hub/2.5.0-5471848641724416/windows-x64/Antigravity-x64.exe)[Download for ARM64](https://storage.googleapis.com/antigravity-public/antigravity-hub/2.5.0-5471848641724416/windows-arm/Antigravity-arm64.exe)

**Requirements:** Windows 10 (64 bit)

|
| **Linux** |

[Download for x64](https://storage.googleapis.com/antigravity-public/antigravity-hub/2.5.0-5471848641724416/linux-x64/Antigravity.tar.gz)[Download for ARM64](https://storage.googleapis.com/antigravity-public/antigravity-hub/2.5.0-5471848641724416/linux-arm/Antigravity.tar.gz)

**Requirements:** glibc >= 2.28, glibcxx >= 3.4.25 (e.g. Ubuntu 20, Debian 10, Fedora 36, RHEL 8)

|

### Installation

You may get a notification asking whether you want to “Keep Both” or “Replace” Antigravity, select “Replace.” You will be prompted to re-install the IDE during installation, should you choose to. If you do not install it now and would like to re-download it later, you can do so [here](/download).

### Creating a Project

Agents work within Projects, which define the boundaries of the folders and repositories they can access.

1.  Click the **folder with a ”+” icon** in the **left sidebar**.
2.  Click on **“New Project”**.
3.  Click **Add Folder** to associate one or more local folders or Git repositories. Adding multiple folders provides your agent with full cross-repository context.
4.  Click **Create**.
5.  _(Optional)_ Configure your Project’s settings. Each Project maintains its own isolated settings and security policies that the agent respects.

### Starting an Agent

Once your Project is created, you can spawn an agent to start working on tasks.

1.  Type your goal or instruction in the chat input (e.g., “Help me add a new feature”) and press Enter.
2.  Choose a **Mode** in the setup modal to boot up your agent:
    - **Local Mode**: The agent operates directly in your active folders.
    - **New Worktree Mode**: The agent operates in an isolated Git worktree.

### Basic Navigation

| Action                         | macOS       | Windows / Linux |
| :----------------------------- | :---------- | :-------------- |
| **Open Conversation Picker**   | ⌘K          | Ctrl + K        |
| **Open File Search**           | ⌘P          | Ctrl + P        |
| **Focus Input**                | ⌘L          | Ctrl + L        |
| **New Conversation**           | ⌘N          | Ctrl + N        |
| **Next/Previous Conversation** | ⌥ Up / Down | Alt + Up / Down |

### Slash Commands

| Slash Command | Description                                                                                            |
| :------------ | :----------------------------------------------------------------------------------------------------- |
| `/goal`       | Run until the specified task is completely finished, not asking for intermediate input from the user.  |
| `/grill-me`   | Before starting to implement, ask questions back to align on the specific details of the plan.         |
| `/schedule`   | Run an instruction as a one-time timer in the future or on a recurring schedule (via Scheduled Tasks). |
| `/browser`    | Explicit slash command controlling browser debugging behaviors in Google Chrome.                       |
