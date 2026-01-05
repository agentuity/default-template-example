---
name: agentuity-cli-integration-github-disconnect
description: Disconnect a GitHub account from your organization. Requires authentication
version: "0.0.111"
license: Apache-2.0
allowed-tools: "Bash(agentuity:*)"
metadata:
  command: "agentuity integration github disconnect"
  tags: "mutating destructive slow"
---

# Integration Github Disconnect

Disconnect a GitHub account from your organization

## Prerequisites

- Authenticated with `agentuity auth login`

## Usage

```bash
agentuity integration github disconnect
```

## Examples

Disconnect a GitHub account from your organization:

```bash
bunx @agentuity/cli integration github disconnect
```
