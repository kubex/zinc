---
meta:
  title: Inline Edit
  description: Inline edit allows users to edit content directly in place, switching between view and edit modes.
layout: component
---

Inline edit components provide a seamless way for users to edit content without leaving the current context or navigating to a separate form. They display content normally and reveal input controls when the user clicks an edit button or the content area itself.

```html:preview
<div class="form-spacing">
  <zn-inline-edit name="title" value="Click edit to change this text" placeholder="Enter title"></zn-inline-edit>

  <zn-inline-edit name="description" value="This example uses a textarea input type" input-type="textarea" placeholder="Enter description"></zn-inline-edit>

  <zn-inline-edit
    name="status"
    value="active"
    options='{"active": "Active", "inactive": "Inactive", "pending": "Pending"}'>
  </zn-inline-edit>
</div>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Text Input

The default input type is text. Click the edit button to activate edit mode.

```html:preview
<div class="form-spacing">
  <zn-inline-edit name="username" value="john.doe" placeholder="Enter username"></zn-inline-edit>

  <zn-inline-edit name="email" value="john.doe@example.com" placeholder="Enter email"></zn-inline-edit>
</div>
```

### Custom Edit Button Text

Use the `edit-text` attribute to customize the edit button text instead of showing the default edit icon.

```html:preview
<div class="form-spacing">
  <zn-inline-edit name="title" value="Custom edit button" edit-text="Edit"></zn-inline-edit>

  <zn-inline-edit name="description" value="Another example" edit-text="Modify"></zn-inline-edit>
</div>
```

### Textarea Input Type

Use `input-type="textarea"` for multi-line text content.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="bio"
    value="This is a longer piece of text that spans multiple lines. Click edit to modify this content in a textarea."
    input-type="textarea"
    placeholder="Enter your bio">
  </zn-inline-edit>

  <zn-inline-edit
    name="notes"
    value="Short note"
    input-type="textarea"
    edit-text="Edit notes">
  </zn-inline-edit>
</div>
```

### Number Input Type

Use `input-type="number"` for numeric values.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="quantity"
    value="42"
    input-type="number"
    placeholder="Enter quantity">
  </zn-inline-edit>

  <zn-inline-edit
    name="price"
    value="99.99"
    input-type="number"
    edit-text="Edit price">
  </zn-inline-edit>
</div>
```

### Select Input with Options

Provide an `options` object to automatically create a select input. The object uses values as keys and labels as values.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="status"
    value="active"
    options='{"active": "Active", "inactive": "Inactive", "pending": "Pending", "archived": "Archived"}'>
  </zn-inline-edit>

  <zn-inline-edit
    name="priority"
    value="medium"
    edit-text="Change"
    options='{"low": "Low Priority", "medium": "Medium Priority", "high": "High Priority", "urgent": "Urgent"}'>
  </zn-inline-edit>
</div>
```

### Data Select with Provider

Use the `provider` attribute to integrate with data select providers like countries, currencies, or colors.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="country"
    value="gb"
    provider="country"
    edit-text="Change country">
  </zn-inline-edit>

  <zn-inline-edit
    name="currency"
    value="usd"
    provider="currency">
  </zn-inline-edit>

  <zn-inline-edit
    name="color"
    value="blue"
    provider="color"
    edit-text="Pick color">
  </zn-inline-edit>
</div>
```

### Data Select with Icon Position

When using a data select provider, you can control the icon position with the `icon-position` attribute.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="country"
    value="us"
    provider="country"
    icon-position="start">
  </zn-inline-edit>

  <zn-inline-edit
    name="country2"
    value="fr"
    provider="country"
    icon-position="end">
  </zn-inline-edit>
</div>
```

### Help Text

Add descriptive help text to guide users with the `help-text` attribute. The help text appears below the input when in edit mode.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="username"
    value="john_doe"
    help-text="Username must be lowercase with no spaces"
    placeholder="Enter username">
  </zn-inline-edit>

  <zn-inline-edit
    name="slug"
    value="my-page-title"
    help-text="Use hyphens to separate words"
    input-type="text"
    edit-text="Edit slug">
  </zn-inline-edit>
</div>
```

### Placeholders

Use the `placeholder` attribute to show placeholder text when the value is empty.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="title"
    value=""
    placeholder="Click edit to add a title">
  </zn-inline-edit>

  <zn-inline-edit
    name="description"
    value=""
    input-type="textarea"
    placeholder="Add a description..."
    edit-text="Add">
  </zn-inline-edit>
</div>
```

### Required Fields

Use the `required` attribute to make the field required for form submission.

```html:preview
<form class="inline-edit-form">
  <div class="form-spacing">
    <zn-inline-edit
      name="firstName"
      value=""
      required
      placeholder="First name (required)"
      help-text="This field is required">
    </zn-inline-edit>

    <zn-inline-edit
      name="lastName"
      value=""
      required
      placeholder="Last name (required)"
      edit-text="Edit">
    </zn-inline-edit>

    <zn-button type="submit" variant="primary">Submit Form</zn-button>
  </div>
</form>

<script type="module">
  const form = document.querySelector('.inline-edit-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-inline-edit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Pattern Validation

Use the `pattern` attribute to validate input against a regular expression.

```html:preview
<form class="pattern-form">
  <div class="form-spacing">
    <zn-inline-edit
      name="zipCode"
      value="12345"
      pattern="[0-9]{5}"
      help-text="Must be a 5-digit ZIP code">
    </zn-inline-edit>

    <zn-inline-edit
      name="productCode"
      value="ABC-123"
      pattern="[A-Z]{3}-[0-9]{3}"
      help-text="Format: ABC-123"
      edit-text="Edit">
    </zn-inline-edit>

    <zn-button type="submit" variant="primary">Validate</zn-button>
  </div>
</form>

<script type="module">
  const form = document.querySelector('.pattern-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-inline-edit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      alert('All fields are valid!');
    }
  });
</script>
```

### Sizes

Use the `size` attribute to change the inline edit size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="small"
    value="Small size"
    size="small">
  </zn-inline-edit>

  <zn-inline-edit
    name="medium"
    value="Medium size (default)"
    size="medium">
  </zn-inline-edit>

  <zn-inline-edit
    name="large"
    value="Large size"
    size="large">
  </zn-inline-edit>
</div>
```

### Disabled State

Use the `disabled` attribute to disable the inline edit component.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="disabled1"
    value="This field is disabled"
    disabled>
  </zn-inline-edit>

  <zn-inline-edit
    name="disabled2"
    value="Cannot edit this"
    disabled
    edit-text="Edit">
  </zn-inline-edit>
</div>
```

### Inline Layout

Use the `inline` attribute to display the inline edit component in a more compact, inline layout.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="title"
    value="Inline layout example"
    inline>
  </zn-inline-edit>

  <zn-inline-edit
    name="status"
    value="active"
    inline
    options='{"active": "Active", "inactive": "Inactive"}'>
  </zn-inline-edit>

  <zn-inline-edit
    name="description"
    value="Short description"
    input-type="textarea"
    inline
    edit-text="Edit">
  </zn-inline-edit>
</div>
```

### Padded Layout

Use the `padded` attribute to add padding around the component.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="padded1"
    value="This has padding"
    padded>
  </zn-inline-edit>

  <zn-inline-edit
    name="padded2"
    value="Another padded example"
    padded
    edit-text="Edit">
  </zn-inline-edit>
</div>
```

### Text Direction

Use the `dir` attribute to control text direction. Useful for right-to-left languages.

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    name="rtl"
    value="مرحبا بك"
    dir="rtl"
    placeholder="أدخل النص">
  </zn-inline-edit>

  <zn-inline-edit
    name="ltr"
    value="Hello world"
    dir="ltr"
    placeholder="Enter text">
  </zn-inline-edit>
</div>
```

### Form Integration

Inline edit components work seamlessly with standard HTML forms. Multiple inline edits can be used together in a form.

```html:preview
<form id="profile-form">
  <div class="form-spacing">
    <zn-inline-edit
      name="fullName"
      value="John Doe"
      required
      placeholder="Full name"
      help-text="Your full legal name">
    </zn-inline-edit>

    <zn-inline-edit
      name="jobTitle"
      value="Senior Developer"
      placeholder="Job title">
    </zn-inline-edit>

    <zn-inline-edit
      name="department"
      value="engineering"
      options='{"engineering": "Engineering", "design": "Design", "marketing": "Marketing", "sales": "Sales"}'>
    </zn-inline-edit>

    <zn-inline-edit
      name="location"
      value="us"
      provider="country"
      icon-position="start">
    </zn-inline-edit>

    <zn-inline-edit
      name="bio"
      value="I love building great software and working with talented teams."
      input-type="textarea"
      placeholder="Short bio">
    </zn-inline-edit>

    <zn-button type="submit" variant="primary">Save Profile</zn-button>
    <zn-button type="reset">Reset</zn-button>
  </div>
</form>

<script type="module">
  const form = document.getElementById('profile-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-inline-edit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Profile saved!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Keyboard Interactions

The inline edit component supports several keyboard interactions for better accessibility:

- **Enter** - When in edit mode (not textarea), submits the changes and exits edit mode
- **Shift + Enter** - In edit mode, allows Enter to be used for its normal purpose (like line breaks in textarea)
- **Escape** - Cancels editing and reverts to the original value
- **Click outside** - Commits changes and exits edit mode

```html:preview
<div class="form-spacing">
  <p><strong>Try these keyboard shortcuts:</strong></p>
  <ul style="margin-bottom: 1rem;">
    <li>Click edit, then press <kbd>Enter</kbd> to save</li>
    <li>Click edit, then press <kbd>Escape</kbd> to cancel</li>
    <li>Click edit, make changes, then click outside to save</li>
  </ul>

  <zn-inline-edit
    name="keyboardDemo"
    value="Edit me and try the keyboard shortcuts"
    help-text="Press Enter to save, Escape to cancel">
  </zn-inline-edit>

  <zn-inline-edit
    name="textareaDemo"
    value="For textareas, use Shift+Enter or click the check button to save"
    input-type="textarea"
    help-text="Enter adds new lines, use check button to save">
  </zn-inline-edit>
</div>
```

### Events

The inline edit component emits several events you can listen to:

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    id="event-example"
    name="eventDemo"
    value="Interact with this field to see events">
  </zn-inline-edit>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
    <strong>Event Log:</strong>
    <div id="event-log" style="margin-top: 0.5rem; font-family: monospace; font-size: 0.875rem;"></div>
  </div>
</div>

<script type="module">
  const inlineEdit = document.getElementById('event-example');
  const eventLog = document.getElementById('event-log');

  await customElements.whenDefined('zn-inline-edit');

  function logEvent(eventName, detail) {
    const time = new Date().toLocaleTimeString();
    const message = `[${time}] ${eventName}${detail ? ': ' + JSON.stringify(detail) : ''}`;
    eventLog.innerHTML = message + '<br>' + eventLog.innerHTML;
    const lines = eventLog.innerHTML.split('<br>');
    if (lines.length > 5) {
      eventLog.innerHTML = lines.slice(0, 5).join('<br>');
    }
  }

  inlineEdit.addEventListener('zn-input', (e) => logEvent('zn-input'));
  inlineEdit.addEventListener('zn-change', (e) => logEvent('zn-change', { value: e.target.value }));
  inlineEdit.addEventListener('zn-submit', (e) => logEvent('zn-submit', { value: e.detail.value }));
  inlineEdit.addEventListener('zn-blur', (e) => logEvent('zn-blur'));
</script>
```

### Practical Use Cases

#### Editable Profile Information

```html:preview
<div style="max-width: 600px; padding: 1.5rem; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px;">
  <h3 style="margin-top: 0;">User Profile</h3>

  <form id="user-profile">
    <div class="form-spacing">
      <div style="display: grid; gap: 0.5rem;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <strong style="min-width: 120px;">Name:</strong>
          <zn-inline-edit name="name" value="Sarah Johnson" inline></zn-inline-edit>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <strong style="min-width: 120px;">Email:</strong>
          <zn-inline-edit name="email" value="sarah.j@example.com" inline></zn-inline-edit>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <strong style="min-width: 120px;">Role:</strong>
          <zn-inline-edit
            name="role"
            value="developer"
            inline
            options='{"developer": "Developer", "designer": "Designer", "manager": "Manager", "admin": "Administrator"}'>
          </zn-inline-edit>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <strong style="min-width: 120px;">Country:</strong>
          <zn-inline-edit
            name="country"
            value="us"
            provider="country"
            icon-position="start"
            inline>
          </zn-inline-edit>
        </div>
      </div>
    </div>
  </form>
</div>
```

#### Editable Table Cells

```html:preview
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background: var(--zn-color-neutral-100); border-bottom: 2px solid var(--zn-color-neutral-300);">
      <th style="padding: 0.75rem; text-align: left;">Product</th>
      <th style="padding: 0.75rem; text-align: left;">Status</th>
      <th style="padding: 0.75rem; text-align: left;">Quantity</th>
      <th style="padding: 0.75rem; text-align: left;">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid var(--zn-color-neutral-200);">
      <td style="padding: 0.75rem;">
        <zn-inline-edit name="product1" value="Widget A" inline></zn-inline-edit>
      </td>
      <td style="padding: 0.75rem;">
        <zn-inline-edit
          name="status1"
          value="active"
          inline
          options='{"active": "Active", "inactive": "Inactive", "discontinued": "Discontinued"}'>
        </zn-inline-edit>
      </td>
      <td style="padding: 0.75rem;">
        <zn-inline-edit name="qty1" value="150" input-type="number" inline></zn-inline-edit>
      </td>
      <td style="padding: 0.75rem;">
        <zn-inline-edit name="notes1" value="In stock" inline></zn-inline-edit>
      </td>
    </tr>
    <tr style="border-bottom: 1px solid var(--zn-color-neutral-200);">
      <td style="padding: 0.75rem;">
        <zn-inline-edit name="product2" value="Widget B" inline></zn-inline-edit>
      </td>
      <td style="padding: 0.75rem;">
        <zn-inline-edit
          name="status2"
          value="inactive"
          inline
          options='{"active": "Active", "inactive": "Inactive", "discontinued": "Discontinued"}'>
        </zn-inline-edit>
      </td>
      <td style="padding: 0.75rem;">
        <zn-inline-edit name="qty2" value="45" input-type="number" inline></zn-inline-edit>
      </td>
      <td style="padding: 0.75rem;">
        <zn-inline-edit name="notes2" value="Low stock" inline></zn-inline-edit>
      </td>
    </tr>
  </tbody>
</table>
```

#### Settings Panel

```html:preview
<div style="max-width: 700px; padding: 1.5rem; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px; background: var(--zn-color-neutral-50);">
  <h3 style="margin-top: 0;">Application Settings</h3>

  <form id="settings-form">
    <div class="form-spacing">
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem;">General</h4>
        <zn-inline-edit
          name="appName"
          value="My Application"
          placeholder="Application name"
          padded>
        </zn-inline-edit>

        <zn-inline-edit
          name="tagline"
          value="The best app for your needs"
          placeholder="Tagline"
          padded>
        </zn-inline-edit>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem;">Localization</h4>
        <zn-inline-edit
          name="language"
          value="en"
          provider="country"
          icon-position="start"
          edit-text="Change"
          padded>
        </zn-inline-edit>

        <zn-inline-edit
          name="currency"
          value="usd"
          provider="currency"
          icon-position="start"
          padded>
        </zn-inline-edit>
      </div>

      <div>
        <h4 style="margin-bottom: 0.5rem;">Description</h4>
        <zn-inline-edit
          name="description"
          value="A comprehensive solution for managing your business operations efficiently."
          input-type="textarea"
          placeholder="Enter a description"
          edit-text="Edit"
          padded>
        </zn-inline-edit>
      </div>

      <zn-button type="submit" variant="primary" style="margin-top: 1rem;">Save Settings</zn-button>
    </div>
  </form>
</div>

<script type="module">
  const form = document.getElementById('settings-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-inline-edit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Settings saved!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Programmatic Control

You can control the inline edit component programmatically using its methods:

```html:preview
<div class="form-spacing">
  <zn-inline-edit
    id="programmatic-demo"
    name="demo"
    value="Control me programmatically">
  </zn-inline-edit>

  <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <zn-button id="check-validity-btn" size="small">Check Validity</zn-button>
    <zn-button id="set-value-btn" size="small">Set Value</zn-button>
    <zn-button id="focus-btn" size="small">Focus</zn-button>
    <zn-button id="get-value-btn" size="small">Get Value</zn-button>
  </div>
</div>

<script type="module">
  const inlineEdit = document.getElementById('programmatic-demo');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-inline-edit');

  document.getElementById('check-validity-btn').addEventListener('click', () => {
    const isValid = inlineEdit.checkValidity();
    alert('Valid: ' + isValid);
  });

  document.getElementById('set-value-btn').addEventListener('click', () => {
    inlineEdit.value = 'New value set at ' + new Date().toLocaleTimeString();
  });

  document.getElementById('focus-btn').addEventListener('click', () => {
    inlineEdit.focus();
  });

  document.getElementById('get-value-btn').addEventListener('click', () => {
    alert('Current value: ' + inlineEdit.value);
  });
</script>
```
