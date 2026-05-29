"use client";

import React, { useEffect } from "react";
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
  pathname,
  children,
}: {
  websiteId: string;
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <AnalyticsConfigProvider websiteId={websiteId}>
      <PageViewTracker pathname={pathname} />
      {children}
    </AnalyticsConfigProvider>
  );
}
