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

### Auto Margin

```html:preview
<style>
.style-abg{
  background-color: #f0f0f0;
  margin: 5px;
  width: 400px;
  height: 200px;
  display: flex;
}
</style>
<div class="style-abg"><zn-style border a-margin=a>Auto Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=l>Left Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=r>Right Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=t>Top Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=b>Bottom Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=x>X Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=y>Y Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=tl>Top Left Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=trbl>Top Right Bottom Left Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=bx>X Bottom Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=xy>XY Margin</zn-style></div>
<div class="style-abg"><zn-style border a-margin=a>ALL Margin</zn-style></div>
```

### Border

Accepts any combination of `t`, `b`, `l`, `r` to render specific sides. Use `a` (or the equivalent `tblr`) as a shortcut for all four sides. The bare `border` attribute (no value) is equivalent to `border="a"` and is kept for backward compatibility.

```html:preview
<zn-style border="t" pad=a>Top only</zn-style>
<zn-style border="b" pad=a>Bottom only</zn-style>
<zn-style border="l" pad=a>Left only</zn-style>
<zn-style border="r" pad=a>Right only</zn-style>
<zn-style border="tb" pad=a>Top + Bottom</zn-style>
<zn-style border="lr" pad=a>Left + Right</zn-style>
<zn-style border="tl" pad=a>Top + Left</zn-style>
<zn-style border="a"  pad=a>All sides (a)</zn-style>
<zn-style border      pad=a>All sides (bare attribute)</zn-style>
```

### Size

Adjusts font size in five steps mapped to the zinc font-size tokens. `m` is the default and applies no class.

| value | token                       |
| ----- | --------------------------- |
| `xs`  | `--zn-font-size-x-small`    |
| `s`   | `--zn-font-size-small`      |
| `m`   | inherits (no class applied) |
| `l`   | `--zn-font-size-large`      |
| `xl`  | `--zn-font-size-x-large`    |

```html:preview
<zn-style size="xs">Extra small</zn-style>
<zn-style size="s">Small</zn-style>
<zn-style size="m">Medium (default)</zn-style>
<zn-style size="l">Large</zn-style>
<zn-style size="xl">Extra large</zn-style>
```

### Muted

Dims the content with reduced opacity. Useful for placeholder-like values, em-dashes for empty cells, or any text you want visually de-emphasized without changing its colour.

```html:preview
<zn-style>Regular text</zn-style>
<zn-style muted>Muted text</zn-style>
<zn-style muted>&mdash;</zn-style>
```

