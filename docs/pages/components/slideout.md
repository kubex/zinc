---
meta:
  title: Slideout
  description: 'Slideouts appear from the side of the screen and are used to display additional content without navigating away from the current page.'
layout: component
---

## Examples

### Basic Slideout

This is a basic slideout that can be triggered by a button. It slides in from the right side of the screen and includes a header with a close button and a footer with action buttons.

```html:preview
<zn-button id="slideout-trigger">Open Basic Slideout</zn-button>
<zn-slideout class="slideout-basic" trigger="slideout-trigger" label="Slideout">
  This is the slideout's body.

  <zn-button color="default" slot="footer">Do Something</zn-button>
  <zn-button color="secondary" slot="footer" slideout-closer>Close Slideout</zn-button>
</zn-slideout>
```

### Labels

The slideout's label is displayed in the header and is required for proper accessibility. Use the `label` attribute to set the label text.

```html:preview
<zn-button id="slideout-label-trigger">Open Slideout</zn-button>
<zn-slideout trigger="slideout-label-trigger" label="Important Information">
  This slideout has a label in the header that describes its purpose.

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>
```

For HTML content in the label, use the `label` slot instead.

```html:preview
<zn-button id="slideout-label-slot-trigger">Open Slideout</zn-button>
<zn-slideout trigger="slideout-label-slot-trigger">
  <span slot="label">Important <em>Information</em></span>
  This slideout uses the label slot for HTML content.

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>
```

### Custom Width

You can set a custom slideout width using the `--width` CSS custom property. The default width is `min(100vw, 46rem)`. Note that the slideout will automatically shrink to accommodate smaller screens.

```html:preview
<zn-button id="slideout-custom-width-trigger">Open Custom Width Slideout</zn-button>
<zn-slideout trigger="slideout-custom-width-trigger" label="Custom Width" style="--width: 800px;">
  This slideout has a custom width of 800px set using the --width CSS property.

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>
```

### Scrolling Content

When the slideout content is longer than the viewport, the body area automatically becomes scrollable while keeping the header and footer fixed.

```html:preview
<zn-button id="slideout-scrolling-trigger">Open Scrolling Slideout</zn-button>
<zn-slideout trigger="slideout-scrolling-trigger" label="Scrolling Content">
  <p>This slideout has a lot of content that requires scrolling.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
  <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
  <zn-button color="default" slot="footer">Save</zn-button>
</zn-slideout>
```

### Slideouts as Forms

Use slideouts as forms when you need to collect information from users without navigating away from the current page. This example shows a slideout with a form inside it.

```html:preview
<form method="post" action="#" style="display: inline-block">
  <zn-button id="slideout-form-trigger">Open Form Slideout</zn-button>
  <zn-slideout trigger="slideout-form-trigger" label="Edit Profile">
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

    <zn-button color="secondary" slot="footer" slideout-closer>Cancel</zn-button>
    <zn-button color="default" slot="footer" type="submit">Save Profile</zn-button>
  </zn-slideout>
</form>
```

### Programmatic Control

Slideouts can be controlled programmatically using the `show()` and `hide()` methods. You can also check or set the `open` property to manage the slideout state.

```html:preview
<div>
  <zn-button class="slideout-show">Show Slideout</zn-button>
  <zn-button class="slideout-hide">Hide Slideout</zn-button>
  <zn-button class="slideout-toggle">Toggle Slideout</zn-button>
</div>

<zn-slideout class="slideout-programmatic" label="Programmatic Control">
  This slideout is controlled programmatically using JavaScript methods.

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>

<script type="module">
  const slideout = document.querySelector('.slideout-programmatic');
  const showButton = document.querySelector('.slideout-show');
  const hideButton = document.querySelector('.slideout-hide');
  const toggleButton = document.querySelector('.slideout-toggle');

  showButton.addEventListener('click', () => slideout.show());
  hideButton.addEventListener('click', () => slideout.hide());
  toggleButton.addEventListener('click', () => {
    if (slideout.open) {
      slideout.hide();
    } else {
      slideout.show();
    }
  });
</script>
```

### Listening to Events

The slideout emits several events that you can listen to: `zn-show` when opened, `zn-close` when closed, and `zn-request-close` when a close is requested.

```html:preview
<zn-button id="slideout-events-trigger">Open Slideout</zn-button>
<zn-slideout class="slideout-events" trigger="slideout-events-trigger" label="Slideout Events">
  Open the browser console to see events logged as you interact with this slideout.

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>

<script type="module">
  const slideout = document.querySelector('.slideout-events');

  slideout.addEventListener('zn-show', () => {
    console.log('Slideout opened');
  });

  slideout.addEventListener('zn-close', () => {
    console.log('Slideout closed');
  });

  slideout.addEventListener('zn-request-close', (event) => {
    console.log('Close requested from:', event.detail.source);
  });
</script>
```

### Preventing Close

The `zn-request-close` event can be cancelled to prevent the slideout from closing. This is useful when you need to validate data or confirm an action before allowing the slideout to close.

:::warning
**Note:** Use this feature sparingly and only when closing the slideout would result in destructive behavior such as data loss. Preventing close can be frustrating for users if overused.
:::

```html:preview
<zn-button id="slideout-prevent-close-trigger">Open Slideout</zn-button>
<zn-slideout class="slideout-prevent-close" trigger="slideout-prevent-close-trigger" label="Unsaved Changes">
  <p>Try closing this slideout using the close button or pressing Escape.</p>
  <p>You'll need to click the "I'm Sure" button to actually close it.</p>

  <zn-button color="warning" slot="footer" class="close-allowed">I'm Sure</zn-button>
</zn-slideout>

<script type="module">
  const slideout = document.querySelector('.slideout-prevent-close');
  const confirmButton = document.querySelector('.close-allowed');

  // Prevent all close attempts
  slideout.addEventListener('zn-request-close', (event) => {
    event.preventDefault();
    alert('Please click "I\'m Sure" to close this slideout.');
  });

  // Allow close when clicking the confirmation button
  confirmButton.addEventListener('click', () => {
    slideout.hide();
  });
</script>
```

You can also prevent close from specific sources by checking the `event.detail.source` property.

```html:preview
<zn-button id="slideout-prevent-specific-trigger">Open Slideout</zn-button>
<zn-slideout class="slideout-prevent-specific" trigger="slideout-prevent-specific-trigger" label="Selective Close Prevention">
  <p>This slideout prevents closing via the Escape key, but allows the close button to work.</p>

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>

<script type="module">
  const slideout = document.querySelector('.slideout-prevent-specific');

  slideout.addEventListener('zn-request-close', (event) => {
    // Prevent close from keyboard, but allow close button
    if (event.detail.source === 'keyboard') {
      event.preventDefault();
      alert('Please use the close button to dismiss this slideout.');
    }
  });
</script>
```

### Slideout Closer Attribute

Add the `slideout-closer` attribute to any element inside the slideout to make it close the slideout when clicked. This is commonly used with buttons in the footer.

```html:preview
<zn-button id="slideout-closer-trigger">Open Slideout</zn-button>
<zn-slideout trigger="slideout-closer-trigger" label="Slideout Closer">
  <p>Any element with the slideout-closer attribute will close this slideout when clicked.</p>

  <zn-button color="default" slot="footer">This Won't Close</zn-button>
  <zn-button color="secondary" slot="footer" slideout-closer>This Will Close</zn-button>
</zn-slideout>
```

### Customizing Spacing

Use CSS custom properties to customize the padding in different areas of the slideout.

```html:preview
<zn-button id="slideout-spacing-trigger">Open Slideout</zn-button>
<zn-slideout
  trigger="slideout-spacing-trigger"
  label="Custom Spacing"
  style="
    --header-spacing: 2rem;
    --body-spacing: 3rem;
    --footer-spacing: 2rem;
  ">
  This slideout has custom spacing applied using CSS properties.

  <zn-button color="secondary" slot="footer" slideout-closer>Close</zn-button>
</zn-slideout>
```