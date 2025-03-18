---
meta:
  title: Sp
  description:
layout: component
---

```html:preview
<zn-sp>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
```

@property({attribute: 'divide', type: Boolean, reflect: true}) divide: boolean = false;
@property({attribute: 'row', type: Boolean, reflect: true}) row: boolean = false;
@property({attribute: 'grow', type: Boolean, reflect: true}) grow: boolean = false;
@property({attribute: 'pad-x', type: Boolean, reflect: true}) padX: boolean = false;
@property({attribute: 'pad-y', type: Boolean, reflect: true}) padY: boolean = false;
@property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;
@property({attribute: 'flush-x', type: Boolean, reflect: true}) flushX: boolean = false;
@property({attribute: 'flush-y', type: Boolean, reflect: true}) flushY: boolean = false;

## Examples

### Divided

```html:preview
<zn-sp divide>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
 ```

### Row

```html:preview
<zn-sp row>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
```

### Padding

```html:preview
<zn-sp pad>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
```

#### Pad X

```html:preview
<zn-sp pad-x>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
```

#### Pad Y

```html:preview
<zn-sp pad-y>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
```


