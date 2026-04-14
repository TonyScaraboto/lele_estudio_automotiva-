import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const html = readFileSync(indexPath, "utf8");

const images = new Set();
const reImg = /\/public\/images\/([^"'>\s]+)/g;
let m;
while ((m = reImg.exec(html)) !== null) {
  images.add(m[1]);
}

if (!/\/public\/logo\.png/.test(html)) {
  console.error("verify-public-assets: index.html must reference /public/logo.png (favicon)");
  process.exit(1);
}

const logoPath = path.join(root, "public", "logo.png");
if (!existsSync(logoPath)) {
  console.error("verify-public-assets: missing public/logo.png");
  process.exit(1);
}

let ok = true;
for (const name of images) {
  const file = path.join(root, "public", "images", name);
  if (!existsSync(file)) {
    console.error(`verify-public-assets: missing public/images/${name}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
if (images.size === 0) {
  console.error("verify-public-assets: no /public/images/ references found in index.html");
  process.exit(1);
}

console.log(`verify-public-assets: OK (${images.size} unique image(s), logo)`);
