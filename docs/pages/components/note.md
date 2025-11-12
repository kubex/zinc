---
meta:
  title: Note
  description:
layout: component
---

```html:preview

<zn-note color="gray" collapse-at-characters="100">
  <span slot="caption">The caption</span>
  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam, autem deleniti, dolore dolores ea enim fugit
  harum incidunt minima numquam possimus praesentium quaerat quasi sequi sunt temporibus ut velit, veniam. Aut dolor
  eius quae. Consequatur deleniti ipsum itaque pariatur ullam velit! Alias aut delectus dolores esse fuga iure laborum
  magnam maiores minima, minus, natus placeat provident quasi ratione ullam ut? Fugit nisi placeat quidem suscipit
  voluptatum? Adipisci aspernatur assumenda consequatur dolore ea esse exercitationem ipsum maiores minima neque saepe,
  voluptates voluptatibus! A ab adipisci consequatur, esse eveniet itaque sed soluta! Aliquid animi blanditiis dolores
  dolorum eum facere fugit harum id illo, laboriosam laborum libero magni minus natus nihil perspiciatis porro quae
  quisquam, ratione rem repellat sequi sit suscipit voluptas voluptatum. Atque delectus eos fugit illo sit soluta
  suscipit vero? At consectetur culpa dolor, dolores ea earum enim error et expedita iste laudantium nam necessitatibus
  quaerat, quis sed tempora vel voluptatum?
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