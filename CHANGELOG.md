# Changelog

All notable changes to Crimson UI are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.1.0 - 2026-11-08

- Point the README install snippets and package metadata at github.com/AlanKam555/crimson-ui.
- Dark theme primary, secondary, and accent buttons use a pressed fill darker than hover, still at WCAG AA with their label text.
- SCSS is the only hand-written source. The build compiles `scss/crimson-ui.scss` partials into `src/` and `dist/crimson-ui.css`.
- Contrast checks resolve token custom properties, and confirm the generated CSS is current.
- GitHub Actions installs dependencies, builds, runs the check, and fails if generated CSS is not committed.

## 1.0.0 - 2026-11-08

- Initial release.
- Red-family color tokens for primary, secondary, accent, background, surface, text, border, and success, warning, error, and info.
- Light theme, explicit `[data-theme="dark"]`, and `prefers-color-scheme: dark`.
- Spacing, radius, shadow, motion, and typography tokens on a system font stack.
- Components: buttons, forms, cards, navbar, tabs, breadcrumbs, typography, alerts, and badges.
- Visible `:focus-visible` rings, `prefers-reduced-motion` support, and forced-colors outlines.
- SCSS source mirror and a dependency-free build that concatenates `src/` into `dist/crimson-ui.css`.
