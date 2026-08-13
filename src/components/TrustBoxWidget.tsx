import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, forceReload?: boolean) => void;
    };
  }
}

export const TrustBoxWidget: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.Trustpilot && ref.current) {
      window.Trustpilot.loadFromElement(ref.current, true);
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-4 my-2" id="trustpilot-widget-wrapper">
      {/* TrustBox widget - Review Collector */}
      <div
        ref={ref}
        className="trustpilot-widget w-full max-w-xl mx-auto"
        data-locale="en-US"
        data-template-id="56278e9abfbbba0bdcd568bc"
        data-businessunit-id="6a7dac007cbe39b7fca8524f"
        data-style-height="52px"
        data-style-width="100%"
        data-token="9dd9ec3c-a0ad-4d84-94e7-ef13b91112c9"
        id="trustpilot-review-collector-widget"
      >
        <a
          href="https://www.trustpilot.com/review/vocalvantage.online"
          target="_blank"
          rel="noopener noreferrer"
        >
          Trustpilot
        </a>
      </div>
      {/* End TrustBox widget */}
    </div>
  );
};
