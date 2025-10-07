"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { getCurrentUser, toViemAccount } from "@coinbase/cdp-core";
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http, publicActions } from "viem";
import { base } from "viem/chains";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { SearchButton } from "@/components/ui/search-button";
import { SearchResponse } from "@/types/firecrawl";
import SearchResultCard from "./SearchResultCard";

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
  const [sources, setSources] = useState<string[]>(['web']);
  const [onlyMainContent, setOnlyMainContent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new results appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [searchHistory]);

  const searchWeb = async () => {
    if (!query.trim()) return;

    if (!evmAddress) {
      setSearchHistory(prev => [...prev, {
        query: query.trim(),
        results: null,
        timestamp: new Date(),
        error: "Wallet not connected"
      }]);
      return;
    }

    setIsLoading(true);
    const currentQuery = query.trim();
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
        sources,
        scrapeOptions: {
          onlyMainContent,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      searchWeb();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);

    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';

    // Set height based on scrollHeight, with max height
    const maxHeight = 200; // max height in pixels
    const newHeight = Math.min(e.target.scrollHeight, maxHeight);
    e.target.style.height = `${newHeight}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overscroll-none">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
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
                  onClick={() => setQuery("what's x402 protocol?")}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-xs md:text-sm"
                >
                  what&apos;s x402 protocol?
                </button>
                <button
                  onClick={() => setQuery("what's Firecrawl?")}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-xs md:text-sm"
                >
                  what&apos;s Firecrawl?
                </button>
                <button
                  onClick={() => setQuery("latest tech trends")}
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
              ) : null}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl rounded-tl-sm shadow-sm">
                <TextShimmer className="text-xs md:text-sm font-medium" duration={1.5}>
                  Searching the web...
                </TextShimmer>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom Search Dock */}
      <div className="border-t border-gray-200 bg-white px-4 md:px-6 lg:px-8 py-4 sticky bottom-0 z-10 overscroll-none">
        <div className="max-w-7xl mx-auto">
          {/* Settings Panel (Collapsible) */}
          {showSettings && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Results Selector */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Results</label>
                  <button
                    onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-300 rounded-lg hover:border-orange-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-700">{limit} results</span>
                    <svg className={`w-4 h-4 text-gray-600 transition-transform ${showLimitDropdown ? 'rotate-180 md:rotate-0' : 'md:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showLimitDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowLimitDropdown(false)}
                      />
                      <div className="absolute top-full mt-2 md:top-auto md:bottom-full md:mb-2 w-full bg-white rounded-lg shadow-lg border-2 border-gray-200 py-1 z-20">
                        {[5, 10, 15, 20].map((value) => (
                          <button
                            key={value}
                            onClick={() => {
                              setLimit(value);
                              setShowLimitDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                              limit === value
                                ? 'bg-orange-50 text-orange-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{value} results</span>
                              {limit === value && (
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Sources */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sources</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (sources.includes('web')) {
                          setSources(sources.filter(s => s !== 'web'));
                        } else {
                          setSources([...sources, 'web']);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                        sources.includes('web')
                          ? 'bg-orange-50 border-orange-500 text-orange-700'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        sources.includes('web')
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-400'
                      }`}>
                        {sources.includes('web') && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">Web</span>
                    </button>

                    <button
                      onClick={() => {
                        if (sources.includes('news')) {
                          setSources(sources.filter(s => s !== 'news'));
                        } else {
                          setSources([...sources, 'news']);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                        sources.includes('news')
                          ? 'bg-orange-50 border-orange-500 text-orange-700'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        sources.includes('news')
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-400'
                      }`}>
                        {sources.includes('news') && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">News</span>
                    </button>
                  </div>
                </div>

                {/* Content Options */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Content</label>
                  <button
                    onClick={() => setOnlyMainContent(!onlyMainContent)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                      onlyMainContent
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      onlyMainContent
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-400'
                    }`}>
                      {onlyMainContent && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">Main content only</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="h-[37px] w-[37px] md:h-[47px] md:w-[47px] rounded-lg border border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-colors flex-shrink-0 flex items-center justify-center"
              title="Settings"
            >
              <svg className="w-4 h-4 md:w-5.5 md:h-5.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <div className="flex-1 relative flex items-center">
              <textarea
                value={query}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Search anything..."
                rows={1}
                className="w-full px-3 md:px-4 py-2 md:py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base resize-none overflow-y-auto leading-relaxed scrollbar-none"
                disabled={isLoading}
                style={{
                  minHeight: '38px',
                  maxHeight: '200px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              />
            </div>

            <SearchButton
              onClick={searchWeb}
              disabled={isLoading || !query.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
