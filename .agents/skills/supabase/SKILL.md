---
name: supabase
description: Supabase database management, SQL schema inspection, and migration workflows via Supabase MCP.
---

# Supabase Integration Guide

Connect your database backend, inspect schemas, and query tables safely using Supabase MCP.

## 1. Remote MCP Endpoint (Recommended)
Add the official hosted endpoint to `mcp_config.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?read_only=true&features=database,docs"
    }
  }
}
```

> [!TIP]
> Setting `read_only=true` is recommended for general safety to prevent accidental table drops or data deletions during design and vibe-coding sessions. Remove `read_only=true` only when applying migrations or schema alterations.

## 2. Local Supabase CLI
If developing against a local Supabase Docker instance:
```bash
npx supabase start
```
The local MCP endpoint will be available at: `http://localhost:54321/mcp`.
