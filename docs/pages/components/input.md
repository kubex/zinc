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
<zn-input label="small input"></zn-input>
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