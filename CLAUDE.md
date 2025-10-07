# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js app demonstrating the **x402 Protocol** for HTTP-based micropayments. It integrates Firecrawl's web scraping service with Coinbase Developer Platform's Embedded Wallet and Onramp, allowing users to pay with USDC on Base network using one-click payments without manual wallet signatures.

## Development Commands

```bash
# Start development server (default port 5000)
npm run dev

# Start on different port
npm run dev -- -p 3000

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Critical Configuration

### Environment Variables (`.env.local`)

Required environment variables:
- `FIRECRAWL_API_KEY` - API key from Firecrawl (get from https://www.firecrawl.dev/)
- `FIRECRAWL_API_BASE_URL` - Firecrawl x402 scrape endpoint (default: `https://api.firecrawl.dev/v2/x402/scrape`)
- `NEXT_PUBLIC_CDP_PROJECT_ID` - Coinbase Developer Platform project ID
- `CDP_API_KEY_ID` - CDP API key ID (for Onramp server-side authentication)
- `CDP_API_KEY_SECRET` - CDP API key secret (for Onramp server-side authentication)
- `NEXT_PUBLIC_NETWORK` - Network to use (`base` for mainnet - Firecrawl requires mainnet)
- `USDC_CONTRACT_ADDRESS` - USDC contract address for the network (Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)

Optional:
- `FACILITATOR_URL` - x402 facilitator URL (defaults to `https://api.x402.org/facilitator`)

### Key Network Configurations

- **Base Mainnet** (required for Firecrawl): `NEXT_PUBLIC_NETWORK=base`, USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Architecture & Payment Flow

### x402 Payment Protocol

The app uses the **x402 protocol** which enables HTTP 402 (Payment Required) responses with automatic payment handling:

1. **Initial Request**: Client makes request to `/api/scrape` without payment
2. **402 Response**: Server returns 402 with payment requirements in response body
3. **Automatic Payment**: `x402-fetch` library intercepts 402, reads requirements, signs EIP-3009 authorization with CDP wallet, and retries with `X-PAYMENT` header
4. **Validation**: Server forwards payment to Firecrawl's x402 endpoint for settlement
5. **Response**: After payment validation, Firecrawl returns scraped data synchronously (no polling needed)

### Key Components

**Frontend (`components/WebScraper.tsx`)**:
- Wraps `fetch()` with `wrapFetchWithPayment()` from `x402-fetch` library
- Converts CDP wallet account to viem-compatible `WalletClient` for signing
- Sets `maxPaymentAmount` to 1 USDC (in 6-decimal format: `1000000`)
- Handles payment automatically on 402 responses - no manual signature required
- Displays scraped content including markdown, HTML, extracted links, and metadata

**Backend (`app/api/scrape/route.ts`)**:
- Receives request with or without `X-PAYMENT` header
- Forwards to Firecrawl's x402 endpoint: `https://api.firecrawl.dev/v2/x402/scrape`
- Request body includes: `url`, `formats` (markdown, html, rawHtml), `onlyMainContent`
- Returns 402 if no payment, 200 with scraped data if payment valid
- Logs detailed payment validation info for debugging
- **Synchronous response** - no webhooks or polling required (unlike image generation)

**Onramp Integration**

The app includes Coinbase Onramp for fiat-to-crypto purchases:

**API Routes**:
- `/api/onramp/buy-options` - Returns available payment methods (credit card, Apple Pay, Coinbase account)
- `/api/onramp/buy-quote` - Creates purchase quotes with pricing and widget URLs

**Authentication (`lib/cdp-auth.ts`)**:
- Server-side routes use JWT authentication via `@coinbase/cdp-sdk/auth`
- `generateCDPJWT()` creates tokens for CDP API calls
- Requires `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`

**Requirements**:
- Domain must be whitelisted in [CDP Portal](https://portal.cdp.coinbase.com/products/embedded-wallets/domains)
- For localhost: add `http://localhost:3000` (or your dev port)
- User location (country + subdivision for US) required for regulatory compliance

## Common Development Patterns

### When Working with x402 Payment Issues

**IMPORTANT**: When experiencing errors or problems with x402 payment calls, use the context7 MCP tool to study the official x402 documentation before making changes. This is critical for understanding payment flow, header formats, and error handling.

Example workflow:
1. Use context7 to retrieve x402 protocol documentation
2. Check payment header structure and validation requirements
3. Verify network configuration matches payment requirements
4. Ensure EIP-3009 authorization format is correct

### Debugging Payment Failures

Check server logs for:
- `═══ PAYMENT VALIDATION ═══` - Shows decoded payment details
- `═══ PAYMENT VERIFICATION FAILED ═══` - Firecrawl rejected payment
- `═══ FACILITATOR VERIFICATION ERROR ═══` - Network/connection issues

Common issues:
- Network mismatch: Payment signed for wrong network (must be Base mainnet for Firecrawl)
- Insufficient balance: Not enough USDC in wallet
- Wrong USDC contract: Using incorrect contract address for network
- Invalid URL: URL validation fails before scraping

### Adding New Scraping Options

Scraping parameters are in `components/WebScraper.tsx`:
- `url`: Target website URL (required)
- `formats`: Array of desired output formats - 'markdown', 'html', 'rawHtml', 'screenshot'
- `onlyMainContent`: Boolean to extract only main content (default: true)
- `waitFor`: Optional wait time before scraping (milliseconds)
- `timeout`: Optional timeout for scraping (milliseconds)

When adding options, update both the UI form and the request body in `/api/scrape/route.ts`.

### Firecrawl Response Structure

```typescript
{
  success: true,
  data: {
    markdown: string,        // Clean markdown content
    html: string,           // Cleaned HTML
    rawHtml: string,        // Original HTML
    screenshot: string,     // Base64 screenshot (if requested)
    metadata: {
      title: string,
      description: string,
      sourceURL: string,
      statusCode: number,
      language?: string,
      ogTitle?: string,
      ogDescription?: string,
      ogImage?: string
    },
    links: string[]         // Extracted links
  }
}
```

## Stack & Dependencies

- **Next.js 14** with App Router
- **x402-fetch ^0.6.0** - HTTP payment handling
- **@coinbase/cdp-react ^0.0.33** - React hooks for embedded wallet
- **@coinbase/cdp-sdk ^1.38.3** - Server-side CDP operations
- **viem** - Ethereum client (via CDP dependencies)
- **Base Network** - Ethereum L2 for low-cost USDC payments
- **Tailwind CSS** + **Framer Motion** - UI styling and animations

## Important Notes

### Payment Authorization

- Uses **EIP-3009** token authorization (not ERC20 approve/transferFrom)
- CDP wallet signs authorization off-chain, Firecrawl settles on-chain
- No user signature popups required after initial wallet connection
- Transaction fees paid by service provider, not user

### Synchronous Web Scraping

- Firecrawl's x402 endpoint returns results immediately (not async like image generation)
- No webhook infrastructure needed
- No polling required
- Response typically returns in 5-15 seconds depending on website complexity

### Security Considerations

- Never commit `.env.local` with real API keys
- CDP API keys should have minimal required permissions
- Onramp requires domain whitelisting to prevent unauthorized use
- URL validation prevents malicious scraping attempts

### Differences from Image Generation Apps

- **Synchronous response** - no webhooks or task polling
- Simpler request/response flow
- URL input instead of prompt/model selection
- Structured data output (markdown/HTML) instead of images
- No task storage or status tracking needed
