export const CDP_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
};

export const APP_CONFIG = {
  name: "Firecrawl × Coinbase",
  logoUrl: "/logo.svg",
};

export const FIRECRAWL_CONFIG = {
  apiKey: process.env.FIRECRAWL_API_KEY ?? "",
  apiUrl: process.env.FIRECRAWL_API_BASE_URL ?? "https://api.firecrawl.dev/v2/x402/scrape",
  network: "base", // Firecrawl requires mainnet
};
