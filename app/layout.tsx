import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
// import PasswordProtection from './components/PasswordProtection';

export const metadata: Metadata = {
  title: "x402",
  description: "This demo showcases a pay-per-use Perplexity-like platform by combining Firecrawl with x402. Users log in with email through Coinbase's embedded wallet, fund their account via Apple Pay or credit card using CDP's onramp, and search the web. Each search deducts $0.01 automatically in the background through x402. The app demonstrates how crypto infrastructure can be abstracted away using CDP services to leverage micropayments through the x402 protocol, creating a sustainable business model where products remain affordable, customers pay only for what they use, platforms eliminate upfront costs, and service providers maintain profitable operations.",
  authors: [{ name: "must_be_ash" }],
  creator: "must_be_ash",
  publisher: "must_be_ash",
  metadataBase: new URL("https://firecrawl-x402-demo.replit.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "402",
    description: "This demo showcases a pay-per-use Perplexity-like platform by combining Firecrawl with x402. Users log in with email through Coinbase's embedded wallet, fund their account via Apple Pay or credit card using CDP's onramp, and search the web. Each search deducts $0.01 automatically in the background through x402. The app demonstrates how crypto infrastructure can be abstracted away using CDP services to leverage micropayments through the x402 protocol, creating a sustainable business model where products remain affordable, customers pay only for what they use, platforms eliminate upfront costs, and service providers maintain profitable operations.",
    url: "https://firecrawl-x402-demo.replit.app",
    siteName: "402",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "x402 demo - Firecrawl x Coinbase",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "402 - x402 demo - Firecrawl x Coinbase",
    description: "This demo showcases a pay-per-use Perplexity-like platform by combining Firecrawl with x402. Users log in with email through Coinbase's embedded wallet, fund their account via Apple Pay or credit card using CDP's onramp, and search the web. Each search deducts $0.01 automatically in the background through x402. The app demonstrates how crypto infrastructure can be abstracted away using CDP services to leverage micropayments through the x402 protocol, creating a sustainable business model where products remain affordable, customers pay only for what they use, platforms eliminate upfront costs, and service providers maintain profitable operations.",
    images: ["/og.png"],
    creator: "@must_be_ash",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  keywords: [
    "x402",
    "Firecrawl",
    "Coinbase",
    "web search",
    "web scraping",
    "crypto payments",
    "USDC",
    "blockchain",
    "demo",
  ],
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <PasswordProtection> */}
          {children}
        {/* </PasswordProtection> */}
        <Analytics />
      </body>
    </html>
  );
}