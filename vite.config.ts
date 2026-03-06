import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig(async () => {
  // Dev-only plugins — excluded from production builds to reduce bundle overhead
  const devPlugins = isDev
    ? [
        (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        (await import("@replit/vite-plugin-runtime-error-modal")).default(),
      ]
    : [];

  return {
    plugins: [react(), tailwindcss(), ...devPlugins, metaImagesPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "client", "src", "assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    publicDir: path.resolve(__dirname, "client", "public"),
    build: {
      outDir: path.resolve(__dirname, "dist", "public"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-state": ["wouter", "zustand", "@tanstack/react-query"],
            "vendor-radix": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-toast",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "@radix-ui/react-slot",
              "@radix-ui/react-label",
            ],
            "vendor-agora": ["agora-rtc-sdk-ng"],
            "vendor-charts": ["recharts"],
          },
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: "all",
    },
  };
});
