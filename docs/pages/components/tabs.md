---
meta:
  title: Tabs
  description: Tabs organize content into separate views that users can switch between using tab navigation elements.
layout: component
---

```html:preview
<zn-tabs caption="Example Panel" flush>
  <zn-navbar slot="top">
    <li tab>Customer</li>
    <li tab="something-else">Something Else</li>
  </zn-navbar>

  <zn-sp id="" no-gap divide>
    <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
  </zn-sp>

  <zn-sp id="something-else" no-gap divide>
    <zn-inline-edit padded inline caption="Label 3" value="This is not Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 4" value="This is not Awesome"></zn-inline-edit>
  </zn-sp>
</zn-tabs>
```

## Examples

### Basic Tabs

The tabs component works by connecting tab navigation elements (typically in a `zn-navbar` in the `top` slot) with content panels. Each panel is identified by an `id` attribute, and navigation items use a `tab` attribute to reference those IDs.

```html:preview
<zn-tabs flush>
  <zn-navbar slot="top">
    <li tab="">Overview</li>
    <li tab="details">Details</li>
    <li tab="settings">Settings</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Overview content goes here. This panel has an empty ID and is shown by default.</p>
  </zn-sp>

  <zn-sp id="details">
    <p>Details panel content.</p>
  </zn-sp>

  <zn-sp id="settings">
    <p>Settings panel content.</p>
  </zn-sp>
</zn-tabs>
```

### With Caption and Description

Use the `caption` and `description` attributes to add a header to your tabs component.

```html:preview
<zn-tabs caption="User Profile" description="Manage user information and settings">
  <zn-navbar slot="top">
    <li tab="">Personal Info</li>
    <li tab="preferences">Preferences</li>
  </zn-navbar>

  <zn-sp id="" padded>
    <zn-inline-edit padded inline caption="Full Name" value="John Doe"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Email" value="john@example.com"></zn-inline-edit>
  </zn-sp>

  <zn-sp id="preferences" padded>
    <zn-inline-edit padded inline caption="Theme" value="Light"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Language" value="English"></zn-inline-edit>
  </zn-sp>
</zn-tabs>
```

### Without Caption

Remove the `caption` attribute for a cleaner layout when a header is not needed.

```html:preview
<zn-tabs flush>
  <zn-navbar slot="top">
    <li tab="">Dashboard</li>
    <li tab="reports">Reports</li>
    <li tab="analytics">Analytics</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Dashboard content.</p>
  </zn-sp>

  <zn-sp id="reports">
    <p>Reports content.</p>
  </zn-sp>

  <zn-sp id="analytics">
    <p>Analytics content.</p>
  </zn-sp>
</zn-tabs>
```

### Dynamic Tabs with URI Loading

Use the `tab-uri` attribute to load content dynamically from a URL when a tab is clicked. The component will automatically fetch and display the content.

```html:preview
<zn-tabs flush no-prefetch>
  <zn-navbar slot="top">
    <li tab-uri="/api/content/overview">Overview</li>
    <li tab-uri="/api/content/details">Details</li>
    <li tab-uri="/api/content/settings">Settings</li>
  </zn-navbar>
</zn-tabs>
```

### Prefetching

By default, tabs with `tab-uri` will prefetch content on hover. Use the `no-prefetch` attribute to disable this behavior and only load content when clicked.

```html:preview
<zn-tabs flush no-prefetch>
  <zn-navbar slot="top">
    <li tab-uri="/api/data/tab1">Tab 1</li>
    <li tab-uri="/api/data/tab2">Tab 2</li>
  </zn-navbar>
</zn-tabs>
```

### Default Active Tab

Use the `active` attribute to specify which tab should be active by default.

```html:preview
<zn-tabs flush active="settings">
  <zn-navbar slot="top">
    <li tab="">Home</li>
    <li tab="settings">Settings</li>
    <li tab="about">About</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Home panel.</p>
  </zn-sp>

  <zn-sp id="settings">
    <p>Settings panel - this is active by default.</p>
  </zn-sp>

  <zn-sp id="about">
    <p>About panel.</p>
  </zn-sp>
</zn-tabs>
```

### Storage Persistence

Use `store-key` to persist the active tab selection across page reloads. By default, uses session storage with a 5-minute TTL. Use `local-storage` for persistent storage beyond the session.

```html:preview
<zn-tabs flush store-key="my-tabs">
  <zn-navbar slot="top">
    <li tab="">Tab 1</li>
    <li tab="tab2">Tab 2</li>
    <li tab="tab3">Tab 3</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Tab 1 content. Switch tabs and reload the page to see persistence.</p>
  </zn-sp>

  <zn-sp id="tab2">
    <p>Tab 2 content.</p>
  </zn-sp>

  <zn-sp id="tab3">
    <p>Tab 3 content.</p>
  </zn-sp>
</zn-tabs>
```

### Local Storage

Use `local-storage` with `store-key` to persist tabs across browser sessions. Control expiration with `store-ttl` (in seconds).

```html:preview
<zn-tabs flush store-key="persistent-tabs" local-storage store-ttl="86400">
  <zn-navbar slot="top">
    <li tab="">Persistent Tab 1</li>
    <li tab="persistent2">Persistent Tab 2</li>
  </zn-navbar>

  <zn-sp id="">
    <p>This tab selection persists for 24 hours.</p>
  </zn-sp>

  <zn-sp id="persistent2">
    <p>Tab 2 content.</p>
  </zn-sp>
</zn-tabs>
```

### Padding Options

Control content padding with the `padded` attribute for all sides, or use `padded-right` for specific padding.

```html:preview
<zn-tabs flush padded>
  <zn-navbar slot="top">
    <li tab="">Padded Content</li>
    <li tab="normal">Normal</li>
  </zn-navbar>

  <zn-sp id="">
    <p>This content has padding applied.</p>
  </zn-sp>

  <zn-sp id="normal">
    <p>Normal content.</p>
  </zn-sp>
</zn-tabs>
```

### Flush Layout

Use the `flush` attribute to remove all padding from the content area, useful for full-width content.

```html:preview
<zn-tabs flush>
  <zn-navbar slot="top">
    <li tab="">Flush Content</li>
    <li tab="padded">Padded Content</li>
  </zn-navbar>

  <div id="">
    <p style="margin: 0; padding: 20px; background: var(--zn-color-neutral-100);">
      This content extends to the edges.
    </p>
  </div>

  <zn-sp id="padded">
    <p>This has default spacing.</p>
  </zn-sp>
</zn-tabs>
```

### Full Width

Use the `full-width` attribute to make tab content expand to fill the available width.

```html:preview
<zn-tabs flush full-width>
  <zn-navbar slot="top">
    <li tab="">Full Width</li>
    <li tab="normal">Normal</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Full width content.</p>
  </zn-sp>

  <zn-sp id="normal">
    <p>Normal content.</p>
  </zn-sp>
</zn-tabs>
```

### Split Pane Layout

Use the `split` attribute with a pixel value to create a split pane layout with resizable sections. Control minimum and maximum sizes with `split-min` and `split-max`.

```html:preview
<zn-tabs split="300" split-min="200" split-max="600">
  <zn-navbar slot="left">
    <li tab="">Navigation</li>
    <li tab="menu2">Menu 2</li>
  </zn-navbar>

  <div slot="right">
    <zn-sp id="">
      <p>Main content area on the right side.</p>
    </zn-sp>

    <zn-sp id="menu2">
      <p>Alternate content.</p>
    </zn-sp>
  </div>
</zn-tabs>
```

### Split Pane with Custom Captions

Customize the split pane labels with `primary-caption` and `secondary-caption`.

```html:preview
<zn-tabs split="250" primary-caption="Sidebar" secondary-caption="Main Area">
  <div slot="left">
    <p>Left sidebar content</p>
  </div>

  <div slot="right">
    <p>Right main area content</p>
  </div>
</zn-tabs>
```

### Slots

The tabs component provides multiple slots for flexible layouts.

```html:preview
<zn-tabs caption="Slotted Content">
  <zn-navbar slot="top">
    <li tab="">Main</li>
    <li tab="extra">Extra</li>
  </zn-navbar>

  <div slot="actions">
    <zn-button size="small" icon="settings">Settings</zn-button>
  </div>

  <div slot="left">
    <p>Left sidebar</p>
  </div>

  <zn-sp id="">
    <p>Main content area.</p>
  </zn-sp>

  <zn-sp id="extra">
    <p>Extra content.</p>
  </zn-sp>

  <div slot="right">
    <p>Right sidebar</p>
  </div>

  <div slot="bottom">
    <p>Footer content</p>
  </div>
</zn-tabs>
```

### Actions Slot

Use the `actions` slot to add action buttons that appear in the header. Elements can be conditionally shown based on the active tab using `ref-tab`.

```html:preview
<zn-tabs caption="Document Editor">
  <zn-navbar slot="top">
    <li tab="">Edit</li>
    <li tab="preview">Preview</li>
  </zn-navbar>

  <div slot="actions">
    <zn-button ref-tab="" size="small" icon="save" color="success">Save</zn-button>
    <zn-button ref-tab="preview" size="small" icon="print">Print</zn-button>
  </div>

  <zn-sp id="">
    <p>Editing mode - Save button is visible.</p>
  </zn-sp>

  <zn-sp id="preview">
    <p>Preview mode - Print button is visible.</p>
  </zn-sp>
</zn-tabs>
```

### Programmatic Tab Control

Access tab methods programmatically to switch tabs, navigate, or refresh content.

```html:preview
<zn-tabs id="programmable-tabs" flush>
  <zn-navbar slot="top">
    <li tab="">Tab 1</li>
    <li tab="tab2">Tab 2</li>
    <li tab="tab3">Tab 3</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Tab 1 content.</p>
  </zn-sp>

  <zn-sp id="tab2">
    <p>Tab 2 content.</p>
  </zn-sp>

  <zn-sp id="tab3">
    <p>Tab 3 content.</p>
  </zn-sp>
</zn-tabs>

<br />

<zn-button id="prev-tab">Previous Tab</zn-button>
<zn-button id="next-tab">Next Tab</zn-button>
<zn-button id="goto-tab2">Go to Tab 2</zn-button>

<script type="module">
  const tabs = document.querySelector('#programmable-tabs');

  document.querySelector('#prev-tab').addEventListener('click', () => {
    tabs.previousTab();
  });

  document.querySelector('#next-tab').addEventListener('click', () => {
    tabs.nextTab();
  });

  document.querySelector('#goto-tab2').addEventListener('click', () => {
    tabs.setActiveTab('tab2', true, false);
  });
</script>
```

### Tab Refresh

Triple-clicking an active tab or using the refresh parameter will reload dynamic content. Hold Alt while clicking to force a refresh.

```html:preview
<zn-tabs flush>
  <zn-navbar slot="top">
    <li tab-uri="/api/timestamp">Timestamp</li>
    <li tab-uri="/api/random">Random Data</li>
  </zn-navbar>
</zn-tabs>
<p><small>Triple-click a tab or Alt+click to refresh its content</small></p>
```

### No Scroll

Use the `no-scroll` attribute to prevent scrolling in the content area.

```html:preview
<zn-tabs flush no-scroll style="height: 300px;">
  <zn-navbar slot="top">
    <li tab="">No Scroll</li>
  </zn-navbar>

  <zn-sp id="">
    <p>This content area doesn't scroll even if content overflows.</p>
    <p>Additional content...</p>
    <p>More content...</p>
  </zn-sp>
</zn-tabs>
```

### Flush X

Use `flush-x` to remove only horizontal padding while keeping vertical padding.

```html:preview
<zn-tabs flush-x>
  <zn-navbar slot="top">
    <li tab="">Horizontal Flush</li>
  </zn-navbar>

  <zn-sp id="">
    <p>Content extends to horizontal edges but has vertical padding.</p>
  </zn-sp>
</zn-tabs>
```

### Dynamic Tab Monitoring

Use the `monitor` attribute to watch for specific elements being added to the DOM and re-register tabs when they appear.

```html:preview
<zn-tabs flush monitor="dynamic-container">
  <zn-navbar slot="top">
    <li tab="">Static Tab</li>
  </zn-navbar>

  <div id="dynamic-container">
    <zn-sp id="">
      <p>Static content that's always here.</p>
    </zn-sp>
  </div>
</zn-tabs>
```
