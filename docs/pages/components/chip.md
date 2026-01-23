---
meta:
  title: Chip
  description: Chips are compact elements that represent labels, tags, categories, or other small pieces of information.
layout: component
---

```html:preview
<zn-chip>Default Chip</zn-chip>
<zn-chip type="primary">Primary</zn-chip>
<zn-chip type="info">Info</zn-chip>
<zn-chip type="success">Success</zn-chip>
<zn-chip type="warning">Warning</zn-chip>
<zn-chip type="error">Error</zn-chip>
```

## Examples

### Basic Chips

A basic chip displays text content with default neutral styling.

```html:preview
<zn-chip>Basic Chip</zn-chip>
<zn-chip>Category</zn-chip>
<zn-chip>Tag</zn-chip>
<zn-chip>Label</zn-chip>
```

### Types

Use the `type` attribute to change the semantic color and styling of the chip. Available types are: `neutral` (default), `primary`, `info`, `success`, `warning`, `error`, `transparent`, and `custom`.

```html:preview
<zn-chip type="neutral">Neutral</zn-chip>
<zn-chip type="primary">Primary</zn-chip>
<zn-chip type="info">Info</zn-chip>
<zn-chip type="success">Success</zn-chip>
<zn-chip type="warning">Warning</zn-chip>
<zn-chip type="error">Error</zn-chip>
<zn-chip type="transparent">Transparent</zn-chip>
```

### With Icons

Use the `icon` attribute to add an icon to the chip. Icons appear on the left side of the chip content.

```html:preview
<zn-chip icon="home">Home</zn-chip>
<zn-chip icon="person" type="primary">User</zn-chip>
<zn-chip icon="check_circle" type="success">Verified</zn-chip>
<zn-chip icon="info" type="info">Information</zn-chip>
<zn-chip icon="warning" type="warning">Warning</zn-chip>
<zn-chip icon="error" type="error">Error</zn-chip>
```

### Icon Size

Use the `icon-size` attribute to control the size of the icon within the chip.

```html:preview
<zn-chip icon="star" icon-size="14">Small Icon</zn-chip>
<zn-chip icon="star" icon-size="18">Default Icon</zn-chip>
<zn-chip icon="star" icon-size="24">Large Icon</zn-chip>
```

### Icon-Only Chips

Chips can be used with just an icon by omitting the text content.

```html:preview
<zn-chip icon="home"></zn-chip>
<zn-chip icon="person" type="primary"></zn-chip>
<zn-chip icon="favorite" type="error"></zn-chip>
<zn-chip icon="star" type="warning"></zn-chip>
<zn-chip icon="settings" type="info"></zn-chip>
<zn-chip icon="check_circle" type="success"></zn-chip>
```

### Sizes

Use the `size` attribute to control the chip's size. Available sizes are `small`, `medium`, and `large`.

```html:preview
<zn-chip size="small">Small</zn-chip>
<zn-chip>Default</zn-chip>
<zn-chip size="medium">Medium</zn-chip>
<zn-chip size="large">Large</zn-chip>
<br /><br />
<zn-chip size="small" icon="home">Small</zn-chip>
<zn-chip icon="home">Default</zn-chip>
<zn-chip size="medium" icon="home">Medium</zn-chip>
<zn-chip size="large" icon="home">Large</zn-chip>
```

### Removable Chips

Chips can include an action button, typically used for removing or closing the chip. Use the `action` slot to add interactive elements.

```html:preview
<zn-chip icon="tag" type="info">
  Removable Tag
  <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
</zn-chip>
<zn-chip icon="label" type="success">
  Another Tag
  <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
</zn-chip>
<zn-chip icon="bookmark" type="warning">
  Bookmark
  <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
</zn-chip>
```

### Action Slot

The `action` slot can be used for any interactive element, not just close buttons.

```html:preview
<zn-chip icon="notifications" type="primary">
  Notifications
  <zn-button icon="settings" slot="action" size="content" icon-size="14" color="transparent"></zn-button>
</zn-chip>
<zn-chip icon="download" type="info">
  Download
  <zn-button icon="arrow_drop_down" slot="action" size="content" icon-size="16" color="transparent"></zn-button>
</zn-chip>
```

### Flush Spacing

Use the `flush`, `flush-x`, or `flush-y` attributes to remove padding from the chip.

```html:preview
<div style="display: flex; gap: 8px; align-items: center;">
  <zn-chip>Default Padding</zn-chip>
  <zn-chip flush>Flush</zn-chip>
  <zn-chip flush-x>Flush X</zn-chip>
  <zn-chip flush-y>Flush Y</zn-chip>
</div>
```

### Custom Color

Use the `custom` type with the `--chip-color-override` CSS variable to create chips with custom colors.

```html:preview
<zn-chip type="custom" style="--chip-color-override: #8b5cf6;">Custom Purple</zn-chip>
<zn-chip type="custom" style="--chip-color-override: #ec4899;">Custom Pink</zn-chip>
<zn-chip type="custom" style="--chip-color-override: #10b981;">Custom Green</zn-chip>
<zn-chip type="custom" icon="palette" style="--chip-color-override: #f59e0b;">Custom Orange</zn-chip>
```

### Transparent Chips

Transparent chips have no background or border, useful for subtle labeling.

```html:preview
<zn-chip type="transparent">Transparent</zn-chip>
<zn-chip icon="label" type="transparent">Tag</zn-chip>
<zn-chip icon="category" type="transparent">Category</zn-chip>
<zn-chip icon="bookmark" type="transparent">Bookmark</zn-chip>
```

### Chip Groups

Chips work well when grouped together to represent multiple tags or categories.

```html:preview
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <zn-chip icon="code" type="primary">JavaScript</zn-chip>
  <zn-chip icon="code" type="primary">TypeScript</zn-chip>
  <zn-chip icon="code" type="primary">Python</zn-chip>
  <zn-chip icon="code" type="primary">Go</zn-chip>
  <zn-chip icon="code" type="primary">Rust</zn-chip>
</div>
<br />
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <zn-chip icon="tag" type="info">
    Frontend
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
  <zn-chip icon="tag" type="info">
    Backend
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
  <zn-chip icon="tag" type="info">
    Database
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
  <zn-chip icon="tag" type="info">
    DevOps
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
</div>
```

### Status Indicators

Chips are excellent for displaying status information with appropriate semantic colors.

```html:preview
<div style="display: flex; gap: 8px; flex-direction: column; align-items: flex-start;">
  <zn-chip icon="check_circle" type="success">Active</zn-chip>
  <zn-chip icon="schedule" type="warning">Pending</zn-chip>
  <zn-chip icon="cancel" type="error">Inactive</zn-chip>
  <zn-chip icon="info" type="info">In Review</zn-chip>
  <zn-chip icon="block">Blocked</zn-chip>
</div>
```

### User Tags

Chips can be used to display user information or assignments.

```html:preview
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <zn-chip icon="person" type="primary">John Doe</zn-chip>
  <zn-chip icon="person" type="primary">Jane Smith</zn-chip>
  <zn-chip icon="person" type="primary">Bob Johnson</zn-chip>
  <zn-chip icon="person" type="primary">
    Alice Williams
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
</div>
```

### Interactive Example

Here's a complete example demonstrating removable chips with JavaScript interaction.

```html:preview
<div id="chip-container" style="display: flex; gap: 8px; flex-wrap: wrap;">
  <zn-chip icon="tag" type="info">
    Design
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
  <zn-chip icon="tag" type="info">
    Development
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
  <zn-chip icon="tag" type="info">
    Testing
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
  <zn-chip icon="tag" type="info">
    Documentation
    <zn-button icon="close" slot="action" size="content" icon-size="12" color="transparent"></zn-button>
  </zn-chip>
</div>

<script type="module">
  const container = document.getElementById('chip-container');

  container.addEventListener('click', (e) => {
    const button = e.target.closest('zn-button');
    if (button && button.hasAttribute('slot') && button.getAttribute('slot') === 'action') {
      const chip = button.closest('zn-chip');
      if (chip) {
        chip.style.transition = 'opacity 0.2s, transform 0.2s';
        chip.style.opacity = '0';
        chip.style.transform = 'scale(0.8)';
        setTimeout(() => chip.remove(), 200);
      }
    }
  });
</script>
```


