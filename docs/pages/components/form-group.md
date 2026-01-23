---
meta:
  title: Form Group
  description: Form groups organize and label multiple related form controls in a grid layout.
layout: component
---

Form groups are used to organize multiple form controls under a shared label and help text. They provide a responsive grid layout that automatically adapts to different screen sizes, making it easy to create multi-column forms with consistent spacing and alignment.

```html:preview
<zn-form-group label="Contact Information" help-text="Please provide your contact details">
  <zn-input label="First Name" placeholder="Enter your first name"></zn-input>
  <zn-input label="Last Name" placeholder="Enter your last name"></zn-input>
  <zn-input label="Email" type="email" placeholder="your.email@example.com"></zn-input>
  <zn-input label="Phone" type="tel" placeholder="(555) 123-4567"></zn-input>
</zn-form-group>
```

## Examples

### Basic Form Group

Use the `label` attribute to give the form group an accessible label. Form controls within the group are automatically laid out in a responsive grid that displays as a single column on mobile and up to 6 columns on larger screens.

```html:preview
<zn-form-group label="User Details">
  <zn-input label="Username" placeholder="username"></zn-input>
  <zn-input label="Email" type="email" placeholder="email@example.com"></zn-input>
</zn-form-group>
```

### Help Text

Add descriptive help text to a form group with the `help-text` attribute. For help text that contains HTML, use the `help-text` slot instead. Help text appears below the label and provides guidance for the entire group of form controls.

```html:preview
<zn-form-group label="Shipping Address" help-text="Enter the address where you want your order delivered">
  <zn-input label="Street Address" placeholder="123 Main St"></zn-input>
  <zn-input label="Apartment/Unit" placeholder="Apt 4B"></zn-input>
  <zn-input label="City" placeholder="New York"></zn-input>
  <zn-input label="Postal Code" placeholder="10001"></zn-input>
</zn-form-group>
<br />
<zn-form-group label="Billing Address">
  <div slot="help-text">Enter the address associated with your <strong>payment method</strong></div>
  <zn-input label="Street Address" placeholder="123 Main St"></zn-input>
  <zn-input label="City" placeholder="New York"></zn-input>
</zn-form-group>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when filling in the form group. Use **help text** to communicate instructions or requirements for filling in the controls without errors.
:::

```html:preview
<zn-form-group
  label="Payment Details"
  label-tooltip="Your payment information is encrypted and securely stored. We never share your financial data with third parties."
  help-text="Enter your credit or debit card information">
  <zn-input label="Cardholder Name" placeholder="Name on card"></zn-input>
  <zn-input label="Card Number" placeholder="1234 5678 9012 3456"></zn-input>
  <zn-input label="Expiry Date" placeholder="MM/YY" span="2"></zn-input>
  <zn-input label="CVV" placeholder="123" span="2"></zn-input>
</zn-form-group>
```

### Using Label Slot

For labels that contain HTML or more complex content, use the `label` slot instead of the attribute.

```html:preview
<zn-form-group help-text="Complete all required fields">
  <span slot="label">
    Account Settings <zn-chip variant="info" size="small">New</zn-chip>
  </span>
  <zn-input label="Display Name" placeholder="How should we address you?"></zn-input>
  <zn-input label="Bio" placeholder="Tell us about yourself"></zn-input>
</zn-form-group>
```

### Controlling Column Spans

By default, all form controls within a form group span the full width (6 columns) on mobile and maintain that full width on larger screens. Use the `span` attribute on individual form controls to control how many columns they occupy on medium and larger screens.

The grid supports spans from 1 to 6 columns. Spans only take effect on screens at the `md` breakpoint and above (tablets and desktops). On smaller screens, all controls stack vertically at full width.

```html:preview
<zn-form-group label="Product Information" help-text="Provide details about the product">
  <zn-input label="Product Name" placeholder="Enter product name"></zn-input>
  <zn-input label="SKU" placeholder="Product code" span="2"></zn-input>
  <zn-input label="Price" type="currency" placeholder="0.00" span="2"></zn-input>
  <zn-input label="Quantity" type="number" placeholder="0" span="2"></zn-input>
  <zn-select label="Category" span="3">
    <zn-option value="electronics">Electronics</zn-option>
    <zn-option value="clothing">Clothing</zn-option>
    <zn-option value="books">Books</zn-option>
  </zn-select>
  <zn-select label="Status" span="3">
    <zn-option value="active">Active</zn-option>
    <zn-option value="inactive">Inactive</zn-option>
  </zn-select>
</zn-form-group>
```

### Two-Column Layout

Create a balanced two-column layout by giving each control a span of 3 columns.

```html:preview
<zn-form-group label="Personal Information">
  <zn-input label="First Name" placeholder="First name" span="3"></zn-input>
  <zn-input label="Last Name" placeholder="Last name" span="3"></zn-input>
  <zn-input label="Email" type="email" placeholder="email@example.com" span="3"></zn-input>
  <zn-input label="Phone" type="tel" placeholder="(555) 123-4567" span="3"></zn-input>
  <zn-datepicker label="Date of Birth" span="3"></zn-datepicker>
  <zn-select label="Country" span="3">
    <zn-option value="us">United States</zn-option>
    <zn-option value="ca">Canada</zn-option>
    <zn-option value="uk">United Kingdom</zn-option>
  </zn-select>
</zn-form-group>
```

### Three-Column Layout

Create a three-column layout by giving each control a span of 2 columns.

```html:preview
<zn-form-group label="Event Schedule" help-text="Set up the event timing">
  <zn-datepicker label="Date" span="2"></zn-datepicker>
  <zn-input label="Start Time" type="time" span="2"></zn-input>
  <zn-input label="End Time" type="time" span="2"></zn-input>
  <zn-input label="Duration (hours)" type="number" span="2"></zn-input>
  <zn-select label="Time Zone" span="4">
    <zn-option value="est">Eastern (EST)</zn-option>
    <zn-option value="cst">Central (CST)</zn-option>
    <zn-option value="mst">Mountain (MST)</zn-option>
    <zn-option value="pst">Pacific (PST)</zn-option>
  </zn-select>
</zn-form-group>
```

### Mixed Column Layouts

Combine different column spans to create flexible layouts that accommodate different types of inputs.

```html:preview
<zn-form-group label="Address Details">
  <zn-input label="Street Address" placeholder="123 Main Street"></zn-input>
  <zn-input label="Apartment/Suite/Unit" placeholder="Apt 4B" span="2"></zn-input>
  <zn-input label="City" placeholder="New York" span="2"></zn-input>
  <zn-input label="State" placeholder="NY" span="1"></zn-input>
  <zn-input label="ZIP Code" placeholder="10001" span="1"></zn-input>
  <zn-select label="Country" span="3">
    <zn-option value="us">United States</zn-option>
    <zn-option value="ca">Canada</zn-option>
    <zn-option value="mx">Mexico</zn-option>
  </zn-select>
  <zn-checkbox span="3">Set as default address</zn-checkbox>
</zn-form-group>
```

### Mixing Form Control Types

Form groups work with all Zinc form components including inputs, selects, textareas, datepickers, checkboxes, radios, and toggles.

```html:preview
<zn-form-group label="Project Settings" help-text="Configure your project preferences">
  <zn-input label="Project Name" placeholder="My Awesome Project" span="4"></zn-input>
  <zn-select label="Priority" span="2">
    <zn-option value="low">Low</zn-option>
    <zn-option value="medium" selected>Medium</zn-option>
    <zn-option value="high">High</zn-option>
  </zn-select>
  <zn-datepicker label="Start Date" span="3"></zn-datepicker>
  <zn-datepicker label="End Date" span="3"></zn-datepicker>
  <zn-textarea label="Description" placeholder="Describe your project..." rows="3"></zn-textarea>
  <zn-radio-group label="Status" span="3">
    <zn-radio value="planning">Planning</zn-radio>
    <zn-radio value="active" checked>Active</zn-radio>
    <zn-radio value="complete">Complete</zn-radio>
  </zn-radio-group>
  <zn-checkbox-group label="Features" span="3">
    <zn-checkbox value="notifications">Email notifications</zn-checkbox>
    <zn-checkbox value="reports">Weekly reports</zn-checkbox>
    <zn-checkbox value="api">API access</zn-checkbox>
  </zn-checkbox-group>
</zn-form-group>
```

### Nested Groups with Different Sections

Create complex forms by using multiple form groups to separate different sections of related information.

```html:preview
<form>
  <zn-form-group label="Account Information" help-text="Basic account details">
    <zn-input label="Username" placeholder="username" span="3" required></zn-input>
    <zn-input label="Email" type="email" placeholder="email@example.com" span="3" required></zn-input>
    <zn-input label="Password" type="password" placeholder="••••••••" span="3" required></zn-input>
    <zn-input label="Confirm Password" type="password" placeholder="••••••••" span="3" required></zn-input>
  </zn-form-group>

  <br />

  <zn-form-group label="Personal Details" help-text="Tell us about yourself">
    <zn-input label="First Name" placeholder="First name" span="3"></zn-input>
    <zn-input label="Last Name" placeholder="Last name" span="3"></zn-input>
    <zn-input label="Phone" type="tel" placeholder="(555) 123-4567" span="3"></zn-input>
    <zn-datepicker label="Date of Birth" span="3"></zn-datepicker>
  </zn-form-group>

  <br />

  <zn-form-group label="Preferences">
    <zn-toggle name="newsletter" span="3">Subscribe to newsletter</zn-toggle>
    <zn-toggle name="sms" span="3">Receive SMS updates</zn-toggle>
  </zn-form-group>

  <br />

  <zn-button type="submit" variant="primary">Create Account</zn-button>
</form>
```

### Single-Column Layout

By default, without span attributes, all controls stack vertically in a single column, which works well for forms with long labels or complex inputs.

```html:preview
<zn-form-group label="Application Form" help-text="Complete all fields to submit your application">
  <zn-input label="Full Legal Name" placeholder="Enter your full name as it appears on government ID"></zn-input>
  <zn-input label="Email Address" type="email" placeholder="your.email@example.com"></zn-input>
  <zn-input label="Phone Number" type="tel" placeholder="Include country code"></zn-input>
  <zn-textarea label="Cover Letter" placeholder="Tell us why you're a great fit for this position..." rows="4"></zn-textarea>
  <zn-select label="How did you hear about us?">
    <zn-option value="search">Search Engine</zn-option>
    <zn-option value="social">Social Media</zn-option>
    <zn-option value="referral">Friend or Colleague</zn-option>
    <zn-option value="other">Other</zn-option>
  </zn-select>
</zn-form-group>
```

### Validation Example

Form groups work seamlessly with form validation. Individual controls within the group can have their own validation rules.

```html:preview
<form class="form-group-validation">
  <zn-form-group label="Registration Form" help-text="All fields are required">
    <zn-input
      name="firstName"
      label="First Name"
      placeholder="First name"
      span="3"
      required>
    </zn-input>
    <zn-input
      name="lastName"
      label="Last Name"
      placeholder="Last name"
      span="3"
      required>
    </zn-input>
    <zn-input
      name="email"
      label="Email"
      type="email"
      placeholder="email@example.com"
      span="3"
      required>
    </zn-input>
    <zn-input
      name="phone"
      label="Phone"
      type="tel"
      placeholder="(555) 123-4567"
      span="3"
      required>
    </zn-input>
    <zn-datepicker
      name="birthdate"
      label="Date of Birth"
      span="3"
      required>
    </zn-datepicker>
    <zn-select
      name="country"
      label="Country"
      span="3"
      required>
      <zn-option value="us">United States</zn-option>
      <zn-option value="ca">Canada</zn-option>
      <zn-option value="uk">United Kingdom</zn-option>
    </zn-select>
  </zn-form-group>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
  <zn-button type="reset">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.form-group-validation');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-input'),
    customElements.whenDefined('zn-datepicker'),
    customElements.whenDefined('zn-select')
  ]).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      alert('Form submitted successfully!\n\n' + JSON.stringify(data, null, 2));
    });
  });
</script>
```

### Responsive Behavior

Form groups are responsive by default. The grid layout automatically adapts based on screen size:

- **Small screens (mobile):** All controls stack vertically at full width, regardless of span attributes
- **Medium screens and up (tablets/desktops):** The span attributes take effect, creating the multi-column layout

This ensures forms remain usable on all devices without additional configuration.

```html:preview
<zn-form-group
  label="Responsive Layout Demo"
  help-text="Resize your browser to see the layout adapt">
  <zn-input label="Full width on mobile" span="6"></zn-input>
  <zn-input label="Half width on desktop" span="3"></zn-input>
  <zn-input label="Half width on desktop" span="3"></zn-input>
  <zn-input label="One third on desktop" span="2"></zn-input>
  <zn-input label="One third on desktop" span="2"></zn-input>
  <zn-input label="One third on desktop" span="2"></zn-input>
</zn-form-group>
```

### Styling with CSS Parts

Form groups expose several CSS parts that can be styled to customize their appearance. This example demonstrates how to create custom layouts using CSS grid.

```html:preview
<zn-form-group class="custom-form-group" label="Custom Styled Form Group" help-text="This form group has custom spacing and borders">
  <zn-input label="Field 1" span="3"></zn-input>
  <zn-input label="Field 2" span="3"></zn-input>
  <zn-input label="Field 3" span="2"></zn-input>
  <zn-input label="Field 4" span="2"></zn-input>
  <zn-input label="Field 5" span="2"></zn-input>
</zn-form-group>

<style>
  .custom-form-group::part(form-control) {
    padding: var(--zn-spacing-large);
    border: 2px solid var(--zn-color-primary-300);
    border-radius: var(--zn-border-radius-medium);
    background-color: var(--zn-color-primary-50);
  }

  .custom-form-group::part(form-control-label) {
    color: var(--zn-color-primary-700);
  }

  .custom-form-group::part(form-control-help-text) {
    color: var(--zn-color-primary-600);
  }
</style>
```

### Accessibility

Form groups are built with accessibility in mind:

- The component uses a `<fieldset>` element to semantically group related form controls
- The `label` is associated with the fieldset using `aria-labelledby`
- Help text is associated with the fieldset using `aria-describedby`
- All form controls within the group maintain their individual labels and accessibility features

```html:preview
<zn-form-group
  label="Accessible Form Group"
  help-text="Screen readers will announce the group label and help text"
  label-tooltip="Additional context for sighted users">
  <zn-input label="Name" placeholder="Your name" required></zn-input>
  <zn-input label="Email" type="email" placeholder="your@email.com" required></zn-input>
</zn-form-group>
```


