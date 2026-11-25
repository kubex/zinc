---
meta:
  title: Chart Switcher
  description: Shows one chart at a time from a set, picked by metric and by what the metric is broken down by.
layout: component
---

```html:preview
<zn-chart-switcher caption="Trends" description="Last 5 days">
  <zn-chart metric="Revenue" by="Project" type="area" smooth
            categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
            data="[{&quot;name&quot;:&quot;Checkout&quot;,&quot;data&quot;:[120,180,150,210,240]},{&quot;name&quot;:&quot;Billing&quot;,&quot;data&quot;:[80,60,90,110,95]}]"></zn-chart>
  <zn-chart metric="Revenue" by="Connector" type="area" smooth
            categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
            data="[{&quot;name&quot;:&quot;Stripe&quot;,&quot;data&quot;:[150,170,160,230,250]},{&quot;name&quot;:&quot;PayPal&quot;,&quot;data&quot;:[50,70,80,90,85]}]"></zn-chart>
  <zn-chart metric="Refunds" by="Project" type="area" smooth
            categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
            data="[{&quot;name&quot;:&quot;Checkout&quot;,&quot;data&quot;:[12,8,15,9,11]},{&quot;name&quot;:&quot;Billing&quot;,&quot;data&quot;:[4,6,3,5,7]}]"></zn-chart>
  <zn-chart metric="Refunds" by="Connector" type="area" smooth
            categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
            data="[{&quot;name&quot;:&quot;Stripe&quot;,&quot;data&quot;:[10,9,12,10,13]},{&quot;name&quot;:&quot;PayPal&quot;,&quot;data&quot;:[6,5,6,4,5]}]"></zn-chart>
  <zn-chart metric="Errors" type="bar"
            categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
            data="[{&quot;name&quot;:&quot;Declined&quot;,&quot;data&quot;:[5,3,7,4,6]}]"></zn-chart>
</zn-chart-switcher>
```

## Examples

### Metrics and Breakdowns

Give each chart a `metric`. Charts that share a metric but split it differently also set `by`, and a **By** select appears beside the metric pills for metrics with more than one breakdown. The chosen breakdown is kept when switching to another metric that offers it.

The caption, an optional muted `description`, and the controls sit in the card's header, since they only change this card.

When the metric pills and **By** select don't fit the header, they fold into one menu behind an ellipsis button.

Every chart keeps its size while hidden, so the panel's height never changes as you switch.

### Remembering the Choice

Set `store-key` to remember the chosen metric and breakdown for the session, or add `local-storage` to keep it across sessions. This keeps the choice when the switcher is replaced, for example when a time range reloads the content around it.

```html
<zn-chart-switcher caption="Trends" store-key="transactions-trends">
  ...
</zn-chart-switcher>
```

### Default Choice

Set `metric` and `by` to choose what shows before anything is stored.

```html
<zn-chart-switcher caption="Trends" metric="Refunds" by="Connector">
  ...
</zn-chart-switcher>
```
