---
name: playwright
description: Browser automation, E2E testing, and accessibility inspection using Playwright CLI and Playwright MCP.
---

# Playwright Automation Guide

Playwright enables browser automation, accessibility tree inspection, form interaction, and UI test execution.

## 1. Playwright CLI Commands
Run browser actions directly from the terminal without overhead:

* **Open a page:**
  ```bash
  playwright-cli open https://localhost:3000
  ```
* **Navigate:**
  ```bash
  playwright-cli goto https://localhost:3000/book
  ```
* **Inspect accessibility snapshot:**
  ```bash
  playwright-cli snapshot
  ```
* **Interact with elements:**
  ```bash
  playwright-cli click "button:has-text('Book Court')"
  playwright-cli fill "input[name='email']" "user@example.com"
  ```
* **Capture screenshots:**
  ```bash
  playwright-cli screenshot ./screenshot.png
  ```
* **Close session:**
  ```bash
  playwright-cli close
  ```

## 2. Playwright MCP Server
Configured in `mcp_config.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```
Provides live accessibility snapshots and structured page interaction directly to the AI agent.
