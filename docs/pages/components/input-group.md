---
meta:
  title: Input Group
  description: A wrapper component that groups inputs and selects visually.
layout: component
---

Input Groups allow you to group multiple form controls together into a single visual unit. They are ideal for creating compound inputs where multiple fields are related and should be visually connected, such as address fields, URL builders, or search interfaces with action buttons.

```html:preview
<zn-input-group>
  <zn-input placeholder="First Name"></zn-input>
  <zn-input placeholder="Last Name"></zn-input>
</zn-input-group>
```

:::tip
Input Groups support `zn-input`, `zn-select`, and `zn-button` components. The component automatically styles the borders and corners to create a seamless visual connection between controls.
:::

## Examples

### Basic Input Group

The simplest input group combines two or more inputs. Borders between controls are merged, and corner radii are adjusted automatically to create a unified appearance.

```html:preview
<zn-input-group>
  <zn-input placeholder="First Name"></zn-input>
  <zn-input placeholder="Last Name"></zn-input>
</zn-input-group>
```

### Multiple Inputs

You can group three or more inputs together. Middle inputs will have no border radius, creating a continuous flow.

```html:preview
<zn-input-group>
  <zn-input placeholder="City"></zn-input>
  <zn-input placeholder="State"></zn-input>
  <zn-input placeholder="Zip"></zn-input>
</zn-input-group>
```

### Label

Use the `label` attribute to give the input group an accessible label. For labels that contain HTML, use the `label` slot instead.

```html:preview
<zn-input-group label="Personal Information">
  <zn-input placeholder="First Name"></zn-input>
  <zn-input placeholder="Last Name"></zn-input>
</zn-input-group>
<br />
<zn-input-group>
  <span slot="label">Mailing Address</span>
  <zn-input placeholder="Street Address"></zn-input>
  <zn-input placeholder="City"></zn-input>
  <zn-input placeholder="State"></zn-input>
  <zn-input placeholder="Zip Code"></zn-input>
</zn-input-group>
```

### Mixed Inputs and Selects

Combine inputs and selects to create powerful compound controls. This is useful for URL builders, phone number inputs with country codes, or any scenario where a predefined option needs to be paired with user input.

```html:preview
<zn-input-group label="Website URL">
  <zn-select value="https://" style="width: 125px;">
    <zn-option value="http://">http://</zn-option>
    <zn-option value="https://">https://</zn-option>
  </zn-select>
  <zn-input placeholder="example.com"></zn-input>
</zn-input-group>
<br />
<zn-input-group label="Phone Number">
  <zn-select value="+1" style="width: 100px;">
    <zn-option value="+1">+1</zn-option>
    <zn-option value="+44">+44</zn-option>
    <zn-option value="+86">+86</zn-option>
    <zn-option value="+91">+91</zn-option>
  </zn-select>
  <zn-input type="tel" placeholder="(555) 123-4567"></zn-input>
</zn-input-group>
```

### Input with Button

Add a button to create search interfaces, newsletter signups, or any input that requires immediate action. Buttons integrate seamlessly with the grouped styling.

```html:preview
<zn-input-group label="Email Newsletter">
  <zn-input placeholder="Enter your email" type="email"></zn-input>
  <zn-button>Subscribe</zn-button>
</zn-input-group>
<br />
<zn-input-group label="Search Products">
  <zn-input placeholder="Search..." type="search"></zn-input>
  <zn-button color="secondary">Search</zn-button>
</zn-input-group>
```

### Button at the Start

Place a button at the beginning of the group for actions that should precede the input.

```html:preview
<zn-input-group label="Quick Search">
  <zn-button icon="search"></zn-button>
  <zn-input placeholder="Type to search..."></zn-input>
</zn-input-group>
```

### Multiple Controls with Buttons

Create more complex interfaces by combining multiple inputs, selects, and buttons in a single group.

```html:preview
<zn-input-group label="Transfer Funds">
  <zn-select value="USD" style="width: 100px;">
    <zn-option value="USD">USD</zn-option>
    <zn-option value="EUR">EUR</zn-option>
    <zn-option value="GBP">GBP</zn-option>
  </zn-select>
  <zn-input type="currency" placeholder="0.00"></zn-input>
  <zn-button color="success">Transfer</zn-button>
</zn-input-group>
<br />
<zn-input-group label="Date Range Filter">
  <zn-input type="date" placeholder="Start Date"></zn-input>
  <zn-input type="date" placeholder="End Date"></zn-input>
  <zn-button color="secondary">Apply</zn-button>
</zn-input-group>
```

### Flexible Width Distribution

Use the `span` attribute on individual controls to control their relative widths within the group. The span attribute accepts values from 1 to 12 and works similarly to CSS grid column spans. This is particularly useful when one field should be larger than others.

```html:preview
<zn-input-group label="Address">
  <zn-input span="8" placeholder="Street Address"></zn-input>
  <zn-input span="4" placeholder="Apt/Unit"></zn-input>
</zn-input-group>
<br />
<zn-input-group label="Contact Information">
  <zn-input span="6" placeholder="First Name"></zn-input>
  <zn-input span="6" placeholder="Last Name"></zn-input>
</zn-input-group>
<br />
<zn-input-group label="Location">
  <zn-input span="6" placeholder="City"></zn-input>
  <zn-input span="3" placeholder="State"></zn-input>
  <zn-input span="3" placeholder="Zip"></zn-input>
</zn-input-group>
```

:::tip
**Usage:** The `span` attribute only takes effect on medium screens and above. On smaller screens, all inputs will be equal width to ensure proper mobile usability.
:::

### Different Input Types

Input groups work with all input types, allowing you to create diverse compound controls.

```html:preview
<zn-input-group label="Payment Information">
  <zn-input type="text" placeholder="Cardholder Name" span="12"></zn-input>
</zn-input-group>
<br />
<zn-input-group>
  <zn-input type="text" placeholder="Card Number" span="8"></zn-input>
  <zn-input type="text" placeholder="CVV" span="4"></zn-input>
</zn-input-group>
<br />
<zn-input-group label="Price Range">
  <zn-input type="currency" placeholder="Min"></zn-input>
  <zn-input type="currency" placeholder="Max"></zn-input>
</zn-input-group>
```

### Form Integration

Input groups work seamlessly within forms. Each control maintains its individual `name` attribute for form submission.

```html:preview
<form class="input-group-form">
  <zn-input-group label="Full Name">
    <zn-input name="firstName" placeholder="First Name" required></zn-input>
    <zn-input name="lastName" placeholder="Last Name" required></zn-input>
  </zn-input-group>
  <br />
  <zn-input-group label="Contact">
    <zn-select name="countryCode" value="+1" style="width: 100px;">
      <zn-option value="+1">+1</zn-option>
      <zn-option value="+44">+44</zn-option>
    </zn-select>
    <zn-input name="phone" type="tel" placeholder="Phone Number" required></zn-input>
  </zn-input-group>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.input-group-form');

  await Promise.all([
    customElements.whenDefined('zn-input'),
    customElements.whenDefined('zn-select'),
    customElements.whenDefined('zn-button')
  ]).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
    });
  });
</script>
```

### Focus Behavior

When a control within the group receives focus, its z-index increases to ensure the focus ring displays properly over adjacent controls.

```html:preview
<zn-input-group label="Try clicking into each field">
  <zn-input placeholder="First Name"></zn-input>
  <zn-input placeholder="Last Name"></zn-input>
  <zn-input placeholder="Email"></zn-input>
</zn-input-group>
```

### Styling Individual Controls

You can still apply individual styling to controls within a group. However, note that border-radius is controlled by the input group and will be overridden.

```html:preview
<zn-input-group label="Custom Styled Controls">
  <zn-input placeholder="Normal" span="4"></zn-input>
  <zn-input placeholder="Disabled" disabled span="4"></zn-input>
  <zn-input placeholder="With Value" value="Prefilled" span="4"></zn-input>
</zn-input-group>
<br />
<zn-input-group label="Different Sizes">
  <zn-input placeholder="Medium (default)" size="medium"></zn-input>
  <zn-input placeholder="Large" size="large"></zn-input>
</zn-input-group>
```

:::warning
**Note:** While controls within a group can have different sizes, it's recommended to use consistent sizes for better visual harmony. The component adjusts alignment automatically, but mixed sizes may not look as polished.
:::
