import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createHash } from "crypto";

// Content-Security-Policy als meta-tag.
//
// De site draait op GitHub Pages: daar kun je geen eigen HTTP-headers zetten,
// dus een meta-tag is de enige plek waar een CSP kan staan. Let op wat een
// meta-CSP niet kan: frame-ancestors (clickjacking) werkt alleen als echte
// header. Zie DEPLOYMENT.md.
//
// De inline scripts in index.html (de SPA-routing van GitHub Pages en het
// schema.org-blok) krijgen een sha256-hash, zodat we geen 'unsafe-inline' voor
// scripts nodig hebben. De hashes worden hier berekend, zodat ze niet kunnen
// verlopen als index.html verandert.
function cspPlugin() {
  return {
    name: "csp-meta",
    enforce: "post" as const,
    transformIndexHtml(html: string) {
      const hashes: string[] = [];
      for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
        hashes.push(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
      }
      const csp = [
        "default-src 'self'",
        `script-src 'self' ${hashes.join(" ")}`.trim(),
        // React en Tailwind zetten stijlen inline; daar is geen hash voor te geven.
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        // Supabase: REST, auth, edge functions en realtime (websocket).
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-src 'none'",
      ].join("; ");
      return html.replace(
        /<head>/i,
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? process.env.VITE_BASE_PATH || "/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), cspPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
