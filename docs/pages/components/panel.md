---
meta:
  title: Panel
  description:
layout: component
---

```html:preview

<zn-panel caption="Example Panel" description="Full Example of a panel" flush tabbed>

  <!-- All the panel actions -->
  <zn-chip slot="actions" icon="home">Awesome</zn-chip>
  <zn-chip slot="actions" icon="phone" type="info">example</zn-chip>

  <!-- Example panel content -->
  <zn-tabs flush>
    <zn-navbar slot="top">
      <li tab>Customer</li>
      <li tab="something-else">Something Else</li>
    </zn-navbar>

    <zn-sp id="" no-gap divide>
      <zn-description-item  label="Label 1">This is awesome
      </zn-description-item>
      <zn-description-item  label="Label 2">This is awesome
      </zn-description-item>
    </zn-sp>

    <zn-sp id="something-else" no-gap divide>
      <zn-description-item  label="Label 3">This is not awesome
      </zn-description-item>
      <zn-description-item  label="Label 4">This is not awesome
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
<zn-panel caption="Example Panel" description="Simple Panels are the best">
  <div>Panel Content</div>
</zn-panel>
```

### Flush with Tabs

`flush` panels are designed to be used in a layout where the content of the panel needs to take up the entire width of
the
panel. This can be useful when using other components such as `zn-tabs`.

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

    <zn-sp id="" no-gap divide>
      <zn-description-item  label="Label 1">This is awesome
      </zn-description-item>
      <zn-description-item  label="Label 2">This is awesome
      </zn-description-item>
    </zn-sp>

    <zn-sp id="something-else" no-gap divide>
      <zn-description-item  label="Label 3">This is not awesome
      </zn-description-item>
      <zn-description-item  label="Label 4">This is not awesome
      </zn-description-item>
    </zn-sp>
  </zn-tabs>

  <!-- Panel Footer -->
  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```



### Moving the caption

```html:preview

<zn-panel flush>

  <!-- Example panel content -->
  <zn-tabs caption="Example Panel">
    <zn-navbar slot="top">
      <li tab>Customer</li>
      <li tab="something-else">Something Else</li>
    </zn-navbar>

    <zn-sp id="" no-gap divide>
      <zn-description-item label="Label 1">This is awesome
      </zn-description-item>
      <zn-description-item label="Label 2">This is awesome
      </zn-description-item>
    </zn-sp>

    <zn-sp id="something-else" no-gap divide>
      <zn-description-item label="Label 3">This is not awesome
      </zn-description-item>
      <zn-description-item label="Label 4">This is not awesome
      </zn-description-item>
    </zn-sp>
  </zn-tabs>

  <!-- Panel Footer -->
  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```


