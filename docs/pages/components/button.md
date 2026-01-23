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

<br>
<br>

<zn-button color="success" auto-click auto-click-delay="10000" loading-text="Accepting">
  Test Auto Button
  <zn-style slot="cancel" margin="l">
    <zn-button
      icon="call_end"
      icon-size="18"
      type="button"
      color="error"
    ></zn-button></zn-style>
</zn-button>
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

Use the `icon` attribute to add an icon to the button.

```html:preview
<zn-button icon="add_circle">Icon</zn-button>
<zn-button icon="file_download" color="secondary">Icon</zn-button>
<zn-button icon="check" color="success">Icon</zn-button>
<zn-button icon="help" color="info">Icon</zn-button>
<zn-button icon="report_problem" color="warning">Icon</zn-button>
<zn-button icon="cancel" color="error">Icon</zn-button>
<zn-button icon="pending" color="transparent">Icon</zn-button>
```

### Icon-Only Buttons

Buttons can be used with just an icon and no text by omitting the button label.

```html:preview
<zn-button icon="settings"></zn-button>
<zn-button icon="favorite" color="error"></zn-button>
<zn-button icon="share" color="success"></zn-button>
<zn-button icon="add" color="info"></zn-button>
```

### Icon Position

Use the `icon-position` attribute to control whether the icon appears before or after the button text.

```html:preview
<zn-button icon="arrow_back" icon-position="left">Back</zn-button>
<zn-button icon="arrow_forward" icon-position="right">Next</zn-button>
```

### Icon Size and Color

Use `icon-size` and `icon-color` attributes to customize the icon appearance.

```html:preview
<zn-button icon="star" icon-size="24" icon-color="warning">Large Star</zn-button>
<zn-button icon="favorite" icon-size="20" icon-color="error">Favorite</zn-button>
<zn-button icon="info" icon-size="16" icon-color="info">Info</zn-button>
```

### Square Buttons

Use the `square` attribute to create square-shaped buttons, useful for icon-only buttons.

```html:preview
<zn-button icon="delete" square></zn-button>
<zn-button icon="edit" square color="info"></zn-button>
<zn-button icon="save" square color="success"></zn-button>
<zn-button icon="close" square color="error"></zn-button>
```

### Grow

Use the `grow` attribute to make the button expand to fill its container width.

```html:preview
<zn-button grow>Full Width Button</zn-button>
<zn-button grow color="success">Submit Form</zn-button>
```

### Loading State

Use the `loading` attribute to show a loading state on the button.

```html:preview
<zn-button loading loading-text="Processing...">Click Me</zn-button>
<zn-button loading loading-text="Saving" color="success">Save</zn-button>
<zn-button loading loading-text="Loading" color="info">Load Data</zn-button>
```

### Notifications

Use the `notification` attribute to display a notification badge on the button. Positive numbers show the count, while negative numbers show a dot indicator.

```html:preview
<zn-button icon="notifications" notification="5">Notifications</zn-button>
<zn-button icon="mail" notification="12" color="info">Messages</zn-button>
<zn-button icon="chat" notification="-1" color="success">Chat</zn-button>
<zn-button icon="notifications" notification="0">No Notifications</zn-button>
```

Use `muted-notifications` for a subtle notification style.

```html:preview
<zn-button icon="notifications" notification="3" muted-notifications>Muted</zn-button>
```

### Tooltip

Use the `tooltip` attribute to add a tooltip to the button.

```html:preview
<zn-button icon="info" tooltip="This button provides additional information"></zn-button>
<zn-button icon="help" tooltip="Click for help" color="info">Help</zn-button>
```

### Links

Buttons can work as hyperlinks by using the `href` attribute.

```html:preview
<zn-button href="https://example.com" target="_blank">External Link</zn-button>
<zn-button href="/dashboard" icon="dashboard">Dashboard</zn-button>
<zn-button href="/settings" icon="settings" text>Settings</zn-button>
```

### Form Integration

Buttons can be used in forms with various form-related attributes.

```html:preview
<form>
  <zn-input name="email" type="email" label="Email" value="test@example.com"></zn-input>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>
```

You can also override form attributes using `formaction`, `formmethod`, `formenctype`, `formnovalidate`, and `formtarget`.

```html:preview
<form action="/default" method="post">
  <zn-input name="query" label="Search"></zn-input>
  <br />
  <zn-button type="submit">Default Submit</zn-button>
  <zn-button type="submit" formaction="/search" formmethod="get">Search</zn-button>
</form>
```

### Dropdown Closer

Use the `dropdown-closer` attribute to automatically close parent dropdowns when the button is clicked.

```html:preview
<zn-dropdown>
  <zn-button slot="trigger">Menu</zn-button>
  <zn-menu>
    <zn-menu-item>
      <zn-button dropdown-closer text>Close on Click</zn-button>
    </zn-menu-item>
    <zn-menu-item>
      <zn-button text>Stays Open</zn-button>
    </zn-menu-item>
  </zn-menu>
</zn-dropdown>
```
