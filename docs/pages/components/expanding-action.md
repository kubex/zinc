---
meta:
  title: Expanding Action
  description:
layout: component
---

```html:preview
<zn-expanding-action icon="new_label" 
                     uri=""
                     method="fill"
                     count-uri=""
                     prefetch>
  This is the content here, this will probably be loaded from one of the URIs.
  if count uri is set, use that to retrieve the number to display as a notification
  if prefetch is set, we need to lod the uri which should have the count with it.
</zn-expanding-action>
```

## Multiple Examples

```html:preview
  <zn-expanding-action icon="edit_note"
                       method="fill"
                       count-uri="/note/count"
                       slot="actions"
                       prefetch>
    Hello there
  </zn-expanding-action>

  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="drop"
                       slot="actions">
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>
```

## Header Example

```html:preview
<zn-header caption="Expanding Action Example"
           navigation="[{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Dashboard&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Another&quot;}]">
  <zn-navbar slot="nav">
    <zn-expanding-action icon="new_label" method="fill">
      <zn-defined-label
        allow-custom
        predefined-labels="[{&quot;name&quot;:&quot;asc2&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;one&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;outbound&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;two&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;another&quot;,&quot;options&quot;:[&quot;one&quot;,&quot;two&quot;,&quot;three&quot;]},{&quot;name&quot;:&quot;awesome&quot;,&quot;options&quot;:[&quot;one&quot;,&quot;two&quot;,&quot;three&quot;,&quot;four&quot;]}]">
      </zn-defined-label>
    </zn-expanding-action>
  </zn-navbar>
</zn-header>
```