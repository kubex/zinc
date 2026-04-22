---
meta:
  title: Shimmer Text
  description: A global utility class that applies an animated shimmer sweep to text, suitable for loading, processing, or "thinking" states.
---

# Shimmer Text

`shimmer-text` is a global utility class that animates a horizontal highlight sweep across text colour. Use it to convey an in-progress state — AI generation, background processing, or any "working on it" indicator.

The class works on any element with text content, including inside Zinc components. Colour variants mirror the standard Zinc palette: `zn-primary`, `zn-accent`, `zn-info`, `zn-success`, `zn-warning`, `zn-error`.

When `prefers-reduced-motion: reduce` is set, the animation is suppressed and the text falls back to a solid colour matching the chosen variant.

## Examples

### Default

```html:preview
<span class="shimmer-text">Thinking…</span>
```

### Colour Variants

```html:preview
<div style="display: flex; flex-direction: column; gap: 8px;">
  <span class="shimmer-text">Default</span>
  <span class="shimmer-text zn-primary">Primary</span>
  <span class="shimmer-text zn-accent">Accent</span>
  <span class="shimmer-text zn-info">Info</span>
  <span class="shimmer-text zn-success">Success</span>
  <span class="shimmer-text zn-warning">Warning</span>
  <span class="shimmer-text zn-error">Error</span>
</div>
```

### Headings and Larger Text

The shimmer scales with whatever `font-size` is on the element, so it can be applied to headings or inline within prose.

```html:preview
<h2 class="shimmer-text zn-primary" style="margin: 0;">Generating summary…</h2>
<p style="margin: 8px 0 0;">
  Please wait while we <span class="shimmer-text zn-info">analyse your data</span>.
</p>
```

### Inside Zinc Components

Because `shimmer-text` is a plain class, it composes with any Zinc component that renders slotted text.

```html:preview
<zn-chip class="shimmer-text zn-accent">Processing</zn-chip>
```

### Tuning the Sweep

The effect mirrors the Claude CLI's character-level shimmer: a narrow, sharper highlight slides across text rather than a soft gradient wash. The class exposes these CSS custom properties — all sized in `ch` so they scale with the current font size.

| Variable | Default | Purpose |
|---|---|---|
| `--shimmer-base` | `rgb(var(--zn-text))` | Resting text colour. |
| `--shimmer-highlight` | `rgb(var(--zn-text-heading))` | Colour of the spotlight. |
| `--shimmer-core` | `0.5ch` | Half-width of the solid-colour core of the spotlight. |
| `--shimmer-spread` | `1.5ch` | Half-width of the full highlight including its fade-out edges. |
| `--shimmer-duration` | `2s` | Time for one full sweep cycle. |

```html:preview
<div style="display: flex; flex-direction: column; gap: 6px;">
  <span class="shimmer-text">Default sweep</span>
  <span class="shimmer-text" style="--shimmer-duration: 1s;">Faster sweep</span>
  <span class="shimmer-text" style="--shimmer-duration: 4s;">Slower, gentler sweep</span>
  <span class="shimmer-text" style="--shimmer-core: 1ch; --shimmer-spread: 3ch;">Wider spotlight</span>
</div>
```

The Claude CLI scales its sweep with message length (50ms per character plus 10 characters of offscreen pause on each side). To match that feel in CSS, set `--shimmer-duration` to roughly `(messageCharacters + 20) × 50ms`.

### Reduced Motion

The animation is wrapped in `@media (prefers-reduced-motion: no-preference)`. Users who have requested reduced motion see the static colour variant instead — no configuration required.
