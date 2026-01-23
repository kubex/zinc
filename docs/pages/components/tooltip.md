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
**Note:** Tooltips without arrows are not the standard tooltip pattern in our Design System.
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

### Distance and Skidding

Use the `distance` and `skidding` attributes to fine-tune the tooltip's position. The `distance` attribute controls how far the tooltip is from the anchor element, while `skidding` offsets the tooltip along the anchor element.

```html:preview
<div style="display: flex; gap: 2rem; margin: 2rem 0;">
  <zn-tooltip content="Distance: 8px" distance="8">
    <zn-button>Distance 8</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Distance: 16px" distance="16">
    <zn-button>Distance 16</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Skidding: 20px" skidding="20">
    <zn-button>Skidding 20</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Distance: 12, Skidding: 15" distance="12" skidding="15">
    <zn-button>Both</zn-button>
  </zn-tooltip>
</div>
```

### Disabled Tooltips

Use the `disabled` attribute to disable a tooltip. The tooltip will not show when disabled.

```html:preview
<zn-tooltip content="This tooltip is disabled" disabled>
  <zn-button>Disabled Tooltip</zn-button>
</zn-tooltip>

<zn-tooltip content="This tooltip is enabled">
  <zn-button>Enabled Tooltip</zn-button>
</zn-tooltip>

<script>
  const disabledTooltip = document.querySelector('zn-tooltip[disabled]');
  const toggleButton = document.createElement('zn-button');
  toggleButton.textContent = 'Toggle Disabled';
  toggleButton.style.marginLeft = '1rem';
  toggleButton.addEventListener('click', () => {
    disabledTooltip.disabled = !disabledTooltip.disabled;
  });
  disabledTooltip.parentElement.appendChild(toggleButton);
</script>
```

### Focus Trigger

Use the `trigger` attribute with value `focus` to show the tooltip only when the anchor element receives focus.

```html:preview
<zn-tooltip content="Focus on the input to see this" trigger="focus">
  <zn-input placeholder="Focus me"></zn-input>
</zn-tooltip>
```

### Hover and Focus Trigger

The default trigger is `hover focus`, which shows the tooltip on both hover and focus events.

```html:preview
<zn-tooltip content="Hover or focus to see this" trigger="hover focus">
  <zn-button>Hover or Focus</zn-button>
</zn-tooltip>
```

### Multiple Trigger Types

You can combine multiple trigger types by separating them with spaces.

```html:preview
<div style="display: flex; gap: 1rem;">
  <zn-tooltip content="Hover only" trigger="hover">
    <zn-button>Hover</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Click only" trigger="click">
    <zn-button>Click</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Focus only" trigger="focus">
    <zn-button>Focus</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Hover and click" trigger="hover click">
    <zn-button>Hover & Click</zn-button>
  </zn-tooltip>
</div>
```

## Events

Tooltips emit events when they show and hide, allowing you to respond to these state changes.

### Show and Hide Events

The `zn-show` event is emitted when the tooltip begins to show, and `zn-hide` is emitted when it begins to hide.

```html:preview
<div class="tooltip-events">
  <zn-tooltip content="Hover me to trigger events">
    <zn-button>Event Demo</zn-button>
  </zn-tooltip>

  <div class="event-log">
    <strong>Event Log:</strong>
    <ul id="event-list"></ul>
  </div>
</div>

<script>
  const tooltip = document.querySelector('.tooltip-events zn-tooltip');
  const eventList = document.getElementById('event-list');

  ['zn-show', 'zn-after-show', 'zn-hide', 'zn-after-hide'].forEach(eventName => {
    tooltip.addEventListener(eventName, () => {
      const li = document.createElement('li');
      li.textContent = `${eventName} - ${new Date().toLocaleTimeString()}`;
      eventList.insertBefore(li, eventList.firstChild);

      // Keep only last 5 events
      if (eventList.children.length > 5) {
        eventList.removeChild(eventList.lastChild);
      }
    });
  });
</script>

<style>
  .tooltip-events {
    display: flex;
    gap: 2rem;
    align-items: start;
  }

  .event-log {
    background: var(--zn-color-neutral-50);
    padding: 1rem;
    border-radius: 4px;
    min-width: 300px;
  }

  .event-log ul {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
  }

  .event-log li {
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--zn-color-neutral-200);
  }

  .event-log li:last-child {
    border-bottom: none;
  }
</style>
```

### After Show and After Hide Events

The `zn-after-show` event is emitted after the tooltip is fully shown, and `zn-after-hide` is emitted after it is fully hidden.

```html:preview
<zn-tooltip content="Open and close events">
  <zn-button id="after-events-btn">After Events Demo</zn-button>
</zn-tooltip>

<div id="after-events-status" style="margin-top: 1rem; padding: 0.5rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  Status: <span id="status-text">Ready</span>
</div>

<script>
  const afterTooltip = document.querySelector('#after-events-btn').parentElement;
  const statusText = document.getElementById('status-text');

  afterTooltip.addEventListener('zn-after-show', () => {
    statusText.textContent = 'Tooltip fully shown';
    statusText.style.color = 'var(--zn-color-success-600)';
  });

  afterTooltip.addEventListener('zn-after-hide', () => {
    statusText.textContent = 'Tooltip fully hidden';
    statusText.style.color = 'var(--zn-color-neutral-600)';
  });
</script>
```

## Methods

Tooltips provide methods to programmatically control their visibility.

### Show Method

Call the `show()` method to display the tooltip programmatically. This method returns a promise that resolves after the `zn-after-show` event is emitted.

```html:preview
<zn-button id="show-method-btn">Show Tooltip Programmatically</zn-button>

<zn-tooltip content="Programmatically shown!" trigger="manual" class="show-method-tooltip">
  <zn-icon src="info" size="24"></zn-icon>
</zn-tooltip>

<script>
  const showBtn = document.getElementById('show-method-btn');
  const showTooltip = document.querySelector('.show-method-tooltip');

  showBtn.addEventListener('click', async () => {
    await showTooltip.show();
    console.log('Tooltip is now visible');

    // Automatically hide after 3 seconds
    setTimeout(() => {
      showTooltip.hide();
    }, 3000);
  });
</script>
```

### Hide Method

Call the `hide()` method to hide the tooltip programmatically.

```html:preview
<div style="display: flex; gap: 1rem; align-items: center;">
  <zn-button id="toggle-show-btn">Show</zn-button>
  <zn-button id="toggle-hide-btn" color="error">Hide</zn-button>

  <zn-tooltip content="Control me with buttons!" trigger="manual" class="hide-method-tooltip">
    <zn-icon src="star" size="32"></zn-icon>
  </zn-tooltip>
</div>

<script>
  const hideTooltip = document.querySelector('.hide-method-tooltip');
  const showMethodBtn = document.getElementById('toggle-show-btn');
  const hideMethodBtn = document.getElementById('toggle-hide-btn');

  showMethodBtn.addEventListener('click', () => {
    hideTooltip.show();
  });

  hideMethodBtn.addEventListener('click', () => {
    hideTooltip.hide();
  });
</script>
```

## Slots

Tooltips provide slots for customizing content and defining the anchor element.

### Default Slot (Content)

The default slot or the `content` slot can be used to add content to the tooltip. Use the slot for HTML content and the `content` attribute for simple text.

```html:preview
<zn-tooltip>
  <div slot="content">
    <strong>Rich Content</strong>
    <p style="margin: 0.25rem 0 0 0;">This tooltip contains <em>formatted</em> text!</p>
  </div>
  <zn-button>Rich Tooltip</zn-button>
</zn-tooltip>
```

### Anchor Slot

The anchor slot (default unnamed slot) defines the element that triggers the tooltip. This should be a single element.

```html:preview
<zn-tooltip content="I'm anchored to this icon">
  <zn-icon src="help_outline" size="32"></zn-icon>
</zn-tooltip>

<zn-tooltip content="I'm anchored to this input" style="margin-left: 2rem;">
  <zn-input placeholder="Hover over me"></zn-input>
</zn-tooltip>
```

### Complex Anchor

When you need multiple elements as the anchor, wrap them in a container.

```html:preview
<zn-tooltip content="This tooltip anchors to the entire group">
  <div style="display: flex; gap: 0.5rem; align-items: center;">
    <zn-icon src="account_circle" size="24"></zn-icon>
    <span>John Doe</span>
    <zn-icon src="verified" size="20"></zn-icon>
  </div>
</zn-tooltip>
```

## CSS Custom Properties

Tooltips can be customized using CSS custom properties.

### Arrow Size

Control the size of the tooltip arrow using the `--zn-tooltip-arrow-size` custom property.

```html:preview
<div style="display: flex; gap: 1rem;">
  <zn-tooltip content="Default arrow">
    <zn-button>Default</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Large arrow" style="--zn-tooltip-arrow-size: 12px;">
    <zn-button>Large Arrow</zn-button>
  </zn-tooltip>

  <zn-tooltip content="Extra large arrow" style="--zn-tooltip-arrow-size: 16px;">
    <zn-button>XL Arrow</zn-button>
  </zn-tooltip>
</div>
```

### Background and Text Color

Customize the tooltip appearance with CSS custom properties.

```html:preview
<div style="display: flex; gap: 1rem;">
  <zn-tooltip
    content="Custom styled tooltip"
    style="
      --zn-tooltip-background-color: var(--zn-color-success-600);
      --zn-tooltip-color: white;
    ">
    <zn-button color="success">Success Style</zn-button>
  </zn-tooltip>

  <zn-tooltip
    content="Error tooltip"
    style="
      --zn-tooltip-background-color: var(--zn-color-error-600);
      --zn-tooltip-color: white;
    ">
    <zn-button color="error">Error Style</zn-button>
  </zn-tooltip>
</div>
```

## Accessibility

Tooltips are built with accessibility in mind:

- The tooltip uses `role="tooltip"` for proper semantics
- The tooltip content has `aria-live="polite"` when open to announce changes to screen readers
- Keyboard navigation is supported with Escape key to dismiss
- Focus management works with the `focus` trigger option

### Keyboard Support

When a tooltip is open, you can press the `Escape` key to hide it.

```html:preview
<zn-tooltip content="Press Escape to close" trigger="click">
  <zn-button>Click me, then press Escape</zn-button>
</zn-tooltip>
```