---
meta:
  title: Nav List
  description: A card of selectable groups shown beside the selected group's contents, for a master–detail layout.
layout: component
---

```html:preview
<zn-tabs flush gap>
  <zn-nav-list slot="left">
    <zn-nav-item tab="" count="4">Monthly plans</zn-nav-item>
    <zn-nav-item tab="annual-plans" count="3">Annual plans</zn-nav-item>
    <zn-nav-item tab="billing" count="3">Billing preferences</zn-nav-item>
  </zn-nav-list>

  <zn-panel id="" caption="Monthly plans">
    <p>The selected group's contents (usually a data table).</p>
  </zn-panel>
  <zn-panel id="annual-plans" caption="Annual plans">
    <p>Annual plan contents.</p>
  </zn-panel>
  <zn-panel id="billing" caption="Billing preferences">
    <p>Billing preference contents.</p>
  </zn-panel>
</zn-tabs>
```

## Examples

### Master–Detail

Use a nav list when a long set of groups sits beside the selected group's contents. Place it in the `left` slot of
a `zn-tabs` with the `flush` and `gap` attributes. Each `zn-nav-item` takes a `tab` attribute naming the `id` of its panel, the
same way tab navigation does, so the selection can also be remembered with `store-key` and panels loaded with
`tab-uri`.

When the tabs are narrower than 900px, the list moves above the contents and scrolls after 224px.

```html:preview
<zn-tabs flush gap>
  <zn-nav-list slot="left">
    <zn-nav-item tab="" count="12">Customers</zn-nav-item>
    <zn-nav-item tab="leads" count="48">Leads</zn-nav-item>
    <zn-nav-item tab="archived">Archived</zn-nav-item>
  </zn-nav-list>

  <zn-panel id="" caption="Customers">
    <p>Customer contents.</p>
  </zn-panel>
  <zn-panel id="leads" caption="Leads">
    <p>Lead contents.</p>
  </zn-panel>
  <zn-panel id="archived" caption="Archived">
    <p>Archived contents.</p>
  </zn-panel>
</zn-tabs>
```

### Counts

Set `count` on an item to show a count at the end of the row. Long labels are truncated with an ellipsis.

```html:preview
<zn-nav-list>
  <zn-nav-item count="4">Monthly plans</zn-nav-item>
  <zn-nav-item count="128">A group with a much longer name than the list is wide</zn-nav-item>
  <zn-nav-item>No count</zn-nav-item>
</zn-nav-list>
```

### Divided

Add the `divide` attribute for full-width rows split by dividers, with the selected row marked by a bar on its edge
and counts drawn as pills. Give an item a `description` for a line of detail below its label.

```html:preview
<zn-tabs flush gap>
  <zn-nav-list slot="left" caption="Sections" divide>
    <zn-nav-item tab="" count="6" description="Opening, discovery and resolution">General</zn-nav-item>
    <zn-nav-item tab="security" count="5" description="Identity checks and disclosures">Security &amp; compliance</zn-nav-item>
    <zn-nav-item tab="closing" count="3" description="Wrap-up and follow-up">Closing</zn-nav-item>
  </zn-nav-list>

  <zn-panel id="" caption="General"><p>General contents.</p></zn-panel>
  <zn-panel id="security" caption="Security &amp; compliance"><p>Security contents.</p></zn-panel>
  <zn-panel id="closing" caption="Closing"><p>Closing contents.</p></zn-panel>
</zn-tabs>
```

### Search

Add the `searchable` attribute to filter the items by their label. Set `search-placeholder` and `empty-label` to change
the input's placeholder and the message shown when nothing matches.

```html:preview
<zn-tabs flush gap>
  <zn-nav-list slot="left" searchable search-placeholder="Search groups">
    <zn-nav-item tab="" count="4">Monthly plans</zn-nav-item>
    <zn-nav-item tab="annual-plans" count="3">Annual plans</zn-nav-item>
    <zn-nav-item tab="billing" count="3">Billing preferences</zn-nav-item>
    <zn-nav-item tab="notifications" count="7">Notifications</zn-nav-item>
    <zn-nav-item tab="security" count="2">Security</zn-nav-item>
  </zn-nav-list>

  <zn-panel id="" caption="Monthly plans"><p>Monthly plan contents.</p></zn-panel>
  <zn-panel id="annual-plans" caption="Annual plans"><p>Annual plan contents.</p></zn-panel>
  <zn-panel id="billing" caption="Billing preferences"><p>Billing preference contents.</p></zn-panel>
  <zn-panel id="notifications" caption="Notifications"><p>Notification contents.</p></zn-panel>
  <zn-panel id="security" caption="Security"><p>Security contents.</p></zn-panel>
</zn-tabs>
```

### Width and Height

Set `--zn-nav-list-width` to change the card's width, and `--zn-nav-list-max-height` to cap its height. The list
scrolls inside the card once it reaches the cap.

```html:preview
<zn-nav-list style="--zn-nav-list-width: 12rem; --zn-nav-list-max-height: 9rem;">
  <zn-nav-item count="1">January</zn-nav-item>
  <zn-nav-item count="4">February</zn-nav-item>
  <zn-nav-item count="2">March</zn-nav-item>
  <zn-nav-item count="6">April</zn-nav-item>
  <zn-nav-item count="3">May</zn-nav-item>
  <zn-nav-item count="5">June</zn-nav-item>
</zn-nav-list>
```

### Keyboard

The list is a single tab stop. Arrow Up and Arrow Down move between items, Home and End jump to the first and last, and
Enter or Space selects the focused item.
