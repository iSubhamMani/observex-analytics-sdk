"use client";

import React, { useEffect } from "react";
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
  children,
}: {
  websiteId: string;
  children: React.ReactNode;
}) {
  return (
    <AnalyticsConfigProvider websiteId={websiteId}>
      <PageViewTracker />
      {children}
    </AnalyticsConfigProvider>
  );
}
