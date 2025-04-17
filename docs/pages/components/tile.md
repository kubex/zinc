---
meta:
  title: List Tile
  description:
layout: component
---

```html:preview
<zn-tile caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
  <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
  <zn-tile-property slot="properties" caption="Co-Founder / CEO Relations">Last seen 2h ago</zn-tile-property>
</zn-tile>

<zn-tile caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
  <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
  <div slot="actions"><zn-button href="#">Action</zn-button></div>
</zn-tile>
```

## Examples

### List

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
    <zn-tile-property slot="properties" caption="Co-Founder / CEO">
      Last seen 2h ago
    </zn-tile-property>
  </zn-tile>
  <zn-tile caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
    <zn-tile-property slot="properties" caption="Co-Founder / CEO">
      Last seen 2h ago
    </zn-tile-property>
  </zn-tile>
  <zn-tile caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
    <zn-tile-property slot="properties" caption="Co-Founder / CEO">
      Last seen 2h ago
    </zn-tile-property>
  </zn-tile>
</zn-sp>
```

### Second Example

TODO


