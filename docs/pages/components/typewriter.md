---
meta:
  title: Typewriter
  description: Types its text out one character at a time, then shows anything slotted after it.
layout: component
---

Use a typewriter to reveal a short, freshly generated answer, such as an assistant's reply. Screen readers receive the
full text immediately, and people who prefer reduced motion see it at once.

```html:preview
<zn-typewriter>Here are the articles that cover deep strike and reserves.</zn-typewriter>
```

## Examples

### Holding content back until typing finishes

Anything in the `after` slot appears once the text has been typed, so a reply reads in order. `padded` spaces the text
like a `zn-sp`, so flush content can sit beneath it.

```html:preview
<zn-typewriter padded>Two articles cover this.
  <div slot="after">
    <zn-tile caption="Reserves and Strategic Reserves"></zn-tile>
    <zn-tile caption="Unit Abilities Reference"></zn-tile>
  </div>
</zn-typewriter>
```

### Speed

`speed` sets the milliseconds per character. Longer text speeds up so it never takes more than `max-duration`
milliseconds.

```html:preview
<zn-typewriter speed="40" max-duration="4000">A slower, more deliberate reveal.</zn-typewriter>
```
