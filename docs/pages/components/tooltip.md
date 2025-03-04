---
meta:
  title: Tooltip
  description: Tooltips display additional information based on a specific action.
layout: component
guidelines: |
  ### Tooltip Basics
  - Tooltips are for supplemental content
  - Keep tooltip content simple — ideally with just one or two words or a short phrase

  ### Tooltip Don'ts
  - **Don't** put essential information in a tooltip
  - **Don't** put interactive elements like buttons and links in a tooltip
  - **Don't** include elements like images in a tooltip

  ### When to Use a Tooltip
  - Use to provide brief supplemental (but not essential) information on hover
    - For example, a trash icon with the word "Delete" in a tooltip, to reinforce the purpose of the icon
    - Or a disabled "Submit" button with the words "Complete required fields" in a tooltip, to remind people why the button is disabled

  ### When to Use Something Else
  - If the supplemental information requires the use of imagery, links, or other interactions, consider a [Popup](/components/popup) or [Drawer](/components/drawer)
---

## Examples

### Basic Tooltip

Tooltips appear when a user hovers or focuses an element. They provide contextual information about the element they are paired with.

A tooltip's target is its _first child element_, so you should only wrap one element inside of the tooltip. If you need the tooltip to show up for multiple elements, nest them inside a container first.

Tooltips use `display: contents` so they won't interfere with how elements are positioned in a flex or grid layout.

```html:preview
<zn-tooltip content="This is a tooltip">
  <zn-button>Hover Me</zn-button>
</zn-tooltip>
```

### Placement

Use the `placement` attribute to set the preferred placement of the tooltip.

:::tip
**Note:** The default placement of tooltips in our Design System is `top`.
:::

```html:preview
<div class="tooltip-placement-example">
  <div class="tooltip-placement-example-row">
    <zn-tooltip content="top-start" placement="top-start">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="top" placement="top">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="top-end" placement="top-end">
      <zn-button></zn-button>
    </zn-tooltip>
  </div>

  <div class="tooltip-placement-example-row">
    <zn-tooltip content="left-start" placement="left-start">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="right-start" placement="right-start">
      <zn-button></zn-button>
    </zn-tooltip>
  </div>

  <div class="tooltip-placement-example-row">
    <zn-tooltip content="left" placement="left">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="right" placement="right">
      <zn-button></zn-button>
    </zn-tooltip>
  </div>

  <div class="tooltip-placement-example-row">
    <zn-tooltip content="left-end" placement="left-end">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="right-end" placement="right-end">
      <zn-button></zn-button>
    </zn-tooltip>
  </div>

  <div class="tooltip-placement-example-row">
    <zn-tooltip content="bottom-start" placement="bottom-start">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="bottom" placement="bottom">
      <zn-button></zn-button>
    </zn-tooltip>

    <zn-tooltip content="bottom-end" placement="bottom-end">
      <zn-button></zn-button>
    </zn-tooltip>
  </div>
</div>

<style>
  .tooltip-placement-example {
    width: 250px;
    margin: 1rem;
  }

  .tooltip-placement-example-row:after {
    content: '';
    display: table;
    clear: both;
  }

  .tooltip-placement-example zn-button {
    float: left;
    width: 2.5rem;
    margin-right: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .tooltip-placement-example-row:nth-child(1) zn-tooltip:first-child zn-button,
  .tooltip-placement-example-row:nth-child(5) zn-tooltip:first-child zn-button {
    margin-left: calc(40px + 0.25rem);
  }

  .tooltip-placement-example-row:nth-child(2) zn-tooltip:nth-child(2) zn-button,
  .tooltip-placement-example-row:nth-child(3) zn-tooltip:nth-child(2) zn-button,
  .tooltip-placement-example-row:nth-child(4) zn-tooltip:nth-child(2) zn-button {
    margin-left: calc((40px * 3) + (0.25rem * 3));
  }
</style>
```

### Click Trigger

Set the `trigger` attribute to `click` to toggle the tooltip on click instead of hover.

```html:preview
<zn-tooltip content="Click again to dismiss" trigger="click">
  <zn-button>Click to Toggle</zn-button>
</zn-tooltip>
```

### Manual Trigger

Tooltips can be controlled programmatically by setting the `trigger` attribute to `manual`. Use the `open` attribute to control when the tooltip is shown.

```html:preview
<zn-button style="margin-right: 4rem;">Toggle Manually</zn-button>

<zn-tooltip content="This is an avatar" trigger="manual" class="manual-tooltip">
  <zn-avatar label="User"></zn-avatar>
</zn-tooltip>

<script>
  const tooltip = document.querySelector('.manual-tooltip');
  const toggle = tooltip.previousElementSibling;

  toggle.addEventListener('click', () => (tooltip.open = !tooltip.open));
</script>
```

### Removing Arrows

You can control the size of tooltip arrows by overriding the `--zn-tooltip-arrow-size` design token. To remove them, set the value to `0` as shown below.

:::warning
**Note:** Tooltips without arrows are not the standard tooltip pattern in our Design System, and there is no Figma component for this option. Please check with the design team before using this option.
:::

```html:preview
<zn-tooltip content="This is a tooltip" style="--zn-tooltip-arrow-size: 0;">
  <zn-button>No Arrow</zn-button>
</zn-tooltip>
```

<!-- To override it globally, set it in a root block in your stylesheet after the Shoelace stylesheet is loaded.

```css
:root {
  --zn-tooltip-arrow-size: 0;
}
``` -->

### HTML in Tooltips

Use the `content` slot to create tooltips with HTML content. Tooltips are designed only for text and presentational elements. Avoid placing interactive content, such as buttons, links, and form controls, in a tooltip.

```html:preview
<zn-tooltip>
  <div slot="content">I'm not <strong>just</strong> a tooltip, I'm a <em>tooltip</em> with HTML!</div>

  <zn-button>Hover me</zn-button>
</zn-tooltip>
```

### Setting a Maximum Width

Use the `--max-width` custom property to change the width the tooltip can grow to before wrapping occurs.

:::warning
**Note:** The default `max-width` for Design System tooltips is 240px (15rem). Please check with the design team before using this option to override this `max-width` setting.
:::

```html:preview
<zn-tooltip style="--max-width: 80px;" content="This tooltip will wrap after only 80 pixels.">
  <zn-button>Hover me</zn-button>
</zn-tooltip>
```

### Hoisting

Tooltips will be clipped if they're inside a container that has `overflow: auto|hidden|scroll`. The `hoist` attribute forces the tooltip to use a fixed positioning strategy, allowing it to break out of the container. In this case, the tooltip will be positioned relative to its [containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#Identifying_the_containing_block), which is usually the viewport unless an ancestor uses a `transform`, `perspective`, or `filter`. [Refer to this page](https://developer.mozilla.org/en-US/docs/Web/CSS/position#fixed) for more details.

```html:preview
<div class="tooltip-hoist">
  <zn-tooltip content="This is a tooltip">
    <zn-button>No Hoist</zn-button>
  </zn-tooltip>

  <zn-tooltip content="This is a tooltip" hoist>
    <zn-button>Hoist</zn-button>
  </zn-tooltip>
</div>

<style>
  .tooltip-hoist {
    position: relative;
    border: solid 2px var(--zn-panel-border-color);
    overflow: hidden;
    padding: var(--zn-spacing-medium);
  }
</style>
```