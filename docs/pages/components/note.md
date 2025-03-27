---
meta:
  title: Note
  description:
layout: component
---

```html:preview
<zn-note caption="The caption" 
         date="11/10/24" 
         body="The body"
         color="gray"></zn-note>
```

## Examples

### Using HTML

```html:preview
<zn-note color="gray">
  <span slot="caption">The caption</span>
  <span slot="body">The body</span>
  <span slot="date">
    <small>11/10/24</small>
  </span>
</zn-note>
```

### Changing Colour

```html:preview
<zn-note caption="The caption" 
         date="11/10/24" 
         body="I'm blue!"
         color="blue"></zn-note>
         
<zn-note caption="The caption" 
         date="11/10/24" 
         body="I'm yellow!"
         color="yellow"></zn-note>

<zn-note caption="The caption" 
         date="11/10/24" 
         body="I'm red!"
         color="red"></zn-note>

<zn-note caption="The caption" 
         date="11/10/24" 
         body="I'm green!"
         color="green"></zn-note>
```

### No Border Colour

```html:preview
<zn-note caption="The caption" 
         date="11/10/24" 
         body="The body"></zn-note>
```