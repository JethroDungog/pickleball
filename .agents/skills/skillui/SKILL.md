---
name: skillui
description: Reverse-engineer design systems from any website, repo, or project. Extracts colors, fonts, spacing, animations, and components into design tokens and guidelines.
---

# SkillUI Guide

SkillUI extracts design tokens, typography, palettes, and layout rules from live websites or repositories through static analysis without consuming AI tokens.

## Common Workflows

### 1. Extract Design System from a Live URL
To capture the styling and design tokens of a reference website:
```bash
npx --yes skillui --url https://example.com
```

### 2. Output Options
* Extract tokens into `DESIGN.md` in a custom directory:
  ```bash
  npx --yes skillui --url https://example.com --out ./design-system --format design-md
  ```
* Ultra mode (crawls up to 5 screens):
  ```bash
  npx --yes skillui --url https://example.com --mode ultra --screens 5
  ```

### 3. Applying Extracted Tokens
Review the generated `DESIGN.md` and transfer the color palette, font sizes, border radiuses, and spacing directly into `tailwind.config.ts` or CSS variables.
