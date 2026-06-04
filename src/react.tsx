"use client";

import React, { useEffect, useState } from "react";
import { AnalyticsConfigProvider, useAnalytics } from "./context.js";

function PageViewTracker({ pathname }: { pathname: string }) {
  const { track } = useAnalytics();

  useEffect(() => {
    track("pageview");
  }, [pathname]);

  return null;
}

export function ReactAnalytics({
  websiteId,
  respectSessionConsent,
  pathname,
  children,
}: {
  websiteId: string;
  pathname: string;
  respectSessionConsent?: boolean;
  children: React.ReactNode;
}) {
  const [tabSessionId, setTabSessionId] = useState<string | null>(null);
  // Flag to know when client-side environment checks are complete
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

  // If session consent is active, delay tracking until tabSessionId is loaded.
  // Otherwise, delay tracking until the component has hydrated fully.
  const shouldDeferTracking = respectSessionConsent
    ? !tabSessionId
    : !isInitialized;

  return (
    <AnalyticsConfigProvider websiteId={websiteId} tabSessionId={tabSessionId}>
      {/* ──► FIXED: Defer mounting tracker to prevent race condition ◄── */}
      {!shouldDeferTracking && <PageViewTracker pathname={pathname} />}
      {children}
    </AnalyticsConfigProvider>
  );
}
