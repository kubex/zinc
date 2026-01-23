---
meta:
  title: Radio Group
  description: Radio groups are used to group multiple radios so they function as a single form control.
layout: component
---

```html:preview
<zn-radio-group label="Select an option">
  <zn-radio value="1">Option 1</zn-radio>
  <zn-radio value="2">Option 2</zn-radio>
  <zn-radio value="3">Option 3</zn-radio>
</zn-radio-group>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Radio Group

Use the `label` attribute to give the radio group an accessible label. For labels that contain HTML, use the `label` slot instead. A basic radio group lays out multiple radio items vertically.

```html:preview
<zn-radio-group label="Financial products permissions" name="a">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
```

### Initial Values

Use the `value` attribute to set the initial selection.

```html:preview
<zn-radio-group label="Select a payment method" value="credit-card">
  <zn-radio value="credit-card">Credit Card</zn-radio>
  <zn-radio value="debit-card">Debit Card</zn-radio>
  <zn-radio value="bank-transfer">Bank Transfer</zn-radio>
</zn-radio-group>
```

### Help Text

Add descriptive help text to a radio group with the `help-text` attribute. For help texts that contain HTML, use the
`help-text` slot instead.

```html:preview
<zn-radio-group label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" name="a">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
<br>
<zn-radio-group label="Financial products permissions" name="b">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
  <div slot="help-text">Outbound transfers require <strong>separate</strong> initiators and approvers</div>
</zn-radio-group>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when
making a selection from the radio group. Use **help text** to communicate instructions or requirements for making a
selection without errors.
:::

```html:preview
<zn-radio-group name="a" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" label-tooltip="These apply to cash account only">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
```

### Sizes

Use the `size` attribute to change a radio group's size. This size will be applied to all child radios in the group. Size `medium` is the default.

```html:preview
<zn-radio-group label="Small size" size="small" name="size-small">
  <zn-radio value="option-1">Option 1</zn-radio>
  <zn-radio value="option-2">Option 2</zn-radio>
  <zn-radio value="option-3">Option 3</zn-radio>
</zn-radio-group>
<br />
<zn-radio-group label="Medium size" size="medium" name="size-medium">
  <zn-radio value="option-1">Option 1</zn-radio>
  <zn-radio value="option-2">Option 2</zn-radio>
  <zn-radio value="option-3">Option 3</zn-radio>
</zn-radio-group>
<br />
<zn-radio-group label="Large size" size="large" name="size-large">
  <zn-radio value="option-1">Option 1</zn-radio>
  <zn-radio value="option-2">Option 2</zn-radio>
  <zn-radio value="option-3">Option 3</zn-radio>
</zn-radio-group>
```

### Horizontal Radio Group

Use the `horizontal` attribute to lay out multiple radio items horizontally.

:::tip
**Making the horizontal radio group responsive:** Use a container query to adjust the layout of the radio group's
`form-control-input` part (which wraps the radio items) at a custom target breakpoint (the container's width when the
horizontal layout breaks). In the example below, a container query checks the width of the radio group container and
switches the layout to vertical (setting `flex-direction` to `column`) when the container becomes too narrow for a
horizontal layout.
:::

```html:preview
<zn-radio-group name="a" id="permissions" label="Financial products permissions" horizontal>
  <zn-radio value="manage-transfers">Manage transfers</zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>

<style>
  zn-radio-group[id="permissions"] {
    container-type: inline-size;
    container-name: permissions;
  }

  @container permissions (max-width: 400px) {
    zn-radio-group[id="permissions"]::part(form-control-input) {
      flex-direction: column;
    }
  }
</style>
```

### Contained Radio Group

Use the `contained` attribute to draw a card-like container around each radio item in the radio group. This style
is useful for giving more emphasis to the list of options.

This option can be combined with the `horizontal` attribute.

```html:preview
<zn-radio-group name="a" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" contained>
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
<br/>
<br/>
<zn-radio-group name="b" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" contained horizontal>
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
</zn-radio-group>
```

:::tip
When [radios](/components/radio) are wrapped with the Radio Group, adding the `contained` attribute to the
parent Radio Group or to _any_ radio in the group will create `contained` radios for the entire group.
:::

### Disabling Options

Radios can be disabled by adding the `disabled` attribute to the respective options inside the radio group.

```html:preview
<zn-radio-group name="a" label="Financial products permissions" help-text="Exporting is currently disabled for all users">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export" disabled>Export transactions</zn-radio>
</zn-radio-group>
```

### Form Integration

Radio group components work seamlessly with standard HTML forms. The radio group's `name` attribute determines the key in the form data, and the selected radio's `value` becomes the value.

```html:preview
<form id="radio-form">
  <zn-radio-group name="department" label="Department" value="engineering" required>
    <zn-radio value="engineering">Engineering</zn-radio>
    <zn-radio value="design">Design</zn-radio>
    <zn-radio value="marketing">Marketing</zn-radio>
    <zn-radio value="sales">Sales</zn-radio>
  </zn-radio-group>
  <br />
  <zn-radio-group name="level" label="Experience level" value="mid" required>
    <zn-radio value="junior">Junior</zn-radio>
    <zn-radio value="mid">Mid-level</zn-radio>
    <zn-radio value="senior">Senior</zn-radio>
  </zn-radio-group>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
  <zn-button type="reset">Reset</zn-button>
</form>

<script type="module">
  const form = document.getElementById('radio-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Validation

Set the `required` attribute to make selecting an option mandatory. If a value has not been selected, it will prevent the form from submitting and display an error message.

```html:preview
<form class="validation">
  <zn-radio-group name="a" label="Select one option" required>
    <zn-radio value="option-1">Option 1</zn-radio>
    <zn-radio value="option-2">Option 2</zn-radio>
    <zn-radio value="option-3">Option 3</zn-radio>
  </zn-radio-group>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.validation');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-radio-group'),
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and
make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html:preview
<form class="custom-validity">
  <zn-radio-group name="a" label="Select the second option" required>
    <zn-radio value="option-1">I'm not the right choice</zn-radio>
    <zn-radio value="option-2">You must choose me</zn-radio>
    <zn-radio value="option-3">I won't work either</zn-radio>
  </zn-radio-group>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.custom-validity');
  const radioGroup = form.querySelector('zn-radio-group');
  const errorMessage = 'You must choose the second option';

  // Set initial validity as soon as the element is defined
  customElements.whenDefined('zn-radio').then(() => {
    radioGroup.setCustomValidity(errorMessage);
  });

  // Update validity when a selection is made
  form.addEventListener('zn-change', () => {
    const isValid = radioGroup.value === 'option-2';
    radioGroup.setCustomValidity(isValid ? '' : errorMessage);
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-radio-group'),
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Programmatic Control

You can control the radio group programmatically using its methods and properties:

```html:preview
<div class="form-spacing">
  <zn-radio-group id="programmatic-radio" label="Programmatic control" name="programmatic">
    <zn-radio value="option-1">Option 1</zn-radio>
    <zn-radio value="option-2">Option 2</zn-radio>
    <zn-radio value="option-3">Option 3</zn-radio>
    <zn-radio value="option-4">Option 4</zn-radio>
  </zn-radio-group>

  <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <zn-button id="focus-btn" size="small">Focus</zn-button>
    <zn-button id="set-value-btn" size="small">Set Value to Option 3</zn-button>
    <zn-button id="check-validity-btn" size="small">Check Validity</zn-button>
    <zn-button id="get-form-btn" size="small">Get Form</zn-button>
  </div>
</div>

<script type="module">
  const radioGroup = document.getElementById('programmatic-radio');

  document.getElementById('focus-btn').addEventListener('click', () => radioGroup.focus());
  document.getElementById('set-value-btn').addEventListener('click', () => {
    radioGroup.value = 'option-3';
  });
  document.getElementById('check-validity-btn').addEventListener('click', () => {
    alert('Valid: ' + radioGroup.checkValidity());
  });
  document.getElementById('get-form-btn').addEventListener('click', () => {
    const form = radioGroup.getForm();
    alert('Form: ' + (form ? form.id || 'Form found (no ID)' : 'Not in a form'));
  });
</script>
```

### Keyboard Navigation

The radio group component supports comprehensive keyboard navigation:

- **Tab** - Move focus to/from the radio group (focuses the checked radio, or the first radio if none are checked)
- **Arrow Up/Left** - Select the previous radio in the group (wraps around to the last option)
- **Arrow Down/Right** - Select the next radio in the group (wraps around to the first option)
- **Space** - Select the currently focused radio

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the label to the left of the control.

```html:preview
<zn-radio-group class="label-on-left" label="Department" name="dept-custom">
  <zn-radio value="engineering">Engineering</zn-radio>
  <zn-radio value="design">Design</zn-radio>
  <zn-radio value="marketing">Marketing</zn-radio>
</zn-radio-group>

<style>
  .label-on-left {
    --label-width: 5rem;
  }

  .label-on-left::part(form-control) {
    display: grid;
    grid: auto / var(--label-width) 1fr;
    gap: var(--zn-spacing-3x-small) var(--zn-spacing-medium);
    align-items: start;
  }

  .label-on-left::part(form-control-label) {
    text-align: right;
    padding-top: 0.25rem;
  }

  .label-on-left::part(form-control-help-text) {
    grid-column-start: 2;
  }
</style>
```
