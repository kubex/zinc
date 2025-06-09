---
meta:
  title: Slideout
  description: 'Slideouts, appear from the side of the screen and are used to display additional content without navigating away from the current page.'
layout: component
---

## Examples

### Basic Slideout

This is a basic sliding out component that can be triggered by a button. It includes a footer with action buttons.

```html:preview

<zn-button id="slideout-trigger">Open Basic slideout</zn-button>
<zn-slideout class="slideout-basic" trigger="slideout-trigger" label="Slideout">
  This is the slideout’s body.

  <zn-button color="default" slot="footer">Do Something</zn-button>
  <zn-button color="secondary" slot="footer" slideout-closer>Close Slideout</zn-button>
</zn-slideout>
```