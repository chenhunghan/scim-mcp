# SCIM MCP Server

Model Context Protocol (MCP) server for enterprise-ready user and group provisioning via SCIM (System for Cross-domain Identity Management) V2 protocol.

## Setup

### Codex

```toml
[mcp_servers.scim]
command = "npx"
args = ["-y", "mcp-remote@latest", "https://scim-mcp-d8a54d7b.alpic.live/", "--header", "x-scim-api-key: Bearer ${SCIM_AUTH_TOKEN}", "--header", "x-scim-base-url: https://service.provider.scim.base.url"]
```

## Development

First, run the development server:

```sh
npm run dev
```
