# x402 On-Chain Data MCP Server

MCP (Model Context Protocol) server wrapper for the x402 On-Chain Data API. Provides pay-per-call blockchain data including wallet profiles, token metrics, protocol TVL, and gas prices.

## Author

0xEtherial

## Features

- **Wallet Profiles** - ETH balance, transaction history, top tokens ($0.10/call)
- **Token Metrics** - Price, market cap, volume, liquidity ($0.05/call)
- **Protocol TVL** - Total value locked, chain breakdown ($0.05/call)
- **Gas Prices** - Real-time gas estimates ($0.02/call)
- **Health Check** - API status (free)

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | x402 On-Chain API base URL | `http://localhost:8900` |

## Usage

### Start the MCP Server

```bash
node server.js
```

### Available Tools

#### 1. `x402_wallet_score`
Get comprehensive wallet profile.

**Parameters:**
- `address` (string, required): Ethereum wallet address

**Example:**
```json
{
  "name": "x402_wallet_score",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD5e"
  }
}
```

**Returns:** ETH balance, transaction count, first/last transaction, top 5 tokens

---

#### 2. `x402_token_metrics`
Get token price and market data.

**Parameters:**
- `address` (string, required): Token contract address

**Example:**
```json
{
  "name": "x402_token_metrics",
  "arguments": {
    "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  }
}
```

**Returns:** Price, market cap, 24h volume, liquidity, FDV

---

#### 3. `x402_protocol_tvl`
Get DeFi protocol TVL data.

**Parameters:**
- `slug` (string, required): Protocol identifier (e.g., "uniswap", "aave")

**Example:**
```json
{
  "name": "x402_protocol_tvl",
  "arguments": {
    "slug": "uniswap"
  }
}
```

**Returns:** TVL, 24h change, chain breakdown

---

#### 4. `x402_gas_prices`
Get current Ethereum gas prices.

**Parameters:** None

**Example:**
```json
{
  "name": "x402_gas_prices",
  "arguments": {}
}
```

**Returns:** Slow/standard/fast gwei + USD estimates

---

#### 5. `x402_health`
Check API health status.

**Parameters:** None

**Example:**
```json
{
  "name": "x402_health",
  "arguments": {}
}
```

**Returns:** API health status

## Integration with AI Clients

### Claude Desktop

1. Open Claude Desktop configuration:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the MCP server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "x402-onchain": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-wrapper/server.js"],
      "env": {
        "API_BASE_URL": "https://nominated-safe-pairs-favorites.trycloudflare.com"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. The x402 tools will appear in Claude's available tools

### Cursor

1. Open Cursor settings (Cmd+,)
2. Navigate to "Features" → "Model Context Protocol"
3. Add new server:
   - **Name**: x402-onchain
   - **Command**: `node /absolute/path/to/mcp-wrapper/server.js`
   - **Environment**: `API_BASE_URL=https://nominated-safe-pairs-favorites.trycloudflare.com`
4. Restart Cursor

### Windsurf

1. Open Windsurf settings
2. Go to "AI" → "MCP Servers"
3. Click "Add Server"
4. Configure:
   - **Name**: x402-onchain
   - **Command**: `node`
   - **Args**: `["/absolute/path/to/mcp-wrapper/server.js"]`
   - **Env**: `{"API_BASE_URL": "https://nominated-safe-pairs-favorites.trycloudflare.com"}`
5. Save and restart Windsurf

## Pricing

All endpoints use the x402 payment protocol (pay-per-call):

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/wallet/:address` | $0.10 | Wallet profile + top tokens |
| `/token/:address` | $0.05 | Token price + metrics |
| `/protocol/:slug` | $0.05 | Protocol TVL data |
| `/gas` | $0.02 | Gas price estimates |
| `/` | Free | Health check |

## Error Handling

The server returns structured error responses:

```json
{
  "error": true,
  "status": 404,
  "message": "Wallet not found"
}
```

## Development

### Requirements
- Node.js >= 18.0.0
- npm

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
API_BASE_URL=http://localhost:8900 node server.js
```

## License

MIT

## Links

- [x402 Payment Protocol](https://github.com/0xEtherial/x402)
- [Model Context Protocol](https://modelcontextprotocol.io)
