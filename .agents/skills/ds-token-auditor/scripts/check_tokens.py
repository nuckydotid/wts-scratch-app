#!/usr/bin/env python3
import sys, re, glob, os

target = sys.argv[1] if len(sys.argv) > 1 else "/Users/a2250/Research/apps/app/src/screens"
hex_pattern = re.compile(r'#[0-9a-fA-F]{3,8}')

print(f"Auditing design tokens in: {target}")
issues = 0
files = glob.glob(f"{target}/**/*.tsx", recursive=True) if os.path.isdir(target) else [target]

for f in files:
    with open(f, encoding='utf-8') as fp:
        lines = fp.readlines()
    for idx, line in enumerate(lines, 1):
        if "color:" in line or "backgroundColor:" in line:
            matches = hex_pattern.findall(line)
            if matches:
                print(f"  [WARN] {os.path.basename(f)}:{idx} Hardcoded hex: {matches}")
                issues += 1

print(f"Token audit finished with {issues} warnings.")
