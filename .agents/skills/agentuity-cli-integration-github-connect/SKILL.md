---
name: agentuity-cli-integration-github-connect
description: Connect your GitHub account to enable automatic deployments. Requires authentication
version: "0.0.111"
license: Apache-2.0
allowed-tools: "Bash(agentuity:*)"
metadata:
  command: "agentuity integration github connect"
  tags: "mutating creates-resource slow api-intensive"
---

# Integration Github Connect

Connect your GitHub account to enable automatic deployments

## Prerequisites

- Authenticated with `agentuity auth login`

## Usage

```bash
agentuity integration github connect
```

## Examples

Connect GitHub to your organization:

```bash
bunx @agentuity/cli integration github connect
```
