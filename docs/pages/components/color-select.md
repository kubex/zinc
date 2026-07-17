---
meta:
  title: Color Select
  description: A simple color picker. The dropdown lists color swatches with names; the closed control shows only the selected color's swatch.
layout: component
---

```html:preview
<zn-color-select label="Color" name="color"></zn-color-select>
```

## Examples

### With a Default Value

Set the selected color with the `value` attribute (lowercase color name).

```html:preview
<zn-color-select label="Color" name="color" value="blue"></zn-color-select>
```

### Clearable

Add the `clearable` attribute to show a clear button when a color is selected.

```html:preview
<zn-color-select label="Color" name="color" value="green" clearable></zn-color-select>
```

### Help Text

```html:preview
<zn-color-select label="Color" name="color" help-text="Pick a color for the label."></zn-color-select>
```
