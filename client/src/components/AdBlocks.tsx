import { useEffect } from "react";

interface AdBlockProps {
  placeholderId: number;
}

export function AdBlock({ placeholderId }: AdBlockProps) {
  useEffect(() => {
    const win = window as any;
    if (win.ezstandalone && win.ezstandalone.cmd) {
      win.ezstandalone.cmd.push(function () {
        win.ezstandalone.showAds(placeholderId);
      });
    }
  }, [placeholderId]);

  return (
    <div
      id={`ezoic-pub-ad-placeholder-${placeholderId}`}
      className="w-full min-h-[120px] bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600"
      style={{ minHeight: '120px' }}
    >
      <div className="text-center pointer-events-none">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          📢 Espaço de Anúncio #{placeholderId}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Anúncios aparecerão após deploy
        </p>
      </div>
    </div>
  );
}

export function AdBlockTop() {
  return (
    <div className="w-full py-6 px-4">
      <AdBlock placeholderId={101} />
    </div>
  );
}

export function AdBlockBottom() {
  return (
    <div className="w-full py-6 px-4">
      <AdBlock placeholderId={103} />
    </div>
  );
}

export function AdBlockSidebarMiddle() {
  return (
    <div className="w-full py-2">
      <AdBlock placeholderId={105} />
    </div>
  );
}

export function AdBlockSidebarBottom() {
  return (
    <div className="w-full py-2">
      <AdBlock placeholderId={106} />
    </div>
  );
}

export function AdBlockSidebarFloating() {
  return (
    <div className="hidden lg:block fixed right-4 top-20 w-64 z-40">
      <AdBlock placeholderId={107} />
    </div>
  );
}

export function AdBlockInContent() {
  return (
    <div className="w-full py-6 px-4">
      <AdBlock placeholderId={115} />
    </div>
  );
}
