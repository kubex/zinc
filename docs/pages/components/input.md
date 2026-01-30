---
meta:
  title: Input
  description: Inputs collect data from the user.
layout: component
unusedProperties: |
  - Size `small`
  - Booleans `pill`
---

## Examples

### Basic Input with Label

Use the `label` attribute to give the input an accessible label.

```html:preview
<zn-input label="Name"></zn-input>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Help Text

Add descriptive help text to an input with the `help-text` attribute. For help text that contains HTML, use the
`help-text` slot instead.

```html:preview
<zn-input label="Previous legal names" help-text="List full names, separated by a semicolon"></zn-input>
<br />
<zn-input label="Previous legal names">
  <div slot="help-text">List <strong>full</strong> names, separated by a <strong>semicolon</strong></div>
</zn-input>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when
filling in the input. Use **help text** to communicate instructions or requirements for filling in the input without
errors.
:::

```html:preview
<zn-input label="Previous legal names" label-tooltip="Names previously used on official government documents, such as passport, driver license, or ID card" help-text="List full names, separated by a semicolon"></zn-input>
```

### Label with Context Note

Use the `context-note` attribute to add text that provides additional context or reference. For text that contains HTML,
use the `context-note` slot. **Note:** On small screens the context note will wrap below the label if there isn't enough
room next to the label.

:::tip
**Usage:** Use a **context note** to provide secondary contextual data, especially dynamic data, that would help people
when filling in the input. Use **help text** to communicate instructions or requirements for filling in the input
without errors.
:::

```html:preview
<zn-input type="currency" label="Amount" context-note="$10,000.29 available" help-text="You can transfer up to $2,500 per day"></zn-input>
<br />
<zn-input type="currency" label="Amount" help-text="You can transfer up to $2,500 per day">
  <div slot="context-note"><strong>$10,000.29</strong> available</div>
</zn-input>
```

### Placeholders

Use the `placeholder` attribute to add a placeholder.

```html:preview
<zn-input placeholder="Type something"></zn-input>
```

### Clearable

Add the `clearable` attribute to add a clear button when the input has content.

```html:preview
<zn-input label="Clearable input" value="I can be cleared!" clearable></zn-input>
```

### Toggle Password

Add the `password-toggle` attribute to add a toggle button that will show the password when activated.

```html:preview
<zn-input type="password" label="Password" password-toggle></zn-input>
```

### Disabled

Use the `disabled` attribute to disable an input.

```html:preview
<zn-input label="Disabled input" disabled></zn-input>
```

### Sizes

Use the `size` attribute to change an input's size. Size `medium` is the input's default.

```html:preview
<zn-input label="small input" size="small"></zn-input>
<br />
<zn-input label="Medium input" size="medium"></zn-input>
<br />
<zn-input label="Large input" size="large"></zn-input>
```

### Pill

Use the `pill` attribute to give inputs rounded edges.

:::warning
**Note:** Pill inputs are not a standard input pattern in our Design System
:::

```html:preview
<zn-input label="Medium pill" pill></zn-input>
<br />
<zn-input label="Large pill" size="large" pill></zn-input>
```

### Input Types

The `type` attribute controls the type of input the browser renders. As shown in the examples below, some input types
have default prefix and suffix elements. Not all available types are shown below. See
the [Properties table](#properties) for the full list of options.

#### Color Input

The color input type displays a clickable color swatch on the left that opens the browser's native color picker. The color value is shown as editable text in the input field, allowing users to either pick a color visually or enter a color value directly.

Use the `color-format` attribute to specify the format: `hex` (default), `rgb`, or `oklch`.

```html:preview
<zn-input type="color" label="Hex Format (default)" value="#3b82f6">
  <div slot="help-text">Default format. Click the swatch to pick a color, or type a hex value like #3b82f6.</div>
</zn-input>
<br />
<zn-input type="color" label="RGB Format" color-format="rgb" value="rgb(139, 92, 246)">
  <div slot="help-text">Type RGB values like rgb(139, 92, 246). The picker converts to/from hex automatically.</div>
</zn-input>
<br />
<zn-input type="color" label="OKLCH Format" color-format="oklch" value="oklch(0.628 0.225 292.6)">
  <div slot="help-text">Type OKLCH values like oklch(0.628 0.225 292.6). The picker converts to/from hex automatically.</div>
</zn-input>
<br />
<zn-input type="color" label="Background Color" value="#f59e0b" clearable>
  <div slot="help-text">Use the <code>clearable</code> attribute to allow clearing the color value.</div>
</zn-input>
<br />
```

#### Other Input Types

```html:preview
<zn-input type="currency" label="Input type: Currency"><div slot="help-text">Has <code>$</code> prefix and <code>USD</code> suffix by default and native input type set to <code>number</code>. The currency input does <strong>NOT</strong> have input masking at this time.</div></zn-input>
<br />
<zn-input type="date" label="Input type: Date" placeholder="Date" help-text="Calendar icon opens the browser default date picker"></zn-input>
<br />
<zn-input type="email" label="Input type: Email">
  <div slot="help-text">Has no icon by default</div>
</zn-input>
<br />
<zn-input type="email" label="Input type: Email, with icon" optional-icon>
  <div slot="help-text">Use the <code>optional-icon</code> attribute to display the default optional icon for email inputs </div>
</zn-input>
<br />
<zn-input type="tel" label="Input type: Tel">
  <div slot="help-text">Has no icon by default</div>
</zn-input>
<br />
<zn-input type="tel" label="Input type: Tel, with icon" optional-icon>
  <div slot="help-text">Use the <code>optional-icon</code> attribute to display the default optional icon for phone number inputs </div>
</zn-input>
<br />
<zn-input type="number" label="Input type: Number"></zn-input>
<br />
<zn-input type="number" label="Input type: Number, no spin buttons" no-spin-buttons>
    <div slot="help-text">Use the <code>no-spin-buttons</code> attribute to hide the browser's default increment/decrement buttons for number inputs</div>
</zn-input>
<br />
<zn-input type="search" label="Input type: Search" clearable><div slot="help-text">Has a search icon by default. Use the <code>clearable</code> attribute to make the input clearable</div></zn-input>
<br />
```

### Min Max Validation

```html:preview
<zn-input type="date" label="Input type: Date" placeholder="Date" help-text="Calendar icon opens the browser default date picker" min="01/01/1970"></zn-input>
<br />
<zn-input type="number" label="Input type: Number" min="10" max="100"></zn-input>
```

### Prefix & Suffix Icons

Several input types have specific `prefix` and `suffix` elements or icons that are displayed by default. You can also
use the `prefix` and `suffix` slots to add icons or text elements for other use cases.

Follow these general guidelines when adding prefix and suffix icons to the input:

- Use the `zn-icon` component
- In general **don't** resize icons or change their color from the default already set by the `zn-input` component

:::warning
**Note:** If you find your use case requires a different size or color from the default, bring it up to the Design Team
so that we can consider whether the pattern needs to be updated.
:::
:::warning
**Note:** `ts_form_for` doesn't support slots. Prefix and suffix icons cannot be added when rendering `zn-input` with
`ts_form_for`. However, the `optional-icon` attribute can be set to `true` to display default icons for input types
`currency`, `email`, `tel`, and `search`.
:::

```html:preview
<zn-input label="Prefix icon example: DO">
  <zn-icon src="rocket_launch" slot="prefix"></zn-icon>
</zn-input>
<br />
<br />
<zn-input label="Prefix icon example: RESIZED" help-text="Same icon as above, resized. Note that a larger prefix or suffix icon will push the input text out of alignment." value="Input text, shifted 4px right due to icon size">
  <zn-icon src="rocket_launch" style="--icon-size: 24px" slot="prefix"></zn-icon>
</zn-input>
```

### Prefix Submit Button

Use the `type="submit"` attribute to create a submit button as a Suffix to the input. This is useful for search inputs.

```html:preview
<zn-input label="Search" placeholder="Search">
  <zn-button slot="suffix" type="submit" variant="primary" outline>Search</zn-button>
</zn-input>
```

Or as a Prefix

```html:preview
<zn-input label="Search" placeholder="Search">
  <zn-button slot="prefix" type="submit" variant="primary">Search</zn-button>
</zn-input>
```

### Form Navigation with Enter Key

Add the `data-enter-navigation` attribute to a form to enable Enter key navigation through form inputs. When enabled, pressing Enter will move focus to the next input field, and submit the form when all named fields are filled and valid.

:::tip
**Usage:** This feature is useful for forms where users naturally want to press Enter to move between fields, such as data entry forms, registration forms, or checkout flows.
:::

#### Basic Example

```html:preview
<form class="form-nav-basic" data-enter-navigation>
  <zn-input name="firstName" label="First Name" required></zn-input>
  <br />
  <zn-input name="lastName" label="Last Name" required></zn-input>
  <br />
  <zn-input name="email" type="email" label="Email" required></zn-input>
  <br />
  <zn-input name="phone" type="tel" label="Phone"></zn-input>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.form-nav-basic');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-input')
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

#### All Input Types Example

This example demonstrates Enter key navigation with various input types including text, email, phone, number, currency, and date inputs:

```html:preview
<form class="form-nav-all-types" data-enter-navigation>
  <zn-input name="fullName" label="Full Name" required></zn-input>
  <br />
  <zn-input name="email" type="email" label="Email Address" required></zn-input>
  <br />
  <zn-input name="phone" type="tel" label="Phone Number" required></zn-input>
  <br />
  <zn-input name="age" type="number" label="Age" min="18" max="100" required></zn-input>
  <br />
  <zn-input name="salary" type="currency" label="Expected Salary" required></zn-input>
  <br />
  <zn-datepicker name="availableDate" label="Available Start Date" required></zn-datepicker>
  <br />
  <zn-input name="website" type="url" label="Portfolio Website"></zn-input>
  <br />
  <zn-button type="submit" variant="primary">Continue</zn-button>
</form>

<script type="module">
  const allTypesForm = document.querySelector('.form-nav-all-types');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-datepicker'),
    customElements.whenDefined('zn-input')
  ]).then(() => {
    allTypesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(allTypesForm);
      const data = Object.fromEntries(formData);
      alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
    });
  });
</script>
```

**Navigation flow:** Press Enter to move through each field. The form submits when all named fields are filled and valid.

#### Mixed Form Controls

Form navigation works with all Zinc form controls including selects, radios, checkboxes, toggles, and textareas. Textareas are excluded from navigation since they need Enter for their own functionality.

```html:preview
<form class="form-nav-mixed" data-enter-navigation>
  <zn-input name="productName" label="Product Name" required></zn-input>
  <br />
  <zn-input name="sku" label="SKU" required></zn-input>
  <br />
  <zn-input name="price" type="currency" label="Price" required></zn-input>
  <br />
  <zn-input name="quantity" type="number" label="Quantity" required min="1"></zn-input>
  <br />
  <zn-select name="category" label="Category" required clearable>
    <zn-option value="electronics">Electronics</zn-option>
    <zn-option value="clothing">Clothing</zn-option>
    <zn-option value="books">Books</zn-option>
    <zn-option value="home">Home & Garden</zn-option>
  </zn-select>
  <br />
  <zn-radio-group name="condition" label="Condition" required>
    <zn-radio value="new">New</zn-radio>
    <zn-radio value="used">Used</zn-radio>
    <zn-radio value="refurbished">Refurbished</zn-radio>
  </zn-radio-group>
  <br /><br />
  <zn-checkbox name="featured" value="yes">Feature this product</zn-checkbox>
  <br /><br />
  <zn-toggle name="available" value="yes">Available for purchase</zn-toggle>
  <br /><br />
  <zn-textarea name="description" label="Description (Press Tab to navigate, Enter for new lines)"></zn-textarea>
  <br />
  <zn-button type="submit" variant="primary">Add Product</zn-button>
</form>

<script type="module">
  const mixedForm = document.querySelector('.form-nav-mixed');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-checkbox'),
    customElements.whenDefined('zn-input'),
    customElements.whenDefined('zn-option'),
    customElements.whenDefined('zn-radio'),
    customElements.whenDefined('zn-radio-group'),
    customElements.whenDefined('zn-select'),
    customElements.whenDefined('zn-textarea'),
    customElements.whenDefined('zn-toggle')
  ]).then(() => {
    mixedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(mixedForm);
      const data = Object.fromEntries(formData);
      alert('Product added!\n\n' + JSON.stringify(data, null, 2));
    });
  });
</script>
```

**Navigation behavior by control type:**
- **Text inputs:** Enter moves to next field
- **Number/Currency inputs:** Enter moves to next field
- **Datepicker:** Enter moves to next field
- **Select dropdowns:** Automatically opens when navigated to. Enter on an option selects it and moves to next field.
- **Radio buttons:** Arrow keys select different options within the radio group. Space or Enter selects the current option. Press Enter to move to next field.
- **Checkboxes:** Space toggles the checkbox. Enter, Arrow Down, or Arrow Up moves to next/previous field.
- **Toggles:** Space toggles the toggle. Enter, Arrow Down, or Arrow Up moves to next/previous field.
- **Textareas:** You can navigate TO a textarea with Enter, but pressing Enter inside a textarea adds newlines. Use Tab to navigate away from textareas.
- **Search inputs:** You can navigate TO a search input with Enter, but pressing Enter inside a search input triggers search. Use Tab to navigate away from search inputs.

**Keyboard shortcuts:**
- **Enter** - Move to next field (or submit form if all fields complete)
- **Arrow Down/Up** - On checkboxes and toggles, moves to next/previous field. On radios, selects next/previous option in group.
- **Space** - Toggle checkboxes and toggles. Select current radio option.
- **Tab** - Standard browser tab navigation

:::warning
**Note:** While you can navigate TO textareas and search inputs using Enter, pressing Enter while inside these controls uses the Enter key for their own functionality (new lines and search triggers, respectively). Use Tab to navigate away from these controls.
:::

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the
label to the left of the control, but the possible orientations are nearly endless. The same technique works for inputs,
textareas, radio groups, and similar form controls.

```html:preview
<zn-input class="label-on-left" label="Name" help-text="Enter your name"></zn-input>
<zn-input class="label-on-left" label="Email" type="email" help-text="Enter your email"></zn-input>
<zn-textarea class="label-on-left" label="Bio" help-text="Tell us something about yourself"></zn-textarea>

<style>
  .label-on-left {
    --label-width: 3.75rem;
    --gap-width: 1rem;
  }

  .label-on-left + .label-on-left {
    margin-top: var(--zn-spacing-medium);
  }

  .label-on-left::part(form-control) {
    display: grid;
    grid: auto / var(--label-width) 1fr;
    gap: var(--zn-spacing-3x-small) var(--gap-width);
    align-items: center;
  }

  .label-on-left::part(form-control-label) {
    text-align: right;
  }

  .label-on-left::part(form-control-help-text) {
    grid-column-start: 2;
  }
</style>
```