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

### Sliding Indicator

Set `--zn-navbar-tab-indicator-slide: 1` to replace each tab's own line with a single indicator that slides to the active tab. Style it with `::part(indicator)`; `--zn-navbar-indicator-top` and `--zn-navbar-indicator-height` give the active tab's box, so the indicator can fill the tab as a pill instead of underlining it.

```html:preview
<style>
  .pill-tabs zn-navbar {
    --zn-navbar-tab-indicator-slide: 1;
    --zn-navbar-tab-background: transparent;
    --zn-navbar-tab-hover-background: transparent;
    --zn-navbar-tab-hover-backdrop: transparent;
    --zn-navbar-tab-active-background: transparent;
  }

  .pill-tabs zn-navbar::part(container) {
    border-bottom: 0;
  }

  .pill-tabs zn-navbar::part(navbar) {
    width: fit-content;
    height: auto;
    padding: 4px;
    border-radius: 10px;
    background: var(--zn-color-neutral-100);
  }

  .pill-tabs zn-navbar::part(navbar-item) {
    z-index: 1;
    min-height: 32px;
    border: 0;
  }

  .pill-tabs zn-navbar::part(indicator) {
    z-index: 0;
    top: var(--zn-navbar-indicator-top);
    bottom: auto;
    height: var(--zn-navbar-indicator-height);
    border-radius: 7px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
  }
</style>

<zn-tabs class="pill-tabs">
  <zn-navbar slot="top" navigation='[{"tab":"","title":"All"},{"tab":"active","title":"Active"},{"tab":"draft","title":"Draft"},{"tab":"archived","title":"Archived"}]'></zn-navbar>
  <div id="">All</div>
  <div id="active">Active</div>
  <div id="draft">Draft</div>
  <div id="archived">Archived</div>
</zn-tabs>
```

### Liquid Indicator

The indicator moves by its two edges. Give the trailing edge a longer duration or a delay and it stretches towards the new tab before catching up; `--zn-navbar-tab-indicator-squash` thins it while it travels, and a spring easing makes it wobble as it lands. Reduced motion turns all of this off.

```html:preview
<style>
  .liquid-tabs zn-navbar {
    --zn-navbar-tab-indicator-duration: 500ms;
    --zn-navbar-tab-indicator-trail-duration: 550ms;
    --zn-navbar-tab-indicator-trail-delay: 70ms;
    --zn-navbar-tab-indicator-squash: 0.85;
    /* Damped spring: ~5% overshoot, one settle */
    --zn-navbar-tab-indicator-easing: linear(0, 0.021, 0.077, 0.156, 0.249, 0.348, 0.447, 0.543, 0.633, 0.713, 0.785, 0.846, 0.897, 0.94, 0.973, 0.999, 1.018, 1.031, 1.04, 1.044, 1.046, 1.045, 1.043, 1.039, 1.035, 1.031, 1.026, 1.022, 1.018, 1.014, 1.01, 1.007, 1.005, 1.003, 1.001, 1, 1);
  }
</style>

<zn-tabs class="pill-tabs liquid-tabs">
  <zn-navbar slot="top" navigation='[{"tab":"","title":"All"},{"tab":"active","title":"Active"},{"tab":"draft","title":"Draft"},{"tab":"suspended","title":"Suspended"},{"tab":"archived","title":"Archived"}]'></zn-navbar>
  <div id="">All</div>
  <div id="active">Active</div>
  <div id="draft">Draft</div>
  <div id="suspended">Suspended</div>
  <div id="archived">Archived</div>
</zn-tabs>
```
