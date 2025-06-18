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


### Simple Header with actions

```html:preview
<div style="background-color: #f5f5f5; padding: 20px;">
  <zn-header caption="John Jones" description="This is the description of the header">
  <zn-button-menu slot="actions">
    <zn-button primary>Something sdf</zn-button>
    <zn-button >sd</zn-button>
    <zn-button secondary>fdf</zn-button>
    <zn-button secondary>fsdsfdf</zn-button>
    <zn-button >fd</zn-button>
    <zn-button category="edit">fdsfdf</zn-button>
    <zn-button primary category="edit">d</zn-button>
    <zn-button secondary category="view">dfsf</zn-button>
  </zn-button-menu>
</zn-header>
</div>
```




### Simple Header with expanding actions

```html:preview
<div style="background-color: #f5f5f5; padding: 20px;">
  <zn-header caption="John Jones" description="This is the description of the header">
  <zn-button-menu slot="actions">
    <zn-button primary>Something sdf</zn-button>
    <zn-button >sd</zn-button>
    <zn-button secondary>fdf</zn-button>
    <zn-button secondary>fsdsfdf</zn-button>
    <zn-button >fd</zn-button>
    <zn-button category="edit">fdsfdf</zn-button>
    <zn-button primary category="edit">d</zn-button>
    <zn-button secondary category="view">dfsf</zn-button>
  </zn-button-menu>
  
  
  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="drop"
                       slot="actions">
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>
  
  
  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="drop"
                       slot="actions">
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>
</zn-header>
</div>
```


