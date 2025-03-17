---
meta:
  title: Panel
  description:
layout: component
---

```html:preview

<zn-panel caption="Example Panel" flush tabbed>

  <!-- All the panel actions -->
  <zn-chip slot="actions" icon="home">Awesome</zn-chip>
  <zn-chip slot="actions" icon="phone" type="info">example</zn-chip>

  <!-- Example panel content -->
  <zn-tabs flush>
    <zn-navbar slot="top">
      <li tab>Customer</li>
      <li tab="something-else">Something Else</li>
    </zn-navbar>

    <zn-sp id="" divide>
      <zn-description-item style="background: var(--zn-color-red-100);" label="Label 1">This is awesome
      </zn-description-item>
      <zn-description-item style="background: var(--zn-color-red-100);" label="Label 2">This is awesome
      </zn-description-item>
    </zn-sp>

    <zn-sp id="something-else" divide>
      <zn-description-item style="background: var(--zn-color-red-100);" label="Label 3">This is not awesome
      </zn-description-item>
      <zn-description-item style="background: var(--zn-color-red-100);" label="Label 4">This is not awesome
      </zn-description-item>
    </zn-sp>
  </zn-tabs>

  <!-- Panel Footer -->
  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```

## Examples

### Basic Panel

Basic panels are just that, basic. However, they are a key component in the zn framework as most content is designed
around been displayed in a panel.

```html:preview
<zn-panel caption="Example Panel">
  <div>Panel Content</div>
</zn-panel>
```

### Second Example

TODO

[component-metadata:zn-panel]
