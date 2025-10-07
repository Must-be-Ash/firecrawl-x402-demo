# Firecrawl x402 Web Scraper

This app brings together the **x402 Protocol**, **Coinbase Developer Platform's Embedded Wallet**, **Onramp**, and **Firecrawl's Web Scraping API** to demonstrate a new type of pay-per-use business model. By enabling micropayments with stablecoins through x402, it creates a digital product that's affordable for customers, profitable for service providers, and sustainable for platforms. Customers pay only for what they use with no commitments. Platforms don't spend upfront to access the service provider. It's a win-win scenario for all three parties.

Users don't need any crypto experience. With **Embedded Wallet**, they simply log in with email and a wallet is created for them automatically. **Onramp** lets them top up using Apple Pay (US only) or credit card without KYC. This abstracts away all crypto complexity and puts everything under the hood. Using **x402 Protocol**, users pay ~$0.10 to scrape websites with one click—no wallet signatures required.

With x402's low transaction fees, Firecrawl's scraping API accessible through x402, **Embedded Wallet**, and **Onramp** removing crypto UX friction, a new type of digital product becomes possible. One where customers don't overpay, and platforms and service providers don't lose on costs, transaction fees, upfront expenses, or subsidizing usage.

## What This App Does

Scrape any website and convert it into clean, LLM-ready data using Firecrawl's API, with automatic crypto payments via the x402 protocol. No manual payment handling required - the `x402-fetch` library intercepts 402 responses and handles payment authorization automatically.

## Architecture Overview

### Frontend Components

- **`app/page.tsx`** - Main page with password protection
- **`components/ClientApp.tsx`** - Handles Coinbase wallet connection state
- **`components/SignInScreen.tsx`** - Coinbase wallet connection UI
- **`components/SignedInScreen.tsx`** - Main app container after wallet connection
- **`components/WebScraper.tsx`** - Web scraping form and payment flow
  - Uses `x402-fetch` to wrap standard `fetch()` with automatic payment handling
  - Integrates with Coinbase CDP SDK for wallet operations
  - Displays scraped content (markdown, HTML, links) immediately

### Backend API Routes

- **`app/api/scrape/route.ts`** - Main web scraping endpoint
  - Forwards requests to Firecrawl's x402 API
  - Handles payment validation and logging
  - Returns scraped data synchronously (no webhooks needed)

### Libraries & Utilities

- **`lib/config.ts`** - CDP and app configuration
- **`lib/cdp-auth.ts`** - JWT generation for Onramp API authentication
- **`lib/to-camel-case.ts`** - Response data transformation helper
- **`lib/onramp-api.ts`** - Client-side Onramp API functions
- **`components/Providers.tsx`** - Coinbase CDP React context provider
- **`types/firecrawl.d.ts`** - TypeScript types for Firecrawl API

### Onramp API Routes

- **`app/api/onramp/buy-options/route.ts`** - Get available payment methods
  - Returns supported payment options (Coinbase account, debit card, etc.)
  - Used by FundModal to display payment choices

- **`app/api/onramp/buy-quote/route.ts`** - Create buy quotes
  - Fetches exchange rates and generates purchase URLs
  - Handles transaction pricing and Coinbase Onramp widget integration

## How It Works

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ 1. User submits URL
       ▼
┌─────────────────────────────┐
│   WebScraper.tsx            │
│  - Wraps fetch() with       │
│    x402-fetch               │
│  - CDP wallet signs payment │
└──────┬──────────────────────┘
       │ 2. POST /api/scrape
       ▼
┌─────────────────────────────┐
│ /api/scrape/route           │
│  - Forwards to Firecrawl    │
└──────┬──────────────────────┘
       │ 3. POST to Firecrawl x402 API
       ▼
┌─────────────────────────────┐
│   Firecrawl API             │
│  - Returns 402 if no payment│
│  - x402-fetch auto-pays     │
│  - Returns scraped data     │
└──────┬──────────────────────┘
       │ 4. Synchronous response (5-15s)
       ▼
┌─────────────────────────────┐
│   User sees scraped content │
│  - Markdown                 │
│  - HTML                     │
│  - Extracted links          │
│  - Metadata                 │
└─────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Firecrawl API key ([Get one here](https://www.firecrawl.dev/))
- Coinbase Developer Platform account for CDP SDK
- USDC on Base network for payments

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```

3. **Set required environment variables in `.env.local`:**
   ```env
   # Firecrawl
   FIRECRAWL_API_KEY=fc-your-api-key
   FIRECRAWL_API_BASE_URL=https://api.firecrawl.dev/v2/x402/scrape

   # Network (Base mainnet - Firecrawl requires mainnet)
   NEXT_PUBLIC_NETWORK=base

   # Coinbase Developer Platform
   NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id
   CDP_API_KEY_ID=your-cdp-api-key-id
   CDP_API_KEY_SECRET=your-cdp-api-key-secret

   # USDC Contract
   USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   ```

4. **Start development server:**
   ```bash
   npm run dev -- -p 3000
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Configuration

### Network Configuration

**Base Mainnet (Required for Firecrawl):**
```env
NEXT_PUBLIC_NETWORK=base
USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Web Scraping Options

- **URL**: Any valid website URL
- **Output Formats**: markdown, html, rawHtml, screenshot
- **Only Main Content**: Extract only main content (removes navigation, ads, etc.)
- **Wait For**: Optional wait time before scraping (milliseconds)
- **Timeout**: Optional timeout for scraping (milliseconds)

## Onramp Integration

Users can fund their wallets directly from the app using credit card or Apple Pay (US only). The integration uses Coinbase's Onramp API with the following components:

### How Users Fund Their Wallets

1. Click "Fund your wallet" button in the app
2. Select amount to purchase ($2, $5, or $10 presets or custom amount)
3. Choose payment method (Coinbase account or debit card)
4. Complete purchase through Coinbase's secure payment widget
5. USDC is deposited directly to their embedded wallet on Base

### Onramp Requirements

- **Domain whitelist**: Add your domain to [CDP Portal allowed domains](https://portal.cdp.coinbase.com/products/embedded-wallets/domains)
- **API credentials**: CDP_API_KEY_ID and CDP_API_KEY_SECRET must be configured
- **User location**: Country and subdivision (for US users) required for regulatory compliance
- **Trial mode**: Enabled by default with purchase limits (upgrade for production use)

## Key Technologies

- **Next.js 14** - React framework with App Router
- **x402-fetch** - Automatic HTTP payment handling
- **Coinbase CDP SDK** - Wallet creation and management
- **Coinbase Onramp** - Fiat-to-crypto purchasing (credit card, Apple Pay)
- **Firecrawl API** - Web scraping and data extraction
- **Base Network** - Ethereum L2 for low-cost USDC payments
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## Payment Flow Details

1. User submits website URL
2. `x402-fetch` wraps the request to `/api/scrape`
3. First attempt returns 402 with payment requirements
4. `x402-fetch` automatically:
   - Reads payment requirements from response
   - Signs EIP-3009 authorization with CDP wallet
   - Retries request with `X-PAYMENT` header
5. Server validates payment and forwards to Firecrawl
6. Firecrawl returns scraped data synchronously (5-15 seconds)
7. Frontend displays results immediately (markdown, HTML, links, metadata)

## Project Structure

```
firecrawl-402demo/
├── app/
│   ├── api/
│   │   ├── scrape/route.ts                 # Main API: forwards to Firecrawl
│   │   └── onramp/
│   │       ├── buy-options/route.ts        # Onramp payment methods API
│   │       └── buy-quote/route.ts          # Onramp quote/pricing API
│   ├── layout.tsx                          # Root layout with CDP provider
│   └── page.tsx                            # Main page with password gate
├── components/
│   ├── WebScraper.tsx                      # Web scraping form + x402 payment
│   ├── ClientApp.tsx                       # Wallet connection logic
│   ├── SignInScreen.tsx                    # Wallet connect UI
│   ├── SignedInScreen.tsx                  # Main app after connect (includes Onramp)
│   └── Providers.tsx                       # CDP React provider setup
├── lib/
│   ├── config.ts                           # App configuration
│   ├── cdp-auth.ts                         # JWT generation for Onramp API
│   ├── to-camel-case.ts                    # Response data transformer
│   └── onramp-api.ts                       # Onramp client API functions
├── types/
│   └── firecrawl.d.ts                      # Firecrawl type definitions
└── .env.local                              # Environment variables
```

## Troubleshooting

### "Payment verification failed"
- Ensure you have sufficient USDC balance on Base mainnet
- Check that your wallet is properly connected
- Verify network configuration is set to `base` in `.env.local`
- Firecrawl requires Base mainnet (not testnet)

### "No payment header provided"
- CDP wallet not properly initialized
- Check that `NEXT_PUBLIC_CDP_PROJECT_ID` and related keys are set
- Ensure wallet is connected (check browser console)

### "Invalid URL format"
- Enter a complete URL including protocol (e.g., https://example.com)
- Ensure URL is accessible and not blocked by robots.txt

### Scraping fails or returns empty content
- Some websites block scraping or require JavaScript
- Try enabling "Wait For" option for JavaScript-heavy sites
- Check if website has anti-scraping measures

### Onramp not working / "CDP API credentials not configured"
- Verify CDP_API_KEY_ID and CDP_API_KEY_SECRET are set in `.env.local`
- Ensure your domain is whitelisted in [CDP Portal](https://portal.cdp.coinbase.com/products/embedded-wallets/domains)
- For localhost development, add `http://localhost:3000` to allowed domains
- Check server logs for detailed error messages

### Onramp modal shows "Failed to fetch buy options"
- Confirm API credentials have correct permissions in CDP Portal
- Verify user location (country/subdivision) is supported by Coinbase Onramp
- Check browser console and server logs for specific error details

## Development

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Learn More

- [x402 Protocol Documentation](https://www.x402.org/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com)
- [Firecrawl API Documentation](https://www.firecrawl.dev/docs)
- [Base Network](https://base.org)

## License

MIT

---

**Note**: This project demonstrates x402 HTTP payment integration with synchronous web scraping. The implementation handles payment authorization client-side using CDP wallets and EIP-3009 token authorizations.
