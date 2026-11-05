"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Admin and the self-check page are the team's own visits, not traffic */
const SKIP = /^\/(admin|sinov)(\/|$)/;

/**
 * Vercel Web Analytics: page views per path, referrers, countries and
 * devices — no cookies. Query strings are dropped before sending, so search
 * text (e.g. /dashboard/library/search?q=…) and sign-in "next" links never
 * leave the browser.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (SKIP.test(url.pathname)) return null;
  url.search = "";
  return { ...event, url: url.toString() };
}

export function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
