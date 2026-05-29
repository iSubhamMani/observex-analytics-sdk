"use client";

import React, { createContext, useContext } from "react";

interface AnalyticsConfig {
  websiteId: string;
}

const INGESTION_URL = "https://ingest.observex.dev/track";

const AnalyticsContext = createContext<AnalyticsConfig | null>(null);

export const AnalyticsConfigProvider = ({
  websiteId,
  children,
}: AnalyticsConfig & { children: React.ReactNode }) => {
  return (
    <AnalyticsContext.Provider value={{ websiteId }}>
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
      website_id: context.websiteId,
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
    console.log(JSON.stringify(payload));
    /*if (navigator.sendBeacon) {
        
      navigator.sendBeacon(INGESTION_URL, blob);
    } else {
        console.log(JSON.stringify(payload));
      fetch(INGESTION_URL, {
        method: "POST",
        body: blob,
        keepalive: true,
      });
    }*/
  };

  return { track };
};
