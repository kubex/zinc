---
meta:
  title: Query Builder
  description:
layout: component
---

```html:preview

<zn-query-builder
  filters="[{&quot;id&quot;:&quot;1&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;:[&quot;eq&quot;]}]">
</zn-query-builder>
```

## Examples

### Query String

This example will show the produce query string from the selected parameters.

```html:preview

<zn-query-builder id="query-string-example"
                  filters="[{&quot;id&quot;:&quot;1&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;:[&quot;eq&quot;]}]">
</zn-query-builder>

<br>

<div style="word-wrap: break-word;"><b>Query String:</b> </span><span class="query-string"></span></div>
```
