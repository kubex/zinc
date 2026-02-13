---
meta:
  title: Translation Group
  description: A panel-styled container that provides a shared language toggle for multiple translation inputs.
layout: component
---

The Translation Group component wraps multiple `zn-translations` components in a panel-styled container with a shared
language toggle. A button group in the top right lets users switch between languages, controlling all child translation
inputs simultaneously.

```html:preview
<zn-translation-group
  label="Product Content"
  languages='{"en":"English","fr":"French","de":"German"}'>
  <zn-translations
    label="Name"
    name="name"
    values='{"en":"Wireless Headphones","fr":"Écouteurs sans fil","de":"Kabellose Kopfhörer"}'
  ></zn-translations>
  <zn-translations
    label="Description"
    name="description"
    values='{"en":"Premium noise-cancelling headphones","fr":"Écouteurs antibruit premium","de":"Premium-Kopfhörer mit Geräuschunterdrückung"}'
  ></zn-translations>
</zn-translation-group>
```

## Examples

### Basic Usage

A translation group with two translation inputs sharing one language button group.

```html:preview
<zn-translation-group languages='{"en":"English","fr":"French"}'>
  <zn-translations label="Title" name="title"></zn-translations>
  <zn-translations label="Subtitle" name="subtitle"></zn-translations>
</zn-translation-group>
```

### With Label

Use the `label` attribute to add a descriptive label in the panel header, displayed on the left side alongside the language toggle.

```html:preview
<zn-translation-group
  label="Page Translations"
  languages='{"en":"English","fr":"French","es":"Spanish"}'>
  <zn-translations label="Heading" name="heading"></zn-translations>
  <zn-translations label="Body" name="body"></zn-translations>
</zn-translation-group>
```

### Pre-filled Values

Set initial translations on each child. The group automatically collects all language codes from children and displays
them as buttons in the toggle group.

```html:preview
<zn-translation-group
  label="Notification Templates"
  languages='{"en":"English","fr":"French","de":"German","es":"Spanish"}'>
  <zn-translations
    label="Subject"
    name="subject"
    values='{"en":"Welcome aboard!","fr":"Bienvenue !","de":"Willkommen!","es":"Bienvenido!"}'
  ></zn-translations>
  <zn-translations
    label="Preview Text"
    name="preview"
    values='{"en":"Get started with your account","fr":"Commencez avec votre compte","de":"Starten Sie mit Ihrem Konto","es":"Comience con su cuenta"}'
  ></zn-translations>
</zn-translation-group>
```

### Many Fields

The group scales well with multiple translation inputs under a single toggle.

```html:preview
<zn-translation-group
  label="SEO Metadata"
  languages='{"en":"English","fr":"French","de":"German"}'>
  <zn-translations label="Page Title" name="seo-title"></zn-translations>
  <zn-translations label="Meta Description" name="seo-description"></zn-translations>
  <zn-translations label="Open Graph Title" name="og-title"></zn-translations>
  <zn-translations label="Open Graph Description" name="og-description"></zn-translations>
</zn-translation-group>
```

### Flush Layout

Remove body padding for a more compact appearance using the `flush` attribute.

```html:preview
<zn-translation-group
  flush
  label="Compact Translations"
  languages='{"en":"English","fr":"French"}'>
  <zn-translations label="Label" name="label"></zn-translations>
  <zn-translations label="Placeholder" name="placeholder"></zn-translations>
</zn-translation-group>
```

### Listening to Language Changes

The group emits a `zn-language-change` event when the active language changes.

```html:preview
<zn-translation-group
  id="group-events"
  label="Event Demo"
  languages='{"en":"English","fr":"French","de":"German"}'>
  <zn-translations label="Title" name="title"></zn-translations>
  <zn-translations label="Description" name="description"></zn-translations>
</zn-translation-group>

<div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: 4px;">
  <strong>Active Language:</strong>
  <span id="active-lang" style="font-family: monospace;">en</span>
</div>

<script type="module">
  const group = document.getElementById('group-events');
  const display = document.getElementById('active-lang');

  group.addEventListener('zn-language-change', (event) => {
    display.textContent = event.detail.language;
  });
</script>
```

### Real-World Use Case: Product Content Management

A complete example showing how the translation group simplifies a product editing form.

```html:preview
<div style="max-width: 800px;">
  <zn-panel caption="Product Details" icon="inventory_2">
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <zn-input
        label="Product SKU"
        value="PROD-12345"
        readonly
      ></zn-input>

      <zn-translation-group
        label="Translatable Content"
        languages='{"en":"English","fr":"French","de":"German","es":"Spanish"}'>
        <zn-translations
          name="name"
          label="Product Name"
          values='{"en":"Premium Wireless Headphones","fr":"Écouteurs sans fil premium","de":"Premium kabellose Kopfhörer","es":"Auriculares inalámbricos premium"}'
        ></zn-translations>
        <zn-translations
          name="short-description"
          label="Short Description"
          values='{"en":"High-quality wireless audio","fr":"Audio sans fil haute qualité","de":"Hochwertiges kabelloses Audio","es":"Audio inalámbrico de alta calidad"}'
        ></zn-translations>
        <zn-translations
          name="description"
          label="Full Description"
          values='{"en":"Experience premium sound with active noise cancellation","fr":"Découvrez un son premium avec suppression active du bruit","de":"Erleben Sie Premium-Sound mit aktiver Geräuschunterdrückung","es":"Experimente sonido premium con cancelación activa de ruido"}'
        ></zn-translations>
      </zn-translation-group>

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

| Property    | Type                     | Default      | Description                                            |
|-------------|--------------------------|--------------|--------------------------------------------------------|
| `label`     | `string`                 | `''`         | Label displayed in the panel header                    |
| `languages` | `Record<string, string>` | `{en: "EN"}` | Object mapping language codes to display names          |
| `flush`     | `boolean`                | `false`      | Removes body padding for compact layout                |

## Events

| Event                | Description                              | Event Detail           |
|----------------------|------------------------------------------|------------------------|
| `zn-language-change` | Emitted when the active language changes | `{ language: string }` |

## Slots

| Slot      | Description                                                |
|-----------|------------------------------------------------------------|
| (default) | Place `<zn-translations>` elements here                    |
| `label`   | Alternative to the `label` attribute for rich HTML content |

## CSS Parts

| Part           | Description                                             |
|----------------|---------------------------------------------------------|
| `base`         | The outer panel wrapper                                 |
| `header`       | The header area containing the label and language toggle |
| `translations` | The body container wrapping the slotted children        |
