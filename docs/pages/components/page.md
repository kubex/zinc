---
meta:
  title: Page
  description: Pages combine a header with tabbed content.
layout: component
---

```html:preview
<zn-page caption="Page Title" summary="Page Summary">
  <zn-button slot="actions" type="primary" href="/ui">UI Examples</zn-button>

  <zn-tab caption="Overview">
    Overview Content
  </zn-tab>

  <zn-tab caption="Tab One">
    Tab One Content
  </zn-tab>

  <zn-tab caption="Tab Two" id="tab-2">
    Tab Two Content
  </zn-tab>

  <zn-tab caption="Dynamic Tab" uri="/tab-three"></zn-tab>
</zn-page>
```

## Examples

### Header Actions

Use `slot="actions"` to place controls in the page header action area.

```html:preview
<zn-page caption="Customers" summary="Manage active customers">
  <zn-button slot="actions" color="secondary">Export</zn-button>
  <zn-button slot="actions" color="primary">New Customer</zn-button>

  <zn-tab caption="Overview">
    Customer overview content
  </zn-tab>

  <zn-tab caption="Active">
    Active customer content
  </zn-tab>

  <zn-tab caption="Archived">
    Archived customer content
  </zn-tab>
</zn-page>
```

### Header Metadata

`zn-page` supports the same header metadata attributes as `zn-header`: `full-location`, `entity-id`, `entity-id-show`, `previous-path`, and `previous-target`.

```html:preview
<zn-page
  caption="Customer Comms"
  summary="This is a description about the purpose of this page."
  full-location="/customers/comms"
  entity-id="customer-comms"
  previous-path="/customers">
  <zn-tab caption="Overview">
    Overview content
  </zn-tab>
</zn-page>
```

### Breadcrumbs

Breadcrumb links can be passed with `slot="breadcrumb"` and will be forwarded to the underlying header.

```html:preview
<zn-page caption="Account Settings" summary="Configure account preferences">
  <a href="#" slot="breadcrumb">Accounts</a>
  <a href="#" slot="breadcrumb">Acme Inc</a>

  <zn-tab caption="Profile">
    Profile content
  </zn-tab>

  <zn-tab caption="Security">
    Security content
  </zn-tab>
</zn-page>
```

### Overview Content

Use a normal `zn-tab` for overview content. An Overview tab without an explicit `id` uses the default empty tab id. `zn-page` leaves tab elements in the page light DOM and projects them into internal tab panels, so scoped styles from the original DOM context continue to apply.
Tabs render in the order they appear in the page by default. Tabs with an empty id are shown first. Set `priority` on `zn-tab` to order the remaining tabs without changing their DOM position.

```html:preview
<zn-page caption="Project" summary="Current project status">
  <zn-tab caption="Overview">
    <zn-note open>
      This summary appears in the Overview tab.
    </zn-note>
  </zn-tab>

  <zn-tab caption="Activity">
    Activity content
  </zn-tab>

  <zn-tab caption="Files">
    Files content
  </zn-tab>
</zn-page>
```

### Tab Priority

Use `priority` to control tab order. Lower numbers appear first after the empty-id overview tab.

```html:preview
<zn-page caption="Ordered Page" summary="Priority controls the navigation order">
  <zn-tab caption="Later">
    Later content
  </zn-tab>

  <zn-tab caption="Second" priority="20">
    Second content
  </zn-tab>

  <zn-tab caption="Overview">
    Overview content
  </zn-tab>

  <zn-tab caption="First" priority="10">
    First content
  </zn-tab>
</zn-page>
```

### Dynamic Tabs

Set `uri` on `zn-tab` to create a dynamic tab. The generated navigation item receives `tab-uri`.

```html:preview
<zn-page caption="Reports" summary="Load reports on demand">
  <zn-tab caption="Overview">
    Report overview content
  </zn-tab>

  <zn-tab caption="Revenue" uri="/reports/revenue"></zn-tab>
  <zn-tab caption="Usage" uri="/reports/usage"></zn-tab>
</zn-page>
```
