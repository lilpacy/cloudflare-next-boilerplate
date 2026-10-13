"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

const GoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    const gtag = (
      window as typeof window & {
        gtag?: (
          command: string,
          targetId: string,
          config?: Record<string, unknown>
        ) => void;
      }
    ).gtag;

    if (!gtag) {
      return;
    }

    const pagePath = searchParamsString
      ? `${pathname}?${searchParamsString}`
      : pathname;

    gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }, [pathname, searchParamsString]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="ga-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;

