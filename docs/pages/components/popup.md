---
meta:
  title: Popup
  description: Popups are low-level positioning primitives used by components like dropdown and tooltip to anchor floating elements to other elements.
layout: component
---

Popups use [Floating UI](https://floating-ui.com/) under the hood to provide robust positioning for floating elements. The popup component exposes all of the underlying positioning features and allows you to anchor any element to any other element.

Popups are designed to work with `anchor` elements and popup content. The anchor can be provided through the `anchor` attribute (by ID or element reference) or by slotting an element into the `anchor` slot.

:::warning
**Important:** Popup is a low-level utility component. For most use cases, you should use higher-level components like [Dropdown](/components/dropdown) or [Tooltip](/components/tooltip) instead.
:::

```html:preview
<div class="popup-overview">
  <zn-popup placement="top" active>
    <span slot="anchor" style="
      display: inline-block;
      width: 150px;
      height: 150px;
      background: var(--zn-color-primary-600);
      border-radius: 4px;
    "></span>

    <div style="
      background: var(--zn-color-neutral-900);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    ">
      I'm a popup!
    </div>
  </zn-popup>
</div>

<style>
  .popup-overview {
    display: flex;
    justify-content: center;
    padding: 3rem;
  }
</style>
```

## Examples

### Activating the Popup

Popups are inactive by default. They won't be positioned until you add the `active` attribute. The popup logic can be computationally expensive, so only activate popups when needed.

```html:preview
<div class="popup-active">
  <zn-popup placement="top" active>
    <span slot="anchor" style="
      display: inline-block;
      width: 100px;
      height: 100px;
      background: var(--zn-color-success-600);
      border-radius: 4px;
    "></span>

    <div style="
      background: var(--zn-color-neutral-900);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    ">
      Active
    </div>
  </zn-popup>

  <zn-popup placement="top">
    <span slot="anchor" style="
      display: inline-block;
      width: 100px;
      height: 100px;
      background: var(--zn-color-neutral-300);
      border-radius: 4px;
      margin-left: 2rem;
    "></span>

    <div style="
      background: var(--zn-color-neutral-900);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    ">
      Inactive
    </div>
  </zn-popup>
</div>

<style>
  .popup-active {
    display: flex;
    justify-content: center;
    padding: 3rem;
  }
</style>
```

### External Anchors

By default, anchors are slotted into the popup using the `anchor` slot. If your anchor needs to live outside of the popup, you can pass its `id`, a DOM reference, or a `VirtualElement` to the `anchor` property.

```html:preview
<div class="popup-external">
  <div
    id="external-anchor"
    style="
      display: inline-block;
      width: 100px;
      height: 100px;
      background: var(--zn-color-primary-600);
      border-radius: 4px;
    "
  ></div>

  <zn-popup anchor="external-anchor" placement="top" active>
    <div style="
      background: var(--zn-color-neutral-900);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    ">
      Anchored externally
    </div>
  </zn-popup>
</div>

<style>
  .popup-external {
    padding: 3rem;
  }
</style>
```

### Placement

Use the `placement` attribute to set the preferred placement of the popup. Note that the actual placement may vary to keep the popup inside the viewport when using positioning features like `flip` and `shift`.

Since placement is preferred when the popup is active, the popup will use the `data-current-placement` attribute on the host element to reflect the actual placement at any given time. This allows you to style the popup based on its current placement if needed.

```html:preview
<div class="popup-placement">
  <zn-popup placement="top-start" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">top-start</span>
  </zn-popup>

  <zn-popup placement="top" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">top</span>
  </zn-popup>

  <zn-popup placement="top-end" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">top-end</span>
  </zn-popup>

  <br><br>

  <zn-popup placement="left-start" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">left-start</span>
  </zn-popup>

  <zn-popup placement="right-start" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">right-start</span>
  </zn-popup>

  <br><br>

  <zn-popup placement="left" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">left</span>
  </zn-popup>

  <zn-popup placement="right" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">right</span>
  </zn-popup>

  <br><br>

  <zn-popup placement="left-end" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">left-end</span>
  </zn-popup>

  <zn-popup placement="right-end" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">right-end</span>
  </zn-popup>

  <br><br>

  <zn-popup placement="bottom-start" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">bottom-start</span>
  </zn-popup>

  <zn-popup placement="bottom" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">bottom</span>
  </zn-popup>

  <zn-popup placement="bottom-end" active>
    <span slot="anchor"></span>
    <span class="popup-placement-label">bottom-end</span>
  </zn-popup>
</div>

<style>
  .popup-placement {
    padding: 3rem;
  }

  .popup-placement zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 75px;
    height: 50px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
    margin: 0.5rem;
  }

  .popup-placement-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Distance

Use the `distance` attribute to change the distance between the popup and its anchor. A positive value moves the popup farther away, while a negative value moves it closer.

```html:preview
<div class="popup-distance">
  <zn-popup placement="top" distance="0" active>
    <span slot="anchor"></span>
    <span class="popup-distance-label">Distance: 0</span>
  </zn-popup>

  <zn-popup placement="top" distance="10" active>
    <span slot="anchor"></span>
    <span class="popup-distance-label">Distance: 10</span>
  </zn-popup>

  <zn-popup placement="top" distance="20" active>
    <span slot="anchor"></span>
    <span class="popup-distance-label">Distance: 20</span>
  </zn-popup>
</div>

<style>
  .popup-distance {
    display: flex;
    gap: 4rem;
    padding: 3rem;
  }

  .popup-distance zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-distance-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Skidding

Use the `skidding` attribute to move the popup along the anchor. This is useful for fine-tuning the popup's position.

```html:preview
<div class="popup-skidding">
  <zn-popup placement="top" skidding="-50" active>
    <span slot="anchor"></span>
    <span class="popup-skidding-label">Skidding: -50</span>
  </zn-popup>

  <zn-popup placement="top" skidding="0" active>
    <span slot="anchor"></span>
    <span class="popup-skidding-label">Skidding: 0</span>
  </zn-popup>

  <zn-popup placement="top" skidding="50" active>
    <span slot="anchor"></span>
    <span class="popup-skidding-label">Skidding: 50</span>
  </zn-popup>
</div>

<style>
  .popup-skidding {
    display: flex;
    gap: 4rem;
    padding: 3rem;
  }

  .popup-skidding zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-skidding-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Arrows

Add an arrow to the popup with the `arrow` attribute. The arrow can be styled using the `--arrow-size` and `--arrow-color` custom properties. You can also target `::part(arrow)` in your stylesheet for additional customizations.

```html:preview
<div class="popup-arrow">
  <zn-popup placement="top" arrow active>
    <span slot="anchor"></span>
    <span class="popup-arrow-label">Top</span>
  </zn-popup>

  <zn-popup placement="bottom" arrow active>
    <span slot="anchor"></span>
    <span class="popup-arrow-label">Bottom</span>
  </zn-popup>

  <zn-popup placement="left" arrow active>
    <span slot="anchor"></span>
    <span class="popup-arrow-label">Left</span>
  </zn-popup>

  <zn-popup placement="right" arrow active>
    <span slot="anchor"></span>
    <span class="popup-arrow-label">Right</span>
  </zn-popup>
</div>

<style>
  .popup-arrow {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-arrow zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 80px;
    height: 80px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-arrow-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Arrow Placement

Use the `arrow-placement` attribute to control how the arrow is positioned. The default is `anchor`, which aligns the arrow as close to the center of the anchor as possible. You can also use `start`, `end`, or `center` to align the arrow to the start, end, or center of the popup instead.

```html:preview
<div class="popup-arrow-placement">
  <zn-popup placement="top" arrow arrow-placement="start" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-placement-label">start</span>
  </zn-popup>

  <zn-popup placement="top" arrow arrow-placement="anchor" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-placement-label">anchor (default)</span>
  </zn-popup>

  <zn-popup placement="top" arrow arrow-placement="center" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-placement-label">center</span>
  </zn-popup>

  <zn-popup placement="top" arrow arrow-placement="end" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-placement-label">end</span>
  </zn-popup>
</div>

<style>
  .popup-arrow-placement {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-arrow-placement zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 60px;
    height: 60px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-arrow-placement-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Arrow Padding

Use the `arrow-padding` attribute to add padding between the arrow and the edges of the popup. This prevents the arrow from overflowing corners when the popup has a border radius.

```html:preview
<div class="popup-arrow-padding">
  <zn-popup placement="top" arrow arrow-padding="0" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-padding-label">Padding: 0</span>
  </zn-popup>

  <zn-popup placement="top" arrow arrow-padding="10" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-padding-label">Padding: 10</span>
  </zn-popup>

  <zn-popup placement="top" arrow arrow-padding="20" active>
    <span slot="anchor"></span>
    <span class="popup-arrow-padding-label">Padding: 20</span>
  </zn-popup>
</div>

<style>
  .popup-arrow-padding {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-arrow-padding zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-arrow-padding-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 12px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Flip

When the popup doesn't have enough room in its preferred placement, it can automatically flip to keep it in view. Use the `flip` attribute to enable this behavior.

```html:preview
<div class="popup-flip">
  <div class="popup-flip-scroll">
    <zn-popup placement="top" flip active>
      <span slot="anchor"></span>
      <span class="popup-flip-label">Scroll down to see me flip</span>
    </zn-popup>
  </div>
</div>

<style>
  .popup-flip {
    height: 200px;
  }

  .popup-flip-scroll {
    height: 150px;
    overflow: auto;
    padding: 3rem;
    padding-bottom: 200px;
  }

  .popup-flip zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-flip-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Flip Fallback Placements

When using the `flip` attribute, you can specify fallback placements using `flip-fallback-placements`. The popup will try each placement in order until it finds one that fits.

```html:preview
<div class="popup-flip-fallback">
  <zn-popup placement="top" flip flip-fallback-placements="right bottom left" active>
    <span slot="anchor"></span>
    <span class="popup-flip-fallback-label">Try: top, right, bottom, left</span>
  </zn-popup>
</div>

<style>
  .popup-flip-fallback {
    padding: 3rem;
  }

  .popup-flip-fallback zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-flip-fallback-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Flip Fallback Strategy

When neither the preferred placement nor the fallback placements fit, the `flip-fallback-strategy` determines the final placement. Use `best-fit` (default) to position using the best available space, or `initial` to use the preferred placement.

```html:preview
<div class="popup-flip-strategy">
  <zn-popup placement="top" flip flip-fallback-strategy="best-fit" active>
    <span slot="anchor"></span>
    <span class="popup-flip-strategy-label">best-fit</span>
  </zn-popup>

  <zn-popup placement="top" flip flip-fallback-strategy="initial" active>
    <span slot="anchor"></span>
    <span class="popup-flip-strategy-label">initial</span>
  </zn-popup>
</div>

<style>
  .popup-flip-strategy {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-flip-strategy zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-flip-strategy-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Shift

When a popup is near the edge of the viewport, part of it may be clipped. Use the `shift` attribute to move it along the axis and keep it in view.

```html:preview
<div class="popup-shift">
  <div class="popup-shift-scroll">
    <zn-popup placement="top" shift active>
      <span slot="anchor"></span>
      <span class="popup-shift-label">Scroll horizontally to see me shift</span>
    </zn-popup>
  </div>
</div>

<style>
  .popup-shift {
    width: 300px;
  }

  .popup-shift-scroll {
    width: 100%;
    overflow: auto;
    padding: 3rem;
    padding-right: 400px;
  }

  .popup-shift zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-shift-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Auto-size

Use the `auto-size` attribute to prevent the popup from overflowing when clipped. The available width and/or height will be applied to the popup as CSS custom properties (`--auto-size-available-width` and `--auto-size-available-height`). Use these properties to set a `max-width` and/or `max-height` on the popup.

```html:preview
<div class="popup-auto-size">
  <div class="popup-auto-size-scroll">
    <zn-popup placement="top" auto-size="both" active>
      <span slot="anchor"></span>
      <div class="popup-auto-size-content">
        <p>This popup will resize to fit the available space.</p>
        <p>Scroll around the container to see how it adapts.</p>
        <p>The content will adjust its size automatically.</p>
      </div>
    </zn-popup>
  </div>
</div>

<style>
  .popup-auto-size {
    height: 250px;
  }

  .popup-auto-size-scroll {
    width: 300px;
    height: 200px;
    overflow: auto;
    padding: 3rem;
    padding-bottom: 300px;
    padding-right: 400px;
  }

  .popup-auto-size zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-auto-size-content {
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);
    overflow: auto;
    padding: 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
  }

  .popup-auto-size-content p {
    margin: 0;
    padding: 0.25rem 0;
  }
</style>
```

### Sync Width and Height

Use the `sync` attribute to make the popup the same width and/or height as the anchor element. This is useful for dropdowns and select controls where the popup should match the trigger's dimensions.

```html:preview
<div class="popup-sync">
  <zn-popup placement="bottom" sync="width" active>
    <span slot="anchor" style="width: 200px;"></span>
    <span class="popup-sync-label">sync="width"</span>
  </zn-popup>

  <zn-popup placement="bottom" sync="height" active>
    <span slot="anchor" style="height: 80px;"></span>
    <span class="popup-sync-label">sync="height"</span>
  </zn-popup>

  <zn-popup placement="bottom" sync="both" active>
    <span slot="anchor" style="width: 180px; height: 80px;"></span>
    <span class="popup-sync-label">sync="both"</span>
  </zn-popup>
</div>

<style>
  .popup-sync {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-sync zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 150px;
    height: 60px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-sync-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Positioning Strategy

By default, popups use a `fixed` positioning strategy. This works well in most situations, but if the popup's anchor is inside a container with `overflow: auto|hidden|scroll`, the popup may be clipped. You can change the strategy to `absolute` to position the popup relative to its containing block.

```html:preview
<div class="popup-strategy">
  <div class="popup-strategy-container">
    <h4>Fixed (Default)</h4>
    <zn-popup placement="bottom" strategy="fixed" active>
      <span slot="anchor"></span>
      <span class="popup-strategy-label">Fixed positioning</span>
    </zn-popup>
  </div>

  <div class="popup-strategy-container">
    <h4>Absolute</h4>
    <zn-popup placement="bottom" strategy="absolute" active>
      <span slot="anchor"></span>
      <span class="popup-strategy-label">Absolute positioning</span>
    </zn-popup>
  </div>
</div>

<style>
  .popup-strategy {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-strategy-container {
    position: relative;
    overflow: hidden;
    border: solid 2px var(--zn-color-neutral-300);
    padding: 2rem;
  }

  .popup-strategy-container h4 {
    margin: 0 0 1rem 0;
  }

  .popup-strategy zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-strategy-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Hover Bridge

When a gap exists between the anchor and the popup, it can be difficult to interact with tooltips that show on hover. The `hover-bridge` attribute fills the gap with an invisible element, making it easier for the pointer to move from the anchor to the popup without dismissing it.

```html:preview
<div class="popup-hover-bridge">
  <zn-popup placement="top" distance="20" hover-bridge active>
    <span slot="anchor"></span>
    <span class="popup-hover-bridge-label">With hover bridge</span>
  </zn-popup>

  <zn-popup placement="top" distance="20" active>
    <span slot="anchor"></span>
    <span class="popup-hover-bridge-label">Without hover bridge</span>
  </zn-popup>
</div>

<style>
  .popup-hover-bridge {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-hover-bridge zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-hover-bridge-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### Virtual Elements

In some cases, you may want to position the popup relative to a non-element coordinate. Virtual elements can be used for this purpose. A virtual element must contain a function called `getBoundingClientRect()` that returns a `DOMRect` object as shown below.

```html:preview
<div class="popup-virtual-element">
  <div id="virtual-element-container">
    <zn-popup id="virtual-element-popup" placement="top" active>
      <div style="
        background: var(--zn-color-neutral-900);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
      ">
        Click anywhere
      </div>
    </zn-popup>
  </div>
</div>

<script>
  const container = document.getElementById('virtual-element-container');
  const popup = document.getElementById('virtual-element-popup');

  let x = 150;
  let y = 50;

  // Create a virtual element
  const virtualElement = {
    getBoundingClientRect: () => ({
      x: x,
      y: y,
      width: 0,
      height: 0,
      top: y,
      left: x,
      right: x,
      bottom: y,
    })
  };

  // Set the anchor to the virtual element
  popup.anchor = virtualElement;

  // Update the virtual element on click
  container.addEventListener('click', (event) => {
    const rect = container.getBoundingClientRect();
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;

    // Force the popup to reposition
    popup.reposition();
  });
</script>

<style>
  .popup-virtual-element #virtual-element-container {
    position: relative;
    height: 300px;
    background: var(--zn-color-neutral-100);
    border: dashed 2px var(--zn-color-neutral-400);
    border-radius: 4px;
    cursor: crosshair;
  }
</style>
```

## Methods

### reposition()

Forces the popup to recalculate and reposition itself. This is useful when the popup's anchor or content changes dynamically.

```html:preview
<div class="popup-reposition">
  <zn-popup id="reposition-popup" placement="top" active>
    <span id="reposition-anchor" slot="anchor"></span>
    <span class="popup-reposition-label">I'll reposition!</span>
  </zn-popup>

  <br><br>

  <zn-button id="reposition-btn">Change Anchor Size</zn-button>
</div>

<script>
  const popup = document.getElementById('reposition-popup');
  const anchor = document.getElementById('reposition-anchor');
  const button = document.getElementById('reposition-btn');

  let size = 100;

  button.addEventListener('click', () => {
    size = size === 100 ? 150 : 100;
    anchor.style.width = size + 'px';
    anchor.style.height = size + 'px';

    // Force reposition after size change
    popup.reposition();
  });
</script>

<style>
  .popup-reposition {
    padding: 3rem;
  }

  .popup-reposition zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .popup-reposition-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

## Slots

### Default Slot

The popup's content is placed in the default slot.

```html:preview
<div class="popup-slot-default">
  <zn-popup placement="top" active>
    <span slot="anchor"></span>
    <div style="
      background: var(--zn-color-neutral-900);
      color: white;
      padding: 1rem;
      border-radius: 4px;
    ">
      <h4 style="margin: 0 0 0.5rem 0;">Custom Content</h4>
      <p style="margin: 0;">Any HTML can go in here!</p>
    </div>
  </zn-popup>
</div>

<style>
  .popup-slot-default {
    padding: 3rem;
  }

  .popup-slot-default zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }
</style>
```

### Anchor Slot

The anchor element is placed in the `anchor` slot.

```html:preview
<div class="popup-slot-anchor">
  <zn-popup placement="top" active>
    <zn-button slot="anchor">Anchor Button</zn-button>
    <div style="
      background: var(--zn-color-neutral-900);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    ">
      I'm anchored to the button!
    </div>
  </zn-popup>
</div>

<style>
  .popup-slot-anchor {
    padding: 3rem;
  }
</style>
```

## CSS Parts

### popup

The popup container. Useful for styling or applying animations.

```html:preview
<div class="popup-part">
  <zn-popup placement="top" active class="popup-custom">
    <span slot="anchor"></span>
    <span class="popup-part-label">Styled with ::part(popup)</span>
  </zn-popup>
</div>

<style>
  .popup-custom::part(popup) {
    background: var(--zn-color-primary-100);
    padding: 0.5rem;
    border-radius: 8px;
  }

  .popup-part {
    padding: 3rem;
  }

  .popup-part zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-part-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### arrow

The arrow element. Use this to style the arrow with custom colors or shapes.

```html:preview
<div class="popup-part-arrow">
  <zn-popup placement="top" arrow active class="popup-custom-arrow">
    <span slot="anchor"></span>
    <span class="popup-part-arrow-label">Styled with ::part(arrow)</span>
  </zn-popup>
</div>

<style>
  .popup-custom-arrow::part(arrow) {
    background: var(--zn-color-success-600);
  }

  .popup-part-arrow {
    padding: 3rem;
  }

  .popup-part-arrow zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-part-arrow-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### hover-bridge

The hover bridge element. Use this to debug or style the invisible hover bridge.

```html:preview
<div class="popup-part-bridge">
  <zn-popup placement="top" distance="20" hover-bridge active class="popup-bridge-visible">
    <span slot="anchor"></span>
    <span class="popup-part-bridge-label">Hover bridge visible</span>
  </zn-popup>
</div>

<style>
  .popup-bridge-visible::part(hover-bridge) {
    background: rgba(255, 0, 0, 0.1);
  }

  .popup-part-bridge {
    padding: 3rem;
  }

  .popup-part-bridge zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-part-bridge-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

## CSS Custom Properties

### --arrow-size

Controls the size of the arrow. The default is `6px`.

```html:preview
<div class="popup-css-arrow-size">
  <zn-popup placement="top" arrow active style="--arrow-size: 4px;">
    <span slot="anchor"></span>
    <span class="popup-css-label">4px</span>
  </zn-popup>

  <zn-popup placement="top" arrow active style="--arrow-size: 8px;">
    <span slot="anchor"></span>
    <span class="popup-css-label">8px</span>
  </zn-popup>

  <zn-popup placement="top" arrow active style="--arrow-size: 12px;">
    <span slot="anchor"></span>
    <span class="popup-css-label">12px</span>
  </zn-popup>
</div>

<style>
  .popup-css-arrow-size {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-css-arrow-size zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 80px;
    height: 80px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-css-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }
</style>
```

### --arrow-color

Controls the color of the arrow. The default is `rgb(0, 0, 0, 0.9)`.

```html:preview
<div class="popup-css-arrow-color">
  <zn-popup placement="top" arrow active style="--arrow-color: var(--zn-color-success-600);">
    <span slot="anchor"></span>
    <span class="popup-css-arrow-color-label popup-css-arrow-color-label--success">Green arrow</span>
  </zn-popup>

  <zn-popup placement="top" arrow active style="--arrow-color: var(--zn-color-error-600);">
    <span slot="anchor"></span>
    <span class="popup-css-arrow-color-label popup-css-arrow-color-label--error">Red arrow</span>
  </zn-popup>

  <zn-popup placement="top" arrow active style="--arrow-color: var(--zn-color-warning-600);">
    <span slot="anchor"></span>
    <span class="popup-css-arrow-color-label popup-css-arrow-color-label--warning">Orange arrow</span>
  </zn-popup>
</div>

<style>
  .popup-css-arrow-color {
    display: flex;
    gap: 3rem;
    padding: 3rem;
  }

  .popup-css-arrow-color zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 80px;
    height: 80px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-css-arrow-color-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    color: white;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .popup-css-arrow-color-label--success {
    background: var(--zn-color-success-600);
  }

  .popup-css-arrow-color-label--error {
    background: var(--zn-color-error-600);
  }

  .popup-css-arrow-color-label--warning {
    background: var(--zn-color-warning-600);
  }
</style>
```

### --auto-size-available-width and --auto-size-available-height

When using the `auto-size` attribute, these properties are set automatically with the available width and/or height. Use them to constrain your popup content.

```html:preview
<div class="popup-css-auto-size">
  <div class="popup-css-auto-size-scroll">
    <zn-popup placement="top" auto-size="both" active>
      <span slot="anchor"></span>
      <div class="popup-css-auto-size-content">
        This content will resize based on available space. The max-width and max-height are set using the CSS custom properties.
      </div>
    </zn-popup>
  </div>
</div>

<style>
  .popup-css-auto-size {
    height: 200px;
  }

  .popup-css-auto-size-scroll {
    width: 250px;
    height: 150px;
    overflow: auto;
    padding: 3rem;
    padding-bottom: 250px;
    padding-right: 350px;
  }

  .popup-css-auto-size zn-popup span[slot="anchor"] {
    display: inline-block;
    width: 100px;
    height: 100px;
    background: var(--zn-color-primary-600);
    border-radius: 4px;
  }

  .popup-css-auto-size-content {
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);
    overflow: auto;
    padding: 1rem;
    background: var(--zn-color-neutral-900);
    color: white;
    border-radius: 4px;
  }
</style>
```

## Accessibility

Popups are low-level primitives and do not include built-in accessibility features. It's your responsibility to ensure proper accessibility when using popups:

- Add appropriate ARIA attributes to popup content
- Ensure keyboard navigation works correctly
- Manage focus as needed
- Use semantic HTML inside the popup

For accessible overlays, consider using higher-level components like [Dropdown](/components/dropdown) or [Tooltip](/components/tooltip), which include built-in accessibility features.
