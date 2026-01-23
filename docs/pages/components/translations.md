---
meta:
  title: Translations
  description: A component for managing multi-language text input with a tabbed interface.
layout: component
---

The Translations component provides a user-friendly interface for managing multi-language text input. It features a tabbed navigation bar for switching between languages and supports inline editing of translations.

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

Provide a custom list of available languages via the `languages` property. Languages are displayed as tabs with their full names.

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

### With Custom Action Button

Use the `expand` slot to add custom buttons or actions.

```html:preview
<zn-translations
  label="Description"
  languages='{"en":"English","fr":"French","de":"German"}'>
  <zn-button slot="expand" size="x-small" color="transparent" icon="translate">
    Auto-Translate
  </zn-button>
</zn-translations>
```

### Many Languages

The component handles many languages gracefully with scrollable tabs.

```html:preview
<zn-translations
  label="International Content"
  languages='{"en":"English","fr":"French","de":"German","es":"Spanish","it":"Italian","pt":"Portuguese","ru":"Russian","zh":"Chinese","ja":"Japanese","ar":"Arabic","hi":"Hindi","ko":"Korean"}'
  values='{"en":"Hello","fr":"Bonjour","de":"Hallo","es":"Hola","it":"Ciao","pt":"Olá","ru":"Привет","zh":"你好","ja":"こんにちは","ar":"مرحبا","hi":"नमस्ते","ko":"안녕하세요"}'
></zn-translations>
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
  <zn-button id="set-values-btn" size="small">Set Sample Values</zn-button>
  <zn-button id="get-values-btn" size="small" color="info">Get Values</zn-button>
  <zn-button id="clear-values-btn" size="small" color="secondary">Clear All</zn-button>
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
        <zn-button slot="expand" size="x-small" color="transparent" icon="smart_toy">
          AI Translate
        </zn-button>
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

## Properties

| Property    | Type                        | Default         | Description                                                          |
|-------------|-----------------------------|-----------------|----------------------------------------------------------------------|
| `name`      | `string`                    | `''`            | Form field name for submission                                       |
| `value`     | `string`                    | `'{"en":""}'`   | JSON string of translations                                          |
| `label`     | `string`                    | `''`            | Label displayed above the component                                  |
| `disabled`  | `boolean`                   | `false`         | Disables editing of all translations                                 |
| `required`  | `boolean`                   | `false`         | Makes the field required for form validation                         |
| `flush`     | `boolean`                   | `false`         | Removes padding for compact layout                                   |
| `languages` | `Record<string, string>`    | `{en: "EN"}`    | Object mapping language codes to display names                       |
| `values`    | `Record<string, string>`    | `{}`            | Object mapping language codes to translation text                    |

## Events

| Event       | Description                                              | Event Detail              |
|-------------|----------------------------------------------------------|---------------------------|
| `zn-change` | Emitted when any translation value changes               | `{value: string}`         |
| `zn-input`  | Emitted when translation input changes                   | None                      |

## Slots

| Slot      | Description                                                      |
|-----------|------------------------------------------------------------------|
| `label`   | Alternative to the `label` attribute for rich HTML content       |
| `expand`  | Action button displayed in the navbar (e.g., translate button)   |

## Methods

| Method                        | Description                              |
|-------------------------------|------------------------------------------|
| `checkValidity()`             | Checks form validity                     |
| `reportValidity()`            | Checks validity and shows message        |
| `setCustomValidity(message)`  | Sets custom validation message           |
| `getForm()`                   | Returns the parent form element          |

## CSS Parts

The component uses `zn-navbar` and `zn-inline-edit` internally, which expose their own CSS parts for advanced styling.

## Accessibility

- The component automatically detects RTL languages (Arabic, Hebrew) and applies proper text direction
- Keyboard navigation is supported within the inline edit fields
- Form integration ensures proper submission behavior with the Enter key
