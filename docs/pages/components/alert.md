---
meta:
  title: Alert
  description: Alerts are used to display important messages inline or as toast notifications.
layout: component
---

## Examples

### Basic Alert

```html:preview
<zn-alert open>
  <zn-icon slot="icon" src="info"></sl-icon>
  <div slot="header">This is the alert header</div>
  This is the alert message. Keep it simple!
</zn-alert>
```

:::tip
Alerts will not be visible if the `open` attribute is not present.
:::

### Variants

Set the `variant` attribute to change the alert's variant.

```html:preview
<zn-alert variant="primary" open>
  <sl-icon slot="icon" library="fa" name="fas-circle-info"></sl-icon>
  <div slot="header">We’ve simplified your login experience</div>
  You can now log in to both apps with one set of credentials.
</zn-alert>

<br />

<zn-alert variant="success" open>
  <sl-icon slot="icon" library="fa" name="fas-circle-check"></sl-icon>
  <div slot="header">Request approved</div>
  This request was approved on April 25, 2024.
</zn-alert>

<br />

<zn-alert variant="warning" open>
  <sl-icon slot="icon" library="fa" name="fas-triangle-exclamation"></sl-icon>
  <div slot="header">This view is currently hidden from shareholders</div>
  Go to <a class="ts-text-link" href="#">Company settings</a> to edit the visibility of this page.
</zn-alert>

<br />

<zn-alert variant="danger" open>
  <sl-icon slot="icon" library="fa" name="fas-circle-exclamation"></sl-icon>
  <div slot="header">Your payment is past due</div>
  To avoid late fees, pay your minimum amount due today.
</zn-alert>
```

### Closable

Add the `closable` attribute to show a close button that will hide the alert.

```html:preview
<zn-alert variant="primary" open closable class="alert-closable">
  <sl-icon slot="icon" library="fa" name="fas-circle-info"></sl-icon>
  You can close this alert any time!
</zn-alert>

<script>
  const alert = document.querySelector('.alert-closable');
  alert.addEventListener('sl-after-hide', () => {
    setTimeout(() => (alert.open = true), 2000);
  });
</script>
```

### Without Icons

Icons are optional. Simply omit the `icon` slot if you don't want them.

```html:preview
<zn-alert variant="primary" open> Nothing fancy here, just a simple alert. </zn-alert>
```

### Duration

Set the `duration` attribute to automatically hide an alert after a period of time. This is useful for alerts that don't
require acknowledgement.

```html:preview
<div class="alert-duration">
  <zn-button variant="primary">Show Alert</zn-button>

  <zn-alert variant="primary" duration="3000" closable>
    <sl-icon slot="icon" library="fa" name="fas-circle-info"></sl-icon>
    This alert will automatically hide itself after three seconds, unless you interact with it.
  </zn-alert>
</div>

<script>
  const container = document.querySelector('.alert-duration');
  const button = container.querySelector('zn-button');
  const alert = container.querySelector('zn-alert');

  button.addEventListener('click', () => alert.show());
</script>

<style>
  .alert-duration zn-alert {
    margin-top: var(--sl-spacing-medium);
  }
</style>
```

### Toast Notifications

To display an alert as a toast notification, or "toast", create the alert and call its `toast()` method. This will move
the alert out of its position in the DOM and into [the toast stack](#the-toast-stack) where it will be shown. Once
dismissed, it will be removed from the DOM completely. To reuse a toast, store a reference to it and call `toast()`
again later on.

You should always use the `closable` attribute so users can dismiss the notification. It's also common to set a
reasonable `duration` when the notification doesn't require acknowledgement.

```html:preview
<div class="alert-toast">
  <zn-button variant="primary">Primary</zn-button>
  <zn-button variant="success">Success</zn-button>
  <zn-button variant="danger">Danger</zn-button>

<zn-alert variant="primary" duration="3000" closable>
  <sl-icon slot="icon" library="fa" name="fas-circle-info"></sl-icon>
  <div slot="header">We’ve simplified your login experience</div>
  You can now log in to both apps with one set of credentials.
</zn-alert>

<zn-alert variant="success" duration="3000" closable>
  <sl-icon slot="icon" library="fa" name="fas-circle-check"></sl-icon>
  <div slot="header">Request submitted</div>
  Your request to issue 1,000 shares to Grace Hopper has been submitted.
</zn-alert>

<zn-alert variant="danger" duration="3000" closable>
  <sl-icon slot="icon" library="fa" name="fas-circle-exclamation"></sl-icon>
  <div slot="header">Your settings couldn’t be updated</div>
  Please <a class="ts-text-link" href="#">contact support</a> for help with this issue.
</zn-alert>
</div>

<script>
  const container = document.querySelector('.alert-toast');

  ['primary', 'success', 'danger'].map(variant => {
    const button = container.querySelector(`zn-button[variant="${variant}"]`);
    const alert = container.querySelector(`zn-alert[variant="${variant}"]`);

    button.addEventListener('click', () => alert.toast());
  });
</script>
```

### Creating Toasts Imperatively

For convenience, you can create a utility that emits toast notifications with a function call rather than composing them
in your HTML. To do this, generate the alert with JavaScript, append it to the body, and call the `toast()` method as
shown in the example below.

```html:preview
<div class="alert-toast-wrapper">
  <zn-button variant="primary">Create Toast</zn-button>
</div>

<script>
  const container = document.querySelector('.alert-toast-wrapper');
  const button = container.querySelector('zn-button');
  let count = 0;

  // Always escape HTML for text arguments!
  function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Custom function to emit toast notifications
  function notify(message, variant = 'primary', icon = 'fas-circle-info', duration = 3000) {
    const alert = Object.assign(document.createElement('zn-alert'), {
      variant,
      closable: true,
      duration: duration,
      innerHTML: `
        <sl-icon name="${icon}" library="fa" slot="icon"></sl-icon>
        ${escapeHtml(message)}
      `
    });

    document.body.append(alert);
    return alert.toast();
  }

  button.addEventListener('click', () => {
    notify(`This is custom toast #${++count}`);
  });
</script>
```

### The Toast Stack

The toast stack is a fixed position singleton element created and managed internally by the alert component. It will be
added and removed from the DOM as needed when toasts are shown. When more than one toast is visible, they will stack
vertically in the toast stack.

By default, the toast stack is positioned at the bottom-right of the viewport. You can change its position by targeting
`.sl-toast-stack` in your stylesheet. To make toasts appear at the top-left of the viewport, for example, use the
following styles.

:::warning
**Note:** The standard position for toast alerts in our apps is the bottom-right. Please check with the design team
before using this method to change the stack position.
:::

```css
.zn-toast-stack {
  left: 0;
  right: auto;
}
```

:::tip
By design, it is not possible to show toasts in more than one stack simultaneously. Such behavior is confusing and makes
for a poor user experience.
:::