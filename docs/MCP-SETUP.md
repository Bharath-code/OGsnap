# MCP Setup

This repo includes a ready MCP config in:

- `mcp.json`

It wires:

- Convex MCP (`convex`)
- Firecrawl MCP (`firecrawl`, remote via `mcp-remote`)
- DodoPayments MCP (`dodopayments`)
- Cloudflare API MCP (`cloudflare-api`, includes R2 APIs)

## One-time setup

1. Create local MCP env file:

```bash
cp .env.mcp.example .env.mcp
```

2. Fill required values in `.env.mcp`:

- `FIRECRAWL_API_KEY`
- `CONVEX_DEPLOYMENT` (if you want MCP to target a specific Convex deployment)

3. Configure your MCP client to use this `mcp.json`.

## Remote server auth

- `dodopayments`: OAuth flow through `https://mcp.dodopayments.com/sse`
- `cloudflare-api`: OAuth flow through `https://mcp.cloudflare.com/mcp`
- `firecrawl`: uses `mcp-remote` to connect to `https://mcp.firecrawl.dev/${FIRECRAWL_API_KEY}/v2/mcp`

Once authorized in your client, you should not need to paste keys repeatedly.
