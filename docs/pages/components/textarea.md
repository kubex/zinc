---
meta:
  title: Textarea
  description: Textareas collect data from the user and allow multiple lines of text.
layout: component
unusedProperties: |
  - Sizes `small`, `large`
---

```html:preview
<zn-textarea label="Comments" placeholder="Enter your feedback here..."></zn-textarea>
```

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

### With Value

Set the initial value using the `value` attribute.

```html:preview
<zn-textarea label="Description" value="This is some initial text content."></zn-textarea>
```

You can also set the value using text content inside the element.

```html:preview
<zn-textarea label="Notes">
This is the initial content set via text content.
It can span multiple lines.
</zn-textarea>
```

### Help Text

Add descriptive help text to a textarea with the `help-text` attribute. For help text that contains HTML, use the
`help-text` slot instead.

```html:preview
<zn-textarea label="Month in review" help-text="Tell us the highlights. Be sure to include details about any financial performance anomalies."></zn-textarea>
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

### Placeholders

Use the `placeholder` attribute to add a placeholder.

```html:preview
<zn-textarea label="Feedback" placeholder="Type something"></zn-textarea>
```

### Rows

Use the `rows` attribute to change the number of text rows that the textarea shows before the text starts to overflow
and the textarea scrolls. The default is 4 rows.

```html:preview
<zn-textarea label="Textarea with 2 rows" rows="2"></zn-textarea>
<br />
<zn-textarea label="Textarea with 4 rows (Default)" rows="4"></zn-textarea>
<br />
<zn-textarea label="Textarea with 6 rows" rows="6"></zn-textarea>
```

### Sizes

Use the `size` attribute to change a textarea's size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<zn-textarea label="Small textarea" size="small"></zn-textarea>
<br />
<zn-textarea label="Medium textarea" size="medium"></zn-textarea>
<br />
<zn-textarea label="Large textarea" size="large"></zn-textarea>
```

### Resize Options

Control how the textarea can be resized using the `resize` attribute. Options are `vertical` (default), `none`, and `auto`.

#### Vertical Resize (Default)

By default, textareas can be resized vertically by the user.

```html:preview
<zn-textarea label="Vertically resizable" resize="vertical"></zn-textarea>
```

#### Prevent Resizing

To prevent resizing, set the `resize` attribute to `none`.

```html:preview
<zn-textarea label="No resizing allowed" resize="none"></zn-textarea>
```

#### Auto-Resize

Textareas will automatically resize to expand to fit their content when `resize` is set to `auto`.

:::warning
**Note:** If using `ts_form_for`, note that the default `resize` option is already set to `auto`. To match the
`zn-textarea` default of `vertical`, set `resize: "vertical"` in `input_html` (see code example below).
:::

```html:preview
<zn-textarea label="Expanding textarea" resize="auto" value="Someone's sitting in the shade today because someone planted a tree a long time ago..." rows="2"></zn-textarea>
```

Try typing multiple lines in the textarea above to see it automatically expand.

### Character Limits

Use the `maxlength` attribute to limit the number of characters that can be entered. The `minlength` attribute sets a minimum character requirement.

```html:preview
<zn-textarea label="Tweet" maxlength="280" help-text="Maximum 280 characters"></zn-textarea>
<br />
<zn-textarea label="Review" minlength="20" maxlength="500" help-text="Must be between 20 and 500 characters"></zn-textarea>
```

### Disabled

Use the `disabled` attribute to disable a textarea.

```html:preview
<zn-textarea label="Disabled textarea" disabled value="This textarea cannot be edited"></zn-textarea>
```

### Readonly

Use the `readonly` attribute to make a textarea read-only. Unlike disabled textareas, readonly textareas can still receive focus and their values are submitted with forms.

```html:preview
<zn-textarea label="Readonly textarea" readonly value="This textarea is read-only but can be focused"></zn-textarea>
```

### Required

Use the `required` attribute to make a textarea required for form submission.

```html:preview
<form class="textarea-required-form">
  <zn-textarea name="feedback" label="Feedback" required help-text="This field is required"></zn-textarea>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.textarea-required-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-textarea');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Form submitted successfully!');
  });
</script>
```

### Transparent Style

Use the `transparent` attribute to create a transparent textarea without a visible border.

```html:preview
<zn-textarea label="Transparent textarea" transparent placeholder="Type here..."></zn-textarea>
```

### Flush Style

Use the `flush` attribute to remove padding from the textarea container.

```html:preview
<zn-textarea label="Flush textarea" flush></zn-textarea>
```

### Text Input Options

#### Autocapitalize

Control automatic capitalization using the `autocapitalize` attribute.

```html:preview
<zn-textarea label="Sentences" autocapitalize="sentences" placeholder="First letter of each sentence capitalized"></zn-textarea>
<br />
<zn-textarea label="Words" autocapitalize="words" placeholder="First letter of each word capitalized"></zn-textarea>
<br />
<zn-textarea label="Characters" autocapitalize="characters" placeholder="All letters capitalized"></zn-textarea>
```

#### Spellcheck

Control spell checking with the `spellcheck` attribute. It's enabled by default.

```html:preview
<zn-textarea label="Spellcheck enabled (default)" spellcheck="true" value="This haz a speling eror"></zn-textarea>
<br />
<zn-textarea label="Spellcheck disabled" spellcheck="false" value="This haz a speling eror"></zn-textarea>
```

#### Autocorrect

Use the `autocorrect` attribute to control autocorrection on mobile devices.

```html:preview
<zn-textarea label="With autocorrect" autocorrect="on"></zn-textarea>
<br />
<zn-textarea label="Without autocorrect" autocorrect="off"></zn-textarea>
```

#### Input Mode

Use the `inputmode` attribute to control the type of virtual keyboard displayed on mobile devices.

```html:preview
<zn-textarea label="Email" inputmode="email" placeholder="user@example.com"></zn-textarea>
<br />
<zn-textarea label="URL" inputmode="url" placeholder="https://example.com"></zn-textarea>
<br />
<zn-textarea label="Numeric" inputmode="numeric" placeholder="123456"></zn-textarea>
```

#### Enter Key Hint

Use the `enterkeyhint` attribute to customize the label or icon of the Enter key on virtual keyboards.

```html:preview
<zn-textarea label="Search" enterkeyhint="search"></zn-textarea>
<br />
<zn-textarea label="Message" enterkeyhint="send"></zn-textarea>
<br />
<zn-textarea label="Step" enterkeyhint="next"></zn-textarea>
```

### Form Integration

Textareas can be used in forms with various form-related attributes.

```html:preview
<form class="textarea-form">
  <zn-textarea name="comments" label="Comments" required minlength="10"></zn-textarea>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.textarea-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-textarea');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Custom Validation

Use the `setCustomValidity()` method to set custom validation messages.

```html:preview
<form class="textarea-validation-form">
  <zn-textarea id="validation-textarea" name="review" label="Product Review" help-text="Must contain the word 'product'"></zn-textarea>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.textarea-validation-form');
  const textarea = document.getElementById('validation-textarea');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-textarea');

  textarea.addEventListener('zn-input', () => {
    if (textarea.value && !textarea.value.toLowerCase().includes('product')) {
      textarea.setCustomValidity('Your review must mention the product');
    } else {
      textarea.setCustomValidity('');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      alert('Form submitted successfully!');
    }
  });
</script>
```

### Character Count Display

Create a character counter using the `zn-input` event and `maxlength` attribute.

```html:preview
<div class="textarea-counter-container">
  <zn-textarea
    id="counter-textarea"
    label="Description"
    maxlength="200"
    help-text="Maximum 200 characters"
  ></zn-textarea>
  <div id="char-count" style="text-align: right; margin-top: 0.5rem; font-size: 0.875rem; color: var(--zn-color-neutral-600);">
    0 / 200
  </div>
</div>

<script type="module">
  const textarea = document.getElementById('counter-textarea');
  const counter = document.getElementById('char-count');

  await customElements.whenDefined('zn-textarea');

  textarea.addEventListener('zn-input', () => {
    const length = textarea.value.length;
    const max = textarea.maxlength;
    counter.textContent = `${length} / ${max}`;

    if (length > max * 0.9) {
      counter.style.color = 'var(--zn-color-error-600)';
    } else if (length > max * 0.75) {
      counter.style.color = 'var(--zn-color-warning-600)';
    } else {
      counter.style.color = 'var(--zn-color-neutral-600)';
    }
  });
</script>
```

### Programmatic Control

Use methods to programmatically control the textarea.

```html:preview
<zn-textarea id="control-textarea" label="Controlled Textarea" value="Initial text content"></zn-textarea>
<br />
<zn-button id="focus-btn">Focus</zn-button>
<zn-button id="blur-btn">Blur</zn-button>
<zn-button id="select-btn">Select All</zn-button>
<zn-button id="clear-btn" color="error">Clear</zn-button>

<script type="module">
  const textarea = document.getElementById('control-textarea');
  const focusBtn = document.getElementById('focus-btn');
  const blurBtn = document.getElementById('blur-btn');
  const selectBtn = document.getElementById('select-btn');
  const clearBtn = document.getElementById('clear-btn');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-textarea');

  focusBtn.addEventListener('click', () => textarea.focus());
  blurBtn.addEventListener('click', () => textarea.blur());
  selectBtn.addEventListener('click', () => textarea.select());
  clearBtn.addEventListener('click', () => textarea.value = '');
</script>
```

### Selection and Range Methods

Use `setSelectionRange()` and `setRangeText()` methods to work with text selections.

```html:preview
<zn-textarea id="selection-textarea" label="Text Selection Demo" value="The quick brown fox jumps over the lazy dog"></zn-textarea>
<br />
<zn-button id="select-word-btn">Select "brown"</zn-button>
<zn-button id="replace-word-btn">Replace "fox" with "cat"</zn-button>
<zn-button id="insert-text-btn">Insert at cursor</zn-button>

<script type="module">
  const textarea = document.getElementById('selection-textarea');
  const selectWordBtn = document.getElementById('select-word-btn');
  const replaceWordBtn = document.getElementById('replace-word-btn');
  const insertTextBtn = document.getElementById('insert-text-btn');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-textarea');

  selectWordBtn.addEventListener('click', () => {
    const text = textarea.value;
    const start = text.indexOf('brown');
    const end = start + 5;
    textarea.setSelectionRange(start, end);
    textarea.focus();
  });

  replaceWordBtn.addEventListener('click', () => {
    const text = textarea.value;
    const start = text.indexOf('fox');
    const end = start + 3;
    textarea.setRangeText('cat', start, end, 'select');
  });

  insertTextBtn.addEventListener('click', () => {
    textarea.setRangeText(' [INSERTED]');
    textarea.focus();
  });
</script>
```

### Events

Listen to textarea events to respond to user interactions.

```html:preview
<zn-textarea id="event-textarea" label="Event Demo" placeholder="Type or interact with this textarea"></zn-textarea>
<div id="event-log" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; font-family: monospace; font-size: 0.875rem; max-height: 200px; overflow-y: auto;">
  Events will appear here...
</div>

<script type="module">
  const textarea = document.getElementById('event-textarea');
  const eventLog = document.getElementById('event-log');

  await customElements.whenDefined('zn-textarea');

  function logEvent(eventName, detail = '') {
    const time = new Date().toLocaleTimeString();
    const message = `[${time}] ${eventName}${detail ? ': ' + detail : ''}`;
    eventLog.innerHTML = message + '<br>' + eventLog.innerHTML;
  }

  textarea.addEventListener('zn-focus', () => logEvent('zn-focus'));
  textarea.addEventListener('zn-blur', () => logEvent('zn-blur'));
  textarea.addEventListener('zn-input', (e) => logEvent('zn-input', `value="${e.target.value}"`));
  textarea.addEventListener('zn-change', (e) => logEvent('zn-change', `value="${e.target.value}"`));
  textarea.addEventListener('zn-invalid', () => logEvent('zn-invalid'));
</script>
```

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the
label to the left of the control.

```html:preview
<zn-textarea class="label-on-left" label="Bio" help-text="Tell us about yourself"></zn-textarea>
<zn-textarea class="label-on-left" label="Notes" help-text="Additional notes"></zn-textarea>

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
    align-items: start;
  }

  .label-on-left::part(form-control-label) {
    text-align: right;
    padding-top: var(--zn-spacing-small);
  }

  .label-on-left::part(form-control-help-text) {
    grid-column-start: 2;
  }
</style>
```