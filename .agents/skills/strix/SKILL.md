---
name: strix
description: Autonomous AI penetration testing and vulnerability analysis tool for scanning code and web applications in isolated Docker sandboxes.
---

# Strix AI Penetration Testing Guide

Strix (`usestrix/strix`) is an open-source autonomous security agent that identifies vulnerabilities in code and web apps and validates them with proof-of-concept tests.

## 1. Prerequisites
1. **Docker Desktop**: Must be installed and running (Strix downloads and executes scans within an isolated Docker sandbox container).
2. **LLM API Key**: Requires an API key (OpenAI, Anthropic, or Google) exported in your terminal environment.

## 2. Installation
Install the Strix CLI:
```bash
# Via official installer
curl -sSL https://strix.ai/install | bash

# Or via Python pip
pip install strix-agent
```

## 3. Running a Scan
> [!CAUTION]
> Strix executes dynamic security checks and proof-of-concept exploits. Only run scans against your own applications and authorized targets.

* Run a local repository scan:
  ```bash
  strix --target ./pickleball-website
  ```
* Run a quick scan:
  ```bash
  strix --target ./pickleball-website --mode quick
  ```
