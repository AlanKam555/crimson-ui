"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const check = require("./check-contrast");

const files = [
  "src/tokens/colors.css",
  "src/tokens/typography.css",
  "src/tokens/spacing.css",
  "src/tokens/radii.css",
  "src/tokens/shadows.css",
  "src/tokens/motion.css",
  "src/base/reset.css",
  "src/base/typography.css",
  "src/components/button.css",
  "src/components/form.css",
  "src/components/card.css",
  "src/components/nav.css",
  "src/components/alert.css",
  "src/components/badge.css",
  "src/base/focus.css",
];

check();

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const banner = "/*! Crimson UI v" + pkg.version + " | MIT License | Copyright Alan */\n";
const parts = files.map(function (file) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    console.error("Missing " + file);
    process.exit(1);
  }
  return "/* " + file + " */\n" + fs.readFileSync(abs, "utf8").trim() + "\n";
});

const outDir = path.join(root, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "crimson-ui.css");
fs.writeFileSync(outFile, banner + "\n" + parts.join("\n"));

const css = fs.readFileSync(outFile, "utf8");
[".btn-primary", ".alert-error", ".navbar", "[data-theme=\"dark\"]", "prefers-color-scheme", "prefers-reduced-motion"].forEach(function (needle) {
  if (!css.includes(needle)) {
    console.error("Built CSS is missing " + needle);
    process.exit(1);
  }
});

console.log("Wrote dist/crimson-ui.css (" + css.length + " bytes) from " + files.length + " sources.");
