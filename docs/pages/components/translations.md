---
meta:
  title: Translations
  description: A component for managing multi-language text input behind a language select.
layout: component
---

The Translations component provides a user-friendly interface for managing multi-language text input. A select above
the field chooses the language being edited, and each language it offers carries a chip saying whether it has a
translation of its own or falls back to English; closed, it carries how many languages are done as a `1/5` chip.
The field itself is a plain input, or a textarea with `input-type="textarea"`, and carries the code of the language
it is showing whenever more than one is on offer.

```html:preview
<zn-translations
  languages='{"en":"English","fr":"French","de":"German"}'
  values='{"en":"Welcome","fr":"Bienvenue","de":"Willkommen"}'
></zn-translations>
```

## Examples

### Basic Usage

A simple translations component with default English language.

```html:preview
<zn-translations></zn-translations>
```

### With Label

Use the `label` attribute to add a descriptive label above the translations.

```html:preview
<zn-translations
  label="Product Description"
  languages='{"en":"English","fr":"French"}'
></zn-translations>
```

### Label Slot

Use the `label` slot for rich HTML content in the label.

```html:preview
<zn-translations languages='{"en":"English","fr":"French"}'>
  <span slot="label">
    <strong>Description</strong>
    <zn-icon src="translate" size="16" style="margin-inline-start: 4px;"></zn-icon>
  </span>
</zn-translations>
```

### Custom Languages

Provide a custom list of available languages via the `languages` property. Each becomes an option in the language
select, labelled `Name (CODE)` — or the code alone where the configured name already is the code.

```html:preview
<zn-translations
  label="Multi-Language Content"
  languages='{"en":"English","fr":"French","de":"German","es":"Spanish","it":"Italian","pt":"Portuguese"}'
></zn-translations>
```

### Pre-filled Values

Set initial translations using the `values` property.

```html:preview
<zn-translations
  label="Welcome Message"
  languages='{"en":"English","fr":"French","es":"Spanish"}'
  values='{"en":"Hello World","fr":"Bonjour le monde","es":"Hola Mundo"}'
></zn-translations>
```

### JSON Value Attribute

Alternatively, use the `value` attribute with a JSON string.

```html:preview
<zn-translations
  label="Description"
  languages='{"en":"English","fr":"French"}'
  value='{"en":"This is a product description","fr":"Ceci est une description de produit"}'
></zn-translations>
```

### Required Field

Mark the translations as required for form validation.

```html:preview
<form>
  <zn-translations
    name="description"
    label="Product Description"
    required
    languages='{"en":"English","fr":"French"}'
  ></zn-translations>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>
```

### Disabled State

Disable editing of translations.

```html:preview
<zn-translations
  label="System Message (Read-only)"
  disabled
  languages='{"en":"English","fr":"French"}'
  values='{"en":"This cannot be edited","fr":"Cela ne peut pas être modifié"}'
></zn-translations>
```

### Flush Layout

Remove padding for a more compact appearance.

```html:preview
<zn-translations
  flush
  languages='{"en":"English","fr":"French","de":"German"}'
  values='{"en":"Compact layout","fr":"Mise en page compacte","de":"Kompaktes Layout"}'
></zn-translations>
```

### Textarea

Use `input-type="textarea"` for longer copy, and `textarea-rows` to set its height.

```html:preview
<zn-translations
  label="Confirmation Message"
  input-type="textarea"
  textarea-rows="3"
  languages='{"en":"English","de":"German"}'
  values='{"en":"Thanks — your order is on its way.","de":"Danke — Ihre Bestellung ist unterwegs."}'
></zn-translations>
```

### Inline Editing

Add `inline-edit` to read the translation as text until it is clicked, through
[`zn-inline-edit`](/components/inline-edit), rather than showing an input outright.

```html:preview
<zn-translations
  inline-edit
  label="Welcome Message"
  languages='{"en":"English","fr":"French"}'
  values='{"en":"Hello World","fr":"Bonjour le monde"}'
></zn-translations>
```

### Many Languages

The select takes any number of languages without reflowing the header, and its listbox scrolls once the list is longer
than the space below it.

```html:preview
<zn-translations
  label="International Content"
  languages='{"en":"English","fr":"French","de":"German","es":"Spanish","it":"Italian","pt":"Portuguese","ru":"Russian","zh":"Chinese","ja":"Japanese","ar":"Arabic","hi":"Hindi","ko":"Korean"}'
  values='{"en":"Hello","fr":"Bonjour","de":"Hallo","es":"Hola","it":"Ciao","pt":"Olá","ru":"Привет","zh":"你好","ja":"こんにちは","ar":"مرحبا","hi":"नमस्ते","ko":"안녕하세요"}'
></zn-translations>
```

### Blank Languages Fall Back to English

A language you have not translated yet is marked `English` in the select rather than hidden, and its field shows the
English text as a placeholder. Leave it blank and the English text is what gets used.

```html:preview
<zn-translations
  label="Product Name"
  languages='{"en":"English","fr":"French","de":"German","pl":"Polish"}'
  values='{"en":"Premium Wireless Headphones","de":"Premium kabellose Kopfhörer"}'
></zn-translations>
```

### Constrained Width

The select spans the field, so a narrow container costs the language name no room.

```html:preview
<div style="max-width: 320px;">
  <zn-translations
    label="Narrow Container"
    languages='{"en":"English","fr":"French","de":"German","es":"Spanish","it":"Italian","pt":"Portuguese","ja":"Japanese","ko":"Korean","zh-hans":"Simplified Chinese"}'
    values='{"en":"Hello","fr":"Bonjour","de":"Hallo","es":"Hola","it":"Ciao","pt":"Olá","ja":"こんにちは","ko":"안녕하세요","zh-hans":"你好"}'
  ></zn-translations>
</div>
```

### RTL Language Support

The component automatically detects and applies right-to-left text direction for Arabic and Hebrew languages.

```html:preview
<zn-translations
  label="RTL Languages"
  languages='{"en":"English","ar":"Arabic","he":"Hebrew"}'
  values='{"en":"Hello World","ar":"مرحبا بالعالم","he":"שלום עולם"}'
></zn-translations>
```

### Listening to Changes

The component emits `zn-change` events when translation values change.

```html:preview
<zn-translations
  id="trans-events"
  label="Translation Input"
  languages='{"en":"English","fr":"French"}'
></zn-translations>

<div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: 4px;">
  <strong>Event Log:</strong>
  <div id="event-log-trans" style="margin-top: 0.5rem; font-family: monospace; font-size: 0.875rem;"></div>
</div>

<script type="module">
  const translations = document.getElementById('trans-events');
  const eventLog = document.getElementById('event-log-trans');

  translations.addEventListener('zn-change', (event) => {
    const timestamp = new Date().toLocaleTimeString();
    const value = JSON.parse(event.target.value);
    eventLog.innerHTML = `[${timestamp}] Translation changed: ${JSON.stringify(value, null, 2)}`;
  });
</script>
```

### Form Integration

Use with standard HTML forms for submission.

```html:preview
<form class="translations-form">
  <zn-translations
    name="content"
    label="Article Content"
    required
    languages='{"en":"English","fr":"French","de":"German"}'
  ></zn-translations>
  <br />
  <zn-button type="submit" color="success">Submit Translations</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.translations-form');

  await customElements.whenDefined('zn-translations');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Programmatic Control

Access and modify translation values via JavaScript.

```html:preview
<zn-translations
  id="prog-trans"
  label="Programmatic Translations"
  languages='{"en":"English","fr":"French","es":"Spanish"}'
></zn-translations>

<div style="margin-top: 1rem;">
  <zn-button id="set-values-btn">Set Sample Values</zn-button>
  <zn-button id="get-values-btn" color="info">Get Values</zn-button>
  <zn-button id="clear-values-btn" color="secondary">Clear All</zn-button>
</div>

<script type="module">
  const trans = document.getElementById('prog-trans');

  document.getElementById('set-values-btn').addEventListener('click', () => {
    trans.values = {
      en: 'Sample English text',
      fr: 'Exemple de texte français',
      es: 'Texto de muestra en español'
    };
  });

  document.getElementById('get-values-btn').addEventListener('click', () => {
    alert('Current values:\n\n' + JSON.stringify(trans.values, null, 2));
  });

  document.getElementById('clear-values-btn').addEventListener('click', () => {
    trans.values = { en: '', fr: '', es: '' };
  });
</script>
```

### Real-World Use Case: Content Management

A complete example showing product content management with translations.

```html:preview
<div style="max-width: 800px;">
  <zn-panel caption="Product Details" icon="inventory_2">
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <zn-input
        label="Product SKU"
        value="PROD-12345"
        readonly
      ></zn-input>

      <zn-translations
        name="name"
        label="Product Name"
        required
        languages='{"en":"English","fr":"French","de":"German","es":"Spanish"}'
        values='{"en":"Premium Wireless Headphones","fr":"Écouteurs sans fil premium","de":"Premium kabellose Kopfhörer","es":"Auriculares inalámbricos premium"}'
      ></zn-translations>

      <zn-translations
        name="description"
        label="Product Description"
        languages='{"en":"English","fr":"French","de":"German","es":"Spanish"}'
        values='{"en":"High-quality wireless headphones with active noise cancellation","fr":"Écouteurs sans fil de haute qualité avec suppression active du bruit","de":"Hochwertige kabellose Kopfhörer mit aktiver Geräuschunterdrückung","es":"Auriculares inalámbricos de alta calidad con cancelación activa de ruido"}'
      >
</zn-translations>

      <zn-input
        label="Price"
        type="currency"
        value="299.99"
      ></zn-input>
    </div>

    <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
      <zn-button color="secondary">Cancel</zn-button>
      <zn-button color="success">Save Product</zn-button>
    </div>
  </zn-panel>
</div>
```

### Help Text

Use the `help-text` attribute to describe how the field should be filled in. It sits below the field and applies to
every language, so it is the place to explain a convention the translator needs to follow. For help text containing
HTML, use the `help-text` slot instead.

```html:preview
<zn-translations
  label="Confirmation headline"
  help-text="Keep this under 60 characters so it does not wrap on mobile."></zn-translations>
<br />
<zn-translations label="Footer">
  <div slot="help-text">Shown on <strong>every</strong> page of the checkout.</div>
</zn-translations>
```

### Slash Menu Quick Insertions

{% raw %}

Copy that carries replacement strings — `{{BRAND_NAME}}` and the like — needs the same tokens in every language. Set
`slash-items` and typing `/` offers them at the caret, in whichever language is being edited. This works on both the
single-line default and `input-type="textarea"`. The attribute takes the same shorthand and JSON that
[`zn-textarea`](/components/textarea#slash-menu-quick-insertions) accepts, and `slash-preset`, `slash-trigger` and
`slash-heading` are forwarded too.

```html:preview
<zn-translations
  label="Confirmation message"
  input-type="textarea"
  textarea-rows="4"
  languages='{"en": "EN", "fr": "FR", "de": "DE"}'
  values='{"en": "Look for /"}'
  slash-heading="Replacement strings"
  slash-items='[
    {"label": "Brand name", "value": "{{BRAND_NAME}}", "description": "The product / company name", "icon": "sell"},
    {"label": "Customer email", "value": "{{CUSTOMER_EMAIL}}", "description": "The customer&#39;s email address", "icon": "mail"},
    {"label": "Renewal price", "value": "{{RENEWAL_PRICE}}", "description": "The renewal price amount", "icon": "payments"}
  ]'></zn-translations>
```

The menu claims `↑`, `↓`, `Enter`, `Tab` and `Escape` while it is open, so choosing an item never submits the form the
way `Enter` otherwise would.

{% endraw %}

## Properties

| Property    | Type                        | Default         | Description                                                          |
|-------------|-----------------------------|-----------------|----------------------------------------------------------------------|
| `name`      | `string`                    | `''`            | Form field name for submission                                       |
| `value`     | `string`                    | `'{"en":""}'`   | JSON string of translations                                          |
| `label`     | `string`                    | `''`            | Label displayed above the component                                  |
| `help-text` | `string`                    | `''`            | Text shown below the field, describing how to fill it in             |
| `disabled`  | `boolean`                   | `false`         | Disables editing of all translations                                 |
| `required`  | `boolean`                   | `false`         | Makes the field required for form validation                         |
| `flush`     | `boolean`                   | `false`         | Removes padding for compact layout                                   |
| `languages` | `Record<string, string>`    | `{en: "EN"}`    | Object mapping language codes to display names                       |
| `values`    | `Record<string, string>`    | `{}`            | Object mapping language codes to translation text                    |
| `grouped`   | `boolean`                   | `false`         | Hides the language select; a parent `zn-translation-group` drives it |
| `input-type`    | `'text' \| 'number' \| 'textarea'` | `'text'` | The control each translation is edited through                |
| `textarea-rows` | `number`                | —               | Rows of the textarea, when `input-type` is `textarea`                |
| `inline-edit`   | `boolean`               | `false`         | Edits through `zn-inline-edit` instead of a plain input or textarea   |
| `slash-items`   | `SlashMenuItem[]`       | `[]`            | Quick insertions offered by the slash menu                           |
| `slash-preset`  | `string`                | `''`            | Registered item sets to offer, comma separated                       |
| `slash-trigger` | `string`                | `'/'`           | The characters that open the slash menu                              |
| `slash-heading` | `string`                | `'Insert'`      | Heading shown above the slash menu's items                           |

## Events

| Event       | Description                                              | Event Detail              |
|-------------|----------------------------------------------------------|---------------------------|
| `zn-change` | Emitted when any translation value changes               | `{value: string}`         |
| `zn-input`  | Emitted when translation input changes                   | None                      |

## Slots

| Slot        | Description                                                      |
|-------------|------------------------------------------------------------------|
| `label`     | Alternative to the `label` attribute for rich HTML content       |
| `help-text` | Alternative to the `help-text` attribute for rich HTML content   |

## Methods

| Method                        | Description                              |
|-------------------------------|------------------------------------------|
| `checkValidity()`             | Checks form validity                     |
| `reportValidity()`            | Checks validity and shows message        |
| `setCustomValidity(message)`  | Sets custom validation message           |
| `getForm()`                   | Returns the parent form element          |

## CSS Parts

| Part                 | Description                                       |
|----------------------|---------------------------------------------------|
| `form-control`       | The component's base wrapper                      |
| `form-control-label` | The label's wrapper                               |
| `form-control-input` | The wrapper around the inline-editable field      |
| `language-select`    | The select that chooses the language being edited |

The component uses `zn-select` for the language and `zn-input`, `zn-textarea` or `zn-inline-edit` for the field, each
of which exposes its own CSS parts for advanced styling.

## Accessibility

- The component automatically detects RTL languages (Arabic, Hebrew) and applies proper text direction
- The language select is a standard combobox: it opens on `Enter` or `Space` and moves through the languages with the
  arrow keys
- Keyboard navigation is supported within the inline edit fields
- Form integration ensures proper submission behavior with the Enter key
