---
meta:
  title: Thumbnail
  description: A captioned image tile with a fixed aspect ratio, optional corner badges and actions, and optional link or selectable behaviour.
layout: component
---

A thumbnail is a single media preview with its title beneath it. Thumbnails are usually placed inside a
[thumbnail group](/components/thumbnail-group), which lays them out as a scrollable row that expands into a grid.

```html:preview
<div style="width: 200px;">
  <zn-thumbnail
    src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60"
    caption="Tahoe Day">
  </zn-thumbnail>
</div>
```

## Examples

### Aspect Ratio

The media frame is `16 / 9` by default. Set the `aspect-ratio` attribute to any CSS aspect ratio to change it — the
image is cropped to fill the frame, so captions stay aligned across a row whatever the source dimensions are.

```html:preview
<div style="display: flex; gap: 16px;">
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60"
      caption="16 / 9">
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      aspect-ratio="1 / 1"
      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60"
      caption="1 / 1">
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      aspect-ratio="3 / 4"
      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60"
      caption="3 / 4">
    </zn-thumbnail>
  </div>
</div>
```

The `--zn-thumbnail-aspect-ratio` custom property does the same thing, and because it inherits you can set it once on
any ancestor — a wrapper, or a [thumbnail group](/components/thumbnail-group) — to reshape every thumbnail beneath it.
A thumbnail's own `aspect-ratio` attribute still wins over an inherited value.

```html:preview
<div style="display: flex; gap: 16px; --zn-thumbnail-aspect-ratio: 1 / 1;">
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60"
      caption="Inherited 1 / 1">
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60"
      caption="Inherited 1 / 1">
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      aspect-ratio="16 / 9"
      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60"
      caption="Overridden">
    </zn-thumbnail>
  </div>
</div>
```

### Badges and Actions

The `badge` slot pins content to the bottom-left of the media and the `actions` slot pins it to the bottom-right. Use
`icon` for the common case of a single badge icon.

Each slotted element becomes its own chip, so several actions read as separate icons dotted along the thumbnail rather
than a single grouped pill. `--zn-thumbnail-chip-gap` controls the spacing between them, and
`--zn-thumbnail-chip-background` / `--zn-thumbnail-chip-color` restyle them.

A badge describes the asset rather than doing something, so it keeps the chip's shape but is held back on opacity
(`--zn-thumbnail-badge-opacity`, default `0.65`) and takes no pointer events — clicks pass straight through to the
thumbnail. Actions keep full opacity, the pointer cursor and a hover state. `--zn-thumbnail-chip-radius` rounds both off.

The overlay sits **outside** the thumbnail's link, so anything you put in `actions` keeps its own click behaviour — a
download link downloads, a button's handler runs — and never selects the thumbnail or follows its `href`.

```html:preview
<div style="display: flex; gap: 16px;">
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60"
      caption="Sequoia Sunrise"
      icon="play_arrow">
    </zn-thumbnail>
  </div>
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60"
      caption="One action"
      icon="play_arrow">
      <a slot="actions" href="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05" download>
        <zn-icon src="download" size="14"></zn-icon>
      </a>
    </zn-thumbnail>
  </div>
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60"
      caption="Three actions"
      icon="play_arrow">
      <zn-icon slot="actions" src="download" size="14"></zn-icon>
      <zn-icon slot="actions" src="share" size="14"></zn-icon>
      <zn-icon slot="actions" src="more_horiz" size="14"></zn-icon>
    </zn-thumbnail>
  </div>
</div>
```

### Preview

Provide `full-uri` and the thumbnail becomes previewable: activating it opens a full-screen overlay that grows out of
the thumbnail's position, over a backdrop, with rounded edges. Escape, the close button, or a click on the backdrop
shrinks it back to where it came from.

The panel takes the asset's own aspect ratio, so it wraps the image rather than letterboxing it in a fixed-shape box —
which also means the close button sits on the image's top-right corner, not on a surrounding container. It grows to
whichever of `--zn-thumbnail-preview-max-width` (70vw) or `--zn-thumbnail-preview-max-height` (70vh) it reaches first,
so it always leaves the page visible around it.

The ratio is measured from the thumbnail's own already-loaded image, which shares it with the full-size asset. That
keeps the panel's size known before the large file arrives, so the grow animation has a correct target from the first
frame; the thumbnail image is held behind it, blurred, in the meantime, and the panel resizes only if the full asset
turns out to be a genuinely different shape. Override the measurement with `--zn-thumbnail-preview-aspect-ratio` — for
slotted media that can't be measured, for instance — and round the corners with `--zn-thumbnail-preview-radius`.

```html:preview
<div style="display: flex; gap: 16px;">
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&q=50"
      full-uri="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=2000&q=80"
      caption="Tahoe Day">
    </zn-thumbnail>
  </div>
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=50"
      full-uri="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2000&q=80"
      caption="Sequoia Sunrise">
    </zn-thumbnail>
  </div>
</div>
```

Because the preview opens in the browser's top layer, it escapes a [thumbnail group](/components/thumbnail-group)'s
scrolling row rather than being clipped by it.

#### Preview Trigger

By default a plain click opens the preview. Set `preview-trigger="button"` to put a dedicated expand control on the
media instead, leaving clicks free for selection or for the thumbnail's `href`.

```html:preview
<zn-thumbnail-group caption="Pick a still" selectable>
  <zn-thumbnail
    value="tahoe"
    preview-trigger="button"
    src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&q=50"
    full-uri="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=2000&q=80"
    caption="Tahoe Day"
    selected>
  </zn-thumbnail>
  <zn-thumbnail
    value="sequoia"
    preview-trigger="button"
    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=50"
    full-uri="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2000&q=80"
    caption="Sequoia Sunrise">
  </zn-thumbnail>
  <zn-thumbnail
    value="sonoma"
    preview-trigger="button"
    src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=50"
    full-uri="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2000&q=80"
    caption="Sonoma Horizon">
  </zn-thumbnail>
</zn-thumbnail-group>
```

When both `href` and `full-uri` are set, a plain left click previews while modifier and middle clicks still open the
link in a new tab. Cancelling `zn-select` suppresses the preview (and the navigation) entirely, and `showPreview()` /
`hidePreview()` drive the overlay from script.

#### Previewing Other Media

The `preview` slot replaces the preview's contents, so the full-size asset doesn't have to be an image. Filling the
slot enables the preview on its own — `full-uri` isn't needed.

```html:preview
<div style="width: 180px;">
  <zn-thumbnail
    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=50"
    caption="Big Sur">
    <video slot="preview" controls autoplay muted
           poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=70"
           src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video>
  </zn-thumbnail>
</div>
```

### Links

Set `href` to render the thumbnail as an anchor. `target` is forwarded to it.

```html:preview
<div style="width: 180px;">
  <zn-thumbnail
    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60"
    caption="Goa Beaches"
    href="https://unsplash.com"
    target="_blank">
  </zn-thumbnail>
</div>
```

### Selected

`selected` draws the accent ring. A [thumbnail group](/components/thumbnail-group) with `selectable` manages this for
you; set it by hand when you're tracking selection yourself from the `zn-select` event.

A thumbnail only enters the tab order when it's a link or when `selectable` is set — a group with `selectable` sets
that on its children for you. If you're handling `zn-select` yourself, set `selectable` too so the thumbnail is
reachable by keyboard and announced as a button.

```html:preview
<div style="display: flex; gap: 16px;">
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60"
      caption="Selected"
      selected>
    </zn-thumbnail>
  </div>
  <div style="width: 180px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60"
      caption="Not selected">
    </zn-thumbnail>
  </div>
</div>
```

### Active

`active` draws a ring in a second colour, for the thumbnail currently in use — playing, open, being edited — as opposed
to the one the user has picked. It's independent of `selected`, and takes the ring colour when a thumbnail is both.
Recolour either ring with `--zn-thumbnail-active-color` and `--zn-thumbnail-selected-color`.

```html:preview
<div style="display: flex; gap: 16px;">
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60"
      caption="Idle">
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60"
      caption="Selected"
      selected>
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60"
      caption="Active"
      icon="play_arrow"
      active>
    </zn-thumbnail>
  </div>
  <div style="width: 160px;">
    <zn-thumbnail
      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60"
      caption="Both"
      selected
      active>
    </zn-thumbnail>
  </div>
</div>
```

### Disabled

A disabled thumbnail is dimmed, emits no `zn-select`, and renders as a plain element rather than a link.

```html:preview
<div style="width: 180px;">
  <zn-thumbnail
    src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60"
    caption="Processing"
    href="/media/1"
    disabled>
  </zn-thumbnail>
</div>
```

### Custom Media

Leave `src` unset and slot your own media into the `image` slot (or the default slot) — a `<video>`, a `<canvas>`, or
an icon placeholder. Slotted media is stretched to fill the frame.

```html:preview
<div style="display: flex; gap: 16px;">
  <div style="width: 180px;">
    <zn-thumbnail caption="No preview">
      <zn-icon slot="image" src="image" size="32" color="disabled"></zn-icon>
    </zn-thumbnail>
  </div>
  <div style="width: 180px;">
    <zn-thumbnail caption="Colour block">
      <div slot="image" style="background: linear-gradient(135deg, #8967ef, #38bdf8);"></div>
    </zn-thumbnail>
  </div>
</div>
```

### Without a Caption

Set `hide-caption` to render just the media frame.

```html:preview
<div style="width: 180px;">
  <zn-thumbnail
    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60"
    caption="Hidden"
    hide-caption>
  </zn-thumbnail>
</div>
```
