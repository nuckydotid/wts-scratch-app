# Worktrees Commands Integration

This repo runs its dev-command catalog through **Worktrees Studio** using
`.worktree/commands.yaml`. The legacy Swift **CommandsGUI** app is frozen
(security fixes only).

## Files

| File                           | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `.worktree/commands.yaml`      | The catalog (source of truth)                              |
| `scripts/validate-commands.ts` | Validates the catalog (`bun scripts/validate-commands.ts`) |
| `gui/`                         | Legacy Swift CommandsGUI — deprecated                      |

Schema reference lives in `docs/commands/`.

## How it works

1. Open this repo in Worktrees Studio.
2. Worktrees Studio finds `.worktree/commands.yaml` (walk-up from the opened path).
3. The **Commands** tab appears in the sidebar.
4. Trust the config once (per file hash).
5. Pick App → Scope → Platform/Env, expand a group, hit **Run**.

Terminals open in the Commands pane and keep running when you switch tabs.
`⌘F` searches the focused terminal; `⌘G` / `⇧⌘G` cycle matches.

## Validating

```bash
bun scripts/validate-commands.ts
```

Checks: version, token references, case values ⊆ options, file existence
(`source`/`badge`/`secretEnv`), non-empty shells, cwd existence. Exit 1 on
error. Missing `source`/`badge`/`secretEnv` files are **warnings** (the
catalog still loads; the affected command fails at run time), matching the
Manggis parser.

## Parity map: CommandsGUI → YAML

The catalog was translated from `gui/Sources/CommandsGUI/AppCommands.swift`.
Use this table to verify a command was ported correctly.

| CommandsGUI symbol                                        | YAML location                                                  | UI type         |
| --------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| `bothExpoGroup` / `iosExpoGroup` / `androidExpoGroup`     | `apps[].scopes[app].groups.{both,ios,android}`                 | `form`/`shell`  |
| `apiGroupStaging` / `apiGroupProduction` / `apiGroupTest` | `scopes[backend].groups.{staging,production,test}`             | `shell`/`form`  |
| `assetsGroupStaging` / `assetsGroupProduction`            | `scopes[backend].groups.{staging,production}` group `Assets`   | `shell`/`form`  |
| `quickE2EGroup`                                           | `scopes[test].groups.<platform>.<env>` group `E2E Quick Smoke` | `shell`         |
| `appMaestroGroup`                                | `scopes[test]` group `E2E Maestro`                             | `shell`/`split` |
| `appNotificationGroup`                           | `scopes[test]` group `E2E Push Notification`                   | `shell`         |
| `appAppUpdateGroup` / `...IOS`                   | `scopes[test]` groups `E2E App Update` / `(iOS)`               | `shell`         |
| `dsGroup`                                                 | `scopes[ds]` group `DS`                                        | `shell`         |
| `flowsGroup`                                              | `scopes[flows]` group `Flows`                                  | `shell`         |
| `generatedE2EGroup`                                       | top-level `generated:` provider                                | generated       |
| `Start` / `StartBuilder`                                  | `ui: {type: form, fields: [toggle,toggle], cases}`             | `form`          |
| `Run` / `runNativeRun`                                    | `ui: {type: form, fields:[select,select], cases}`              | `form`          |
| `App Version` / `runAppVersion`                           | `ui: {type: form, fields:[select,text], cases}`                | `form`          |
| `Refresh DB` / `runRefreshDB`                             | `ui: {type: form, ..., validation, secretEnv, cases}`          | `form`          |
| `ktFlowCommand` (`parallelShells`)                        | `ui: {type: split, shells}`                                    | `split`         |
| `Command.openURL`                                         | command `openURL:`                                             | any             |
| `currentAppVariant()`                                     | `apps[].badge`                                                 | badge           |
| `AppId`                                                   | `apps[]`                                                       | app picker      |
| `Scope`                                                   | `apps[].scopes[]`                                              | scope picker    |
| `Platform`                                                | `pickers: [platform]`                                          | picker          |
| `BackendEnv` / `TestEnv`                                  | `pickers: [env]`                                               | picker          |

## Adding a command

1. Edit `.worktree/commands.yaml`.
2. `bun scripts/validate-commands.ts`.
3. Commit. Worktrees Studio reloads on save and resets trust.
