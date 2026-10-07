#!/usr/bin/env python3
import os

modules_dir = "/Users/a2250/Research/modules"
if not os.path.exists(modules_dir):
    print("Modules dir not found.")
    exit(1)

modules = sorted(os.listdir(modules_dir))
print(f"=== Auditing {len(modules)} Native Modules ===")

for m in modules:
    mp = os.path.join(modules_dir, m)
    if not os.path.isdir(mp): continue
    has_pkg = os.path.exists(os.path.join(mp, "package.json"))
    has_ios = os.path.exists(os.path.join(mp, "ios"))
    has_android = os.path.exists(os.path.join(mp, "android"))
    platforms = []
    if has_ios: platforms.append("iOS")
    if has_android: platforms.append("Android")
    if not platforms: platforms.append("JS-only")
    print(f"  {m:25s} -> Platforms: {', '.join(platforms)}")

print("✓ Native module audit complete.")
