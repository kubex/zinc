---
meta:
  title: Color Picker
  description: A colour panel with a saturation and brightness area, a hue slider and the colour's HEX, RGB, HSL and OKLCH values.
layout: component
---

```html:preview
<zn-color-picker value="#085EFD"></zn-color-picker>
```

The panel that a [colour input](/components/input#color-input) opens from its swatch. In a form, use
`<zn-input type="color">` rather than the panel on its own.

## Examples

### Using the Panel

The colour area sets saturation (left to right) and brightness (bottom to top); click or drag, or use the arrow keys
(Shift for bigger steps). The hue slider sits under it. HEX, RGB, HSL and OKLCH are always shown together: edit any one
and the others follow, and an out-of-range number is marked red.

`value` accepts any CSS colour and reads back as `#RRGGBB`. `format` is the row last worked in, which a colour input
uses as the format to write its value in. Listen for `zn-input` to follow changes.

```html:preview
<zn-color-picker class="color-picker-demo" value="rgb(117, 87, 245)"></zn-color-picker>
<p>Value: <code class="color-picker-demo-value">#7557F5</code> · format: <code class="color-picker-demo-format">hex</code></p>

<script type="module">
  const picker = document.querySelector('.color-picker-demo');
  picker.addEventListener('zn-input', () => {
    document.querySelector('.color-picker-demo-value').textContent = picker.value;
    document.querySelector('.color-picker-demo-format').textContent = picker.format;
  });
</script>
```
