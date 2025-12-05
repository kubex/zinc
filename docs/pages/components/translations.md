---
meta:
  title: Translations
  description: A component for managing multi-language text input.
layout: component
---

The Translations component allows users to enter text for multiple languages, with a tabbed interface for switching
between languages.

```html:preview
<zn-translations></zn-translations>
```

## Attributes

| Attribute   | Type     | Description                                                                                 |
|-------------|----------|---------------------------------------------------------------------------------------------|
| `languages` | `Object` | A key-value pair of language codes and names (e.g., `{ "en": "English", "fr": "French" }`). |
| `values`    | `Object` | A key-value pair of language codes and translations.                                        |
| `value`     | `String` | A JSON string representing the current translations.                                        |

## Examples

### With Label and extra button

```html:preview

<zn-translations
  label="Description"
  languages='{&quot;en&quot;:&quot;English&quot;,&quot;fr&quot;:&quot;French&quot;,&quot;de&quot;:&quot;German&quot;}'>
  <zn-button slot="expand" size="x-small" color="transparent" icon="translate"></zn-button>
</zn-translations>
```

### Custom Languages

You can provide a custom list of available languages via the `languages` property.

```html:preview

<zn-translations
  languages='{&quot;en&quot;:&quot;English&quot;,&quot;fr&quot;:&quot;French&quot;,&quot;de&quot;:&quot;German&quot;,&quot;es&quot;:&quot;Spanish&quot;,&quot;it&quot;:&quot;Italian&quot;,&quot;pt&quot;:&quot;Portuguese&quot;,&quot;ru&quot;:&quot;Russian&quot;,&quot;zh&quot;:&quot;Chinese&quot;,&quot;ja&quot;:&quot;Japanese&quot;,&quot;ar&quot;:&quot;Arabic&quot;}'></zn-translations>
```

### Pre-filled Values

```html:preview

<zn-translations
  languages='{&quot;en&quot;:&quot;English&quot;,&quot;fr&quot;:&quot;French&quot;}'
  values='{&quot;en&quot;:&quot;Hello World&quot;,&quot;fr&quot;:&quot;Bonjour le monde&quot;}'
></zn-translations>
```
