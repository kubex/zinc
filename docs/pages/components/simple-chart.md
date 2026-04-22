---
meta:
  title: Simple Chart
  description: A pre-styled compact bar chart for inline sparklines and dashboard tiles.
layout: component
---

`zn-simple-chart` renders a small, opinionated bar chart with no axes or legend — handy for inline sparklines and dashboard summary tiles. It accepts a single series of values via `datasets` and optional x-axis labels via `labels`. If neither is provided, a placeholder dataset is shown.

```html:preview
<zn-simple-chart>
</zn-simple-chart>
```

## Examples

### With Your Own Data

Pass a `datasets` array with one entry and its `data` values, plus a matching `labels` array for tooltip context.

```html:preview
<zn-simple-chart
  datasets="[{&quot;data&quot;:[12,18,9,24,30,22,35,42]}]"
  labels="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;,&quot;Sat&quot;,&quot;Sun&quot;,&quot;Mon&quot;]">
</zn-simple-chart>
```

### Enable Animations

By default, bars render immediately with no animation. Add the `enable-animations` attribute to make bars grow from the baseline on first render. Pass a number (milliseconds) to control the duration; bare `enable-animations` defaults to `1500`.

```html:preview
<zn-simple-chart
  enable-animations="3000"
  datasets="[{&quot;data&quot;:[12,18,9,24,30,22,35,42]}]"
  labels="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;,&quot;Sat&quot;,&quot;Sun&quot;,&quot;Mon&quot;]">
</zn-simple-chart>
```
