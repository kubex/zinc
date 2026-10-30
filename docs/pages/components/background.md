---
meta:
  title: Background
  description: Layer a colour, decorative image, image strength, motion and contrast overlay behind content.
layout: component
---

`zn-background` builds a presentation background without making assumptions about the content laid over it. Give the element a height (or let its content establish one), then use the default slot for foreground content.

```html:preview
<zn-background
  image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80"
  color="#18382f"
  image-strength="full"
  motion="drift"
  overlay="strong"
  overlay-tone="dark"
  floating-icons="school,lightbulb,auto_awesome,psychology,rocket_launch,public"
  style="min-height: 24rem; border-radius: var(--zn-border-radius-large); color: white;">
  <zn-sp style="max-width: 38rem;" xl>
    <h2>Build a calm, legible canvas</h2>
    <p>The image, movement and contrast treatment stay behind any slotted Zinc or HTML content.</p>
  </zn-sp>
</zn-background>
```

## Treatments

Use `image-strength="soft|medium|full"` to set the image opacity, `motion="none|drift|breathe"` to choose its movement, and `overlay="none|soft|strong"` to control the contrast gradient. `overlay-tone="light"` places a white gradient over the image; use `dark` when light foreground content needs a dark gradient.

Motion automatically stops for people who request reduced motion. Set `paused` when a background remains in the document but is not currently visible, such as an inactive slide.

### Image strength

```html:preview
<zn-cols layout="1,1,1">
  <zn-background color="#dcefeb" image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70" image-strength="soft" overlay="soft" style="min-height: 13rem;">
    <zn-sp><strong>Soft image</strong></zn-sp>
  </zn-background>
  <zn-background color="#dcefeb" image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70" image-strength="medium" overlay="soft" style="min-height: 13rem;">
    <zn-sp><strong>Medium image</strong></zn-sp>
  </zn-background>
  <zn-background color="#10231d" image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=70" image-strength="full" overlay="strong" overlay-tone="dark" style="min-height: 13rem; color: white;">
    <zn-sp><strong>Full image</strong></zn-sp>
  </zn-background>
</zn-cols>
```

### Motion

`drift` slowly travels across the image, while `breathe` gently changes its scale. The oversized image canvas keeps the edges covered throughout both animations.

```html:preview
<zn-cols layout="1,1,1">
  <zn-background
    color="#18382f"
    image="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=75"
    motion="none"
    overlay="strong"
    overlay-tone="dark"
    style="min-height: 14rem; color: white;">
    <zn-sp><strong>No motion</strong></zn-sp>
  </zn-background>
  <zn-background
    color="#18382f"
    image="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=75"
    motion="drift"
    overlay="strong"
    overlay-tone="dark"
    style="min-height: 14rem; color: white;">
    <zn-sp><strong>Gentle drift</strong></zn-sp>
  </zn-background>
  <zn-background
    color="#18382f"
    image="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=75"
    motion="breathe"
    overlay="strong"
    overlay-tone="dark"
    style="min-height: 14rem; color: white;">
    <zn-sp><strong>Gentle breathe</strong></zn-sp>
  </zn-background>
</zn-cols>
```

### Overlay strength

The overlay sits above the image and below the slotted content. Choose its strength based on how much contrast the foreground needs.

```html:preview
<zn-cols layout="1,1,1">
  <zn-background
    color="#dcefeb"
    image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75"
    overlay="none"
    style="min-height: 14rem;">
    <zn-sp><strong>No overlay</strong></zn-sp>
  </zn-background>
  <zn-background
    color="#dcefeb"
    image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75"
    overlay="soft"
    overlay-tone="light"
    style="min-height: 14rem;">
    <zn-sp><strong>Soft light overlay</strong></zn-sp>
  </zn-background>
  <zn-background
    color="#10231d"
    image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75"
    overlay="strong"
    overlay-tone="dark"
    style="min-height: 14rem; color: white;">
    <zn-sp><strong>Strong dark overlay</strong></zn-sp>
  </zn-background>
</zn-cols>
```

### Floating icons

Pass up to eight comma-separated Zinc icon names to `floating-icons`. The icons are decorative and non-interactive. Each uses a fixed ambient anchor with its own timing and fades between 1% and no more than 50% opacity.

Icon size follows the background width: 5% of the available space, capped at 150px. Floating motion stops when reduced motion is requested or when the background has `paused`.

```html:preview
<zn-background
  color="#151b34"
  image="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&q=80"
  image-strength="medium"
  overlay="strong"
  overlay-tone="dark"
  floating-icons="rocket_launch,public,star,science,satellite_alt,explore,orbit,auto_awesome"
  style="min-height: 28rem; color: white; --zn-background-floating-icon-color: #d9e2ff;">
  <zn-sp style="max-width: 34rem;" xl>
    <h2>Explore the next horizon</h2>
    <p>Floating icons remain a background treatment, so the foreground content keeps normal focus and pointer behaviour.</p>
  </zn-sp>
</zn-background>
```

## CSS customisation

Use `--zn-background-image-position` to change the image focal point, `--zn-background-overlay-angle` to turn the overlay gradient, and `--zn-background-floating-icon-color` to recolour the ambient icons. `--zn-background-color` provides a reusable fallback when the `color` attribute is omitted.

The `base`, `image`, `overlay`, `floating-icons`, `floating-icon`, and `content` CSS parts are available for application-specific treatments that cannot be expressed with the attributes or custom properties.
