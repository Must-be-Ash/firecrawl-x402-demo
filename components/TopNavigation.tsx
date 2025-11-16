"use client";

import { useState, useCallback, useEffect } from "react";
import { useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { AuthButton, FundModal, type FundModalProps } from "@coinbase/cdp-react";
import { getBuyOptions, createBuyQuote } from "@/lib/onramp-api";
import { CircleHelp } from "lucide-react";
import FAQModal from "./FAQModal";

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
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="backdrop-blur-md bg-white/50 border border-gray-200/40 rounded-xl">
          <div className="flex items-center justify-between h-12 px-4 sm:px-5">
            {/* Logo/Title Section */}
            <div className="flex items-center">
              <div className="flex flex-col justify-center">
                <p className="text-[11px] text-gray-600 font-medium leading-tight">
                  Powered by <span className="text-gray-800">Firecrawl</span> & <span className="text-gray-800">x402</span>
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Wallet Address - More Visible */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-gray-300/60 rounded-lg hover:bg-white hover:border-gray-400/60 transition-colors"
                title={copied ? "Address copied!" : "Click to copy address"}
              >
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="font-mono text-xs font-medium text-gray-800">
                  {`${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
                </span>
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                )}
              </button>

              {/* Help Icon - Circle Button */}
              <button
                onClick={() => setIsFAQOpen(true)}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                title="Help & FAQ"
              >
                <CircleHelp className="w-4 h-4 text-gray-600" />
              </button>

              {/* Fund Button - Circle Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                title="Fund Wallet"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>

              {/* Signout Button - Circle Button */}
              <button
                onClick={signOut}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                title="Sign Out"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              {/* Wallet Address - More Visible */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 border border-gray-300/60 rounded-lg hover:bg-white hover:border-gray-400/60 transition-colors"
                title={copied ? "Address copied!" : "Click to copy address"}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                <span className="font-mono text-xs font-medium text-gray-800">
                  {`${evmAddress?.slice(0, 4)}...${evmAddress?.slice(-3)}`}
                </span>
              </button>

              {/* Help Icon - Circle Button */}
              <button
                onClick={() => setIsFAQOpen(true)}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                aria-label="FAQ"
              >
                <CircleHelp className="w-4 h-4 text-gray-600" />
              </button>

              {/* Hamburger Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Menu"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/60 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                      {/* Wallet Address */}
                      <div className="px-4 py-3 border-b border-gray-100/80">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Wallet Address</p>
                        <button
                          onClick={copyToClipboard}
                          className="group flex items-center gap-2 w-full px-3 py-2 bg-white border border-gray-300/60 hover:border-gray-400/60 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-1.5 flex-1">
                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            <span className="font-mono text-xs font-medium text-gray-800 text-left">
                              {`${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
                            </span>
                          </div>
                          {copied ? (
                            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Fund Button */}
                      <div className="px-4 py-2.5 border-b border-gray-100/80">
                        <button
                          onClick={() => {
                            setIsModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">Fund Wallet</span>
                        </button>
                      </div>

                      {/* Signout */}
                      <div className="px-4 py-2.5">
                        <button
                          onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
