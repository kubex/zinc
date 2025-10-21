---
meta:
  title: Button
  description: Buttons represent actions that are available to the user.
layout: component
---

```html:preview
<zn-button>Button</zn-button>
```

## Examples

### Auto Click

The `auto-click` attribute can be added to a button to make it automatically click after a given time

```html:preview
<zn-button auto-click>
  Test Auto Button
</zn-button auto-click>

<br>
<br>

<zn-button color="transparent" auto-click auto-click-delay="5000">
  Test Auto Button

  <zn-button
    slot="cancel"
    icon="close"
    icon-size="18"
    type="button"
    color="transparent"
  ></zn-button>
</zn-button auto-click>
```

### Variants

Use the `color` attribute to set the button's color.

```html:preview
<zn-button color="default">Default</zn-button>
<zn-button color="secondary">Secondary</zn-button>
<zn-button color="success">Success</zn-button>
<zn-button color="info">Info</zn-button>
<zn-button color="warning">Warning</zn-button>
<zn-button color="error">Error</zn-button>
<zn-button color="transparent">Transparent</zn-button>
```

### Sizes

Use the `size` attribute to set the button's size.

```html:preview
<zn-button size="content">Content</zn-button>
<zn-button size="x-small">X Small</zn-button>
<zn-button size="small">Small</zn-button>
<zn-button size="medium">Medium</zn-button>
<zn-button size="large">Large</zn-button>
```

### Outline

Use the `outline` attribute to set the button's outline.

```html:preview
<zn-button outline>Outline</zn-button>
<zn-button outline color="secondary">Outline</zn-button>
<zn-button outline color="success">Outline</zn-button>
<zn-button outline color="info">Outline</zn-button>
<zn-button outline color="warning">Outline</zn-button>
<zn-button outline color="error">Outline</zn-button>
<zn-button outline color="transparent">Outline</zn-button>
```

### Text

Use the `text` attribute to set the button's style to text.

```html:preview
<zn-button text>Outline</zn-button>
<zn-button text color="secondary">Text</zn-button>
<zn-button text color="success">Text</zn-button>
<zn-button text color="info">Text</zn-button>
<zn-button text color="warning">Text</zn-button>
<zn-button text color="error">Text</zn-button>
<zn-button text color="transparent">Text</zn-button>
```

### Icon

Use the `icon` attribute to set the button's icon.

```html:preview
<zn-button icon="add_circle">Icon</zn-button>
<zn-button icon="file_download" color="secondary">Icon</zn-button>
<zn-button icon="check" color="success">Icon</zn-button>
<zn-button icon="help" color="info">Icon</zn-button>
<zn-button icon="report_problem" color="warning">Icon</zn-button>
<zn-button icon="cancel" color="error">Icon</zn-button>
<zn-button icon="pending" color="transparent">Icon</zn-button>
```
