"use strict";

const fs = require("fs");
const path = require("path");
const generate = require("./generate");
const check = require("./check-contrast");

const files = generate.generatedFiles();

Object.keys(files).forEach(function (rel) {
  const abs = path.join(generate.root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, files[rel]);
});

const css = files["dist/crimson-ui.css"];
[".btn-primary", ".alert-error", ".navbar", "prefers-color-scheme", "prefers-reduced-motion", "--color-primary-active"].forEach(function (needle) {
  if (!css.includes(needle)) {
    console.error("Built CSS is missing " + needle);
    process.exit(1);
  }
});

check();

console.log(
  "Wrote " +
    Object.keys(files).length +
    " CSS files from " +
    generate.entryUses().length +
    " SCSS partials (" +
    css.length +
    " bytes in dist/crimson-ui.css)."
);
