"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function lin(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = lin(parseInt(h.slice(0, 2), 16));
  const g = lin(parseInt(h.slice(2, 4), 16));
  const b = lin(parseInt(h.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const hi = Math.max(luminance(a), luminance(b));
  const lo = Math.min(luminance(a), luminance(b));
  return (hi + 0.05) / (lo + 0.05);
}

function hexSet(text) {
  return new Set(text.toLowerCase().match(/#[0-9a-f]{6}/g) || []);
}

function mirroredBlocks(css, name) {
  const re = new RegExp("/\\* " + name + ":start \\*/([\\s\\S]*?)/\\* " + name + ":end \\*/", "g");
  return [...css.matchAll(re)].map(function (match) {
    return match[1]
      .trim()
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .join("\n");
  });
}

function main() {
  const failures = [];

  const mirrors = [
    ["src/base/reset.css", "scss/base/_reset.scss"],
    ["src/base/typography.css", "scss/base/_typography.scss"],
    ["src/base/focus.css", "scss/base/_focus.scss"],
    ["src/components/button.css", "scss/components/_button.scss"],
    ["src/components/form.css", "scss/components/_form.scss"],
    ["src/components/card.css", "scss/components/_card.scss"],
    ["src/components/nav.css", "scss/components/_nav.scss"],
    ["src/components/alert.css", "scss/components/_alert.scss"],
    ["src/components/badge.css", "scss/components/_badge.scss"],
  ];

  mirrors.forEach(function (pair) {
    if (read(pair[0]).trim() !== read(pair[1]).trim()) {
      failures.push(pair[0] + " does not match " + pair[1]);
    }
  });

  const cssHex = hexSet(read("src/tokens/colors.css"));
  const scssHex = hexSet(read("scss/tokens/_colors.scss"));
  cssHex.forEach(function (hex) {
    if (!scssHex.has(hex)) failures.push("Missing from SCSS palette: " + hex);
  });
  scssHex.forEach(function (hex) {
    if (!cssHex.has(hex)) failures.push("Missing from CSS palette: " + hex);
  });

  [
    ["src/tokens/colors.css", "dark-theme"],
    ["src/tokens/shadows.css", "shadow-dark"],
  ].forEach(function (item) {
    const blocks = mirroredBlocks(read(item[0]), item[1]);
    if (blocks.length !== 2) {
      failures.push(item[1] + " should have 2 mirrored blocks, found " + blocks.length);
    } else if (blocks[0] !== blocks[1]) {
      failures.push(item[1] + " blocks differ");
    }
  });

  const pairs = [
    ["#2b1216", "#fff5f3", 4.5, "text on bg"],
    ["#2b1216", "#ffffff", 4.5, "text on surface"],
    ["#2b1216", "#fbecea", 4.5, "text on muted surface"],
    ["#6b3d45", "#fff5f3", 4.5, "muted text on bg"],
    ["#6b3d45", "#ffffff", 4.5, "muted text on surface"],
    ["#6b3d45", "#fbecea", 4.5, "muted text on muted surface"],
    ["#9f1239", "#fff5f3", 4.5, "primary text on bg"],
    ["#9f1239", "#ffffff", 4.5, "primary text on surface"],
    ["#9f1239", "#fde8ec", 4.5, "primary text on subtle"],
    ["#6f102c", "#fff5f3", 4.5, "link hover on bg"],
    ["#6d2142", "#ffffff", 4.5, "secondary text on surface"],
    ["#6d2142", "#f6e4ec", 4.5, "secondary text on subtle"],
    ["#9a3412", "#ffffff", 4.5, "accent text on surface"],
    ["#9a3412", "#fde8dc", 4.5, "accent text on subtle"],
    ["#6b2d5b", "#ffffff", 4.5, "success text on surface"],
    ["#6b2d5b", "#fff5f3", 4.5, "success text on bg"],
    ["#6b2d5b", "#f6e4f1", 4.5, "success text on subtle"],
    ["#7c3414", "#ffffff", 4.5, "warning text on surface"],
    ["#7c3414", "#fff5f3", 4.5, "warning text on bg"],
    ["#7c3414", "#fdecdc", 4.5, "warning text on subtle"],
    ["#b91c1c", "#ffffff", 4.5, "error text on surface"],
    ["#b91c1c", "#fff5f3", 4.5, "error text on bg"],
    ["#b91c1c", "#fdecec", 4.5, "error text on subtle"],
    ["#9d174d", "#ffffff", 4.5, "info text on surface"],
    ["#9d174d", "#fff5f3", 4.5, "info text on bg"],
    ["#9d174d", "#fbe4f0", 4.5, "info text on subtle"],
    ["#ffffff", "#9f1239", 4.5, "on primary"],
    ["#ffffff", "#881337", 4.5, "on primary hover"],
    ["#ffffff", "#6f102c", 4.5, "on primary active"],
    ["#ffffff", "#6d2142", 4.5, "on secondary"],
    ["#ffffff", "#551933", 4.5, "on secondary hover"],
    ["#ffffff", "#45142a", 4.5, "on secondary active"],
    ["#ffffff", "#c2410c", 4.5, "on accent"],
    ["#ffffff", "#9a3412", 4.5, "on accent hover"],
    ["#ffffff", "#7c2d0f", 4.5, "on accent active"],
    ["#ffffff", "#b91c1c", 4.5, "on error solid"],
    ["#ffffff", "#991b1b", 4.5, "on error solid hover"],
    ["#ffffff", "#6b2d5b", 4.5, "white on success ink"],
    ["#ffffff", "#7c3414", 4.5, "white on warning ink"],
    ["#ffffff", "#9d174d", 4.5, "white on info ink"],
    ["#a86b74", "#ffffff", 3, "border on surface"],
    ["#a86b74", "#fff5f3", 3, "border on bg"],
    ["#a86b74", "#fbecea", 3, "border on muted surface"],
    ["#9f1239", "#fff5f3", 3, "primary fill on bg"],
    ["#6d2142", "#fff5f3", 3, "secondary fill on bg"],
    ["#c2410c", "#fff5f3", 3, "accent fill on bg"],
    ["#b91c1c", "#fff5f3", 3, "error fill on bg"],
    ["#fbe8ea", "#1a0c10", 4.5, "dark text on bg"],
    ["#fbe8ea", "#261318", 4.5, "dark text on surface"],
    ["#fbe8ea", "#341c23", 4.5, "dark text on muted surface"],
    ["#e4b4bc", "#1a0c10", 4.5, "dark muted on bg"],
    ["#e4b4bc", "#261318", 4.5, "dark muted on surface"],
    ["#e4b4bc", "#341c23", 4.5, "dark muted on muted surface"],
    ["#ff8fa3", "#1a0c10", 4.5, "dark primary text on bg"],
    ["#ff8fa3", "#261318", 4.5, "dark primary text on surface"],
    ["#ff8fa3", "#341c23", 4.5, "dark primary text on muted"],
    ["#ff8fa3", "#3d1824", 4.5, "dark primary text on subtle"],
    ["#ffb4c2", "#1a0c10", 4.5, "dark secondary text on bg"],
    ["#ffb4c2", "#261318", 4.5, "dark secondary text on surface"],
    ["#ffb4c2", "#3a1828", 4.5, "dark secondary text on subtle"],
    ["#f8c9a8", "#1a0c10", 4.5, "dark accent text on bg"],
    ["#f8c9a8", "#261318", 4.5, "dark accent text on surface"],
    ["#f8c9a8", "#3a2218", 4.5, "dark accent text on subtle"],
    ["#f6c6d8", "#1a0c10", 4.5, "dark success text on bg"],
    ["#f6c6d8", "#261318", 4.5, "dark success text on surface"],
    ["#f6c6d8", "#3a1a2a", 4.5, "dark success text on subtle"],
    ["#f3b183", "#1a0c10", 4.5, "dark warning text on bg"],
    ["#f3b183", "#261318", 4.5, "dark warning text on surface"],
    ["#f3b183", "#3a2216", 4.5, "dark warning text on subtle"],
    ["#fecaca", "#1a0c10", 4.5, "dark error text on bg"],
    ["#fecaca", "#261318", 4.5, "dark error text on surface"],
    ["#fecaca", "#3f1618", 4.5, "dark error text on subtle"],
    ["#f9c2de", "#1a0c10", 4.5, "dark info text on bg"],
    ["#f9c2de", "#261318", 4.5, "dark info text on surface"],
    ["#f9c2de", "#3a162c", 4.5, "dark info text on subtle"],
    ["#ffffff", "#e11d48", 4.5, "on dark primary"],
    ["#ffffff", "#be123c", 4.5, "on dark primary hover"],
    ["#ffffff", "#a84466", 4.5, "on dark secondary"],
    ["#ffffff", "#8e3a56", 4.5, "on dark secondary hover"],
    ["#ffffff", "#c2410c", 4.5, "on dark accent"],
    ["#ffffff", "#dc2626", 4.5, "on dark error solid"],
    ["#ffffff", "#b91c1c", 4.5, "on dark error hover"],
    ["#c48b96", "#1a0c10", 3, "dark border on bg"],
    ["#c48b96", "#261318", 3, "dark border on surface"],
    ["#c48b96", "#341c23", 3, "dark border on muted"],
    ["#fbe8ea", "#1a0c10", 3, "dark focus on bg"],
    ["#2b1216", "#fff5f3", 3, "light focus on bg"],
    ["#e11d48", "#1a0c10", 3, "dark primary fill on bg"],
    ["#a84466", "#1a0c10", 3, "dark secondary fill on bg"],
    ["#c2410c", "#1a0c10", 3, "dark accent fill on bg"],
    ["#dc2626", "#1a0c10", 3, "dark error fill on bg"],
  ];

  pairs.forEach(function (pair) {
    const ratio = contrast(pair[0], pair[1]);
    if (ratio < pair[2]) {
      failures.push(pair[3] + " is " + ratio.toFixed(2) + ":1 (needs " + pair[2] + ":1)");
    }
  });

  if (failures.length) {
    console.error("Crimson UI contrast check failed:");
    failures.forEach(function (line) {
      console.error(" - " + line);
    });
    process.exit(1);
  }

  console.log("Contrast, palette parity, and SCSS mirror checks passed (" + pairs.length + " pairs).");
}

if (require.main === module) {
  main();
}

module.exports = main;
