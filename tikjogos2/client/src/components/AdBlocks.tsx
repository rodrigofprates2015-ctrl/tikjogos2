import { useEffect } from "react";

interface AdBlockProps {
  placeholderId: number;
  className?: string;
}

export function AdBlock({ placeholderId, className = "" }: AdBlockProps) {
  useEffect(() => {
    // Inicializar script do Ezoic se disponível
    const win = window as any;
    if (win.ezoicSelfService) {
      win.ezoicSelfService.display();
    }
  }, [placeholderId]);

  return (
    <div
      id={`ezoic-pub-ad-placeholder-${placeholderId}`}
      className={className}
    />
  );
}

// Bloco de anúncio no topo da página
export function AdBlockTop() {
  return (
    <div className="w-full py-2">
      <AdBlock placeholderId={101} className="w-full" />
    </div>
  );
}

// Bloco de anúncio no rodapé
export function AdBlockBottom() {
  return (
    <div className="w-full py-2">
      <AdBlock placeholderId={103} className="w-full" />
    </div>
  );
}

// Bloco de anúncio na lateral (sidebar middle)
export function AdBlockSidebarMiddle() {
  return (
    <div className="w-full py-2">
      <AdBlock placeholderId={105} className="w-full" />
    </div>
  );
}

// Bloco de anúncio na lateral inferior
export function AdBlockSidebarBottom() {
  return (
    <div className="w-full py-2">
      <AdBlock placeholderId={106} className="w-full" />
    </div>
  );
}

// Bloco flutuante na lateral
export function AdBlockSidebarFloating() {
  return (
    <div className="hidden lg:block fixed right-4 top-20 w-64 z-40">
      <AdBlock placeholderId={107} className="w-full" />
    </div>
  );
}

// Bloco de anúncio no conteúdo (entre seções)
export function AdBlockInContent() {
  return (
    <div className="w-full py-4">
      <AdBlock placeholderId={115} className="w-full" />
    </div>
  );
}
