"use client";

import { X } from "lucide-react";

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  if (!isOpen) return null;

  const faqs = [
    {
      question: "What is Pay-per-crawl?",
      answer: "Pay-per-crawl is a demo app showcasing web scraping with Firecrawl using x402 micropayments. It uses CDP's embedded wallets to create a seamless user experience, enabling instant, pay-per-use access to Firecrawl via the x402 protocol."
    },
    {
      question: "What is the x402 protocol?",
      answer: "x402 is an open protocol for internet-native payments. Built around the HTTP 402 status code, x402 enables users to pay for resources via API without registration, emails, OAuth, or complex signatures.",
      link: {
        text: "Learn more about x402",
        url: "https://www.x402.org/"
      }
    },
    {
      question: "What is Firecrawl?",
      answer: " is a powerful web scraping and data extraction service that turns websites into clean, structured data.",
      link: {
        text: "Firecrawl",
        url: "https://firecrawl.dev/",
        position: "start"
      }
    },
    {
      question: "What are Embedded Wallets?",
      answer: " allow your users to access the full power of onchain through familiar authentication methods like email and SMS without wallet apps, seed phrases, browser extensions, or pop-ups.",
      link: {
        text: "CDP's Embedded Wallets",
        url: "https://docs.cdp.coinbase.com/embedded-wallets/welcome",
        position: "start"
      }
    },
    {
      question: "How does the fund button work?",
      answer: "The fund button uses the ",
      link: {
        text: "Coinbase Onramp SDK",
        url: "https://docs.cdp.coinbase.com/onramp-&-offramp/introduction/welcome",
        position: "inline"
      },
      answerEnd: " which allows users to fund their wallet using Apple Pay (US only), credit card, or Coinbase account up to $500 without KYC."
    },
    {
      question: "How much does each search cost?",
      answer: "Search costs vary based on the number of results requested. Costs are typically a fraction of a cent per search, paid automatically from your wallet balance."
    },
    {
      question: "Can I fork or remix this app?",
      answer: "Absolutely! This is an open-source demo. You can fork it on GitHub or remix it on Replit to build your own pay-per-use applications.",
      link: {
        text: "Remix on Replit",
        url: "https://replit.com/@ashnouruzi/firecrawl-x402-demo"
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
              <p className="text-sm text-gray-600 mt-1">Frequently Asked Questions</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {(faq as any).link && (faq as any).link.position === "start" && (
                    <a
                      href={(faq as any).link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {(faq as any).link.text}
                    </a>
                  )}
                  {faq.answer}
                  {(faq as any).link && (faq as any).link.position === "inline" && (
                    <a
                      href={(faq as any).link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {(faq as any).link.text}
                    </a>
                  )}
                  {(faq as any).answerEnd && (faq as any).answerEnd}
                  {(faq as any).link && (faq as any).link.position !== "start" && (faq as any).link.position !== "inline" && (
                    <>
                      {" "}
                      <a
                        href={(faq as any).link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {(faq as any).link.text}
                      </a>
                    </>
                  )}
                </p>
                {index < faqs.length - 1 && (
                  <div className="pt-4 border-b border-gray-200" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <p className="text-sm text-gray-600 text-center">
              Still have questions? Check out the{" "}
              <a
                href="https://docs.firecrawl.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Firecrawl
              </a>
              {" "}or{" "}
              <a
                href="https://x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                x402
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
