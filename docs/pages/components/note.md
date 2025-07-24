---
meta:
  title: Note
  description:
layout: component
---

```html:preview

<zn-note color="gray">
  <span slot="caption">The caption</span>
  <span>The body</span>
  <span slot="date">
    <small>11/10/24</small>
  </span>
</zn-note>
```

## Examples

### Using HTML

```html:preview

<zn-note color="gray">
  <span slot="caption">The caption</span>
  <span>The body</span>
  <span slot="date">
    <small>11/10/24</small>
  </span>
</zn-note>
```

### Changing Colour

```html:preview
<zn-note caption="The caption" date="11/10/24" color="red"><div>I'm red!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="blue"><div>I'm blue!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="orange"><div>I'm orange!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="yellow"><div>I'm yellow!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="indigo"><div>I'm indigo!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="violet"><div>I'm violet!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="green"><div>I'm green!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="pink"><div>I'm pink!</div></zn-note>
<zn-note caption="The caption" date="11/10/24" color="gray"><div>I'm gray!</div></zn-note>
```

### No Border Colour

```html:preview
<zn-note caption="The caption" 
         date="11/10/24">
  <div>The Body</div>
</zn-note>
```