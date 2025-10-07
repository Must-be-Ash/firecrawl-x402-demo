"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import SignInScreen from "./SignInScreen";
import SignedInScreen from "./SignedInScreen";
import { LoadingCard } from "@/components/ui/loading-spinner";

export default function ClientApp() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingCard message="loading..." />
      </div>
    );
  }

  return (
    <>
      {!isSignedIn && <SignInScreen />}
      {isSignedIn && <SignedInScreen />}
    </>
  );
}