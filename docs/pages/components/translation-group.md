---
meta:
  title: Translation Group
  description: A panel-styled container that provides a shared language select for multiple translation inputs.
layout: component
---

The Translation Group component wraps multiple `zn-translations` components in a panel-styled container with a shared
language select. The fields sit in a [form group](/components/form-group), so the caption, help text and the select
share its label column and the fields line up with every other form group around them. Closed, the select carries how
many languages are done as a `1/5` chip; open, each language is marked translated, partial or falling back to English.
Type to filter the list — by name or by language code, so `de` finds German. Choosing a language switches every child
at once.

```html:preview
<zn-translation-group
  label="Product Content"
  help-text="Every field is translated one language at a time"
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

A translation group with two translation inputs sharing one language select.

```html:preview
<zn-translation-group languages='{"en":"English","fr":"French"}'>
  <zn-translations label="Title" name="title"></zn-translations>
  <zn-translations label="Subtitle" name="subtitle"></zn-translations>
</zn-translation-group>
```

### Label and Help Text

`label` names the section in the form group's label column, and `help-text` sits under it — the pair behave as they do
on any other form group. The language select follows them, in the group's chip position. `language-label` sets the
select's accessible name — it is not shown, since the caption names the section on screen.

```html:preview
<zn-translation-group
  label="Page Translations"
  help-text="Pick a language to edit every field in it"
  languages='{"en":"English","fr":"French","es":"Spanish"}'>
  <zn-translations label="Heading" name="heading"></zn-translations>
  <zn-translations label="Body" name="body"></zn-translations>
</zn-translation-group>
```

### Pre-filled Values

Set initial translations on each child. A language every child has a value for is marked `Translated`; one only some
children have is `Partial`; one no child has falls back to English. English itself is the source, so it is neither
counted nor marked as a translation.

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

### Many Languages

Every configured language is offered whether or not it has been translated yet, so there is no separate step to add
one — pick it and start typing. The chip on the closed select tracks how many are done.

```html:preview
<zn-translation-group
  label="Release Notes"
  languages='{"en":"English","ar":"Arabic","de":"German","es":"Spanish","fr":"French","it":"Italian","ja":"Japanese","ko":"Korean","pt":"Portuguese","ru":"Russian","tr":"Turkish","zh-hans":"Simplified Chinese"}'>
  <zn-translations
    label="Headline"
    name="headline"
    values='{"en":"Now shipping","ar":"متاح الآن","de":"Jetzt verfügbar","es":"Ya disponible","fr":"Disponible dès maintenant","it":"Disponibile ora","ja":"発売開始","ko":"출시됨","pt":"Disponível agora","ru":"Уже в продаже","tr":"Şimdi mevcut","zh-hans":"现已发布"}'
  ></zn-translations>
  <zn-translations
    label="Summary"
    name="summary"
    values='{"en":"Tap through the release highlights.","ar":"تصفح أبرز ميزات الإصدار.","de":"Highlights der Version ansehen.","es":"Consulta lo más destacado.","fr":"Découvrez les nouveautés.","it":"Scopri le novità.","ja":"リリースのハイライトをご覧ください。","ko":"업데이트 주요 내용 보기.","pt":"Veja os destaques.","ru":"Ознакомьтесь с обновлениями.","tr":"Sürüm önemli noktaları.","zh-hans":"浏览版本亮点。"}'
  ></zn-translations>
</zn-translation-group>
```

### Custom Accessible Name

`language-label` is read out by a screen reader in place of a visible label.

```html:preview
<zn-translation-group
  language-label="Language"
  languages='{"en":"English","fr":"French","de":"German"}'>
  <zn-translations label="Heading" name="heading" values='{"en":"Now shipping","de":"Jetzt verfügbar"}'></zn-translations>
  <zn-translations label="Body" name="body" values='{"en":"Tap through the highlights."}'></zn-translations>
</zn-translation-group>
```

### Inline (No Panel)

Nested inside another panel, the group's own border and padding indent its fields out of line with everything around
them. `inline` drops the chrome so the group reads as a section of the form instead.

```html:preview
<zn-panel caption="Product Details" icon="inventory_2">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <zn-input label="Product SKU" value="PROD-12345" readonly></zn-input>

    <zn-translation-group
      inline
      label="Translatable Content"
      languages='{"en":"English","fr":"French","de":"German"}'>
      <zn-translations
        name="name"
        label="Product Name"
        values='{"en":"Premium Wireless Headphones","fr":"Écouteurs sans fil premium","de":"Premium kabellose Kopfhörer"}'
      ></zn-translations>
      <zn-translations
        name="short-description"
        label="Short Description"
        values='{"en":"High-quality wireless audio","fr":"Audio sans fil haute qualité","de":"Hochwertiges kabelloses Audio"}'
      ></zn-translations>
    </zn-translation-group>

    <zn-input label="Price" type="currency" value="299.99"></zn-input>
  </div>
</zn-panel>
```

### Actions

Buttons for the bottom of the group go in the `actions` slot. They sit on the white body rather than the grey
`footer`, and follow zinc's form action rows in sitting on the right. `align="start"` moves one to the left; any
number can sit on either side. Write them in the order they should be read — the sides are set by CSS ordering, so
markup order is what a keyboard follows.

```html:preview
<zn-translation-group
  label="Product Content"
  languages='{"en":"English","fr":"French","de":"German"}'>
  <zn-translations label="Name" name="name" values='{"en":"Wireless Headphones","de":"Kabellose Kopfhörer"}'></zn-translations>
  <zn-translations label="Description" name="description" values='{"en":"Premium noise-cancelling headphones"}'></zn-translations>

  <zn-button slot="actions" align="start" color="transparent" icon="translate">Auto-translate</zn-button>
  <zn-button slot="actions" color="secondary">Cancel</zn-button>
  <zn-button slot="actions" color="success">Save</zn-button>
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

## Properties

| Property         | Type                     | Default            | Description                                       |
|------------------|--------------------------|--------------------|---------------------------------------------------|
| `label`          | `string`                 | `''`               | Names the section, in the form group's label column |
| `help-text`      | `string`                 | `''`               | Sits under the label, above the language select   |
| `language-label` | `string`                 | `'Edit Languages'` | The select's accessible name; not shown on screen |
| `inline`         | `boolean`                | `false`            | Drops the panel border, background and padding    |
| `languages`      | `Record<string, string>` | `{en: "EN"}`       | Object mapping language codes to display names    |
| `flush`          | `boolean`                | `false`            | Removes body padding for compact layout           |

## Events

| Event                | Description                              | Event Detail           |
|----------------------|------------------------------------------|------------------------|
| `zn-language-change` | Emitted when the active language changes | `{ language: string }` |

## Slots

| Slot      | Description                                                |
|-----------|------------------------------------------------------------|
| (default) | Place `<zn-translations>` elements here                    |
| `actions` | Buttons for the bottom of the body; `align="start"` on a child moves it to the left |
| `footer`  | Content displayed in the grey panel footer                |

## CSS Parts

| Part              | Description                                                          |
|-------------------|----------------------------------------------------------------------|
| `base`            | The outer panel wrapper                                              |
| `form-group`      | The form group holding the caption, the language select and the fields |
| `language-field`  | The container holding the language select, in the group's chip slot   |
| `language-select` | The select itself                                                    |
| `actions`         | The row of buttons at the bottom of the body                         |
