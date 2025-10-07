---
meta:
  title: Settings Container
  description:
layout: component
---

By default, all elements inside a `<zn-settings-container>` are shown.
You can add filters to toggle visibility of specific elements based on their attributes.

```html:preview

<div style="width: 100%; height: 300px; border: 1px solid #ccc;">
  <zn-settings-container>

    <zn-tile private caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <zn-tile private caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <zn-tile private caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <zn-tile original caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <zn-tile original caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <div slot="filter" attribute="private" default="true">Toggle Private Messages</div>
    <div slot="filter" attribute="original" default="true">Toggle Original Messages</div>

  </zn-settings-container>
</div>
```

## Examples

### Specific Elements Only

You can pass to the settings container only specific elements you want to be affected by the filters.
for example by adding item-selector="zn-inline-edit" only the inline edit elements will be affected by the filters.

```html:preview

<style>
  zn-tile, zn-inline-edit {
    position: relative;
  }

  [private]:after, [original]:after {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 0 0 0 4px;
    color: #000;
    font-weight: bold;
  }

  [private]:after {
    content: " (private)";
    border: 1px solid #f00;
    background: #fee;
  }

  [original]:after {
    content: " (original)";
    border: 1px solid #00f;
    background: #eef;
  }
</style>

<div style="width: 100%; height: 300px; border: 1px solid #ccc;">
  <zn-settings-container item-selector="zn-inline-edit">

    <zn-inline-edit private caption="Something" value="1" action="#" method="GET"
                    options="{&quot;1&quot;: &quot;Option 1&quot;,&quot;2&quot;: &quot;Option 2&quot;}">
    </zn-inline-edit>

    <zn-tile private caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <zn-tile private caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <zn-inline-edit original caption="Something" value="1" action="#" method="GET"
                    options="{&quot;1&quot;: &quot;Option 1&quot;,&quot;2&quot;: &quot;Option 2&quot;}">
    </zn-inline-edit>

    <zn-tile original caption="Leslie Alexander" description="Leslie.alexander@example.com" href="https://google.com">
      <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
      <div slot="actions">
        <zn-button href="#">Action</zn-button>
      </div>
    </zn-tile>

    <div slot="filter" attribute="private" default="true" item-selector="zn-inline-edit">Toggle Inline Edit Private Messages</div>
    <div slot="filter" attribute="original" default="true" item-selector="zn-tile">Toggle Tile Original Messages</div>

  </zn-settings-container>
</div>
```

### Second Example

TODO
