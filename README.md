# Pay-per-crawl: Firecrawl x402 Search Demo

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://firecrawl-x402-demo.replit.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Must-be-Ash/firecrawl-x402-demo)
[![Remix on Replit](https://img.shields.io/badge/Replit-Remix-orange)](https://replit.com/@ashnouruzi/firecrawl-x402-demo)

This app brings together the **x402 Protocol**, **Coinbase Developer Platform's Embedded Wallet**, **Onramp**, and **Firecrawl's Search API** to demonstrate a new type of pay-per-use business model. By enabling micropayments with stablecoins through x402, it creates a digital product that's affordable for customers, profitable for service providers, and sustainable for platforms. Customers pay only for what they use with no commitments. Platforms don't spend upfront to access the service provider. It's a win-win scenario for all three parties.

Users don't need any crypto experience. With **Embedded Wallet**, they simply log in with email and a wallet is created for them automatically. **Onramp** lets them top up using Apple Pay (US only) or credit card without KYC. This abstracts away all crypto complexity and puts everything under the hood. Using **x402 Protocol**, users pay with micropayments to search and scrape the web with one click—no wallet signatures required.

With x402's low transaction fees, Firecrawl's search API accessible through x402, **Embedded Wallet**, and **Onramp** removing crypto UX friction, a new type of digital product becomes possible. One where customers don't overpay, and platforms and service providers don't lose on costs, transaction fees, upfront expenses, or subsidizing usage.

## What This App Does

Search the web and get clean, scraped data from multiple sources using Firecrawl's Search API, with automatic crypto payments via the x402 protocol. Simply enter a search query (like "AI developments 2024" or "latest tech news") and the app:
- Searches across web and news sources
- Returns structured results with titles, descriptions, and URLs
- Scrapes full content from each result (markdown, HTML, metadata)
- Handles all payments automatically using USDC micropayments

No manual payment handling required - the `x402-fetch` library intercepts 402 responses and handles payment authorization automatically.

## Architecture Overview

### Frontend Components

- **`app/page.tsx`** - Main page with CDP provider setup
- **`components/ClientApp.tsx`** - Handles Coinbase wallet connection state
- **`components/SignInScreen.tsx`** - Coinbase wallet connection UI
- **`components/SignedInScreen.tsx`** - Main app container after wallet connection
- **`components/WebScraper.tsx`** - Chat-style search interface with payment flow
  - Uses `x402-fetch` to wrap standard `fetch()` with automatic payment handling
  - Integrates with Coinbase CDP SDK for wallet operations
  - Displays search results with scraped content (markdown, HTML, metadata) immediately
  - Includes collapsible settings for results count, sources (web/news), and content options
- **`components/TopNavigation.tsx`** - Navigation bar with wallet info, fund button, and FAQ
- **`components/SearchResultCard.tsx`** - Individual search result cards with actions
- **`components/FAQModal.tsx`** - FAQ modal with app information

### Backend API Routes

- **`app/api/scrape/route.ts`** - Main search endpoint (proxies to Firecrawl's x402 search API)
  - Accepts search queries and configuration (limit, sources, scrape options)
  - Forwards requests to Firecrawl's x402 search API
  - Handles payment validation and logging
  - Returns search results with scraped data synchronously (no webhooks needed)

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
       │ 1. User enters search query
       ▼
┌─────────────────────────────┐
│   WebScraper.tsx            │
│  - Chat-style interface     │
│  - Wraps fetch() with       │
│    x402-fetch               │
│  - CDP wallet signs payment │
└──────┬──────────────────────┘
       │ 2. POST /api/scrape with search query
       ▼
┌─────────────────────────────┐
│ /api/scrape/route           │
│  - Forwards to Firecrawl    │
│    search API               │
└──────┬──────────────────────┘
       │ 3. POST to Firecrawl x402 search API
       ▼
┌─────────────────────────────┐
│   Firecrawl Search API      │
│  - Returns 402 if no payment│
│  - x402-fetch auto-pays     │
│  - Searches & scrapes       │
│  - Returns results          │
└──────┬──────────────────────┘
       │ 4. Synchronous response (5-15s)
       ▼
┌─────────────────────────────┐
│  User sees search results   │
│  Multiple cards with:       │
│  - Title & description      │
│  - Source URL               │
│  - Scraped markdown         │
│  - HTML content             │
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
   FIRECRAWL_API_BASE_URL=https://api.firecrawl.dev/v2/x402/search

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

### Search Options

The app provides configurable search settings through a collapsible settings panel:

- **Query**: Any search term (e.g., "AI developments 2024", "climate news today")
- **Results Limit**: Number of results to return (5, 10, 15, or 20)
- **Sources**: Choose between Web, News, or both
- **Content Options**:
  - **Only Main Content**: Extract only main content from scraped pages (removes navigation, ads, etc.)
  - **Max Age**: Optional freshness requirement for results

Each search result includes:
- Title and description
- Source URL with favicon
- Full scraped content (markdown format)
- Metadata (language, status code, etc.)
- Actions: Visit source, view content, download as markdown

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

1. User enters search query in chat interface
2. `x402-fetch` wraps the request to `/api/scrape`
3. First attempt returns 402 with payment requirements
4. `x402-fetch` automatically:
   - Reads payment requirements from response
   - Signs EIP-3009 authorization with CDP wallet
   - Retries request with `X-PAYMENT` header
5. Server validates payment and forwards to Firecrawl search API
6. Firecrawl searches the web, scrapes results, and returns data synchronously (5-15 seconds)
7. Frontend displays search results as interactive cards with full scraped content

## Project Structure

```
firecrawl-402demo/
├── app/
│   ├── api/
│   │   ├── scrape/route.ts                 # Main API: forwards to Firecrawl search
│   │   └── onramp/
│   │       ├── buy-options/route.ts        # Onramp payment methods API
│   │       └── buy-quote/route.ts          # Onramp quote/pricing API
│   ├── layout.tsx                          # Root layout with CDP provider
│   └── page.tsx                            # Main page
├── components/
│   ├── WebScraper.tsx                      # Chat-style search interface + x402 payment
│   ├── SearchResultCard.tsx                # Individual search result display
│   ├── TopNavigation.tsx                   # Navigation with wallet info & FAQ
│   ├── FAQModal.tsx                        # FAQ modal component
│   ├── ClientApp.tsx                       # Wallet connection logic
│   ├── SignInScreen.tsx                    # Wallet connect UI
│   ├── SignedInScreen.tsx                  # Main app after connect
│   ├── Providers.tsx                       # CDP React provider setup
│   └── ui/
│       ├── search-button.tsx               # Custom search button component
│       ├── minimal-button.tsx              # Minimal button for result cards
│       └── signout-button.tsx              # Custom signout button
├── lib/
│   ├── config.ts                           # App configuration
│   ├── cdp-auth.ts                         # JWT generation for Onramp API
│   ├── to-camel-case.ts                    # Response data transformer
│   └── onramp-api.ts                       # Onramp client API functions
├── types/
│   └── firecrawl.d.ts                      # Firecrawl search API type definitions
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

### "Search returns no results"
- Try broader search terms
- Check if sources (web/news) are properly selected in settings
- Verify you have sufficient USDC balance for the search cost

### Search results missing content or empty
- Some websites block scraping or require JavaScript
- Try adjusting the "Only Main Content" option in settings
- Results may vary based on website accessibility and anti-scraping measures
- Increase results limit to get more diverse sources

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

## Try It Out

- **🌐 [Live Demo](https://firecrawl-x402-demo.replit.app/)** - Try the app now
- **🔧 [Remix on Replit](https://replit.com/@ashnouruzi/firecrawl-x402-demo)** - Fork and customize
- **📦 [GitHub Repository](https://github.com/Must-be-Ash/firecrawl-x402-demo)** - Clone the source code

## Learn More

- [x402 Protocol Documentation](https://www.x402.org/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com)
- [Firecrawl API Documentation](https://www.firecrawl.dev/docs)
- [Base Network](https://base.org)

## License

MIT

---

**Note**: This project demonstrates x402 HTTP payment integration with Firecrawl's search API for synchronous web search and scraping. The implementation handles payment authorization client-side using CDP embedded wallets and EIP-3009 token authorizations, creating a seamless pay-per-use experience with no crypto knowledge required from end users.
