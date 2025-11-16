"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { getCurrentUser, toViemAccount } from "@coinbase/cdp-core";
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http, publicActions } from "viem";
import { base } from "viem/chains";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { SearchResponse } from "@/types/firecrawl";
import SearchResultCard from "./SearchResultCard";
import { ExpandableSearchDock } from "./expandable-search-dock";

interface SearchHistory {
  query: string;
  results: SearchResponse | null;
  timestamp: Date;
  error?: string;
}

export default function WebScraper() {
  const { evmAddress } = useEvmAddress();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [searchHistory]);

  const searchWeb = async (searchQuery?: string) => {
    const queryToUse = searchQuery || query;
    if (!queryToUse.trim()) return;

    if (!evmAddress) {
      setSearchHistory(prev => [...prev, {
        query: queryToUse.trim(),
        results: null,
        timestamp: new Date(),
        error: "Wallet not connected"
      }]);
      return;
    }

    setIsLoading(true);
    const currentQuery = queryToUse.trim();
    setQuery(""); // Clear input immediately

    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      const requestBody = {
        query: currentQuery,
        limit,
        sources: ['web'],
        scrapeOptions: {
          onlyMainContent: true,
        },
      };

      console.log("Making request to Firecrawl API with x402 payment...");

      // Get CDP user and convert to viem account for x402
      let fetchFunc: typeof fetch = fetch;
      try {
        const user = await getCurrentUser();
        if (user && user.evmAccounts && user.evmAccounts.length > 0) {
          const viemAccount = await toViemAccount(user.evmAccounts[0]);
          const chain = base;
          const rpcUrl = 'https://mainnet.base.org';

          const walletClient = createWalletClient({
            account: viemAccount,
            chain: chain,
            transport: http(rpcUrl),
          }).extend(publicActions);

          const maxPaymentAmount = BigInt(0.1 * 10 ** 6);
          // @ts-ignore
          fetchFunc = wrapFetchWithPayment(fetch, walletClient, maxPaymentAmount) as typeof fetch;
        }
      } catch (signerError) {
        console.warn("Failed to setup x402 payment:", signerError);
      }

      const response = await fetchFunc("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      setSearchHistory(prev => [...prev, {
        query: currentQuery,
        results: data,
        timestamp: new Date(),
      }]);

      setIsLoading(false);

    } catch (err) {
      console.error("Web search failed:", err);

      let errorMessage = "An unknown error occurred";
      if (err instanceof Error) {
        if (err.message.includes("rejected")) {
          errorMessage = "Payment was rejected";
        } else if (err.message.includes("Insufficient funds")) {
          errorMessage = "Insufficient USDC balance";
        } else {
          errorMessage = err.message;
        }
      }

      setSearchHistory(prev => [...prev, {
        query: currentQuery,
        results: null,
        timestamp: new Date(),
        error: errorMessage
      }]);

      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overscroll-none pt-24">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-8 pb-24 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {searchHistory.length === 0 && !isLoading && (
            <div className="text-center py-10 md:py-20 px-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="w-12 h-12 md:w-16 md:h-16 object-contain mx-auto mb-3 md:mb-4"
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Start a Search</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Enter a search query below to find and scrape web content</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => searchWeb("what's x402 protocol?")}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-xs md:text-sm"
                >
                  what&apos;s x402 protocol?
                </button>
                <button
                  onClick={() => searchWeb("what's Firecrawl?")}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-xs md:text-sm"
                >
                  what&apos;s Firecrawl?
                </button>
                <button
                  onClick={() => searchWeb("latest tech trends")}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-xs md:text-sm"
                >
                  latest tech trends
                </button>
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.map((item, idx) => (
            <div key={idx} className="space-y-4">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl rounded-tr-sm max-w-xs md:max-w-2xl">
                  <p className="font-medium text-sm md:text-base">{item.query}</p>
                </div>
              </div>

              {/* Results or Error */}
              {item.error ? (
                <div className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl rounded-tl-sm max-w-xs md:max-w-2xl">
                    <p className="font-medium text-sm md:text-base">Error: {item.error}</p>
                  </div>
                </div>
              ) : item.results?.success && item.results.data.web ? (
                item.results.data.web.length === 0 ? (
                  /* Empty Results State */
                  <div className="flex justify-start">
                    <div className="bg-blue-50 border border-blue-200 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl rounded-tl-sm max-w-xs md:max-w-2xl">
                      <div className="space-y-2">
                        <p className="font-semibold text-sm md:text-base text-blue-900">No results found</p>
                        <p className="text-xs md:text-sm text-blue-700">
                          Try adjusting your search:
                        </p>
                        <ul className="text-xs md:text-sm text-blue-700 list-disc list-inside space-y-1">
                          <li>Use different keywords</li>
                          <li>Try broader search terms</li>
                          <li>Increase result limit</li>
                        </ul>
                        <p className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                          ✓ Payment processed successfully
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Results Found */
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm text-gray-600">
                        Found {item.results.data.web.length} results
                      </div>
                    </div>
                    <div className="space-y-4">
                      {item.results.data.web.map((result, resultIdx) => (
                        <SearchResultCard key={resultIdx} result={result} index={resultIdx} />
                      ))}
                    </div>
                  </div>
                )
              ) : null}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-end">
              <div className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl rounded-tr-sm max-w-xs md:max-w-2xl">
                <TextShimmer className="text-sm md:text-base font-medium text-white" duration={1.5}>
                  Searching the web...
                </TextShimmer>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Expandable Search Dock */}
      <ExpandableSearchDock
        query={query}
        setQuery={setQuery}
        limit={limit}
        setLimit={setLimit}
        onSearch={searchWeb}
        isLoading={isLoading}
      />
    </div>
  );
}
