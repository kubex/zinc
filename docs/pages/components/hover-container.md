---
meta:
  title: Hover Container
  description: A popup container component that displays additional content when triggered by hover, focus, or click events. Supports multiple placements, custom positioning, and automatic hiding on blur or escape.
layout: component
---

```html:preview
<zn-hover-container content="This is helpful information that appears on hover">
  <zn-button slot="anchor">Hover over me</zn-button>
</zn-hover-container>
```

## Examples

### Basic Usage

Display content when hovering over an element.

```html:preview
<zn-hover-container content="This is a helpful tooltip">
  <zn-button slot="anchor">Hover me</zn-button>
</zn-hover-container>
```

### Custom Content Slot

Use the content slot for rich HTML content.

```html:preview
<zn-hover-container>
  <zn-button slot="anchor">Hover for details</zn-button>
  <div slot="content">
    <h4 style="margin: 0 0 5px 0;">Important Information</h4>
    <p style="margin: 0;">This is detailed information with <strong>formatting</strong>.</p>
  </div>
</zn-hover-container>
```

### Different Placements

Control where the hover container appears using the `placement` attribute.

```html:preview
<div style="display: flex; gap: 20px; flex-wrap: wrap;">
  <zn-hover-container content="Appears on top" placement="top">
    <zn-button slot="anchor">Top</zn-button>
  </zn-hover-container>

  <zn-hover-container content="Appears on right" placement="right">
    <zn-button slot="anchor">Right</zn-button>
  </zn-hover-container>

  <zn-hover-container content="Appears on bottom" placement="bottom">
    <zn-button slot="anchor">Bottom</zn-button>
  </zn-hover-container>

  <zn-hover-container content="Appears on left" placement="left">
    <zn-button slot="anchor">Left</zn-button>
  </zn-hover-container>
</div>
```

### Placement Variations

Use placement variations for more precise positioning.

```html:preview
<div style="display: flex; gap: 20px; flex-wrap: wrap;">
  <zn-hover-container content="Top Start" placement="top-start">
    <zn-button slot="anchor">Top Start</zn-button>
  </zn-hover-container>

  <zn-hover-container content="Top End" placement="top-end">
    <zn-button slot="anchor">Top End</zn-button>
  </zn-hover-container>

  <zn-hover-container content="Bottom Start" placement="bottom-start">
    <zn-button slot="anchor">Bottom Start</zn-button>
  </zn-hover-container>

  <zn-hover-container content="Bottom End" placement="bottom-end">
    <zn-button slot="anchor">Bottom End</zn-button>
  </zn-hover-container>
</div>
```

### Click Trigger

Change the trigger to click instead of hover.

```html:preview
<zn-hover-container trigger="click" content="Click to toggle this message">
  <zn-button slot="anchor">Click me</zn-button>
</zn-hover-container>
```

### Focus Trigger

Trigger on focus events, useful for form inputs.

```html:preview
<zn-hover-container trigger="focus" content="This field is required and must be a valid email">
  <zn-input slot="anchor" label="Email" placeholder="Enter email"></zn-input>
</zn-hover-container>
```

### Multiple Triggers

Combine multiple trigger types.

```html:preview
<zn-hover-container trigger="hover focus" content="Appears on hover or focus">
  <zn-input slot="anchor" label="Username" placeholder="Enter username"></zn-input>
</zn-hover-container>
```

### Custom Distance

Adjust the distance from the anchor using the `distance` attribute.

```html:preview
<div style="display: flex; gap: 20px;">
  <zn-hover-container distance="0" content="No distance">
    <zn-button slot="anchor">Distance: 0</zn-button>
  </zn-hover-container>

  <zn-hover-container distance="10" content="10px distance">
    <zn-button slot="anchor">Distance: 10</zn-button>
  </zn-hover-container>

  <zn-hover-container distance="20" content="20px distance">
    <zn-button slot="anchor">Distance: 20</zn-button>
  </zn-hover-container>
</div>
```

### Skidding

Offset the hover container along the anchor using the `skidding` attribute.

```html:preview
<div style="display: flex; gap: 20px;">
  <zn-hover-container skidding="-20" content="Skidded left">
    <zn-button slot="anchor">Skid Left</zn-button>
  </zn-hover-container>

  <zn-hover-container skidding="20" content="Skidded right">
    <zn-button slot="anchor">Skid Right</zn-button>
  </zn-hover-container>
</div>
```

### Disabled State

Disable the hover container to prevent it from showing.

```html:preview
<zn-hover-container disabled content="This won't show">
  <zn-button slot="anchor" disabled>Disabled</zn-button>
</zn-hover-container>
```

### Without Hoisting

Disable hoisting to keep the popup within the document flow.

```html:preview
<zn-hover-container hoist="false" content="This popup stays in the document flow">
  <zn-button slot="anchor">No Hoist</zn-button>
</zn-hover-container>
```

### Icon with Help Text

Add help information to icons.

```html:preview
<div style="display: flex; align-items: center; gap: 10px;">
  <span>Password Requirements</span>
  <zn-hover-container trigger="hover focus">
    <zn-icon slot="anchor" src="help" size="20" style="color: var(--zn-color-info-500); cursor: help;"></zn-icon>
    <div slot="content" style="max-width: 200px;">
      <ul style="margin: 0; padding-left: 20px;">
        <li>At least 8 characters</li>
        <li>One uppercase letter</li>
        <li>One number</li>
        <li>One special character</li>
      </ul>
    </div>
  </zn-hover-container>
</div>
```

### Form Field Help

Provide contextual help for form fields.

```html:preview
<div class="form-spacing">
  <div style="display: flex; align-items: center; gap: 5px;">
    <zn-input label="API Key" placeholder="Enter your API key"></zn-input>
    <zn-hover-container trigger="click" placement="right">
      <zn-button slot="anchor" icon="info" color="transparent" size="small"></zn-button>
      <div slot="content" style="max-width: 250px; padding: 10px;">
        <h4 style="margin: 0 0 5px 0;">Finding your API Key</h4>
        <p style="margin: 0; font-size: 0.9em;">Go to Settings &gt; Developer &gt; API Keys to generate a new key.</p>
      </div>
    </zn-hover-container>
  </div>
</div>
```

### Status Indicator

Add explanations to status indicators.

```html:preview
<div style="display: flex; gap: 15px; align-items: center;">
  <zn-hover-container content="System operational">
    <zn-badge slot="anchor" color="success">Online</zn-badge>
  </zn-hover-container>

  <zn-hover-container content="Experiencing issues">
    <zn-badge slot="anchor" color="warning">Degraded</zn-badge>
  </zn-hover-container>

  <zn-hover-container content="Service unavailable">
    <zn-badge slot="anchor" color="error">Offline</zn-badge>
  </zn-hover-container>
</div>
```

### Complex Content

Display detailed information with formatted content.

```html:preview
<zn-hover-container trigger="click" placement="bottom-start">
  <zn-button slot="anchor" icon="info">View Details</zn-button>
  <div slot="content" style="padding: 15px; max-width: 300px;">
    <h3 style="margin: 0 0 10px 0;">Product Details</h3>
    <div style="display: grid; gap: 5px; font-size: 0.9em;">
      <div><strong>SKU:</strong> ABC-12345</div>
      <div><strong>Price:</strong> $99.99</div>
      <div><strong>Stock:</strong> 42 units</div>
      <div><strong>Category:</strong> Electronics</div>
    </div>
  </div>
</zn-hover-container>
```
