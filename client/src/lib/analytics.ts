declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_ID = 'G-7BRQ5X7FHL';

function gtag(...args: any[]) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function trackVirtualPageview(path: string, title: string) {
  try {
    const location = window.location.origin + path;
    gtag('event', 'page_view', {
      page_title: title,
      page_location: location,
      page_path: path,
      send_to: GA_ID,
    });
  } catch (e) {
  }
}
