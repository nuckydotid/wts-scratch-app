# Remote Control

Antigravity Remote Control allows you to securely connect to and drive your Antigravity 2.0 desktop sessions running across your machines from any web browser.

As AI agents take on larger-scope tasks—such as full-subsystem refactorings, extensive test suite runs, and complex dependency migrations—operations can run for extended periods. Remote Control untethers you from your physical desk while preserving your entire local development environment.

## Enabling Remote Control in Antigravity 2.0

You can enable Remote Control directly from the Antigravity 2.0 Settings:

1.  Open the **Settings** panel by pressing `Cmd + ,` (or `Ctrl + ,` on Linux/Windows), or click **Settings** at the bottom of the left sidebar.
2.  Navigate to the **App** section.
3.  Toggle **Enable Remote Control** to **On**.
4.  _(Optional)_ Set a custom **Nickname** (e.g., `workstation-primary` or `server-machine`) to easily identify this machine in your instance list.

### Connecting from a web browser

To access your remote Antigravity instance:

1.  Open your web browser on any device and navigate to the [Antigravity Remote Control Dashboard](https://antigravity.google.com). (Tip: On mobile devices, you can optionally install the web app to your home screen to receive push notifications when agents complete tasks or request input.)
2.  Sign in with the same Google Account that you used on your desktop application.
3.  In the instance switcher, select the machine you want to control.
4.  You now have full access to view active conversations, start new agent tasks, review implementation plans, and inspect artifacts.

## Install Remote Control headless daemon

### Linux and macOS

Run the installer script in your terminal:

```
curl -fsSL https://antigravity.google/cli/agy-daemon.sh | bash
```

To pass optional flags (such as setting an instance name or update interval), append `bash -s --`:

```
curl -fsSL https://antigravity.google/cli/agy-daemon.sh | bash -s -- install --name "my-box"
```

### Windows (needs Administrator)

Open Command Prompt as Administrator (**“Run as administrator”**) and run:

```
curl -fsSL https://antigravity.google/cli/agy-daemon.cmd -o agy-daemon.cmd && agy-daemon.cmd install
```

Note

**Important:** On Windows, `install` and `uninstall` need an Administrator prompt, and the script must be run from Command Prompt, not PowerShell. `status` and `restart` work from a normal prompt.

### Options (both scripts)

```
install --name "my-box"       instance name shown in Remote Control
install --interval weekly     how often updates are applied (default: daily)
install --no-auto-update      don't apply updates automatically
install --no-prompt           never ask questions (for scripts)
status | restart | uninstall  manage the service; restart applies pending updates
```

### One-time sign-in

During setup you sign in once in the terminal (open the printed URL, paste the code back). After that the service signs in by itself, including after reboots.

- This sign-in is **separate from the Antigravity editor’s**, so you may be asked even though the editor is already signed in. That’s normal.
- If you ever sign out of `agy` on that machine, the service loses access too — just re-run the setup script to sign in again.

### Naming your machine (headless daemon)

For headless daemon instances, the instance name is how the machine appears in Remote Control. Three ways to set it:

1.  **During setup** — the script asks for a name. Just press Enter to keep the current one, or to get a friendly generated name (like `my-machine-distant-plume`) if this is a fresh install.
2.  **With `--name`** — for scripted installs: `curl -fsSL https://antigravity.google/cli/agy-daemon.sh | bash -s -- install --name "my-box"`.
3.  **Edit the settings file** — to rename without re-running setup, open the file below, change the value of `cliRemoteControlHostname`, save, and run `restart`. The new name appears in the Hub once the service restarts — edits do nothing while it’s running.

### Settings file locations

| OS            | Settings file                              |
| :------------ | :----------------------------------------- |
| Linux / macOS | `~/.gemini/config/config.json`             |
| Windows       | `%USERPROFILE%\.gemini\config\config.json` |

Note

**Important:** The file has two similar-looking names in it. `cliRemoteControlHostname` is this service — the one you want. `remoteControlHostname` is the Antigravity editor on the same machine; in Antigravity 2.0, you can edit this directly in **Settings > App**.

If you installed with `--name`, that name wins over the file every time the service restarts. So if your edit keeps reverting, re-run setup and leave the name question blank — after that, the file is in charge.

### When the daemon runs

|                                    | Linux                           | macOS                   | Windows                                                                 |
| :--------------------------------- | :------------------------------ | :---------------------- | :---------------------------------------------------------------------- |
| Starts                             | at boot, nobody needs to log in | when you log in         | at boot, nobody needs to log in                                         |
| Keeps running after you sign out   | yes                             | no — back at next login | yes                                                                     |
| Comes back by itself after a crash | yes                             | yes                     | no — at the next boot, the next scheduled update, or a manual `restart` |

## Troubleshooting

### Antigravity 2.0 Desktop

- **Machine Does Not Appear in the Web UI**:
  - Ensure that **Enable Remote Control** is toggled on in Antigravity 2.0 Settings on your host machine.
  - Verify that your host machine has an active internet connection and is not asleep or suspended.
  - Check that you are signed in with the same Google Account in both the desktop app and the web browser.
- **Reconnection and Disconnects**:
  - If your local network connectivity drops temporarily, the web interface automatically tries to reconnect. Any running background agent tasks and shell commands will continue executing on your host machine uninterrupted as long as the host maintains an internet connection.

### Script / Headless Daemon Install

- **Machine doesn’t show up in the Hub** — run `status` and check the log file above; if it mentions sign-in problems, re-run the setup script.
- **Rename didn’t take effect** — the name is read when the service starts; run `restart`.
- **Name keeps reverting after editing the file** — you installed with `--name`; re-run setup and leave the name blank.
- **Windows install fails** — you’re not in an Administrator prompt.
- **Two similar entries in the Hub** — one is the editor, one is this service. They’re separate on purpose; rename whichever one you mean.

---

## Next Steps

- [Settings Overview](/docs/settings): Explore all configuration options in Antigravity 2.0.
- [Permissions & Security](/docs/permissions): Configure security presets and tool access rules.
