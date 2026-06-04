"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation.js";
import { AnalyticsConfigProvider, useAnalytics } from "./context.js";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { track } = useAnalytics();

  useEffect(() => {
    track("pageview");
  }, [pathname, searchParams]);

  return null;
}

export function NextAnalytics({
  websiteId,
  respectSessionConsent,
  children,
}: {
  websiteId: string;
  respectSessionConsent?: boolean;
  children: React.ReactNode;
}) {
  const [tabSessionId, setTabSessionId] = useState<string | null>(null);
  // Flag to track client hydration state
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (respectSessionConsent) {
      let currentSessionId = sessionStorage.getItem("ox_sess_id");

      if (!currentSessionId) {
        currentSessionId = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("ox_sess_id", currentSessionId);
      }

      setTabSessionId(currentSessionId);
    }
    setIsInitialized(true);
  }, [respectSessionConsent]);

  // Ensures tracking only triggers once state parameters are fully resolved
  const shouldDeferTracking = respectSessionConsent
    ? !tabSessionId
    : !isInitialized;

  return (
    <AnalyticsConfigProvider tabSessionId={tabSessionId} websiteId={websiteId}>
      {/* ──► FIXED: Defer mounting tracker to ensure valid initial data payload ◄── */}
      {!shouldDeferTracking && <PageViewTracker />}
      {children}
    </AnalyticsConfigProvider>
  );
}
