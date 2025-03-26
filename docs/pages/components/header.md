---
meta:
  title: Header
  description:
layout: component
---

```html:preview
<div style="background-color: #f5f5f5; padding: 20px;">
<zn-header caption="John Jones"
           description="This is the Description of the header"
           previous-path="#"
           breadcrumb="[{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Dashboard&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Another&quot;}]"
           navigation="[{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Dashboard&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Another&quot;}]">
  <zn-icon round src="test1@example.com" size="36"></zn-icon>
</zn-header>
</div>
```

## Examples

### Simple Header

```html:preview
<div style="background-color: #f5f5f5; padding: 20px;">
  <zn-header caption="John Jones"></zn-header>
</div>
```

### Simple Header with description

```html:preview
<div style="background-color: #f5f5f5; padding: 20px;">
  <zn-header caption="John Jones" description="This is the description of the header"></zn-header>
</div>
```


