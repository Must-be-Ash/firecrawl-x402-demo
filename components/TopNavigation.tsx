"use client";

import { useState, useCallback, useEffect } from "react";
import { useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { AuthButton, FundModal, type FundModalProps } from "@coinbase/cdp-react";
import { getBuyOptions, createBuyQuote } from "@/lib/onramp-api";
import { CircleHelp } from "lucide-react";
import FAQModal from "./FAQModal";
import { SignoutButton } from "@/components/ui/signout-button";

export default function TopNavigation() {
  const { evmAddress } = useEvmAddress();
  const { signOut } = useSignOut();
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  // Add data attribute to body when FundModal is open to control CSS styling
  useEffect(() => {
    if (isModalOpen) {
      document.body.setAttribute('data-fund-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-fund-modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.removeAttribute('data-fund-modal-open');
    };
  }, [isModalOpen]);

  const copyToClipboard = async () => {
    if (!evmAddress) return;

    try {
      await navigator.clipboard.writeText(evmAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Get the user's location (for Onramp)
  const userCountry = "US";
  const userSubdivision = "CA";

  // Onramp API callback functions
  const fetchBuyQuote: FundModalProps["fetchBuyQuote"] = useCallback(async params => {
    return createBuyQuote(params);
  }, []);

  const fetchBuyOptions: FundModalProps["fetchBuyOptions"] = useCallback(async params => {
    return getBuyOptions(params);
  }, []);

  const handleOnrampSuccess = useCallback(() => {
    console.log("✅ Onramp purchase successful!");
    setIsModalOpen(false);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pay-per-crawl</h1>
              <p className="text-xs text-gray-500">Powered by Firecrawl & x402</p>
            </div>
          </div>

          {/* Desktop Wallet Info & Actions */}
          <div className="hidden md:flex items-center gap-2 md:gap-3">
            {/* Help Icon */}
            <button
              onClick={() => setIsFAQOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="FAQ"
            >
              <CircleHelp className="w-5 h-5 text-gray-600" />
            </button>

            {/* Wallet Address */}
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs md:text-sm"
              title={copied ? "Address copied!" : "Click to copy address"}
            >
              <span className="font-mono text-gray-700">
                {`${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
              </span>
              {copied ? (
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              )}
            </button>

            {/* Fund Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-xs md:text-sm"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Fund</span>
              <span className="sm:hidden">+</span>
            </button>

            {/* Signout Button */}
            <div className="border-l border-gray-300 pl-2 md:pl-3">
              <SignoutButton onClick={signOut} />
            </div>
          </div>

          {/* Mobile Help & Hamburger Menu */}
          <div className="md:hidden flex items-center gap-2 mt-6">
            {/* Help Icon */}
            <button
              onClick={() => setIsFAQOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              aria-label="FAQ"
            >
              <CircleHelp className="w-5 h-5 text-gray-600" />
            </button>

            {/* Hamburger Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                aria-label="Menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-25 z-40"
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Menu Panel */}
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Wallet Address */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span className="font-mono text-xs text-gray-700 flex-1 text-left">
                        {`${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
                      </span>
                      {copied ? (
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Fund Button */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Fund Wallet
                    </button>
                  </div>

                  {/* Signout */}
                  <div className="px-4 py-3">
                    <div onClick={() => setIsMobileMenuOpen(false)}>
                      <SignoutButton onClick={signOut} />
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* FAQ Modal */}
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />

      {/* Onramp Modal */}
      {isModalOpen && (
        <FundModal
          open={isModalOpen}
          setIsOpen={setIsModalOpen}
          country={userCountry}
          subdivision={userSubdivision}
          cryptoCurrency="usdc"
          fiatCurrency="usd"
          fetchBuyQuote={fetchBuyQuote}
          fetchBuyOptions={fetchBuyOptions}
          network="base"
          presetAmountInputs={[2, 5, 10]}
          onSuccess={handleOnrampSuccess}
        />
      )}
    </>
  );
}
