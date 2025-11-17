---
meta:
  title: Collapsible
  description:
layout: component
---

```html:preview
<zn-collapsible caption="This is the caption"
                label="Optional label"
                description="This is the description to accompany the caption"
                label="The Label">
  <span>Boo</span>
  <zn-icon src="android"></zn-icon>
</zn-collapsible>
```

## Examples

### Default Open

Used instead of directly setting the `expanded` attribute on the element.

```html:preview
<zn-collapsible caption="Default Open"
                label="Toggle"
                description="Setting the default state show the element in it's open state on load"
                default="open">
  <span>Boo</span>
  <zn-icon src="android"></zn-icon>
</zn-collapsible>
```

### Checkbox stuff

```html:preview

<zn-collapsible caption="Collapsible with Checkbox">
  <div class="flex-mid" slot="caption">
    <div class="grow zn-pr">Billing</div>
    <zn-toggle name="enabled"></zn-toggle>
  </div>
  <div class="permission" data-filter="Example Permission">
    <div class="flex-row zn-pad">
      <div class="flex-mid">
        <div class="grow flex-col flex-jc">
          <strong>Example Permission</strong>
          <span>Example Permission Description</span>
        </div>
        <div class="flex-mid">
          <zn-toggle class="permission-toggle" name="enabled" value="1" fallback="0" size="medium">
          </zn-toggle>
        </div>
      </div>
    </div>
  </div>
  <div class="permission" data-filter="Example Permission">
    <div class="flex-row zn-pad">
      <div class="flex-mid">
        <div class="grow flex-col flex-jc">
          <strong>Example Permission 2</strong>
          <span>Example Permission 2 Description</span>
        </div>
        <div class="flex-mid">
          <zn-toggle name="enabled" size="medium"></zn-toggle>
        </div>
      </div>
    </div>
  </div>
</zn-collapsible>
```

### Expanded Attribute

```html:preview

<zn-collapsible caption="Expanded Attribute"
                description="Adding the expanded attribute will open the collapsible"
                expanded>
  <zn-button>Button</zn-button>
</zn-collapsible>
```

### Flush Attribute

```html:preview
<zn-collapsible caption="Flush" 
                description="The flush attribute removes the left margin of the content"
                flush>
  <zn-button>Button</zn-button>
</zn-collapsible>
```
