#!/usr/bin/env python3
import os, glob, re

root_dir = "/Users/a2250/Research"
scan_dirs = [
    os.path.join(root_dir, "apps/app/src"),
    os.path.join(root_dir, "packages/worktrees-studio-ds/src"),
]

print("=== Auditing React 19 Architectural Standards ===")
warnings = 0
files_scanned = 0

for sdir in scan_dirs:
    if not os.path.exists(sdir): continue
    for ext in ["*.tsx", "*.ts"]:
        for fpath in glob.glob(os.path.join(sdir, "**", ext), recursive=True):
            if "__tests__" in fpath or "node_modules" in fpath: continue
            files_scanned += 1
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            # Check for legacy Context.Provider
            if ".Provider" in content and "createContext" in content:
                rel = os.path.relpath(fpath, root_dir)
                print(f"  💡 {rel}: Uses legacy '<Context.Provider>'. Consider modern React 19 '<Context value={{...}}>' direct rendering.")
                warnings += 1

print(f"✓ Scanned {files_scanned} files across apps and packages. React standards audit complete with {warnings} recommendations.")
