# Native TurboModules Documentation (modules/)

This directory documents the native TurboModules built for the Worktrees Studio mobile client under Expo SDK 57 New Architecture.

## 📦 Native Module Directory

- [Asset Cache](asset-cache.md) (`modules/worktrees-studio-asset-cache`) — Native filesystem image and media caching with LRU eviction.
- [Google Sign-In](google-sign-in.md) (`modules/worktrees-studio-google-sign-in`) — Native OAuth Google authentication bridge.
- [MMKV Storage](mmkv.md) (`modules/worktrees-studio-mmkv`) — Ultra-fast synchronous key-value storage bridge for Zustand.
- [OTA Updates](ota-updates.md) (`modules/worktrees-studio-ota-updates`) — Dynamic runtime JavaScript bundle update manager.
- [System Bars](system-bars.md) (`modules/worktrees-studio-system-bars`) — Edge-to-edge status bar and navigation bar styling.

## 🛠️ Architecture Principles

- All modules implement the Expo New Architecture TurboModule specifications (`specs/`).
- Native implementations exist for both iOS (Swift/ObjC++) and Android (Kotlin/C++).
- Synchronous bindings (e.g. MMKV) provide zero-async-overhead state retrieval.

## 🚦 Lint & Manual Gates

Per-module ESLint coverage (`bun --filter './modules/*' lint`) and the iOS
OTA/native manual gate (`pod install` + `xcodebuild` evidence) are documented in
[`modules/AGENTS.md`](../../modules/AGENTS.md).
