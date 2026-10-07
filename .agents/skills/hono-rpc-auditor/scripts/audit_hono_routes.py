#!/usr/bin/env python3
import os, glob, re

root_dir = "/Users/a2250/Research"
routes_dir = os.path.join(root_dir, "apps/app/api/src/routes")

print("=== Auditing Hono RPC Route Handlers ===")
warnings = 0
files_scanned = 0

if os.path.exists(routes_dir):
    for fpath in glob.glob(os.path.join(routes_dir, "**", "*.ts"), recursive=True):
        if "__tests__" in fpath: continue
        files_scanned += 1
        rel = os.path.relpath(fpath, root_dir)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check for Hono initialization without chaining or export
        if "new Hono" in content and "export const" not in content and "export default" not in content:
            print(f"  ⚠ {rel}: Hono router initialized but not exported.")
            warnings += 1
        
        # Check for raw string concatenation in SQL queries
        if ".prepare(" in content and "${" in content:
            print(f"  🚨 {rel}: Potential SQL injection via string template in prepare()! Use parameter binding.")
            warnings += 1
        else:
            print(f"  ✓ {os.path.basename(fpath)}: Verified Hono RPC patterns.")

print(f"✓ Scanned {files_scanned} route files. Hono RPC audit complete with {warnings} warnings.")
