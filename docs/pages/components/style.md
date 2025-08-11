---
meta:
  title: Style
  description:
layout: component
---

## Examples

### Colours

```html:preview
<zn-style>
  <p>Default Style</p>
</zn-style>
<zn-style color="blue">
  <p>Blue Color</p>
</zn-style>
<zn-style color="indigo">
  <p>Indigo Color</p>
</zn-style>
<zn-style info>
  <p>Info Style</p>
</zn-style>
<zn-style error>
  <p>Error Style</p>
</zn-style>
<zn-style success>
  <p>Success Style</p>
</zn-style>
<zn-style warning>
  <p>Warning Style</p>
</zn-style>
<zn-style primary>
  <p>Primary Style</p>
</zn-style>
<zn-style accent>
  <p>Accent Style</p>
</zn-style>
```

### Padding

```html:preview
<zn-style border pad=l>Left Padding</zn-style>
<zn-style border pad=r>Right Padding</zn-style>
<zn-style border pad=t>Top Padding</zn-style>
<zn-style border pad=b>Bottom Padding</zn-style>
<zn-style border pad=x>X Padding</zn-style>
<zn-style border pad=y>Y Padding</zn-style>
<zn-style border pad=tl>Top Left Padding</zn-style>
<zn-style border pad=trbl>Top Right Bottom Left Padding</zn-style>
<zn-style border pad=bx>X Bottom Padding</zn-style>
<zn-style border pad=xy>XY Padding</zn-style>
<zn-style border pad=a>ALL Padding</zn-style>
```

### Margin

```html:preview
<style>
.style-bg{
  background-color: #f0f0f0;
  margin: 5px;
  display: inline-block;
}
</style>
<div class="style-bg"><zn-style border margin=l>Left Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=r>Right Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=t>Top Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=b>Bottom Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=x>X Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=y>Y Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=tl>Top Left Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=trbl>Top Right Bottom Left Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=bx>X Bottom Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=xy>XY Margin</zn-style></div>
<div class="style-bg"><zn-style border margin=a>ALL Margin</zn-style></div>
```

