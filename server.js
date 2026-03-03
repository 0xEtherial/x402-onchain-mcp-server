#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8900';

// Tool definitions
const TOOLS = [
  {
    name: 'x402_wallet_score',
    description: 'Get comprehensive wallet profile including ETH balance, transaction count, first/last transaction timestamps, and top 5 tokens held. Cost: $0.10 per call via x402 payment protocol.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum wallet address (0x...)',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'x402_token_metrics',
    description: 'Get token data including price, market cap, 24h volume, liquidity, and FDV. Cost: $0.05 per call via x402 payment protocol.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Token contract address (0x...)',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'x402_protocol_tvl',
    description: 'Get DeFi protocol TVL data including total value locked, 24h change, and chain breakdown. Cost: $0.05 per call via x402 payment protocol.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Protocol slug identifier (e.g., "uniswap", "aave")',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'x402_gas_prices',
    description: 'Get current Ethereum gas prices with slow/standard/fast gwei estimates and USD cost estimates. Cost: $0.02 per call via x402 payment protocol.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'x402_health',
    description: 'Check API health status. Free endpoint - no payment required.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// API request handler
async function makeApiRequest(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: true,
        status: response.status,
        message: errorText || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || 'Network request failed',
    };
  }
}

// Tool handlers
const toolHandlers = {
  x402_wallet_score: async (args) => {
    const { address } = args;
    if (!address || !address.startsWith('0x')) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid Ethereum address format. Must start with 0x.' }) }] };
    }
    const result = await makeApiRequest(`/wallet/${address}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },

  x402_token_metrics: async (args) => {
    const { address } = args;
    if (!address || !address.startsWith('0x')) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid token address format. Must start with 0x.' }) }] };
    }
    const result = await makeApiRequest(`/token/${address}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },

  x402_protocol_tvl: async (args) => {
    const { slug } = args;
    if (!slug) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Protocol slug is required.' }) }] };
    }
    const result = await makeApiRequest(`/protocol/${slug}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },

  x402_gas_prices: async () => {
    const result = await makeApiRequest('/gas');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },

  x402_health: async () => {
    const result = await makeApiRequest('/');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
};

// Create MCP server
const server = new Server(
  {
    name: 'x402-onchain-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool call request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = toolHandlers[name];
  if (!handler) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: `Unknown tool: ${name}` }),
        },
      ],
    };
  }

  return await handler(args || {});
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`x402 On-Chain MCP Server running on ${API_BASE_URL}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
