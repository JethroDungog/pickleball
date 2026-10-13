---
name: context7
description: Retrieve live, version-accurate documentation and official code examples using Context7 to eliminate outdated APIs and hallucinations.
---

# Context7 Documentation Guide

Context7 connects AI coding agents to up-to-date documentation for libraries like Next.js, Supabase, Tailwind CSS, TypeScript, and React.

## 1. Quick Setup
Run the setup wizard to connect your account or generate a free key:
```bash
npx --yes ctx7 setup
```

## 2. Context7 MCP Integration
Configured in `mcp_config.json`:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

## 3. Best Practices
1. **Resolve Library ID First**: Convert the package name to an official Context7 library slug (e.g. `next.js` -> `/vercel/next.js`).
2. **Targeted Queries**: Request specific concepts (e.g. `Route Handlers in Next.js 14`, `Supabase Server Components cookies`) to get compact, accurate code snippets.
