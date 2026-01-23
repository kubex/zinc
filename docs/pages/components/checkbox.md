---
meta:
  title: Checkbox
  description: Checkboxes allow the user to toggle an option on or off.
layout: component
---

```html:preview
<zn-checkbox>Accept terms and conditions</zn-checkbox>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Checkbox

A basic checkbox with a label.

```html:preview
<zn-checkbox>Financial products access</zn-checkbox>
```

### Checked

Use the `checked` attribute to activate the checkbox by default.

```html:preview
<zn-checkbox checked>I agree to the terms</zn-checkbox>
```

### Indeterminate

Use the `indeterminate` attribute to show an indeterminate state. This is typically used to represent a "select all" checkbox when some but not all items are selected.

```html:preview
<zn-checkbox indeterminate>Select all items</zn-checkbox>
```

```html:preview
<div id="indeterminate-example">
  <zn-checkbox id="select-all">Select all</zn-checkbox>
  <br /><br />
  <zn-checkbox class="item">Item 1</zn-checkbox>
  <br />
  <zn-checkbox class="item">Item 2</zn-checkbox>
  <br />
  <zn-checkbox class="item">Item 3</zn-checkbox>
</div>

<script type="module">
  const container = document.querySelector('#indeterminate-example');
  const selectAll = container.querySelector('#select-all');
  const items = container.querySelectorAll('.item');

  function updateSelectAll() {
    const checkedCount = Array.from(items).filter(item => item.checked).length;

    if (checkedCount === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    } else if (checkedCount === items.length) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else {
      selectAll.checked = false;
      selectAll.indeterminate = true;
    }
  }

  selectAll.addEventListener('zn-change', () => {
    items.forEach(item => {
      item.checked = selectAll.checked;
    });
  });

  items.forEach(item => {
    item.addEventListener('zn-change', updateSelectAll);
  });
</script>
```

### Disabled

Use the `disabled` attribute to disable the checkbox.

```html:preview
<zn-checkbox disabled>Disabled checkbox</zn-checkbox>
<br />
<zn-checkbox disabled checked>Disabled and checked</zn-checkbox>
```

### Sizes

Use the `size` attribute to change the checkbox size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<zn-checkbox size="small">Small</zn-checkbox>
<br />
<zn-checkbox size="medium">Medium</zn-checkbox>
<br />
<zn-checkbox size="large">Large</zn-checkbox>
```

### Colors

Use the `color` attribute to apply semantic colors to the checkbox. When checked or indeterminate, the checkbox will use the specified color.

```html:preview
<zn-checkbox color="default" checked>Default</zn-checkbox>
<br />
<zn-checkbox color="primary" checked>Primary</zn-checkbox>
<br />
<zn-checkbox color="secondary" checked>Secondary</zn-checkbox>
<br />
<zn-checkbox color="info" checked>Info</zn-checkbox>
<br />
<zn-checkbox color="success" checked>Success</zn-checkbox>
<br />
<zn-checkbox color="warning" checked>Warning</zn-checkbox>
<br />
<zn-checkbox color="error" checked>Error</zn-checkbox>
```

### Checked and Unchecked Colors

Use the `checked-color` and `unchecked-color` attributes to apply different colors based on the checkbox state.

```html:preview
<zn-checkbox checked-color="success" unchecked-color="error" checked>Checked color (success)</zn-checkbox>
<br />
<zn-checkbox checked-color="success" unchecked-color="error">Unchecked color (error)</zn-checkbox>
```

### Description

Add descriptive help text to checkboxes with the `description` attribute. For descriptions that contain HTML, use the `description` slot instead.

```html:preview
<zn-checkbox description="Grants access to cash account and charge card features">Financial products access</zn-checkbox>
<br /><br />
<zn-checkbox>
  Advanced settings
  <div slot="description">
    This option enables <strong>advanced features</strong> that require additional permissions.
  </div>
</zn-checkbox>
```

### Label and Label Tooltip

Use the `label` attribute to add a form control label above the checkbox. Use `label-tooltip` to provide additional context.

```html:preview
<zn-checkbox label="User Preferences" label-tooltip="Configure your account settings">
  Enable notifications
</zn-checkbox>
```

### Custom Icons

Use the `checked-icon` and `unchecked-icon` attributes to display custom icons for different states.

```html:preview
<zn-checkbox checked-icon="favorite" color="error" checked>Add to favorites</zn-checkbox>
<br />
<zn-checkbox checked-icon="thumb_up" unchecked-icon="thumb_down" color="success">Like this</zn-checkbox>
```

### Contained Style

Add the `contained` attribute to draw a card-like container around a checkbox. This style is useful for giving more emphasis to a checkbox or list of checkboxes.

```html:preview
<zn-checkbox description="Grants access to cash account and charge card features" contained>Financial products access</zn-checkbox>
<br/><br/>
<zn-checkbox-group label="Financial products permissions" contained>
  <zn-checkbox description="Requires separate initiators and approvers">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox description="Requires separate initiators and approvers">Approve outbound transfers</zn-checkbox>
  <zn-checkbox description="Applies to both cash account and charge card" disabled>Export transactions</zn-checkbox>
</zn-checkbox-group>
```

:::tip
When checkboxes are wrapped with [Checkbox Group](/components/checkbox-group), adding the `contained` attribute to the parent Checkbox Group or to _any_ checkbox in the group will create `contained` checkboxes for the entire group.
:::

### Borderless

Use the `borderless` attribute to remove borders from the checkbox.

```html:preview
<zn-checkbox borderless>Borderless checkbox</zn-checkbox>
<br />
<zn-checkbox borderless checked>Borderless checked</zn-checkbox>
```

### Horizontal Layout

Use the `horizontal` attribute to apply styles relevant to checkboxes in a horizontal layout. This is typically used with checkbox groups.

```html:preview
<div style="display: flex; gap: 1rem;">
  <zn-checkbox horizontal>Option 1</zn-checkbox>
  <zn-checkbox horizontal>Option 2</zn-checkbox>
  <zn-checkbox horizontal>Option 3</zn-checkbox>
</div>
```

### Selected Content

Use the `selected-content` slot to display additional content (such as an input field) inside a `contained` checkbox when it is checked. The slot is unstyled by default. Use `::part(selected-content)` to style the content as needed.

:::warning
**Note:** `ts_form_for` doesn't support slots. The `selected-content` slot cannot be used for checkboxes rendered with `ts_form_for`.
:::

```html:preview
<zn-checkbox style="width:100%" contained>Grant financial products access
  <div slot="selected-content">
    <p>A mobile number is required to grant this user access to financial products. The number will be used for login verification.</p>
    <zn-input style="width: 280px;" label="Mobile number" type="tel" required optional-icon></zn-input>
  </div>
</zn-checkbox>
<style>
  zn-checkbox::part(selected-content) {
    font-size: 14px;
    font-weight: normal;
    color: #6D7176;
    margin-top: 1rem;
  }
</style>
```

### Form Integration

Checkboxes work seamlessly with forms and will be submitted with form data.

```html:preview
<form id="checkbox-form">
  <zn-checkbox name="newsletter" value="yes">Subscribe to newsletter</zn-checkbox>
  <br />
  <zn-checkbox name="terms" value="accepted" required>I accept the terms and conditions</zn-checkbox>
  <br /><br />
  <zn-button type="submit" color="primary">Submit</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#checkbox-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    alert('Form submitted: ' + JSON.stringify(data, null, 2));
  });
</script>
```

### Unchecked Value

Use the `unchecked-value` attribute to submit a specific value when the checkbox is unchecked.

```html:preview
<form id="unchecked-value-form">
  <zn-checkbox name="receive-emails" value="yes" unchecked-value="no" checked>
    Receive email updates
  </zn-checkbox>
  <br /><br />
  <zn-button type="submit" color="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#unchecked-value-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    alert('Value: ' + formData.get('receive-emails'));
  });
</script>
```

### Required Validation

Use the `required` attribute to make the checkbox required. The form will not submit unless the checkbox is checked.

```html:preview
<form id="required-form">
  <zn-checkbox name="agree" required>
    I agree to the terms and conditions
  </zn-checkbox>
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
<form class="custom-validity">
  <zn-checkbox>I understand the risks involved</zn-checkbox>
  <br/>
  <zn-button type="submit" color="primary" style="margin-top: 1rem;">Submit</zn-button>
</form>
<script type="module">
  const form = document.querySelector('.custom-validity');
  const checkbox = form.querySelector('zn-checkbox');
  const errorMessage = `You must acknowledge the risks before proceeding`;

  // Set initial validity as soon as the element is defined
  customElements.whenDefined('zn-checkbox').then(async () => {
    await checkbox.updateComplete;
    checkbox.setCustomValidity(errorMessage);
  });

  // Update validity on change
  checkbox.addEventListener('zn-change', () => {
    checkbox.setCustomValidity(checkbox.checked ? '' : errorMessage);
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-checkbox')
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Submit on Click

Use the `submit-on-click` attribute to automatically submit the containing form when the checkbox is clicked.

```html:preview
<form id="submit-on-click-form">
  <zn-checkbox name="instant" submit-on-click>
    Apply changes immediately
  </zn-checkbox>
</form>

<script type="module">
  const form = document.querySelector('#submit-on-click-form');
  let submitCount = 0;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitCount++;
    alert('Form submitted ' + submitCount + ' time(s)');
  });
</script>
```

### External Form Association

Use the `form` attribute to associate the checkbox with a form element by ID, even if the checkbox is not a descendant of the form.

```html:preview
<form id="external-form">
  <zn-button type="submit" color="primary">Submit External Form</zn-button>
</form>

<br /><br />

<zn-checkbox form="external-form" name="external-option" value="selected">
  This checkbox is associated with the form above
</zn-checkbox>

<script type="module">
  const form = document.querySelector('#external-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    alert('External option: ' + (formData.get('external-option') || 'not selected'));
  });
</script>
```

### Events

Checkboxes emit several events that you can listen to:

- `zn-change` - Emitted when the checked state changes
- `zn-input` - Emitted when the checkbox receives input
- `zn-focus` - Emitted when the checkbox gains focus
- `zn-blur` - Emitted when the checkbox loses focus
- `zn-invalid` - Emitted when form validation fails

```html:preview
<div>
  <zn-checkbox id="event-checkbox">Toggle me</zn-checkbox>
  <div id="event-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
    <strong>Events:</strong>
    <ul id="event-list" style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;"></ul>
  </div>
</div>

<script type="module">
  const checkbox = document.querySelector('#event-checkbox');
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

  checkbox.addEventListener('zn-change', (e) => {
    logEvent('zn-change', `checked = ${e.target.checked}`);
  });

  checkbox.addEventListener('zn-input', () => {
    logEvent('zn-input');
  });

  checkbox.addEventListener('zn-focus', () => {
    logEvent('zn-focus');
  });

  checkbox.addEventListener('zn-blur', () => {
    logEvent('zn-blur');
  });
</script>
```

### Methods

Checkboxes provide several methods for programmatic control:

- `click()` - Simulates a click on the checkbox
- `focus()` - Sets focus on the checkbox
- `blur()` - Removes focus from the checkbox
- `checkValidity()` - Checks validity without showing a message
- `reportValidity()` - Checks validity and shows the browser's validation message
- `setCustomValidity(message)` - Sets a custom validation message

```html:preview
<div>
  <zn-checkbox id="method-checkbox">Programmatic control</zn-checkbox>
  <br /><br />
  <zn-button id="click-btn" size="small">Click Checkbox</zn-button>
  <zn-button id="focus-btn" size="small" color="info">Focus Checkbox</zn-button>
  <zn-button id="blur-btn" size="small" color="secondary">Blur Checkbox</zn-button>
  <zn-button id="validate-btn" size="small" color="warning">Check Validity</zn-button>
</div>

<script type="module">
  const checkbox = document.querySelector('#method-checkbox');

  document.querySelector('#click-btn').addEventListener('click', () => {
    checkbox.click();
  });

  document.querySelector('#focus-btn').addEventListener('click', () => {
    checkbox.focus();
  });

  document.querySelector('#blur-btn').addEventListener('click', () => {
    checkbox.blur();
  });

  document.querySelector('#validate-btn').addEventListener('click', () => {
    const isValid = checkbox.checkValidity();
    alert('Checkbox is ' + (isValid ? 'valid' : 'invalid'));
  });
</script>
```