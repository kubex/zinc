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

### Pill

Add the `pill` attribute to draw the tabs as a segmented control: a grey track with a raised pill that slides to the
active tab, stretching and settling with a spring as it moves.

```html:preview
<zn-tabs>
  <zn-navbar slot="top" pill navigation='[{"tab":"","title":"All"},{"tab":"active","title":"Active"},{"tab":"draft","title":"Draft"},{"tab":"archived","title":"Archived"}]'></zn-navbar>
  <div id="">All</div>
  <div id="active">Active</div>
  <div id="draft">Draft</div>
  <div id="archived">Archived</div>
</zn-tabs>
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

`zn-navbar pill` draws the tabs as a segmented control with this motion built in. The indicator moves by its two
edges: on a tab change it squishes slightly during `--zn-navbar-tab-indicator-delay`, then its leading edge glides to
the new tab while the trailing edge follows on a damped spring, so it stretches a little and settles. Neither edge
travels beyond the new tab. Reduced motion turns all of this off.

```html:preview
<style>
  .liquid-tabs zn-navbar {
    /* Squish, then move once the squish is at its deepest */
    --zn-navbar-tab-indicator-delay: 60ms;
    --zn-navbar-tab-indicator-squash: 0.9;
    /* The leading edge glides in on a drawer curve */
    --zn-navbar-tab-indicator-duration: 280ms;
    --zn-navbar-tab-indicator-easing: cubic-bezier(0.32, 0.72, 0, 1);
    /* The trailing edge follows on a well-damped spring */
    --zn-navbar-tab-indicator-trail-duration: 340ms;
    --zn-navbar-tab-indicator-trail-easing: linear(0, 0.055, 0.177, 0.325, 0.47, 0.601, 0.71, 0.798, 0.865, 0.914, 0.949, 0.973, 0.988, 0.998, 1.003, 1.005, 1.006, 1.006, 1.005, 1.004, 1.004, 1.003, 1.002, 1.001, 1);
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
