---
meta:
  title: Toggle
  description: Toggles allow the user to switch an option on or off.
layout: component
---

```html:preview
<zn-toggle checked>Enable notifications</zn-toggle>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Toggle

A basic toggle switch with a label.

```html:preview
<zn-toggle label="Settings">Dark mode</zn-toggle>
```

### Checked

Use the `checked` attribute to activate the toggle by default.

```html:preview
<zn-toggle checked>Auto-save enabled</zn-toggle>
```

### Disabled

Use the `disabled` attribute to disable the toggle.

```html:preview
<zn-toggle disabled>Disabled toggle</zn-toggle>
<br />
<zn-toggle disabled checked>Disabled and checked</zn-toggle>
```

### Sizes

Use the `size` attribute to change the toggle size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<zn-toggle size="small">Small toggle</zn-toggle>
<br />
<zn-toggle size="medium">Medium toggle</zn-toggle>
<br />
<zn-toggle size="large">Large toggle</zn-toggle>
```

### With Label

Use the `label` attribute to add a form control label above the toggle.

```html:preview
<zn-toggle label="User Preferences">Enable email notifications</zn-toggle>
```

### On/Off Text with Tooltip

Use the `on-text` and `off-text` attributes to display tooltips that show when the toggle is in the on or off state. This provides additional context for the toggle's current state.

```html:preview
<zn-toggle on-text="Notifications enabled" off-text="Notifications disabled" checked>
  Push notifications
</zn-toggle>
<br /><br />
<zn-toggle on-text="Available" off-text="Unavailable" label="Status">
  User availability
</zn-toggle>
```

### Help Text

Use the `help-text` attribute to add descriptive help text to the toggle.

```html:preview
<zn-toggle help-text="When enabled, you will receive real-time notifications">
  Enable real-time updates
</zn-toggle>
```

### Keyboard Navigation

Toggles support keyboard navigation using arrow keys. Press the left arrow to turn the toggle off, and the right arrow to turn it on.

```html:preview
<zn-toggle checked>Try using arrow keys when focused</zn-toggle>
```

<script type="module">
  const toggle = document.currentScript.previousElementSibling;
  const output = document.createElement('div');
  output.style.cssText = 'margin-top: 1rem; padding: 0.75rem; background: #f5f5f5; border-radius: 4px;';
  output.textContent = 'Focus the toggle and use left/right arrow keys';
  toggle.insertAdjacentElement('afterend', output);

  toggle.addEventListener('zn-change', (e) => {
    output.textContent = `Toggle is now: ${e.target.checked ? 'ON' : 'OFF'}`;
  });
</script>

### Form Integration

Toggles work seamlessly with forms and will be submitted with form data.

```html:preview
<form id="toggle-form">
  <zn-toggle name="notifications" value="enabled">Enable notifications</zn-toggle>
  <br />
  <zn-toggle name="auto-save" value="on" checked>Auto-save changes</zn-toggle>
  <br />
  <zn-toggle name="analytics" value="yes" required>Accept analytics (required)</zn-toggle>
  <br /><br />
  <zn-button type="submit" color="primary">Submit</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#toggle-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    alert('Form submitted: ' + JSON.stringify(data, null, 2));
  });
</script>
```

### Fallback Value

Use the `fallback` attribute to submit a specific value when the toggle is unchecked. This is useful when you need to ensure a value is always submitted for the field.

```html:preview
<form id="fallback-form">
  <zn-toggle name="premium-features" value="enabled" fallback="disabled" checked>
    Premium features
  </zn-toggle>
  <br /><br />
  <zn-button type="submit" color="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#fallback-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    alert('Value: ' + formData.get('premium-features'));
  });
</script>
```

### Required Validation

Use the `required` attribute to make the toggle required. The form will not submit unless the toggle is checked.

```html:preview
<form id="required-form">
  <zn-toggle name="terms" required>
    I agree to the terms and conditions
  </zn-toggle>
  <br /><br />
  <zn-button type="submit" color="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#required-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Form is valid!');
  });
</script>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html:preview
<form class="toggle-custom-validity">
  <zn-toggle>I confirm that I have reviewed all settings</zn-toggle>
  <br/>
  <zn-button type="submit" color="primary" style="margin-top: 1rem;">Submit</zn-button>
</form>
<script type="module">
  const form = document.querySelector('.toggle-custom-validity');
  const toggle = form.querySelector('zn-toggle');
  const errorMessage = `You must confirm that you have reviewed the settings`;

  // Set initial validity as soon as the element is defined
  customElements.whenDefined('zn-toggle').then(async () => {
    await toggle.updateComplete;
    toggle.setCustomValidity(errorMessage);
  });

  // Update validity on change
  toggle.addEventListener('zn-change', () => {
    toggle.setCustomValidity(toggle.checked ? '' : errorMessage);
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-toggle')
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Submit on Change

Use the `trigger-submit` attribute to automatically submit the containing form when the toggle is changed.

```html:preview
<form id="trigger-submit-form">
  <zn-toggle name="instant" trigger-submit>
    Apply changes immediately
  </zn-toggle>
</form>

<script type="module">
  const form = document.querySelector('#trigger-submit-form');
  let submitCount = 0;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitCount++;
    alert('Form submitted ' + submitCount + ' time(s)');
  });
</script>
```

### External Form Association

Use the `form` attribute to associate the toggle with a form element by ID, even if the toggle is not a descendant of the form.

```html:preview
<form id="external-toggle-form">
  <zn-button type="submit" color="primary">Submit External Form</zn-button>
</form>

<br /><br />

<zn-toggle form="external-toggle-form" name="external-option" value="selected">
  This toggle is associated with the form above
</zn-toggle>

<script type="module">
  const form = document.querySelector('#external-toggle-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    alert('External option: ' + (formData.get('external-option') || 'not selected'));
  });
</script>
```

### Events

Toggles emit several events that you can listen to:

- `zn-change` - Emitted when the checked state changes (via the `handleClick` method)
- `zn-input` - Emitted when the toggle receives input
- `zn-focus` - Emitted when the toggle gains focus
- `zn-blur` - Emitted when the toggle loses focus
- `zn-invalid` - Emitted when form validation fails

:::tip
The `zn-change` event is emitted in the `handleClick` method when the toggle is clicked, so it fires after the checked state has been updated. Note that the component listens to native input events and emits `zn-input`, but does not explicitly emit `zn-change`, `zn-focus`, or `zn-blur` events in the component code - these would need to be added if needed.
:::

```html:preview
<div>
  <zn-toggle id="event-toggle" checked>Toggle me</zn-toggle>
  <div id="event-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
    <strong>Events:</strong>
    <ul id="event-list" style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;"></ul>
  </div>
</div>

<script type="module">
  const toggle = document.querySelector('#event-toggle');
  const eventList = document.querySelector('#event-list');

  function logEvent(eventName, detail = '') {
    const li = document.createElement('li');
    li.textContent = `${eventName}${detail ? ': ' + detail : ''}`;
    eventList.insertBefore(li, eventList.firstChild);

    // Keep only last 5 events
    while (eventList.children.length > 5) {
      eventList.removeChild(eventList.lastChild);
    }
  }

  toggle.addEventListener('zn-input', (e) => {
    logEvent('zn-input', `checked = ${e.target.checked}`);
  });

  toggle.addEventListener('focus', () => {
    logEvent('focus');
  });

  toggle.addEventListener('blur', () => {
    logEvent('blur');
  });

  // Monitor checked state changes
  let lastChecked = toggle.checked;
  toggle.addEventListener('click', () => {
    if (toggle.checked !== lastChecked) {
      logEvent('state-change', `checked = ${toggle.checked}`);
      lastChecked = toggle.checked;
    }
  });
</script>
```

### Methods

Toggles provide several methods for programmatic control:

- `click()` - Simulates a click on the toggle
- `focus(options?)` - Sets focus on the toggle
- `blur()` - Removes focus from the toggle
- `checkValidity()` - Checks validity without showing a message
- `reportValidity()` - Checks validity and shows the browser's validation message
- `setCustomValidity(message)` - Sets a custom validation message
- `getForm()` - Returns the associated form element, if one exists

```html:preview
<div>
  <zn-toggle id="method-toggle">Programmatic control</zn-toggle>
  <br /><br />
  <zn-button id="click-btn" size="small">Toggle State</zn-button>
  <zn-button id="focus-btn" size="small" color="info">Focus Toggle</zn-button>
  <zn-button id="blur-btn" size="small" color="secondary">Blur Toggle</zn-button>
  <zn-button id="validate-btn" size="small" color="warning">Check Validity</zn-button>
</div>

<script type="module">
  const toggle = document.querySelector('#method-toggle');

  document.querySelector('#click-btn').addEventListener('click', () => {
    toggle.click();
  });

  document.querySelector('#focus-btn').addEventListener('click', () => {
    toggle.focus();
  });

  document.querySelector('#blur-btn').addEventListener('click', () => {
    toggle.blur();
  });

  document.querySelector('#validate-btn').addEventListener('click', () => {
    const isValid = toggle.checkValidity();
    alert('Toggle is ' + (isValid ? 'valid' : 'invalid'));
  });
</script>
```

### Complete Example

Here's a comprehensive example demonstrating multiple toggle features together:

```html:preview
<form id="complete-form">
  <zn-toggle
    label="Notification Settings"
    name="email-notifications"
    value="enabled"
    fallback="disabled"
    on-text="Email notifications are ON"
    off-text="Email notifications are OFF"
    help-text="Receive email updates about your account"
    checked
  >
    Enable email notifications
  </zn-toggle>

  <br />

  <zn-toggle
    label="Privacy Settings"
    name="analytics"
    value="allowed"
    on-text="Analytics tracking enabled"
    off-text="Analytics tracking disabled"
    help-text="Help us improve by sharing anonymous usage data"
    size="medium"
  >
    Allow analytics
  </zn-toggle>

  <br />

  <zn-toggle
    name="terms"
    value="accepted"
    required
    size="small"
  >
    I agree to the terms and conditions (required)
  </zn-toggle>

  <br /><br />
  <zn-button type="submit" color="primary">Save Settings</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<div id="form-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; display: none;">
  <strong>Form Data:</strong>
  <pre id="form-data" style="margin-top: 0.5rem; white-space: pre-wrap;"></pre>
</div>

<script type="module">
  const form = document.querySelector('#complete-form');
  const output = document.querySelector('#form-output');
  const dataDisplay = document.querySelector('#form-data');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    dataDisplay.textContent = JSON.stringify(data, null, 2);
    output.style.display = 'block';
  });

  form.addEventListener('reset', () => {
    output.style.display = 'none';
  });
</script>
```

