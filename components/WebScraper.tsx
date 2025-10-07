"use client";

import { useState } from "react";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { getCurrentUser, toViemAccount } from "@coinbase/cdp-core";
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http, publicActions } from "viem";
import { base } from "viem/chains";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ModernButton } from "@/components/ui/modern-button";
import { SearchResponse } from "@/types/firecrawl";

export default function WebScraper() {
  const { evmAddress } = useEvmAddress();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [sources, setSources] = useState<string[]>(['web']);
  const [onlyMainContent, setOnlyMainContent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchWeb = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    if (!evmAddress) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestBody = {
        query,
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
          // Convert CDP account to viem-compatible LocalAccount
          const viemAccount = await toViemAccount(user.evmAccounts[0]);

          // Determine which chain to use based on environment
          const network = process.env.NEXT_PUBLIC_NETWORK || 'base';
          const chain = base; // Firecrawl requires mainnet
          const rpcUrl = 'https://mainnet.base.org';

          // Wrap the account in a WalletClient with the appropriate chain info
          const walletClient = createWalletClient({
            account: viemAccount,
            chain: chain,
            transport: http(rpcUrl),
          }).extend(publicActions);

          console.log("Wallet client details:", {
            address: walletClient.account?.address,
            chainId: walletClient.chain?.id,
            chainName: walletClient.chain?.name,
          });

          // Create x402-enabled fetch with payment handling
          // Max payment amount: 0.1 USDC for search queries
          const maxPaymentAmount = BigInt(0.1 * 10 ** 6); // 0.1 USDC (100,000 units with 6 decimals)
          // @ts-ignore - Type mismatch between viem versions, but runtime is compatible
          fetchFunc = wrapFetchWithPayment(fetch, walletClient, maxPaymentAmount) as typeof fetch;
          console.log(`Using x402-enabled fetch with CDP wallet on ${chain.name}, max payment: 0.1 USDC`);
          console.log("CDP wallet address being used for payment:", viemAccount.address);
          console.log(`Network: ${chain.name} (chain ID ${chain.id})`);
        } else {
          console.warn("No CDP user or accounts available, using regular fetch (payments won't work)");
        }
      } catch (signerError) {
        console.warn("Failed to setup x402 payment, falling back to regular fetch:", signerError);
      }

      // Make request to our API route which proxies to Firecrawl
      const response = await fetchFunc("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Request failed: ${response.status} ${response.statusText}`, errorData);

        if (response.status === 402) {
          setError("Payment required but x402-fetch didn't handle it automatically. Please check your wallet setup.");
        } else {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data: SearchResponse = await response.json();
      console.log("Firecrawl response received:", data);

      // Check for payment confirmation header
      const paymentResponseHeader = response.headers.get('X-PAYMENT-RESPONSE');
      if (paymentResponseHeader) {
        console.log('═══ PAYMENT CONFIRMED ═══');
        try {
          const decoded = JSON.parse(atob(paymentResponseHeader));
          console.log('Payment response:', decoded);
          if (decoded.transaction) {
            console.log('✅ Transaction hash:', decoded.transaction);
            console.log('View on BaseScan:', `https://basescan.org/tx/${decoded.transaction}`);
          }
        } catch (e) {
          console.error('Could not decode payment response:', e);
        }
        console.log('═══ END PAYMENT CONFIRMATION ═══');
      }

      setResult(data);
      setIsLoading(false);

    } catch (err) {
      console.error("Web search failed:", err);

      if (err instanceof Error) {
        if (err.message.includes("rejected") || err.message.includes("User rejected")) {
          setError("Payment was rejected. Please try again.");
        } else if (err.message.includes("Insufficient funds")) {
          setError("Insufficient USDC balance. Please add funds to your wallet.");
        } else if (err.message.includes("No Web3 wallet")) {
          setError("No wallet detected. Please refresh and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unknown error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Search Query Input */}
      <div className="form-group">
        <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-2">
          Search Query
        </label>
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., AI developments 2024, climate news today..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base"
        />
      </div>

      {/* Advanced Options Section */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Options</h3>

        {/* Number of Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-600 mb-2">
              Number of Results
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
            >
              <option value={5}>5 results</option>
              <option value={10}>10 results</option>
              <option value={15}>15 results</option>
              <option value={20}>20 results</option>
            </select>
          </div>

          {/* Search Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Search Sources
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-md border border-gray-300 hover:border-orange-400 transition-colors">
                <input
                  type="checkbox"
                  checked={sources.includes('web')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSources([...sources, 'web']);
                    } else {
                      setSources(sources.filter(s => s !== 'web'));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium">Web</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-md border border-gray-300 hover:border-orange-400 transition-colors">
                <input
                  type="checkbox"
                  checked={sources.includes('news')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSources([...sources, 'news']);
                    } else {
                      setSources(sources.filter(s => s !== 'news'));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium">News</span>
              </label>
            </div>
          </div>
        </div>

        {/* Extract Main Content Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-md border border-gray-300 hover:border-orange-400 transition-colors">
            <input
              type="checkbox"
              checked={onlyMainContent}
              onChange={(e) => setOnlyMainContent(e.target.checked)}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Extract only main content</span>
              <p className="text-xs text-gray-500 mt-0.5">Removes navigation, ads, and other non-essential elements</p>
            </div>
          </label>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center pt-2">
        <ModernButton
          variant="orange"
          onClick={searchWeb}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? "Searching..." : "Search"}
        </ModernButton>
      </div>

      {error && (
        <div className="output" style={{ color: "#ff6b6b", textAlign: "center" }}>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="output">
          <div className="spinner" />
          <TextShimmer className="mt-4 text-lg font-medium" duration={1.5}>
            Searching the web...
          </TextShimmer>
        </div>
      )}

      {result && result.success && result.data.web && (
        <div className="output" style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
          <div className="w-full">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Search Results ({result.data.web.length})</h3>
              <p className="text-gray-600 text-sm">Query: &ldquo;{query}&rdquo;</p>
            </div>

            <div className="space-y-4">
              {result.data.web.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <h4 className="font-semibold text-lg mb-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800"
                    >
                      {item.title || item.metadata.title}
                    </a>
                  </h4>

                  <p className="text-sm text-gray-600 mb-2">{item.url}</p>

                  <p className="text-gray-700 mb-3">
                    {item.description || item.summary || item.metadata.description}
                  </p>

                  {item.markdown && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-800">
                        View Content
                      </summary>
                      <div className="mt-2">
                        <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto max-h-64 text-xs whitespace-pre-wrap">
                          {item.markdown.substring(0, 500)}
                          {item.markdown.length > 500 && '...'}
                        </pre>
                        <div className="mt-2 flex gap-2">
                          <ModernButton
                            variant="orange"
                            className="text-xs px-3 py-1"
                            onClick={() => {
                              const blob = new Blob([item.markdown], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${item.title || 'content'}.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            Download Markdown
                          </ModernButton>
                          {item.html && (
                            <ModernButton
                              variant="orange"
                              className="text-xs px-3 py-1"
                              onClick={() => {
                                const blob = new Blob([item.html], { type: 'text/html' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${item.title || 'content'}.html`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Download HTML
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
