"use strict";

const fs = require("fs");
const path = require("path");
const sass = require("sass");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function entryUses() {
  const uses = [];
  const re = /@use\s+"([^"]+)"/g;
  const text = read("scss/crimson-ui.scss");
  let match = re.exec(text);
  while (match) {
    if (!match[1].startsWith("sass:") && !uses.includes(match[1])) {
      uses.push(match[1]);
    }
    match = re.exec(text);
  }
  if (!uses.length) {
    throw new Error("scss/crimson-ui.scss has no @use partials.");
  }
  return uses;
}

function partialPath(usePath) {
  const directory = path.dirname(usePath);
  const base = path.basename(usePath);
  const underscored = path.join(root, "scss", directory, "_" + base + ".scss");
  const plain = path.join(root, "scss", usePath + ".scss");
  if (fs.existsSync(underscored)) return underscored;
  if (fs.existsSync(plain)) return plain;
  throw new Error("No SCSS partial for @use \"" + usePath + "\".");
}

function compilePartial(usePath) {
  const result = sass.compile(partialPath(usePath), {
    style: "expanded",
    charset: false,
  });
  return result.css.trim() + "\n";
}

function generatedFiles() {
  const uses = entryUses();
  const files = {};

  uses.forEach(function (usePath) {
    files["src/" + usePath + ".css"] = compilePartial(usePath);
  });

  const imports = uses.map(function (usePath) {
    return '@import "' + usePath + '.css";';
  });
  files["src/crimson-ui.css"] =
    "/* Unbuilt entry. Imports resolve next to this file. Prefer dist/crimson-ui.css in production. */\n\n" +
    imports.join("\n") +
    "\n";

  const pkg = JSON.parse(read("package.json"));
  const banner = "/*! Crimson UI v" + pkg.version + " | MIT License | Copyright Alan */\n";
  const parts = uses.map(function (usePath) {
    const rel = "src/" + usePath + ".css";
    return "/* " + rel + " */\n" + files[rel].trim() + "\n";
  });
  files["dist/crimson-ui.css"] = banner + "\n" + parts.join("\n");
  return files;
}

module.exports = {
  root: root,
  read: read,
  entryUses: entryUses,
  generatedFiles: generatedFiles,
};
