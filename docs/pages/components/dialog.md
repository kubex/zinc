---
meta:
  title: Dialog
  description: 'Dialogs, also called "modals", appear above the page and require the users immediate attention.'
layout: component
---

## Examples

### Basic Dialog

This is a basic dialog. It has a trigger button that opens the dialog. The dialog has a close button and two buttons in the footer.

```html:preview
<zn-button id="dialog-trigger">Open Basic dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger" label="Dialog">
  This is the dialog's body.

  <zn-button color="default" slot="footer">Do Something</zn-button>
  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
</zn-dialog>
```

### Labels

The dialog's label is displayed in the header and is required for proper accessibility. Use the `label` attribute to set the label text.

```html:preview
<zn-button id="dialog-label-trigger">Open Dialog</zn-button>
<zn-dialog trigger="dialog-label-trigger" label="Important Information">
  This dialog has a label in the header that describes its purpose.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>
```

For HTML content in the label, use the `label` slot instead.

```html:preview
<zn-button id="dialog-label-slot-trigger">Open Dialog</zn-button>
<zn-dialog trigger="dialog-label-slot-trigger">
  <span slot="label">Important <em>Information</em></span>
  This dialog uses the label slot for HTML content.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>
```

### Dialog Variants

Dialogs come in three variants: `default`, `warning`, and `announcement`. Set the `variant` attribute to apply the appropriate theme.

Use the `header-icon` slot to display an icon to the left of the dialog header label. The icon color is automatically styled based on the dialog variant.

#### Default Variant

Use the default variant for confirmation of neutral actions like submitting a form or displaying informational content.

```html:preview
<zn-button id="dialog-default-trigger">Open Default Dialog</zn-button>
<zn-dialog trigger="dialog-default-trigger" label="Confirm Submission" variant="default">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  If you need to, you can cancel this request after submitting it. Are you sure you want to submit it now?

  <zn-button color="secondary" slot="footer" dialog-closer>Cancel</zn-button>
  <zn-button color="default" slot="footer">Submit</zn-button>
</zn-dialog>
```

#### Warning Variant

Use the warning variant for confirmation of destructive actions like deleting or canceling something.

```html:preview
<zn-button id="dialog-warning-trigger">Open Warning Dialog</zn-button>
<zn-dialog trigger="dialog-warning-trigger" label="Delete Item" variant="warning">
  <zn-icon src="warning" slot="header-icon"></zn-icon>
  This action cannot be undone. Are you sure you want to delete this item?

  <zn-button color="secondary" slot="footer" dialog-closer>Cancel</zn-button>
  <zn-button color="warning" slot="footer">Delete</zn-button>
</zn-dialog>
```

#### Announcement Variant

Use the announcement variant for special announcements, feature introductions, or welcome messages. This variant supports additional slots for intro text and footer text.

```html:preview
<zn-button id="dialog-announcement-trigger">Open Announcement</zn-button>
<zn-dialog trigger="dialog-announcement-trigger" label="Meet your new Monthly Numbers dashboard" variant="announcement">
  <div slot="announcement-intro">Welcome!</div>
  <zn-icon src="celebration" slot="header-icon"></zn-icon>
  We've redesigned the Monthly Numbers dashboard with new features and improved performance. Take a tour to see what's new.

  <zn-button color="secondary" slot="footer" dialog-closer>Skip Tour</zn-button>
  <zn-button color="default" slot="footer">Start Tour</zn-button>
  <div slot="footer-text"><a href="#">Learn more about Monthly Numbers</a></div>
</zn-dialog>
```

### Dialog Sizes

Dialogs come in three different sizes: `small`, `medium`, and `large`. The default size is `medium`. Use the `size` attribute to control the dialog width.

```html:preview
<zn-button id="dialog-small-trigger">Open Small Dialog</zn-button>
<zn-dialog trigger="dialog-small-trigger" label="Small Dialog" size="small">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This is a small dialog, ideal for simple confirmations.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
  <zn-button color="default" slot="footer">Confirm</zn-button>
</zn-dialog>

<zn-button id="dialog-medium-trigger">Open Medium Dialog</zn-button>
<zn-dialog trigger="dialog-medium-trigger" label="Medium Dialog">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This is a medium dialog, the default size. It works well for most content.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
  <zn-button color="default" slot="footer">Confirm</zn-button>
</zn-dialog>

<zn-button id="dialog-large-trigger">Open Large Dialog</zn-button>
<zn-dialog trigger="dialog-large-trigger" label="Large Dialog" size="large">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This is a large dialog, suitable for complex forms or detailed content.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
  <zn-button color="default" slot="footer">Confirm</zn-button>
</zn-dialog>
```

### Custom Width

You can set a custom dialog width using the `--width` CSS custom property. Note that the dialog will automatically shrink to accommodate smaller screens.

```html:preview
<zn-button id="dialog-custom-width-trigger">Open Custom Width Dialog</zn-button>
<zn-dialog trigger="dialog-custom-width-trigger" label="Custom Width" style="--width: 800px;">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This dialog has a custom width of 800px set using the --width CSS property.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>
```

### Scrolling Content

When the dialog content is longer than the viewport, the body area automatically becomes scrollable while keeping the header and footer fixed.

```html:preview
<zn-button id="dialog-scrolling-trigger">Open Scrolling Dialog</zn-button>
<zn-dialog trigger="dialog-scrolling-trigger" label="Scrolling Content">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  <p>This dialog has a lot of content that requires scrolling.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
  <zn-button color="default" slot="footer">Save</zn-button>
</zn-dialog>
```

### No Header

Use the `no-header` attribute to hide the header, including the default close button. When using this option, ensure you provide an accessible way for users to close the dialog.

:::warning
**Note:** Even when using `no-header`, you should still provide a `label` attribute for proper accessibility. The label is used for screen readers even when visually hidden.
:::

```html:preview
<zn-button id="dialog-no-header-trigger">Open No Header Dialog</zn-button>
<zn-dialog trigger="dialog-no-header-trigger" label="Dialog without header" no-header>
  <p>This dialog has no header. Notice there's no close button, so we've added one in the footer.</p>
  <p>The label attribute is still required for accessibility, even though it's not visible.</p>

  <zn-button color="default" slot="footer">Continue</zn-button>
  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>
```

### Header Actions

Use the `header-actions` slot to add buttons or other interactive elements to the header, next to the close button.

```html:preview
<zn-button id="dialog-header-actions-trigger">Open Dialog</zn-button>
<zn-dialog trigger="dialog-header-actions-trigger" label="Document Settings">
  <zn-button icon="refresh" color="transparent" size="content" slot="header-actions"></zn-button>
  <zn-button icon="settings" color="transparent" size="content" slot="header-actions"></zn-button>

  <p>This dialog has action buttons in the header for quick access to common functions.</p>

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
  <zn-button color="default" slot="footer">Save</zn-button>
</zn-dialog>
```

### Dialogs as Forms

Use dialogs as forms when you need to collect information from users. This example shows a dialog with a form inside it.

```html:preview
<form method="post" action="#" style="display: inline-block">
  <zn-button id="dialog-form-trigger">Open Form Dialog</zn-button>
  <zn-dialog trigger="dialog-form-trigger" label="Edit Profile" size="large">
    <zn-icon src="person" slot="header-icon"></zn-icon>

    <zn-form-group
      label="Profile Information"
      label-tooltip="This information will be displayed on your public profile"
      help-text="All fields marked with an asterisk are required">

      <div class="form-spacing">
        <zn-input type="text" name="name" label="Name" required></zn-input>
        <zn-select label="Favorite Animal" clearable required>
          <zn-option value="birds">Birds</zn-option>
          <zn-option value="cats">Cats</zn-option>
          <zn-option value="dogs">Dogs</zn-option>
          <zn-option value="other">Other</zn-option>
        </zn-select>

        <zn-textarea name="comment" label="Bio" required></zn-textarea>

        <zn-checkbox required>I agree to the terms and conditions</zn-checkbox>

        <br>
        <zn-checkbox-group label="Interests" help-text="Select at least one" label-tooltip="Choose your areas of interest"
                           required>
          <zn-checkbox value="technology">Technology</zn-checkbox>
          <zn-checkbox value="sports">Sports</zn-checkbox>
          <zn-checkbox value="music">Music</zn-checkbox>
        </zn-checkbox-group>
      </div>
    </zn-form-group>

    <zn-button color="secondary" slot="footer" dialog-closer>Cancel</zn-button>
    <zn-button color="default" slot="footer" type="submit">Save Profile</zn-button>
  </zn-dialog>
</form>
```

### Programmatic Control

Dialogs can be controlled programmatically using the `show()` and `hide()` methods. You can also check or set the `open` property to manage the dialog state.

```html:preview
<div>
  <zn-button class="dialog-show">Show Dialog</zn-button>
  <zn-button class="dialog-hide">Hide Dialog</zn-button>
  <zn-button class="dialog-toggle">Toggle Dialog</zn-button>
</div>

<zn-dialog class="dialog-programmatic" label="Programmatic Control">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This dialog is controlled programmatically using JavaScript methods.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>

<script type="module">
  const dialog = document.querySelector('.dialog-programmatic');
  const showButton = document.querySelector('.dialog-show');
  const hideButton = document.querySelector('.dialog-hide');
  const toggleButton = document.querySelector('.dialog-toggle');

  showButton.addEventListener('click', () => dialog.show());
  hideButton.addEventListener('click', () => dialog.hide());
  toggleButton.addEventListener('click', () => {
    if (dialog.open) {
      dialog.hide();
    } else {
      dialog.show();
    }
  });
</script>
```

### Listening to Events

The dialog emits several events that you can listen to: `zn-show` when opened, `zn-close` when closed, and `zn-request-close` when a close is requested.

```html:preview
<zn-button id="dialog-events-trigger">Open Dialog</zn-button>
<zn-dialog class="dialog-events" trigger="dialog-events-trigger" label="Dialog Events">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  Open the browser console to see events logged as you interact with this dialog.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>

<script type="module">
  const dialog = document.querySelector('.dialog-events');

  dialog.addEventListener('zn-show', () => {
    console.log('Dialog opened');
  });

  dialog.addEventListener('zn-close', () => {
    console.log('Dialog closed');
  });

  dialog.addEventListener('zn-request-close', (event) => {
    console.log('Close requested from:', event.detail.source);
  });
</script>
```

### Preventing Close

The `zn-request-close` event can be cancelled to prevent the dialog from closing. This is useful when you need to validate data or confirm an action before allowing the dialog to close.

:::warning
**Note:** Use this feature sparingly and only when closing the dialog would result in destructive behavior such as data loss. Preventing close can be frustrating for users if overused.
:::

```html:preview
<zn-button id="dialog-prevent-close-trigger">Open Dialog</zn-button>
<zn-dialog class="dialog-prevent-close" trigger="dialog-prevent-close-trigger" label="Unsaved Changes">
  <zn-icon src="warning" slot="header-icon"></zn-icon>
  <p>Try closing this dialog using the close button, clicking the overlay, or pressing Escape.</p>
  <p>You'll need to click the "I'm Sure" button to actually close it.</p>

  <zn-button color="warning" slot="footer" class="close-allowed">I'm Sure</zn-button>
</zn-dialog>

<script type="module">
  const dialog = document.querySelector('.dialog-prevent-close');
  const confirmButton = document.querySelector('.close-allowed');

  // Prevent all close attempts
  dialog.addEventListener('zn-request-close', (event) => {
    event.preventDefault();
    alert('Please click "I\'m Sure" to close this dialog.');
  });

  // Allow close when clicking the confirmation button
  confirmButton.addEventListener('click', () => {
    dialog.hide();
  });
</script>
```

You can also prevent close from specific sources by checking the `event.detail.source` property.

```html:preview
<zn-button id="dialog-prevent-specific-trigger">Open Dialog</zn-button>
<zn-dialog class="dialog-prevent-specific" trigger="dialog-prevent-specific-trigger" label="Selective Close Prevention">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  <p>This dialog prevents closing via the overlay or Escape key, but allows the close button to work.</p>

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>

<script type="module">
  const dialog = document.querySelector('.dialog-prevent-specific');

  dialog.addEventListener('zn-request-close', (event) => {
    // Prevent close from overlay and keyboard, but allow close button
    if (event.detail.source === 'overlay' || event.detail.source === 'keyboard') {
      event.preventDefault();
      alert('Please use the close button to dismiss this dialog.');
    }
  });
</script>
```

### Dialog Closer Attribute

Add the `dialog-closer` attribute to any element inside the dialog to make it close the dialog when clicked. This is commonly used with buttons in the footer.

```html:preview
<zn-button id="dialog-closer-trigger">Open Dialog</zn-button>
<zn-dialog trigger="dialog-closer-trigger" label="Dialog Closer">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  <p>Any element with the dialog-closer attribute will close this dialog when clicked.</p>

  <zn-button color="default" slot="footer">This Won't Close</zn-button>
  <zn-button color="secondary" slot="footer" dialog-closer>This Will Close</zn-button>
</zn-dialog>
```

### Cosmic Effect

Add the `cosmic` attribute to apply a special visual effect to the dialog backdrop.

```html:preview
<zn-button id="dialog-cosmic-trigger">Open Cosmic Dialog</zn-button>
<zn-dialog trigger="dialog-cosmic-trigger" label="Cosmic Dialog" cosmic>
  <zn-icon src="star" slot="header-icon"></zn-icon>
  This dialog has the cosmic effect applied to the backdrop.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>
```

### Customizing Spacing

Use CSS custom properties to customize the padding in different areas of the dialog.

```html:preview
<zn-button id="dialog-spacing-trigger">Open Dialog</zn-button>
<zn-dialog
  trigger="dialog-spacing-trigger"
  label="Custom Spacing"
  style="
    --header-spacing: 2rem;
    --body-spacing: 3rem;
    --footer-spacing: 2rem;
  ">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This dialog has custom spacing applied using CSS properties.

  <zn-button color="secondary" slot="footer" dialog-closer>Close</zn-button>
</zn-dialog>
```