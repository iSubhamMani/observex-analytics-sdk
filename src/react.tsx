"use client";

import React, { useEffect, useState } from "react";
import { AnalyticsConfigProvider, useAnalytics } from "./context.js";

function PageViewTracker({ pathname }: { pathname: string }) {
  const { track } = useAnalytics();

  useEffect(() => {
    let startTime = Date.now();
    let trackingSent = false;

    // 1. Fire the initial entry pageview tracking log
    track("pageview");

    // Helper function to calculate duration and send data safely
    const sendDurationMetrics = () => {
      if (trackingSent) return; // Prevent double reporting on identical scopes

      const durationSeconds = Math.round((Date.now() - startTime) / 1000);

      // Save bandwidth and filter out instant bounce bots by checking for > 0 seconds
      if (durationSeconds > 0) {
        track("page_leave", { duration_seconds: durationSeconds });
        trackingSent = true;
      }
    };

    // 2. Handle tab termination, window close, minimize actions, or desktop app switches
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendDurationMetrics();
      } else if (document.visibilityState === "visible") {
        // Reset timestamp baseline if user returns to tab so idle time isn't double-counted
        startTime = Date.now();
        trackingSent = false;
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Handle SPA routing jumps (triggers when pathname changes)
    return () => {
      sendDurationMetrics();
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
