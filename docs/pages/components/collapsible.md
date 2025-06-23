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
