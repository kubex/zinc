---
meta:
  title: Navbar
  description:
layout: component
---

```html:preview

<zn-navbar
  navigation="[{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Dashboard&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Another&quot;}]">
</zn-navbar>
```

## Examples

### Stacked

```html:preview

<zn-tabs>
  <zn-navbar
    slot="left"
    stacked
    navigation="[{&quot;path&quot;:&quot;#&quot;,&quot;icon&quot;:&quot;phone&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;icon&quot;:&quot;home&quot;}]">
  </zn-navbar>
  
  <div id="">
000000
  </div>
  <div id="1">
111111
  </div>
</zn-tabs>
```

### Second Example

```html:preview

  <zn-navbar
  navigation="[{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Dashboard&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Another&quot;}]">
    
  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="drop"></zn-expanding-action>
  </zn-navbar>
```


### Third Example

```html:preview

<zn-navbar small icon-bar rounded  navigation="[{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;HTML&quot;},{&quot;path&quot;:&quot;#&quot;,&quot;title&quot;:&quot;Text&quot;}]">>
</zn-navbar>
```