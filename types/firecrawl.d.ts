// Firecrawl API Type Definitions for x402 Integration (Search API)

export interface SearchRequest {
  query: string;
  limit?: number;
  sources?: string[];
  scrapeOptions?: {
    onlyMainContent?: boolean;
    maxAge?: number;
  };
}

export interface FirecrawlWebResult {
  title: string;
  description: string;
  url: string;
  markdown: string;
  html: string;
  rawHtml: string;
  summary: string;
  links: string[];
  screenshot?: string;
  metadata: {
    title: string;
    description: string;
    sourceURL: string;
    statusCode: number;
    language?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    [key: string]: any;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    web: FirecrawlWebResult[];
    images?: any[];
    news?: any[];
  };
  warning?: string;
}

export interface FirecrawlError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}
