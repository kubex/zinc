---
meta:
  title: Split Pane
  description: Split panes divide a container into two resizable sections, allowing users to adjust the space allocated to each side.
layout: component
---

```html:preview
<zn-split-pane style="height: 400px;">
  <div slot="primary" style="padding: 20px;">
    <h3>Primary Pane</h3>
    <p>This is the primary (left) pane. Drag the divider to resize.</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <h3>Secondary Pane</h3>
    <p>This is the secondary (right) pane. It adjusts automatically as you resize the primary pane.</p>
  </div>
</zn-split-pane>
```

## Examples

### Basic Split Pane

Create a basic split pane with two sections. By default, the split is horizontal (left/right) with the primary pane starting at 50% width.

```html:preview
<zn-split-pane style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane content</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane content</p>
  </div>
</zn-split-pane>
```

### Initial Size

Use the `initial-size` attribute to set the starting size of the primary pane. By default, this is a percentage value (0-100).

```html:preview
<zn-split-pane initial-size="30" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane at 30%</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane at 70%</p>
  </div>
</zn-split-pane>
```

### Pixel-Based Sizing

Use the `pixels` attribute to switch from percentage-based sizing to pixel-based sizing. When enabled, `initial-size`, `min-size`, and `max-size` are all interpreted as pixel values.

```html:preview
<zn-split-pane pixels initial-size="250" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane is 250px wide</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane fills remaining space</p>
  </div>
</zn-split-pane>
```

### Min and Max Size

Use `min-size` and `max-size` to constrain how much users can resize the primary pane. These values match the unit type (percentage or pixels).

```html:preview
<zn-split-pane min-size="20" max-size="80" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane can be resized between 20% and 80%</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane adjusts accordingly</p>
  </div>
</zn-split-pane>
```

With pixel sizing:

```html:preview
<zn-split-pane pixels min-size="150" max-size="400" initial-size="250" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane can be resized between 150px and 400px</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane fills remaining space</p>
  </div>
</zn-split-pane>
```

### Secondary Size Preference

Use the `secondary` attribute to make the `initial-size` value apply to the secondary pane instead of the primary pane.

```html:preview
<zn-split-pane secondary initial-size="30" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane takes remaining space (70%)</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane is 30%</p>
  </div>
</zn-split-pane>
```

### Vertical Split

Use the `vertical` attribute to create a vertical split (top/bottom) instead of horizontal (left/right).

```html:preview
<zn-split-pane vertical style="height: 400px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <h3>Top Pane</h3>
    <p>This is the primary (top) pane.</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <h3>Bottom Pane</h3>
    <p>This is the secondary (bottom) pane.</p>
  </div>
</zn-split-pane>
```

### Bordered Divider

Use the `bordered` attribute to add a visible border to the divider, making it more prominent.

```html:preview
<zn-split-pane bordered style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane with bordered divider</p>
  </div>
</zn-split-pane>
```

### Persistent State with Storage

Use the `store-key` attribute to persist the split position across page reloads. By default, the position is stored in session storage.

```html:preview
<zn-split-pane store-key="my-split-pane" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Resize this pane and reload the page.</p>
    <p>Your position will be remembered during this session.</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane content</p>
  </div>
</zn-split-pane>
```

### Local Storage Persistence

Use `local-storage` with `store-key` to persist the split position across browser sessions. Use `store-ttl` to set an expiration time in seconds.

```html:preview
<zn-split-pane store-key="persistent-split" local-storage store-ttl="86400" style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>This position persists for 24 hours (86400 seconds).</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane content</p>
  </div>
</zn-split-pane>
```

### Padded Layout

Use the `padded` attribute to add padding and styling to the split pane, giving it a more distinct visual appearance with borders and rounded corners.

```html:preview
<zn-split-pane padded style="height: 400px;">
  <div slot="primary">
    <zn-sp padded>
      <h3>Padded Primary</h3>
      <p>The padded attribute adds visual styling.</p>
    </zn-sp>
  </div>
  <div slot="secondary">
    <zn-sp padded>
      <h3>Padded Secondary</h3>
      <p>Both panes have styled borders.</p>
    </zn-sp>
  </div>
</zn-split-pane>
```

### Padded Right

Use the `padded-right` attribute for padding on the right pane specifically.

```html:preview
<zn-split-pane padded-right style="height: 300px;">
  <div slot="primary">
    <zn-sp padded>
      <p>Primary pane</p>
    </zn-sp>
  </div>
  <div slot="secondary">
    <zn-sp padded>
      <p>Secondary pane with right padding</p>
    </zn-sp>
  </div>
</zn-split-pane>
```

### Responsive Behavior

On smaller screens (below medium breakpoint), the split pane automatically converts to a tabbed navigation interface, allowing users to toggle between the primary and secondary panes.

```html:preview
<zn-split-pane
  primary-caption="Details"
  secondary-caption="Settings"
  style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <h3>Details</h3>
    <p>On small screens, this becomes a tab.</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <h3>Settings</h3>
    <p>Toggle between panes using the navigation.</p>
  </div>
</zn-split-pane>
```

:::tip
**Note:** Resize your browser window to see the responsive behavior in action. Below the medium breakpoint (~750px), tabs will appear at the top.
:::

### Custom Captions

Use `primary-caption` and `secondary-caption` to customize the labels shown in the responsive tab navigation.

```html:preview
<zn-split-pane
  primary-caption="File Browser"
  secondary-caption="Editor"
  style="height: 350px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <h3>File Browser</h3>
    <ul>
      <li>index.html</li>
      <li>styles.css</li>
      <li>script.js</li>
    </ul>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <h3>Editor</h3>
    <p>File contents would appear here.</p>
  </div>
</zn-split-pane>
```

### Programmatic Focus Control

Use the `split-pane-focus` attribute on clickable elements to programmatically switch between panes on small screens.

```html:preview
<zn-split-pane style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Primary pane content</p>
    <zn-button split-pane-focus="1">Show Secondary</zn-button>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Secondary pane content</p>
    <zn-button split-pane-focus="0">Show Primary</zn-button>
  </div>
</zn-split-pane>
```

### Code Editor Layout

A practical example showing a split pane used for a code editor with file browser.

```html:preview
<zn-split-pane
  pixels
  initial-size="200"
  min-size="150"
  max-size="400"
  store-key="code-editor"
  primary-caption="Files"
  secondary-caption="Editor"
  style="height: 400px;">
  <div slot="primary" style="padding: 15px; background: #f8f8f8;">
    <h4 style="margin-top: 0;">Files</h4>
    <div style="font-family: monospace; font-size: 0.9em;">
      <div style="padding: 4px 0;">📁 src/</div>
      <div style="padding: 4px 0; padding-left: 20px;">📄 index.ts</div>
      <div style="padding: 4px 0; padding-left: 20px;">📄 app.ts</div>
      <div style="padding: 4px 0;">📁 styles/</div>
      <div style="padding: 4px 0; padding-left: 20px;">📄 main.css</div>
      <div style="padding: 4px 0;">📄 package.json</div>
    </div>
  </div>
  <div slot="secondary" style="padding: 15px;">
    <h4 style="margin-top: 0;">Editor - index.ts</h4>
    <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto;"><code>import { Component } from './app';

const app = new Component({
  name: 'MyApp',
  version: '1.0.0'
});

app.init();</code></pre>
  </div>
</zn-split-pane>
```

### Dashboard Layout

A dashboard layout example with a sidebar and main content area.

```html:preview
<zn-split-pane
  initial-size="25"
  min-size="20"
  max-size="40"
  bordered
  store-key="dashboard-layout"
  primary-caption="Menu"
  secondary-caption="Dashboard"
  style="height: 400px;">
  <div slot="primary" style="padding: 20px; background: #f8f9fa;">
    <h4 style="margin-top: 0;">Navigation</h4>
    <nav>
      <zn-menu>
        <zn-menu-item>Dashboard</zn-menu-item>
        <zn-menu-item>Analytics</zn-menu-item>
        <zn-menu-item>Reports</zn-menu-item>
        <zn-menu-item>Settings</zn-menu-item>
      </zn-menu>
    </nav>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <h3 style="margin-top: 0;">Dashboard Overview</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0;">Total Users</h4>
        <p style="font-size: 2em; margin: 0;">1,234</p>
      </div>
      <div style="background: #f3e5f5; padding: 20px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0;">Revenue</h4>
        <p style="font-size: 2em; margin: 0;">$45.6K</p>
      </div>
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0;">Active Sessions</h4>
        <p style="font-size: 2em; margin: 0;">89</p>
      </div>
    </div>
  </div>
</zn-split-pane>
```

### Vertical Dashboard

A vertical split pane showing a header area and main content.

```html:preview
<zn-split-pane
  vertical
  initial-size="30"
  min-size="20"
  max-size="50"
  bordered
  style="height: 400px;">
  <div slot="primary" style="padding: 20px; background: #f8f9fa;">
    <h3 style="margin-top: 0;">Activity Feed</h3>
    <div style="overflow-y: auto;">
      <div style="padding: 10px; border-bottom: 1px solid #ddd;">New user registration</div>
      <div style="padding: 10px; border-bottom: 1px solid #ddd;">System update completed</div>
      <div style="padding: 10px; border-bottom: 1px solid #ddd;">New comment posted</div>
    </div>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <h3 style="margin-top: 0;">Content Area</h3>
    <p>Main content goes here. The vertical split is useful for layouts with header/footer sections.</p>
  </div>
</zn-split-pane>
```

### Nested Split Panes

Split panes can be nested to create complex layouts with multiple resizable sections.

```html:preview
<zn-split-pane
  pixels
  initial-size="250"
  min-size="150"
  max-size="400"
  style="height: 400px;">
  <div slot="primary" style="padding: 20px; background: #f8f9fa;">
    <h4 style="margin-top: 0;">Sidebar</h4>
    <p>Fixed left sidebar</p>
  </div>
  <zn-split-pane
    slot="secondary"
    vertical
    initial-size="40"
    min-size="30"
    max-size="60">
    <div slot="primary" style="padding: 20px;">
      <h4 style="margin-top: 0;">Top Section</h4>
      <p>This is a nested vertical split</p>
    </div>
    <div slot="secondary" style="padding: 20px; background: #f5f5f5;">
      <h4 style="margin-top: 0;">Bottom Section</h4>
      <p>Resize both horizontal and vertical dividers</p>
    </div>
  </zn-split-pane>
</zn-split-pane>
```

### Touch Support

The split pane fully supports touch events for mobile devices. Users can drag the divider with their finger to resize.

```html:preview
<zn-split-pane style="height: 300px;">
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Touch and drag the divider on mobile devices</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Touch events are fully supported</p>
  </div>
</zn-split-pane>
```

### Customizing with CSS Variables

The split pane exposes CSS variables for advanced customization.

```html:preview
<zn-split-pane
  style="
    height: 300px;
    --min-panel-size: 150px;
    --max-panel-size: 500px;
    --initial-size: 300px;
    --resize-size: 4px;
    --resize-margin: 10px;
  "
  pixels>
  <div slot="primary" style="padding: 20px; background: #f5f5f5;">
    <p>Custom CSS variables applied</p>
  </div>
  <div slot="secondary" style="padding: 20px;">
    <p>Thicker divider with custom sizing</p>
  </div>
</zn-split-pane>
```

