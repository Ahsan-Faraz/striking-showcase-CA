"use client";

import { ShowcasePortfolio } from "./ShowcasePortfolio";

export default function AthletePreviewPage() {
  return (
    <ShowcasePortfolio
      sourceMode="me"
      hideMessagingCta
      showControls
      trackScrollSticky
    />
  );
}
