---
meta:
  title: Example Page
  description: An example of a full page in zinc with use of multiple nested tabs, in case you need to show multiple views of data.
fullWidth: true
---

# Example Page

An example of a full page in zinc with use of multiple nested tabs, in case you need to show multiple views of data.

We have a primary set of tabs which uses just the `zn-navbar` component to show the navigation, and then a secondary
set of tabs which uses the `zn-header` component to show the navigation in a more detailed way.

:::tip
**Note:** This is subject to change as defining the navigation and dropdown as attributes is not ideal, especially
for SEO purposes. We should be slotting everything in as children of the components.
:::

```html:preview

<style>
  .code-preview__preview {
    background-color: rgb(var(--zn-body)) !important;
    padding: 0 25px 0 0;
  }
</style>

<zn-tabs flush primary-caption="Navigation" secondary-caption="content">

  <!-- This is the navigation for the first set of tabs -->
  <zn-navbar slot="top"
             highlight
             navigation="[{&quot;title&quot;:&quot;John Doe&quot;,&quot;active&quot;:false,&quot;hintText&quot;:&quot;Overview&quot;,&quot;launchMode&quot;:&quot;page&quot;}]"
             dropdown="[{&quot;tab&quot;:&quot;2&quot;,&quot;title&quot;:&quot;Some Actions&quot;,&quot;type&quot;:&quot;dropdown&quot;}]">
  </zn-navbar>

  <!-- This is the content of the first tab / default -->
  <zn-tabs flush primary-caption="Navigation" secondary-caption="Content">

    <!-- This is the Navigation/Header for the Inner set of tabs -->
    <zn-header slot="top"
               caption="Customer"
               description="My Awesome Customer"
               navigation="[{&quot;title&quot;:&quot;Overview&quot;}, {&quot;title&quot;:&quot;Details&quot;, &quot;tab&quot;:&quot;details&quot;}]">
    </zn-header>

    <!--This is the content of the first tab / default inside the first tab -->
    <div>
      <!-- This is where your page content would be defined -->
      <zn-sp>
        <zn-panel caption="Something">Data Points</zn-panel>
        <zn-panel caption="Another Thing">Other Points</zn-panel>
      </zn-sp>
    </div>

    <!--This is the content of the second tab inside the first tab -->
    <div id="details">
      <!-- This is where your page content would be defined -->
      <zn-sp>
        <zn-panel caption="Awesome">this is an example of the details tab</zn-panel>
      </zn-sp>
    </div>
  </zn-tabs>

  <!-- This is the content of the second tab -->
  <div id="2">
    <zn-pane>
      <zn-header slot="top"
                 caption="Customer"
                 description="My Awesome Customer"
                 navigation="[{&quot;title&quot;:&quot;Overview&quot;}, {&quot;title&quot;:&quot;Details&quot;, &quot;tab&quot;:&quot;details&quot;}]">
      </zn-header>
      <!-- This is where your page content would be defined -->
      <zn-sp> <!-- Maybe zn-sp should be defaulted into the content? -->
        <zn-panel caption="Number 2">Something Something Darkside</zn-panel>
      </zn-sp>
    </zn-pane>
  </div>

</zn-tabs>

```

## What we want it to look like

Ideally we want to merge `zn-panel` and `zn-tabs` into a single component, this is because they are both used to define
the layout of the page but act in different ways.

We can used `tabbed` on the `zn-panel` component to define that it should be a tabbed layout, and then use the
`zn-navbar` component to define the navigation for the tabs. We should remove the navigation attribute from the
`zn-header` component and instead use the `zn-navbar` component to define the navigation for the inner tabs.

```html:preview

<style>
  .code-preview__preview {
    background-color: rgb(var(--zn-body)) !important;
    padding: 0 25px 0 0;
  }
</style>

<zn-panel tabbed flush primary-caption="Navigation" secondary-caption="content">

  <!-- This is the navigation for the first set of tabs -->
  <!-- highlight should change from highlight to pill-bar or something similar -->
  <zn-navbar slot="top"
             highlight
             navigation="[{&quot;title&quot;:&quot;John Doe&quot;,&quot;active&quot;:false,&quot;hintText&quot;:&quot;Overview&quot;,&quot;launchMode&quot;:&quot;page&quot;}]"
             dropdown="[{&quot;tab&quot;:&quot;2&quot;,&quot;title&quot;:&quot;Some Actions&quot;,&quot;type&quot;:&quot;dropdown&quot;}]">
  </zn-navbar>

  <!-- This is the content of the first tab / default -->
  <!-- Can probably remove flush as they should all be by default -->
  <zn-panel flush tabbed primary-caption="Navigation" secondary-caption="Content">

    <!-- This is the Navigation/Header for the Inner set of tabs -->
    <zn-header slot="top"
               caption="Customer"
               description="My Awesome Customer"
               navigation="[{&quot;title&quot;:&quot;Overview&quot;}, {&quot;title&quot;:&quot;Details&quot;, &quot;tab&quot;:&quot;details&quot;}]">
    </zn-header>

    <!--This is the content of the first tab / default inside the first tab -->
    <div>
      <!-- This is where your page content would be defined -->
      <zn-sp>
        <zn-panel caption="Something">Data Points</zn-panel>
        <zn-panel caption="Another Thing">Other Points</zn-panel>
      </zn-sp>
    </div>

    <!--This is the content of the second tab inside the first tab -->
    <div id="details">
      <!-- This is where your page content would be defined -->
      <zn-sp>
        <zn-panel caption="Awesome">this is an example of the details tab</zn-panel>
      </zn-sp>
    </div>
  </zn-panel>

  <!-- This is the content of the second tab -->
  <div id="2">
    <zn-pane>
      <zn-header slot="top"
                 caption="Customer"
                 description="My Awesome Customer"
                 navigation="[{&quot;title&quot;:&quot;Overview&quot;}, {&quot;title&quot;:&quot;Details&quot;, &quot;tab&quot;:&quot;details&quot;}]">
      </zn-header>
      <!-- This is where your page content would be defined -->
      <zn-sp> <!-- Maybe zn-sp should be defaulted into the content? -->
        <zn-panel caption="Number 2">Something Something Darkside</zn-panel>
      </zn-sp>
    </zn-pane>
  </div>

</zn-panel>

```