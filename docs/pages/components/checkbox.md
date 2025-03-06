---
meta:
  title: Checkbox
  description: Checkboxes allow the user to toggle an option on or off.
layout: component
unusedProperties: |
  - Boolean `indeterminate
---

## Examples

### Basic Checkbox

```html:preview
<zn-checkbox>Financial products access<zn-checkbox>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Description

Add descriptive help text to individual checkbox items with the `description` attribute. For descriptions that contain
HTML, use the `description` slot instead.

```html:preview
<zn-checkbox description="Grants access to cash account and charge card features">Financial products access</zn-checkbox>
```

### Contained

Add the `contained` attribute to draw a card-like container around a checkbox. Add to
a [Checkbox Group](/components/checkbox-group) to draw a container around each checkbox in the group. This style is
useful for giving more emphasis to a checkbox or list of checkboxes.

```html:preview
<zn-checkbox description="Grants access to cash account and charge card features" contained>Financial products access</zn-checkbox>
<br/>
<br/>
<zn-checkbox-group label="Financial products permissions" contained>
  <zn-checkbox description="Requires separate initiators and approvers">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox description="Requires separate initiators and approvers">Approve outbound transfers </zn-checkbox>
  <zn-checkbox description="Applies to both cash account and charge card" disabled>Export transactions<zn-checkbox>
<zn-checkbox-group>
```

:::tip
When checkboxes are wrapped with [Checkbox Group](/components/checkbox-group), adding the `contained` attribute to the
parent Checkbox Group or to _any_ checkbox in the group will create `contained` checkboxes for the entire group.
:::

### Selected Content

Use the `selected-content` slot to display additional content (such as an input field) inside a `contained` checkbox
when it is checked. The slot is unstyled by default. Use `::part(selected-content)` to style the content as needed.

:::warning
**Note:** `ts_form_for` doesn't support slots. The `selected-content` slot cannot be used for checkboxes rendered with
`ts_form_for`.
:::

```html:preview
<zn-checkbox style="width:100%" contained>Grant financial products access
  <div slot="selected-content">
    <p>A mobile number is required to grant this user access to financial products. The number will be used for login verification.</p>
    <zn-input style="width: 280px;" label="Mobile number" type="tel" required optional-icon></div>
<zn-checkbox>
<style>
 zn-checkbox::part(selected-content) {
    font-size: 14px;
    font-weight: normal;
    color: #6D7176;
  }
</style>
```

### Checked

Use the `checked` attribute to activate the checkbox.

```html:preview
<zn-checkbox checked>Financial products access<zn-checkbox>
```

### Indeterminate

Use the `indeterminate` attribute to make the checkbox indeterminate.

```html:preview
<zn-checkbox indeterminate>Indeterminate<zn-checkbox>
```

### Disabled

Use the `disabled` attribute to disable the checkbox.

```html:preview
<zn-checkbox disabled>Disabled<zn-checkbox>
```

### Sizes

Use the `size` attribute to change a checkboxs size.

```html:preview
<zn-checkbox size="small">Small</zn-checkbox>
<br />
<zn-checkbox size="medium">Medium</zn-checkbox>
<br />
<zn-checkbox size="large">Large</zn-checkbox>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and
make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html:preview
<form class="custom-validity">
  <zn-checkbox>Check me</zn-checkbox>
  <br />
  <zn-button type="submit" variant="primary" style="margin-top: 1rem;">Submit</zn-button>
</form>
<script type="module">
  const form = document.querySelector('.custom-validity');
  const checkbox = form.querySelector('zn-checkbox');
  const errorMessage = `Do not forget to check me!`;

  // Set initial validity as soon as the element is defined
  customElements.whenDefined(zn-checkbox').then(async () => {
    await checkbox.updateComplete;
    checkbox.setCustomValidity(errorMessage);
  });

  // Update validity on change
  checkbox.addEventListener('zn-change', () => {
    checkbox.setCustomValidity(checkbox.checked ? '' : errorMessage);
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined(zn-checkbox'),
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```