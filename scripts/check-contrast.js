"use strict";

const fs = require("fs");
const path = require("path");
const generate = require("./generate");

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

function extractBlockAfter(css, startIndex) {
  const open = css.indexOf("{", startIndex);
  if (open < 0) return "";
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return "";
}

function propsFrom(text) {
  const map = new Map();
  const re = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
  let match = re.exec(text);
  while (match) {
    map.set(match[1], match[2].trim());
    match = re.exec(text);
  }
  return map;
}

function mapsEqual(left, right) {
  if (left.size !== right.size) return false;
  let same = true;
  left.forEach(function (value, key) {
    if (right.get(key) !== value) same = false;
  });
  return same;
}

function themeSelectorIndex(css) {
  const re = /\[data-theme=(?:"dark"|dark)\]/g;
  let match = re.exec(css);
  while (match) {
    const before = css.slice(Math.max(0, match.index - 6), match.index);
    if (!before.includes("not(")) return match.index;
    match = re.exec(css);
  }
  return -1;
}

function rootProps(css) {
  const match = css.match(/(?:^|\n):root\s*\{/);
  if (!match) return new Map();
  return propsFrom(extractBlockAfter(css, match.index));
}

function resolveToken(name, theme, rootMap, darkMap, stack, failures) {
  const seen = stack || [];
  if (seen.indexOf(name) !== -1) {
    failures.push("Token cycle at " + name);
    return null;
  }
  const raw = theme === "dark" && darkMap.has(name) ? darkMap.get(name) : rootMap.get(name);
  if (!raw) {
    failures.push("Missing " + name + " in the " + theme + " theme");
    return null;
  }
  const variable = raw.match(/^var\(\s*(--[A-Za-z0-9-]+)\s*\)$/);
  if (variable) {
    return resolveToken(variable[1], theme, rootMap, darkMap, seen.concat(name), failures);
  }
  const hex = raw.toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(hex)) {
    failures.push(name + " resolved to \"" + raw + "\" instead of a 6-digit hex");
    return null;
  }
  return hex;
}

function main() {
  const failures = [];
  let files;

  try {
    files = generate.generatedFiles();
  } catch (error) {
    console.error("Crimson UI check failed:");
    console.error(" - " + error.message);
    process.exit(1);
  }

  Object.keys(files).forEach(function (rel) {
    const abs = path.join(generate.root, rel);
    if (!fs.existsSync(abs)) {
      failures.push(rel + " is missing. Run npm run build.");
      return;
    }
    const onDisk = fs.readFileSync(abs, "utf8");
    if (onDisk !== files[rel]) {
      failures.push(rel + " is stale. Run npm run build.");
    }
  });

  const colors = fs.existsSync(path.join(generate.root, "src/tokens/colors.css"))
    ? fs.readFileSync(path.join(generate.root, "src/tokens/colors.css"), "utf8")
    : "";
  const shadows = fs.existsSync(path.join(generate.root, "src/tokens/shadows.css"))
    ? fs.readFileSync(path.join(generate.root, "src/tokens/shadows.css"), "utf8")
    : "";

  [
    ["src/tokens/colors.css", colors],
    ["src/tokens/shadows.css", shadows],
  ].forEach(function (item) {
    const css = item[1];
    const mediaAt = css.indexOf("@media (prefers-color-scheme: dark)");
    const themeAt = themeSelectorIndex(css);
    if (mediaAt < 0 || themeAt < 0) {
      failures.push(item[0] + " is missing a prefers-color-scheme or data-theme dark block");
      return;
    }
    const mediaProps = propsFrom(extractBlockAfter(css, mediaAt));
    const themeProps = propsFrom(extractBlockAfter(css, themeAt));
    if (!mediaProps.size || !mapsEqual(mediaProps, themeProps)) {
      failures.push(item[0] + " dark theme blocks differ");
    }
  });

  const rootMap = rootProps(colors);
  const darkMap = propsFrom(extractBlockAfter(colors, themeSelectorIndex(colors)));
  const themes = { light: rootMap, dark: darkMap };

  const pairs = [
    ["--color-text", "--color-bg", 4.5, "text on bg", "both"],
    ["--color-text", "--color-surface", 4.5, "text on surface", "both"],
    ["--color-text", "--color-surface-muted", 4.5, "text on muted surface", "both"],
    ["--color-text-muted", "--color-bg", 4.5, "muted text on bg", "both"],
    ["--color-text-muted", "--color-surface", 4.5, "muted text on surface", "both"],
    ["--color-text-muted", "--color-surface-muted", 4.5, "muted text on muted surface", "both"],
    ["--color-primary-text", "--color-bg", 4.5, "primary text on bg", "both"],
    ["--color-primary-text", "--color-surface", 4.5, "primary text on surface", "both"],
    ["--color-primary-text", "--color-surface-muted", 4.5, "primary text on muted", "dark"],
    ["--color-primary-text", "--color-primary-subtle", 4.5, "primary text on subtle", "both"],
    ["--color-link-hover", "--color-bg", 4.5, "link hover on bg", "light"],
    ["--color-secondary-text", "--color-bg", 4.5, "secondary text on bg", "dark"],
    ["--color-secondary-text", "--color-surface", 4.5, "secondary text on surface", "both"],
    ["--color-secondary-text", "--color-secondary-subtle", 4.5, "secondary text on subtle", "both"],
    ["--color-accent-text", "--color-bg", 4.5, "accent text on bg", "dark"],
    ["--color-accent-text", "--color-surface", 4.5, "accent text on surface", "both"],
    ["--color-accent-text", "--color-accent-subtle", 4.5, "accent text on subtle", "both"],
    ["--color-success-text", "--color-bg", 4.5, "success text on bg", "both"],
    ["--color-success-text", "--color-surface", 4.5, "success text on surface", "both"],
    ["--color-success-text", "--color-success-subtle", 4.5, "success text on subtle", "both"],
    ["--color-warning-text", "--color-bg", 4.5, "warning text on bg", "both"],
    ["--color-warning-text", "--color-surface", 4.5, "warning text on surface", "both"],
    ["--color-warning-text", "--color-warning-subtle", 4.5, "warning text on subtle", "both"],
    ["--color-error-text", "--color-bg", 4.5, "error text on bg", "both"],
    ["--color-error-text", "--color-surface", 4.5, "error text on surface", "both"],
    ["--color-error-text", "--color-error-subtle", 4.5, "error text on subtle", "both"],
    ["--color-info-text", "--color-bg", 4.5, "info text on bg", "both"],
    ["--color-info-text", "--color-surface", 4.5, "info text on surface", "both"],
    ["--color-info-text", "--color-info-subtle", 4.5, "info text on subtle", "both"],
    ["--color-on-primary", "--color-primary", 4.5, "on primary", "both"],
    ["--color-on-primary", "--color-primary-hover", 4.5, "on primary hover", "both"],
    ["--color-on-primary", "--color-primary-active", 4.5, "on primary active", "both"],
    ["--color-on-secondary", "--color-secondary", 4.5, "on secondary", "both"],
    ["--color-on-secondary", "--color-secondary-hover", 4.5, "on secondary hover", "both"],
    ["--color-on-secondary", "--color-secondary-active", 4.5, "on secondary active", "both"],
    ["--color-on-accent", "--color-accent", 4.5, "on accent", "both"],
    ["--color-on-accent", "--color-accent-hover", 4.5, "on accent hover", "both"],
    ["--color-on-accent", "--color-accent-active", 4.5, "on accent active", "both"],
    ["--color-on-error", "--color-error-solid", 4.5, "on error solid", "both"],
    ["--color-on-error", "--color-error-solid-hover", 4.5, "on error solid hover", "both"],
    ["--color-on-primary", "--color-success", 4.5, "white on success ink", "light"],
    ["--color-on-primary", "--color-warning", 4.5, "white on warning ink", "light"],
    ["--color-on-primary", "--color-info", 4.5, "white on info ink", "light"],
    ["--color-border", "--color-surface", 3, "border on surface", "both"],
    ["--color-border", "--color-bg", 3, "border on bg", "both"],
    ["--color-border", "--color-surface-muted", 3, "border on muted surface", "both"],
    ["--color-primary", "--color-bg", 3, "primary fill on bg", "both"],
    ["--color-secondary", "--color-bg", 3, "secondary fill on bg", "both"],
    ["--color-accent", "--color-bg", 3, "accent fill on bg", "both"],
    ["--color-error-solid", "--color-bg", 3, "error fill on bg", "both"],
    ["--color-focus", "--color-bg", 3, "focus on bg", "both"],
  ];

  let checked = 0;
  pairs.forEach(function (pair) {
    const which = pair[4] === "both" ? ["light", "dark"] : [pair[4]];
    which.forEach(function (theme) {
      const fg = resolveToken(pair[0], theme, rootMap, darkMap, [], failures);
      const bg = resolveToken(pair[1], theme, rootMap, darkMap, [], failures);
      if (!fg || !bg) return;
      checked += 1;
      const ratio = contrast(fg, bg);
      if (ratio < pair[2]) {
        failures.push(
          theme + " " + pair[3] + " (" + pair[0] + " " + fg + " on " + pair[1] + " " + bg + ") is " +
            ratio.toFixed(2) + ":1 (needs " + pair[2] + ":1)"
        );
      }
    });
  });

  ["primary", "secondary", "accent"].forEach(function (role) {
    ["light", "dark"].forEach(function (theme) {
      const hover = resolveToken("--color-" + role + "-hover", theme, themes.light, themes.dark, [], failures);
      const active = resolveToken("--color-" + role + "-active", theme, themes.light, themes.dark, [], failures);
      if (!hover || !active) return;
      if (hover === active) {
        failures.push(theme + " " + role + " active fill matches hover (" + active + ")");
      } else if (luminance(active) >= luminance(hover)) {
        failures.push(theme + " " + role + " active fill " + active + " is not darker than hover " + hover);
      }
    });
  });

  if (failures.length) {
    console.error("Crimson UI check failed:");
    failures.forEach(function (line) {
      console.error(" - " + line);
    });
    process.exit(1);
  }

  console.log("Generated CSS is current. Contrast checks passed (" + checked + " token pairs).");
}

if (require.main === module) {
  main();
}

module.exports = main;
