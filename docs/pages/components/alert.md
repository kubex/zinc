---
meta:
  title: Alert
  description: Alerts are used to display important messages inline or as toast notifications.
layout: component
---

```html:preview
<zn-alert caption="Important Notice">This is a basic alert with a caption and description.</zn-alert>
```

## Examples

### Basic Alert

A basic alert with just a caption.

```html:preview
<zn-alert caption="This is an alert">This is the description text that provides more details.</zn-alert>
```

### Without Caption

Alerts can also be used without a caption, displaying only the content.

```html:preview
<zn-alert>This alert has no caption, just content.</zn-alert>
```

### Levels

Use the `level` attribute to change the semantic color and styling of the alert. Available levels are: `primary`, `error`, `info`, `success`, `warning`, `note`, and `cosmic`.

```html:preview
<zn-alert caption="Primary Alert" level="primary">This is a primary alert.</zn-alert>
<br />
<zn-alert caption="Error Alert" level="error">This indicates an error or problem.</zn-alert>
<br />
<zn-alert caption="Info Alert" level="info">This provides informational content.</zn-alert>
<br />
<zn-alert caption="Success Alert" level="success">This indicates a successful action.</zn-alert>
<br />
<zn-alert caption="Warning Alert" level="warning">This warns about potential issues.</zn-alert>
<br />
<zn-alert caption="Note Alert" level="note">This is a general note.</zn-alert>
<br />
<zn-alert caption="Cosmic Alert" level="cosmic">This is a special cosmic-themed alert.</zn-alert>
```

### With Icons

Use the `icon` attribute to add an icon to the alert. Icons appear on the left side of the alert.

```html:preview
<zn-alert caption="Success!" icon="check_circle" level="success">
  Your changes have been saved successfully.
</zn-alert>
<br />
<zn-alert caption="Warning" icon="warning" level="warning">
  Please review the information before proceeding.
</zn-alert>
<br />
<zn-alert caption="Error" icon="error" level="error">
  An error occurred while processing your request.
</zn-alert>
<br />
<zn-alert caption="Information" icon="info" level="info">
  Here's some helpful information you should know.
</zn-alert>
```

### With Actions

Use the `actions` slot to add buttons or other interactive elements to the alert.

```html:preview
<zn-alert caption="New updates available" icon="system_update" level="info">
  A new version of the app is ready to install.
  <zn-button slot="actions" color="info" size="small">Update Now</zn-button>
  <zn-button slot="actions" color="transparent" size="small">Later</zn-button>
</zn-alert>
<br />
<zn-alert caption="Confirm deletion" icon="delete" level="error">
  Are you sure you want to delete this item? This action cannot be undone.
  <zn-button slot="actions" color="error" size="small">Delete</zn-button>
  <zn-button slot="actions" color="secondary" size="small">Cancel</zn-button>
</zn-alert>
```

### Collapsible Alerts

Use the `collapse` attribute to make the alert icon clickable for dismissing the alert.

```html:preview
<zn-alert caption="Dismissible Alert" icon="close" collapse level="info">
  Click the icon to dismiss this alert.
</zn-alert>
<br />
<zn-alert caption="Another Dismissible Alert" icon="cancel" collapse level="warning">
  You can click the icon to hide this warning.
</zn-alert>
```

### Sizes

Use the `size` attribute to control the alert's size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<zn-alert caption="Small Alert" size="small" level="info">This is a small-sized alert.</zn-alert>
<br />
<zn-alert caption="Medium Alert" size="medium" level="success">This is a medium-sized alert (default).</zn-alert>
<br />
<zn-alert caption="Large Alert" size="large" level="warning">This is a large-sized alert.</zn-alert>
```

### Complex Content

Alerts can contain rich HTML content including lists, links, and formatted text.

```html:preview
<zn-alert caption="System Requirements" icon="info" level="info">
  <p>Before proceeding, please ensure:</p>
  <ul>
    <li>Your browser is up to date</li>
    <li>JavaScript is enabled</li>
    <li>You have a stable internet connection</li>
  </ul>
  <p>Need help? <a href="#">Contact support</a></p>
  <zn-button slot="actions" color="info" size="small">Continue</zn-button>
</zn-alert>
```

### Programmatic Dismissal

Alerts can be dismissed programmatically using the `hideAlert()` method.

```html:preview
<zn-alert id="dismissible-alert" caption="Auto-dismiss Alert" icon="timer" level="warning">
  This alert will automatically dismiss in 5 seconds.
</zn-alert>

<script type="module">
  const alert = document.getElementById('dismissible-alert');
  setTimeout(() => {
    alert.hideAlert();
  }, 5000);
</script>
```