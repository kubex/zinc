---
meta:
  title: Radio
  description: Radios allow the user to select a single option from a group.
layout: component
---

```html:preview
<zn-radio>Radio option</zn-radio>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Radio

A basic radio button with a label.

```html:preview
<zn-radio>Default option</zn-radio>
```

### Checked

Use the `checked` attribute to activate the radio by default.

```html:preview
<zn-radio checked>Selected option</zn-radio>
```

### Disabled

Use the `disabled` attribute to disable the radio.

```html:preview
<zn-radio disabled>Disabled radio</zn-radio>
<br />
<zn-radio disabled checked>Disabled and checked</zn-radio>
```

### Sizes

Use the `size` attribute to change the radio size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<zn-radio size="small">Small</zn-radio>
<br />
<zn-radio size="medium">Medium</zn-radio>
<br />
<zn-radio size="large">Large</zn-radio>
```

### Radio Groups

Radio buttons are typically used in groups where only one option can be selected. Radios with the same `name` will be mutually exclusive.

```html:preview
<div id="basic-radio-group">
  <zn-radio name="color" value="red">Red</zn-radio>
  <br />
  <zn-radio name="color" value="green">Green</zn-radio>
  <br />
  <zn-radio name="color" value="blue" checked>Blue</zn-radio>
</div>
```

### Description

Add descriptive help text to radios with the `description` attribute. For descriptions that contain HTML, use the `description` slot instead.

```html:preview
<zn-radio name="plan" description="Best for individuals and small teams">Basic Plan</zn-radio>
<br />
<zn-radio name="plan" description="Includes advanced features and priority support">Pro Plan</zn-radio>
<br />
<zn-radio name="plan">
  Enterprise Plan
  <div slot="description">
    Custom pricing with <strong>dedicated support</strong> and enterprise features.
  </div>
</zn-radio>
```

### Label and Label Tooltip

Use the `label` attribute to add a form control label above the radio group. Use `label-tooltip` to provide additional context.

```html:preview
<zn-radio label="Notification Preferences" label-tooltip="Choose how you want to be notified">
  Email notifications
</zn-radio>
<br />
<zn-radio label="Notification Preferences" label-tooltip="Choose how you want to be notified">
  SMS notifications
</zn-radio>
```

### Contained Style

Add the `contained` attribute to draw a card-like container around a radio. This style is useful for giving more emphasis to radio options.

```html:preview
<zn-radio name="payment" value="credit" description="Pay with Visa, Mastercard, or Amex" contained checked>Credit Card</zn-radio>
<br />
<zn-radio name="payment" value="paypal" description="Fast and secure PayPal checkout" contained>PayPal</zn-radio>
<br />
<zn-radio name="payment" value="bank" description="Direct bank transfer (3-5 business days)" contained>Bank Transfer</zn-radio>
```

### Horizontal Layout

Use the `horizontal` attribute to apply styles relevant to radios in a horizontal layout.

```html:preview
<div style="display: flex; gap: 1rem;">
  <zn-radio name="size" horizontal>Small</zn-radio>
  <zn-radio name="size" horizontal checked>Medium</zn-radio>
  <zn-radio name="size" horizontal>Large</zn-radio>
</div>
```

### Selected Content

Use the `selected-content` slot to display additional content (such as an input field) inside a `contained` radio when it is checked. The slot is unstyled by default. Use `::part(selected-content)` to style the content as needed.

:::warning
**Note:** This feature only works with the `contained` style. The `selected-content` slot cannot be used for radios rendered with `ts_form_for`.
:::

```html:preview
<zn-radio name="shipping" value="standard" contained checked>
  Standard Shipping
  <div slot="selected-content">
    <p>Estimated delivery: 5-7 business days</p>
  </div>
</zn-radio>
<br />
<zn-radio name="shipping" value="express" contained>
  Express Shipping
  <div slot="selected-content">
    <p>Estimated delivery: 1-2 business days</p>
    <zn-input style="width: 280px;" label="Delivery instructions" placeholder="e.g., Leave at door"></zn-input>
  </div>
</zn-radio>
<style>
  zn-radio::part(selected-content) {
    font-size: 14px;
    font-weight: normal;
    color: #6D7176;
    margin-top: 1rem;
  }
</style>
```

### Form Integration

Radios work seamlessly with forms and will be submitted with form data. Only the selected radio's value will be submitted.

```html:preview
<form id="radio-form">
  <div style="margin-bottom: 1rem;">
    <strong>Choose your plan:</strong>
    <br /><br />
    <zn-radio name="subscription" value="free">Free Plan</zn-radio>
    <br />
    <zn-radio name="subscription" value="pro" checked>Pro Plan - $9.99/mo</zn-radio>
    <br />
    <zn-radio name="subscription" value="enterprise">Enterprise Plan - Contact us</zn-radio>
  </div>
  <zn-button type="submit" color="primary">Submit</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#radio-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    alert('Form submitted: ' + JSON.stringify(data, null, 2));
  });
</script>
```

### Required Validation

Use the `required` attribute to make the radio required. The form will not submit unless one of the radios in the group is selected.

```html:preview
<form id="required-form">
  <strong>Select your preferred contact method:</strong>
  <br /><br />
  <zn-radio name="contact" value="email" required>Email</zn-radio>
  <br />
  <zn-radio name="contact" value="phone" required>Phone</zn-radio>
  <br />
  <zn-radio name="contact" value="mail" required>Mail</zn-radio>
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
  <strong>Accept terms:</strong>
  <br /><br />
  <zn-radio name="terms" value="accept">I accept the terms</zn-radio>
  <br />
  <zn-radio name="terms" value="decline">I decline</zn-radio>
  <br /><br />
  <zn-button type="submit" color="primary">Submit</zn-button>
</form>
<script type="module">
  const form = document.querySelector('.custom-validity');
  const radios = form.querySelectorAll('zn-radio');
  const errorMessage = 'You must accept the terms to continue';

  // Set initial validity
  customElements.whenDefined('zn-radio').then(async () => {
    await Promise.all(Array.from(radios).map(r => r.updateComplete));
    radios[0].setCustomValidity(errorMessage);
  });

  // Update validity on change
  radios.forEach(radio => {
    radio.addEventListener('zn-change', () => {
      if (radio.value === 'accept' && radio.checked) {
        radios.forEach(r => r.setCustomValidity(''));
      } else if (radio.value === 'decline' && radio.checked) {
        radios.forEach(r => r.setCustomValidity(errorMessage));
      }
    });
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-radio')
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### External Form Association

Use the `form` attribute to associate the radio with a form element by ID, even if the radio is not a descendant of the form.

```html:preview
<form id="external-form">
  <zn-button type="submit" color="primary">Submit External Form</zn-button>
</form>

<br /><br />

<strong>Choose an option:</strong>
<br /><br />
<zn-radio form="external-form" name="external-option" value="option1" checked>Option 1</zn-radio>
<br />
<zn-radio form="external-form" name="external-option" value="option2">Option 2</zn-radio>

<script type="module">
  const form = document.querySelector('#external-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    alert('Selected: ' + formData.get('external-option'));
  });
</script>
```

### Events

Radios emit several events that you can listen to:

- `zn-change` - Emitted when the checked state changes
- `zn-input` - Emitted when the radio receives input
- `zn-focus` - Emitted when the radio gains focus
- `zn-blur` - Emitted when the radio loses focus
- `zn-invalid` - Emitted when form validation fails

```html:preview
<div>
  <strong>Try interacting with the radios:</strong>
  <br /><br />
  <zn-radio class="event-radio" name="event-demo" value="option1" checked>Option 1</zn-radio>
  <br />
  <zn-radio class="event-radio" name="event-demo" value="option2">Option 2</zn-radio>
  <br />
  <zn-radio class="event-radio" name="event-demo" value="option3">Option 3</zn-radio>
  <div id="event-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
    <strong>Events:</strong>
    <ul id="event-list" style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;"></ul>
  </div>
</div>

<script type="module">
  const radios = document.querySelectorAll('.event-radio');
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

  radios.forEach(radio => {
    radio.addEventListener('zn-change', (e) => {
      logEvent('zn-change', `${e.target.value} selected`);
    });

    radio.addEventListener('zn-input', () => {
      logEvent('zn-input');
    });

    radio.addEventListener('zn-focus', (e) => {
      logEvent('zn-focus', e.target.value);
    });

    radio.addEventListener('zn-blur', (e) => {
      logEvent('zn-blur', e.target.value);
    });
  });
</script>
```

### Methods

Radios provide several methods for programmatic control:

- `click()` - Simulates a click on the radio
- `focus()` - Sets focus on the radio
- `blur()` - Removes focus from the radio
- `checkValidity()` - Checks validity without showing a message
- `reportValidity()` - Checks validity and shows the browser's validation message
- `setCustomValidity(message)` - Sets a custom validation message
- `getForm()` - Gets the associated form, if one exists

```html:preview
<div>
  <zn-radio id="method-radio-1" name="method-demo" checked>Option 1</zn-radio>
  <br />
  <zn-radio id="method-radio-2" name="method-demo">Option 2</zn-radio>
  <br />
  <zn-radio id="method-radio-3" name="method-demo">Option 3</zn-radio>
  <br /><br />
  <zn-button id="click-btn" size="small">Click Option 2</zn-button>
  <zn-button id="focus-btn" size="small" color="info">Focus Option 3</zn-button>
  <zn-button id="blur-btn" size="small" color="secondary">Blur All</zn-button>
  <zn-button id="validate-btn" size="small" color="warning">Check Validity</zn-button>
</div>

<script type="module">
  const radio1 = document.querySelector('#method-radio-1');
  const radio2 = document.querySelector('#method-radio-2');
  const radio3 = document.querySelector('#method-radio-3');

  document.querySelector('#click-btn').addEventListener('click', () => {
    radio2.click();
  });

  document.querySelector('#focus-btn').addEventListener('click', () => {
    radio3.focus();
  });

  document.querySelector('#blur-btn').addEventListener('click', () => {
    document.activeElement?.blur();
  });

  document.querySelector('#validate-btn').addEventListener('click', () => {
    const isValid = radio1.checkValidity();
    alert('Radio group is ' + (isValid ? 'valid' : 'invalid'));
  });
</script>
```

### Complete Example

Here's a comprehensive example showing a radio group with contained style, descriptions, and selected content:

```html:preview
<form id="complete-example">
  <div style="max-width: 600px;">
    <h3 style="margin-top: 0;">Choose Your Subscription</h3>

    <zn-radio name="plan" value="starter" description="Perfect for getting started with basic features" contained>
      Starter Plan - Free
      <div slot="selected-content">
        <p>Includes:</p>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          <li>Up to 3 users</li>
          <li>5 GB storage</li>
          <li>Community support</li>
        </ul>
      </div>
    </zn-radio>

    <br />

    <zn-radio name="plan" value="professional" description="Advanced features for growing teams" contained checked>
      Professional Plan - $29/month
      <div slot="selected-content">
        <p>Includes everything in Starter, plus:</p>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          <li>Up to 25 users</li>
          <li>100 GB storage</li>
          <li>Priority email support</li>
          <li>Advanced analytics</li>
        </ul>
      </div>
    </zn-radio>

    <br />

    <zn-radio name="plan" value="enterprise" description="Custom solutions for large organizations" contained>
      Enterprise Plan - Custom pricing
      <div slot="selected-content">
        <p>Includes everything in Professional, plus:</p>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          <li>Unlimited users</li>
          <li>Unlimited storage</li>
          <li>24/7 phone support</li>
          <li>Custom integrations</li>
          <li>Dedicated account manager</li>
        </ul>
        <zn-input
          style="width: 100%; margin-top: 1rem;"
          label="Company name"
          placeholder="Enter your company name"
          required>
        </zn-input>
      </div>
    </zn-radio>

    <br /><br />
    <zn-button type="submit" color="success" style="margin-right: 0.5rem;">Continue</zn-button>
    <zn-button type="reset" color="secondary">Reset</zn-button>
  </div>
</form>

<style>
  zn-radio::part(selected-content) {
    font-size: 14px;
    font-weight: normal;
    color: #6D7176;
    margin-top: 1rem;
  }

  zn-radio::part(selected-content) p {
    margin: 0 0 0.5rem 0;
    font-weight: 500;
  }
</style>

<script type="module">
  const form = document.querySelector('#complete-example');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const plan = formData.get('plan');
    const company = formData.get('company') || 'N/A';
    alert(`Selected: ${plan}\nCompany: ${company}`);
  });
</script>
```
