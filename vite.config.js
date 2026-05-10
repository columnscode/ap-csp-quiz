import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Two file://-portability fixups applied to the built dist/index.html:
//
//  1. Strip type="module" from the inlined script. iOS Safari silently
//     refuses to execute inline module scripts under file://, producing a
//     black screen. Safe to drop because we already build the bundle as a
//     classic IIFE (rollup format: "iife"); no import/export remain.
//
//  2. Move the now-classic <script> to immediately before </body>.
//     vite-plugin-singlefile inlines the script in-place, which Vite puts
//     in <head>. Classic scripts run synchronously, so a head-positioned
//     script runs BEFORE <div id="root"> exists and React errors with
//     "Target container is not a DOM element" (#299). Putting it after
//     all body content guarantees the DOM is built first.
const fileProtocolFixups = () => ({
  name: "file-protocol-fixups",
  closeBundle() {
    const file = resolve("dist/index.html");
    let html = readFileSync(file, "utf8");

    html = html.replace(/<script type="module"([^>]*)>/g, "<script$1>");

    const scriptMatch = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/);
    if (scriptMatch) {
      const tag = scriptMatch[0];
      html = html.replace(tag, "");
      html = html.replace("</body>", tag + "\n  </body>");
    }

    writeFileSync(file, html);
  },
});

// Build target: ONE self-contained index.html that runs from a flash drive
// or as an emailed attachment, with no network access required.
//
// - base: './'           → relative asset URLs (work under file://)
// - viteSingleFile()     → inline every <script> and <link rel="stylesheet">
// - cssCodeSplit: false  → keep all CSS in one stylesheet so it can be inlined
// - assetsInlineLimit    → very large so woff2 fonts get base64'd into CSS
// - inlineDynamicImports → fold any code-split chunks into the main bundle
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile(), fileProtocolFixups()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    // No external chunks to preload (everything is inlined), and the
    // polyfill's fetch() call trips a "unique origin" warning under file://.
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        // IIFE = classic <script>, not <script type="module">. iOS Safari
        // refuses to execute inline module scripts loaded over file://,
        // which manifests as a black screen when emailed and opened.
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
});
