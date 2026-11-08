# Crimson UI

Crimson UI is a red-family design system for interfaces that should feel warm and stay readable. It ships as plain CSS custom properties, so a page can use it with one stylesheet link. An SCSS source mirror exposes the same tokens as Sass maps, mixins, and partials.

Text colors meet WCAG AA (4.5:1). Control borders and resting button fills meet the 3:1 non-text requirement. Success, warning, error, and info stay inside the red family (berry, brick, scarlet, and rose) and are also named in the component text.

## Folder tree

```
.
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package.json
├── demo/
│   ├── demo.css
│   └── index.html
├── dist/
│   └── crimson-ui.css
├── scripts/
│   ├── build.js
│   └── check-contrast.js
├── scss/
│   ├── crimson-ui.scss
│   ├── base/
│   ├── components/
│   └── tokens/
└── src/
    ├── crimson-ui.css
    ├── base/
    │   ├── focus.css
    │   ├── reset.css
    │   └── typography.css
    ├── components/
    │   ├── alert.css
    │   ├── badge.css
    │   ├── button.css
    │   ├── card.css
    │   ├── form.css
    │   └── nav.css
    └── tokens/
        ├── colors.css
        ├── motion.css
        ├── radii.css
        ├── shadows.css
        ├── spacing.css
        └── typography.css
```

`scss/` is the hand-written source. `npm run build` compiles each partial `@use`d by `scss/crimson-ui.scss` into `src/`, then concatenates those files into `dist/crimson-ui.css`. A new partial is added in that one `@use` list. The demo loads the concatenated file.

## Install and usage

### Copy

Copy `dist/crimson-ui.css` into your project and link it. No build step, package manager, or network font is required.

```html
<link rel="stylesheet" href="path/to/crimson-ui.css">
<button class="btn btn-primary" type="button">Save swatch</button>
```

To load the unbuilt source instead, link `src/crimson-ui.css`. That file `@import`s the partials next to it.

### npm

From a project that depends on this folder or a git URL:

```bash
npm install git+https://github.com/AlanKam555/crimson-ui.git
```

The package entry is `dist/crimson-ui.css` (`main` and `style`). The Sass entry is `scss/crimson-ui.scss` (`sass`).

```css
@import "crimson-ui/dist/crimson-ui.css";
```

```scss
@use "crimson-ui/scss/crimson-ui";
```

There are no runtime dependencies. Sass is a development dependency used only to compile. After changing `scss/`, rebuild with Node 18 or newer:

```bash
npm install
npm run build
```

`npm run check` confirms `src/` and `dist/` match that compile, and checks contrast for the token custom properties. It does not write files.

### git

```bash
git clone git@github.com:AlanKam555/crimson-ui.git
cd crimson-ui
npm install
npm run build
python3 -m http.server 8741
```

Open `http://127.0.0.1:8741/demo/`. The demo uses relative paths, so `demo/index.html` also works from a static host or as a local file.

## Examples

Button variants and sizes:

```html
<button class="btn btn-primary" type="button">Primary</button>
<button class="btn btn-secondary" type="button">Secondary</button>
<button class="btn btn-accent" type="button">Accent</button>
<button class="btn btn-danger" type="button">Danger</button>
<button class="btn btn-outline" type="button">Outline</button>
<button class="btn btn-ghost" type="button">Ghost</button>
<button class="btn btn-primary btn-sm" type="button">Small</button>
<button class="btn btn-primary btn-lg" type="button" disabled>Disabled</button>
```

A field with an error:

```html
<div class="field is-invalid">
  <label class="label" for="email">Email</label>
  <input class="input" id="email" type="email" value="alan@" aria-invalid="true" aria-describedby="email-error">
  <p class="field-message" id="email-error">Enter a full address, including the domain.</p>
</div>
```

Selects that hide the native arrow use a wrapper:

```html
<div class="select-wrap">
  <select class="select" id="size">
    <option>A1, tube</option>
  </select>
</div>
```

Checkbox, radio, and switch keep a real input and draw the face on the next element:

```html
<label class="choice">
  <input type="checkbox" checked>
  <span class="choice-control" aria-hidden="true"></span>
  <span>Include the hex sheet</span>
</label>

<label class="switch">
  <input type="checkbox" role="switch">
  <span class="switch-ui" aria-hidden="true"></span>
  <span>Notify me when the deck ships</span>
</label>
```

Alerts and badges:

```html
<div class="alert alert-warning" role="status">
  <p class="alert-title"><span class="alert-mark" aria-hidden="true">!</span> Check the tube</p>
  <p>A1 sheets crease when they ship flat.</p>
</div>
<span class="badge badge-success">Success</span>
```

Tabs are a radio group styled as a tab list. Arrow keys move the selection. The CSS shows up to five panels, matched by child index:

```html
<div class="tabs">
  <div class="tab-list" role="radiogroup" aria-label="Notes">
    <div class="tab">
      <input class="tab-input" type="radio" name="notes" id="note-a" checked>
      <label class="tab-label" for="note-a">Install</label>
    </div>
    <div class="tab">
      <input class="tab-input" type="radio" name="notes" id="note-b">
      <label class="tab-label" for="note-b">Tokens</label>
    </div>
  </div>
  <div class="tab-panels">
    <div class="tab-panel">Link the built CSS.</div>
    <div class="tab-panel">Override custom properties.</div>
  </div>
</div>
```

The navbar puts the menu behind a checkbox below 62rem. Give the toggle button `class="navbar-tool"` if it should stay outside that menu.

```html
<header class="navbar">
  <div class="navbar-inner">
    <a class="navbar-brand" href="/">Crimson UI</a>
    <input id="nav-toggle" class="navbar-toggle-input" type="checkbox">
    <label class="navbar-toggle" for="nav-toggle">
      <span class="navbar-toggle-bar" aria-hidden="true"></span>
      <span class="sr-only">Menu</span>
    </label>
    <nav class="navbar-menu" aria-label="Primary">
      <a class="navbar-link" href="/palette">Palette</a>
    </nav>
  </div>
</header>
```

## Token reference

Semantic colors change with the theme. Primitives do not.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#FFF5F3` | `#1A0C10` | Page background |
| `--color-surface` | `#FFFFFF` | `#261318` | Cards and fields |
| `--color-surface-muted` | `#FBECEA` | `#341C23` | Wells, code, card headers |
| `--color-text` | `#2B1216` | `#FBE8EA` | Body text |
| `--color-text-muted` | `#6B3D45` | `#E4B4BC` | Hints and secondary text |
| `--color-text-inverse` | `#FFFFFF` | `#2B1216` | Text on an inverse band |
| `--color-border` | `#A86B74` | `#C48B96` | Input and card edges (3:1) |
| `--color-divider` | `#E7CFD2` | `#5C3842` | Quiet rules |
| `--color-focus` | `#2B1216` | `#FBE8EA` | Focus ring |
| `--color-primary` | `#9F1239` | `#E11D48` | Crimson fill |
| `--color-primary-hover` | `#881337` | `#BE123C` | Primary hover fill |
| `--color-primary-active` | `#6F102C` | `#9F1239` | Primary pressed fill |
| `--color-on-primary` | `#FFFFFF` | `#FFFFFF` | Text on primary fill |
| `--color-primary-text` | `#9F1239` | `#FF8FA3` | Primary as text |
| `--color-primary-subtle` | `#FDE8EC` | `#3D1824` | Primary wash |
| `--color-secondary` | `#6D2142` | `#A84466` | Wine fill |
| `--color-secondary-hover` | `#551933` | `#8E3A56` | Wine hover |
| `--color-secondary-active` | `#45142A` | `#6D2142` | Wine pressed fill |
| `--color-on-secondary` | `#FFFFFF` | `#FFFFFF` | Text on wine |
| `--color-secondary-text` | `#6D2142` | `#FFB4C2` | Wine as text |
| `--color-accent` | `#C2410C` | `#C2410C` | Vermilion fill |
| `--color-accent-hover` | `#9A3412` | `#9A3412` | Vermilion hover |
| `--color-accent-active` | `#7C2D0F` | `#7C2D0F` | Vermilion pressed fill |
| `--color-on-accent` | `#FFFFFF` | `#FFFFFF` | Text on vermilion |
| `--color-accent-text` | `#9A3412` | `#F8C9A8` | Vermilion as text |
| `--color-success` / `--color-success-text` | `#6B2D5B` | `#F6C6D8` | Berry |
| `--color-success-subtle` | `#F6E4F1` | `#3A1A2A` | Berry wash |
| `--color-warning` / `--color-warning-text` | `#7C3414` | `#F3B183` | Brick |
| `--color-warning-subtle` | `#FDECDC` | `#3A2216` | Brick wash |
| `--color-error` / `--color-error-text` | `#B91C1C` | `#FECACA` | Scarlet text and borders |
| `--color-error-subtle` | `#FDECEC` | `#3F1618` | Scarlet wash |
| `--color-error-solid` | `#B91C1C` | `#DC2626` | Danger button fill |
| `--color-on-error` | `#FFFFFF` | `#FFFFFF` | Text on the danger fill |
| `--color-info` / `--color-info-text` | `#9D174D` | `#F9C2DE` | Rose |
| `--color-info-subtle` | `#FBE4F0` | `#3A162C` | Rose wash |
| `--color-link` | `#9F1239` | `#FF8FA3` | Links |
| `--color-link-hover` | `#6F102C` | `#FBE8EA` | Link hover |

Crimson ramp: `#FFF5F3`, `#FBECEA`, `#F6D5D8`, `#E7B4BA`, `#D07A88`, `#E11D48`, `#BE123C`, `#9F1239`, `#881337`, `#6F102C`, `#2B1216` as `--crimson-50` through `--crimson-950`.

| Scale | Tokens |
| --- | --- |
| Space | `--space-0` through `--space-6`, then `--space-8`, `--space-10`, `--space-12`, `--space-16`, `--space-20`, `--space-24` (0 to 6rem, 4px steps at the start) |
| Radius | `--radius-sm` 0.25rem, `--radius-md` 0.5rem, `--radius-lg` 0.75rem, `--radius-xl` 1rem, `--radius-2xl` 1.5rem, `--radius-full` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Type | `--font-sans`, `--font-serif`, `--font-mono`; `--text-xs` to `--text-5xl`; `--leading-tight`, `--leading-snug`, `--leading-normal`, `--leading-relaxed`; `--weight-normal` to `--weight-bold` |
| Motion | `--duration-fast` 120ms, `--duration-base` 180ms, `--ease-standard` |

`--text-4xl` and `--text-5xl` use `clamp()` so headlines shrink on a phone without a second stylesheet.

## Customization

Override semantic tokens after the stylesheet. Components read the names, so one change recolors buttons, links, alerts, and focus.

```css
:root {
  --color-primary: #7f1d1d;
  --color-primary-hover: #64141f;
  --color-primary-text: #7f1d1d;
  --color-link: #7f1d1d;
}
```

Keep new text colors at 4.5:1 on the surfaces where they appear, and new fills at 4.5:1 with their `--color-on-*` text. `npm run check` resolves the stock pairs from the generated custom properties.

In Sass, read a primitive at compile time. The function returns the hex from `$crimson-primitives`.

```scss
@use "crimson-ui/scss/tokens/colors" as crimson;

.poster {
  background: crimson.crimson-token("crimson-700");
}
```

`$crimson-primitives` is marked `!default`, so a project can pass a complete replacement map the first time that file is loaded. Pass every key. A partial map drops the rest of the ramp. For a single brand change, the custom property above is the path that restyles the components.

Themes:

- No `data-theme` attribute: follow `prefers-color-scheme`.
- `data-theme="dark"` or `data-theme="light"` on `<html>`: force that theme, including when it disagrees with the system.

The demo toggle writes the attribute and remembers it in `localStorage`. `?theme=dark` and `?theme=light` do the same on load.

## Accessibility

- `:focus-visible` draws a 3px ring in `--color-focus`, offset from the control. Mouse clicks do not keep the ring. Choice, switch, tabs, and the navbar toggle move that ring onto the visible face.
- `prefers-reduced-motion: reduce` shortens transitions and animations and cancels the card hover lift.
- `forced-colors: active` keeps a system focus outline and a `ButtonText` border on controls.
- Body text, muted text, link text, and text on button fills are covered by the contrast check. Placeholder text uses the muted token.
- Alerts are not color alone. Success is a solid border, warning is dashed, error is double, info is dotted, and each title names the state.
- Links are underlined. Disabled controls use the `disabled` attribute.
- The skip link class `.skip-link` is visually hidden until focused.
- Tabs are real radio inputs, so arrow keys work without a script. The navbar menu is a checkbox with a visible label.
- The font stacks are system fonts. The stylesheet does not request a third-party host.

## Browser support

Crimson UI targets the current and previous two major versions of Chrome, Edge, Firefox, and Safari.

That set includes custom properties, `:focus-visible`, `prefers-color-scheme`, `prefers-reduced-motion`, `forced-colors`, `clamp()`, and `:has()` (used by tabs to show the selected panel). Internet Explorer is not supported.

## License

MIT. Copyright Alan. See [LICENSE](LICENSE).
