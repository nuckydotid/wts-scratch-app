# React Server Components (RSC) Architecture

React Server Components allow frontend developers to leverage the best of both server and client rendering in a single React tree.

---

## Mental Model: The Server-Client Spectrum

```
           [ Server-Only ]                      [ Client-Only ]
-------------------------------------------------------------------------
• Direct DB queries (D1/Prisma)         • State (useState, useReducer)
• Secret tokens / API keys              • Effects (useEffect, useLayoutEffect)
• Large dependencies (zero bundle size) • Browser APIs (DOM, window, geolocation)
• Fast initial data streaming           • Event listeners (onClick, onChange)
```

### Key Differences

| Feature                           | Server Components                      | Client Components                        |
| :-------------------------------- | :------------------------------------- | :--------------------------------------- |
| **Default in RSC Frameworks**     | Yes (no directive needed)              | Requires `'use client'` at top of file   |
| **Executes On**                   | Server runtime only                    | Both Server (SSR) and Client (Hydration) |
| **Bundle Size Impact**            | 0 KB sent to client bundle             | Adds to client JavaScript bundle         |
| **Can Use Hooks?**                | No (`useState`, `useEffect` forbidden) | Yes (all hooks available)                |
| **Can Access Backend Resources?** | Yes (files, databases, internal RPC)   | No (must use HTTP/RPC requests)          |
