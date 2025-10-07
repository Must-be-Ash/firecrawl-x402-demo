"use client";

import TopNavigation from "./TopNavigation";
import WebScraper from "./WebScraper";

export default function SignedInScreen() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavigation />
      <WebScraper />
    </div>
  );
}
