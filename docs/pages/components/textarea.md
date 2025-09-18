---
meta:
  title: Textarea
  description: Textareas collect data from the user and allow multiple lines of text.
layout: component
unusedProperties: |
  - Sizes `small`, `large`
---

## Examples

### Basic Textarea with Label

Use the `label` attribute to give the textarea an accessible label.

```html:preview
<zn-textarea label="Month in review"></zn-textarea>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Help Text

Add descriptive help text to a textarea with the `help-text` attribute. For help text that contains HTML, use the
`help-text` slot instead.

```html:preview
<zn-textarea transparent label="Month in review" help-text="Tell us the highlights. Be sure to include details about any financial performance anomalies."> </zn-textarea>
<br />
<zn-textarea label="Month in review">
  <div slot="help-text">Tell us the highlights. Be sure to include details about any financial performance <strong>anomalies</strong>.</div>
</zn-textarea>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use the **label tooltip** to provide helpful but non-essential instructions or examples to guide people when
filling in the textarea. Use **help text** to communicate instructions or requirements for filling in the textarea
without errors.
:::

```html:preview
<zn-textarea label="Month in review" help-text="Tell us the highlights. Be sure to include details about any financial performance anomalies." label-tooltip="There is no required format for this commentary. However, we suggest covering the following topics: 1) Revenue, 2) COGS, 3) Gross profit, and 4) Operating expenses."></zn-textarea>
```

### Label with Context Note

Use the `context-note` attribute to add text that provides additional context or reference. For text that contains HTML,
use the `context-note` slot. **Note:** On small screens the context note will wrap below the label if there isn't enough
room next to the label.

:::tip
**Usage:** Use a **context note** to provide secondary contextual data, especially dynamic data, that would help people
when filling in the textarea. Use **help text** to communicate instructions or requirements for filling in the textarea
without errors.
:::

```html:preview
<zn-textarea label="Month in review" help-text="Tell us the highlights. Be sure to include details about any financial performance anomalies." context-note="Data synced 1 hr ago"></zn-textarea>
```

### Rows

Use the `rows` attribute to change the number of text rows that the textarea shows before the text starts to overflow
and the textarea scrolls.

```html:preview
<zn-textarea label="Textarea with 2 rows" rows="2"></zn-textarea>
<br />
<zn-textarea label="Textarea with 4 rows (Default)" rows="4"></zn-textarea>
<br />
<zn-textarea label="Textarea with 6 rows" rows="6"></zn-textarea>
```

### Placeholders

Use the `placeholder` attribute to add a placeholder.

```html:preview
<zn-textarea placeholder="Type something"></zn-textarea>
```

### Sizes

Use the `size` attribute to change a textarea's size.

```html:preview
<zn-textarea placeholder="Small" size="small"></zn-textarea>
<br />
<zn-textarea placeholder="Medium" size="medium"></zn-textarea>
<br />
<zn-textarea placeholder="Large" size="large"></zn-textarea>
```

### Prevent Resizing

By default, textareas can be resized vertically by the user. To prevent resizing, set the `resize` attribute to `none`.

```html:preview
<zn-textarea label="Textarea with no resizing" resize="none"></zn-textarea>
```

### Expand with Content

Textareas will automatically resize to expand to fit their content when `resize` is set to `auto`.

:::warning
**Note:** If using `ts_form_for`, note that the default `resize` option is already set to `auto`. To match the
`zn-textarea` default of `vertical`, set `resize: "vertical"` in `input_html` (see code example below).
:::

```html:preview
<zn-textarea label="Expanding textarea" resize="auto" value="Someone’s sitting in the shade today because someone planted a tree a long time ago. ... Keep typing to see the textarea expand..." rows="2"></zn-textarea>
```