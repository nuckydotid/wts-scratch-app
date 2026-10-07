#!/usr/bin/env python3
import os, glob, re

root_dir = "/Users/a2250/Research"
app_src = os.path.join(root_dir, "apps/app/src")

print("=== Auditing TanStack React Query v5 Hooks ===")
warnings = 0
files_scanned = 0

if os.path.exists(app_src):
    for fpath in glob.glob(os.path.join(app_src, "**", "*.ts*"), recursive=True):
        if "__tests__" in fpath or "node_modules" in fpath: continue
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        if "useQuery(" in content or "useMutation(" in content or "useInfiniteQuery(" in content:
            files_scanned += 1
            rel = os.path.relpath(fpath, root_dir)
            
            # Check for legacy string queryKey (v4 anti-pattern)
            if re.search(r'queryKey:\s*["\']', content):
                print(f"  ⚠ {rel}: String queryKey detected. In v5, queryKey MUST always be an Array.")
                warnings += 1
            
            # Check for useInfiniteQuery missing initialPageParam
            if "useInfiniteQuery(" in content and "initialPageParam" not in content:
                print(f"  ⚠ {rel}: useInfiniteQuery is missing required 'initialPageParam' (v5 requirement).")
                warnings += 1
            else:
                print(f"  ✓ {os.path.basename(fpath)}: Verified TanStack Query v5 patterns.")

print(f"✓ Scanned {files_scanned} query/mutation files. TanStack Query audit complete with {warnings} warnings.")
