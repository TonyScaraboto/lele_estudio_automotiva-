import { defineConfig } from "vite";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

// GitHub Pages: https://<user>.github.io/<repo>/
// Repo branch deploy serves files under public/ at /repo/public/...
// Vite copies public/ to dist root (dist/images/), so we mirror into dist/public/ for the same URLs.
function mirrorPublicAssets() {
  return {
    name: "mirror-public-assets",
    closeBundle() {
      const dist = path.resolve("dist");
      const srcImages = path.join(dist, "images");
      const destDir = path.join(dist, "public", "images");
      mkdirSync(destDir, { recursive: true });
      if (existsSync(srcImages)) {
        for (const name of readdirSync(srcImages)) {
          copyFileSync(path.join(srcImages, name), path.join(destDir, name));
        }
      }
      const logo = path.join(dist, "logo.png");
      if (existsSync(logo)) {
        mkdirSync(path.join(dist, "public"), { recursive: true });
        copyFileSync(logo, path.join(dist, "public", "logo.png"));
      }
    },
  };
}

export default defineConfig({
  base: "/lele_estudio_automotiva-/",
  plugins: [mirrorPublicAssets()],
});
