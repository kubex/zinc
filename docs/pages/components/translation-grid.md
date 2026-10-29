---
meta:
  title: Translation Grid
  description: Shows how far each language's translation has got, with a column per language to choose and enable it.
layout: component
---

Each language gets a column: its code links to that language's translation, the Enable row holds the control that
turns it on, and the Translation row shows its status. Pass the languages as a JSON array of
`{code, label, status, href}`, where `status` is `source`, `translated`, `outdated` or `missing`, and put each
language's Enable control in the `enable-{code}` slot.

```html:preview
<zn-translation-grid
  selected="es"
  languages='[
    {"code":"en","label":"English","status":"source"},
    {"code":"fr","label":"French","status":"translated","href":"#fr"},
    {"code":"de","label":"German","status":"outdated","href":"#de"},
    {"code":"es","label":"Spanish","status":"missing","href":"#es"},
    {"code":"it","label":"Italian","status":"missing","href":"#it"}
  ]'>
  <zn-checkbox slot="enable-en" checked disabled aria-label="English is always on"></zn-checkbox>
  <zn-checkbox slot="enable-fr" checked aria-label="Enable French"></zn-checkbox>
  <zn-checkbox slot="enable-de" aria-label="Enable German"></zn-checkbox>
  <zn-checkbox slot="enable-es" disabled aria-label="Enable Spanish"></zn-checkbox>
  <zn-checkbox slot="enable-it" disabled aria-label="Enable Italian"></zn-checkbox>
</zn-translation-grid>
```

## Examples

### Enabling From A Form

Each Enable control can post on its own: put it in a form in the language's slot and give it `submit-on-click`, with
an `unchecked-value` so unticking posts too.

```html:preview
<zn-translation-grid
  selected="fr"
  languages='[
    {"code":"en","label":"English","status":"source"},
    {"code":"fr","label":"French","status":"translated","href":"#fr"}
  ]'>
  <zn-checkbox slot="enable-en" checked disabled aria-label="English is always on"></zn-checkbox>
  <form slot="enable-fr" method="post" action="/translations/fr/enable">
    <zn-checkbox name="enabled" value="1" unchecked-value="0" submit-on-click aria-label="Enable French"></zn-checkbox>
  </form>
</zn-translation-grid>
```

### Naming The Source

The legend calls an out-of-date translation "English changed". Set `source-label` when the source is another language.

```html:preview
<zn-translation-grid
  source-label="German"
  languages='[
    {"code":"de","label":"German","status":"source"},
    {"code":"en","label":"English","status":"outdated","href":"#en"}
  ]'>
</zn-translation-grid>
```
