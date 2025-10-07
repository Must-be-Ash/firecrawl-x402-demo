"use client";

import { AuthButton } from "@coinbase/cdp-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ModernButton } from "@/components/ui/modern-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function SignInScreen() {
  return (
    <div className="signin-container relative h-screen w-screen flex items-center justify-center bg-white overflow-hidden">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
        )}
      />
      <div className="relative z-0 text-center max-w-md mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Firecrawl × Coinbase</h1>
          <TextShimmer className="text-lg text-gray-600 mb-6" duration={2.5}>
            Web Search using x402 Micropayments
          </TextShimmer>
          <div className="inline-flex items-center bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium border border-orange-200">
            Search the web for just <span className="font-semibold ml-1">~$0.01 USDC</span>
          </div>
        </div>
        
        <div className="mb-8">
          
          
          <div className="flex justify-center">
            <div className="modern-auth-button">
              <AuthButton />
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 space-y-2">
          <p>Powered by Coinbase CDP • Firecrawl API • x402 Payments</p>
        </div>
      </div>
    </div>
  );
}