"use client";

import React, { createContext, useContext } from "react";

interface AnalyticsConfig {
  websiteId: string;
  tabSessionId?: string | null;
}

const INGESTION_URL = "http://localhost:8001/ingest";

const AnalyticsContext = createContext<AnalyticsConfig | null>(null);

export const AnalyticsConfigProvider = ({
  websiteId,
  tabSessionId,
  children,
}: AnalyticsConfig & { children: React.ReactNode }) => {
  return (
    <AnalyticsContext.Provider value={{ websiteId, tabSessionId }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error(
      "useAnalytics must be used inside an initialized Analytics component or provider.",
    );
  }

  const getUtmParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
      utm_term: params.get("utm_term") || null,
      utm_content: params.get("utm_content") || null,
    };
  };

  const track = (eventName: string, meta: Record<string, any> = {}) => {
    if (typeof window === "undefined") return;

    const payload = {
      tabSessionId: context.tabSessionId,
      websiteId: context.websiteId,
      event_name: eventName,
      url: window.location.href,
      pathname: window.location.pathname,
      referrer: document.referrer || "direct",
      ...getUtmParams(),
      screen_width: window.innerWidth,
      meta,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(INGESTION_URL, blob);
    } else {
      fetch(INGESTION_URL, {
        method: "POST",
        body: blob,
        keepalive: true,
      });
    }
  };

  return { track };
};
