---
meta:
  title: Tile
  description: Tiles are flexible list items for displaying structured content with images, captions, descriptions, properties, and actions in a horizontal layout.
layout: component
---

Tiles are compact, single-line rows (48px tall) that inherit table content typography, making them ideal for building structured lists: a leading value, optional inline values, and an optional chip or action on the right. The same flexible component covers everything from a plain phone number to a multi-value transaction row.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Total VPN">
    <span slot="properties">Professional</span>
    <span slot="properties">$9.95/mo</span>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>

  <zn-tile caption="Galaxy 16 Plus Pro">
    <span slot="properties">Android</span>
    <zn-chip slot="actions" type="success">In Use</zn-chip>
  </zn-tile>

  <zn-tile caption="customer.name@example.com"></zn-tile>
</zn-sp>
```

## Tile Row Variants

A single tile adapts to a wide range of content. The leading `caption` is bold by default; add the `plain` attribute for the normal table-content weight. Values placed in the `properties` slot align to the right, and a chip or button in the `actions` slot pins to the far right.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="This is a Tile Row Value" plain>
    <span slot="properties">Row value</span>
    <span slot="properties">Row value</span>
    <span slot="properties">Row value</span>
    <zn-chip slot="actions">Chip</zn-chip>
  </zn-tile>

  <zn-tile caption="Total VPN" plain>
    <span slot="properties">Professional</span>
    <span slot="properties">$9.95/mo</span>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>

  <zn-tile caption="+1 (541) 555-0198" plain></zn-tile>

  <zn-tile caption="customer.name@example.com" plain></zn-tile>

  <zn-tile caption="742 Evergreen Terrace, Apt 4B, Building C, Springfield, Oregon, 94777-1246" plain></zn-tile>

  <zn-tile caption="14th August 2025" plain>
    <span slot="properties">$9.95/mo</span>
    <span slot="properties">Capture Auth [paypal-connector]</span>
    <span slot="properties">Completed</span>
    <zn-chip slot="actions" type="success">Capture Auth</zn-chip>
  </zn-tile>

  <zn-tile caption="Brand">
    <span slot="properties">BrightCloud</span>
  </zn-tile>

  <zn-tile caption="Galaxy 16 Plus Pro" plain>
    <span slot="properties">Android</span>
    <zn-chip slot="actions" type="success">In Use</zn-chip>
  </zn-tile>

  <zn-tile caption="14th August 2026" description="Event Name"></zn-tile>
</zn-sp>
```

### Emphasised Caption

The leading caption renders bold by default to lead the row. Add `plain` when the first value should match the regular table-content weight (most data rows).

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Brand">
    <span slot="properties">BrightCloud</span>
  </zn-tile>

  <zn-tile caption="Region" plain>
    <span slot="properties">BrightCloud</span>
  </zn-tile>
</zn-sp>
```

## Examples

### Basic Tile

A basic tile displays a caption and description. Tiles automatically apply padding when they contain structured content.

```html:preview
<zn-tile caption="Basic Tile" description="A simple tile with just caption and description"></zn-tile>
```

### Tile with Image

Use the `image` slot to add an image or icon to the left side of the tile. This is commonly used for avatars, logos, or file icons.

```html:preview
<zn-tile caption="John Smith" description="Senior Developer">
  <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=12" round></zn-icon>
</zn-tile>
```

### Clickable Tiles

Add the `href` attribute to make a tile clickable. The tile will render as an anchor tag and display hover effects.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Dashboard" description="View your analytics dashboard" href="/dashboard">
    <zn-icon slot="image" size="32" src="dashboard" round></zn-icon>
  </zn-tile>

  <zn-tile caption="Settings" description="Configure your preferences" href="/settings">
    <zn-icon slot="image" size="32" src="settings" round></zn-icon>
  </zn-tile>

  <zn-tile caption="Profile" description="Manage your account" href="/profile">
    <zn-icon slot="image" size="32" src="person" round></zn-icon>
  </zn-tile>
</zn-sp>
```

### Tiles with Properties

Use the `properties` slot to display metadata on the right side of the tile. The `zn-tile-property` component provides consistent styling for property labels and values.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Project Alpha" description="Active development project">
    <zn-icon slot="image" size="32" src="folder" color="primary"></zn-icon>
    <zn-tile-property slot="properties" caption="Status">In Progress</zn-tile-property>
  </zn-tile>

  <zn-tile caption="Project Beta" description="Testing phase">
    <zn-icon slot="image" size="32" src="folder" color="success"></zn-icon>
    <zn-tile-property slot="properties" caption="Status">Completed</zn-tile-property>
  </zn-tile>
</zn-sp>
```

### Multiple Properties

Add multiple `zn-tile-property` components to display several pieces of metadata in a horizontal layout.

```html:preview
<zn-tile caption="Annual Report 2024.pdf" description="1.2 MB • PDF Document">
  <zn-icon slot="image" size="32" src="description" color="error"></zn-icon>
  <zn-tile-property slot="properties" caption="Modified">2 hours ago</zn-tile-property>
  <zn-tile-property slot="properties" caption="Owner">John Smith</zn-tile-property>
  <zn-tile-property slot="properties" caption="Shared">5 people</zn-tile-property>
</zn-tile>
```

### Tiles with Actions

Use the `actions` slot to add buttons or other interactive elements to the right side of the tile.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Database Backup" description="Last backup: 2 hours ago">
    <zn-icon slot="image" size="32" src="storage" color="info"></zn-icon>
    <div slot="actions">
      <zn-button color="primary">Run Now</zn-button>
    </div>
  </zn-tile>

  <zn-tile caption="Email Notification" description="Receive daily summaries">
    <zn-icon slot="image" size="32" src="mail" color="secondary"></zn-icon>
    <div slot="actions">
      <zn-button color="transparent" icon="edit" square></zn-button>
      <zn-button color="transparent" icon="delete" square></zn-button>
    </div>
  </zn-tile>
</zn-sp>
```

### Properties with Actions

Combine both properties and actions for comprehensive tile layouts.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Sarah Johnson" description="sarah.johnson@example.com" href="mailto:sarah.johnson@example.com">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=45" round></zn-icon>
    <zn-tile-property slot="properties" caption="Department">Marketing</zn-tile-property>
    <zn-tile-property slot="properties" caption="Role">Manager</zn-tile-property>
    <div slot="actions">
      <zn-button>Message</zn-button>
    </div>
  </zn-tile>

  <zn-tile caption="David Chen" description="david.chen@example.com" href="mailto:david.chen@example.com">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=33" round></zn-icon>
    <zn-tile-property slot="properties" caption="Department">Engineering</zn-tile-property>
    <zn-tile-property slot="properties" caption="Role">Senior Dev</zn-tile-property>
    <div slot="actions">
      <zn-button>Message</zn-button>
    </div>
  </zn-tile>
</zn-sp>
```

### User List

A complete example showing a team member list with avatars, roles, and status information.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Leslie Alexander" description="leslie.alexander@example.com" href="/users/leslie">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=70" round></zn-icon>
    <zn-tile-property slot="properties" caption="Co-Founder / CEO">Last seen 2h ago</zn-tile-property>
  </zn-tile>

  <zn-tile caption="Michael Foster" description="michael.foster@example.com" href="/users/michael">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=51" round></zn-icon>
    <zn-tile-property slot="properties" caption="Engineering Lead">Active now</zn-tile-property>
  </zn-tile>

  <zn-tile caption="Emma Davis" description="emma.davis@example.com" href="/users/emma">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=47" round></zn-icon>
    <zn-tile-property slot="properties" caption="Product Manager">Last seen 1d ago</zn-tile-property>
  </zn-tile>

  <zn-tile caption="James Wilson" description="james.wilson@example.com" href="/users/james">
    <zn-icon slot="image" size="40" src="https://i.pravatar.cc/60?img=15" round></zn-icon>
    <zn-tile-property slot="properties" caption="Design Lead">Last seen 3h ago</zn-tile-property>
  </zn-tile>
</zn-sp>
```

### File Browser

Example showing how to use tiles for a file browser interface.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Documents" description="24 files" href="/files/documents">
    <zn-icon slot="image" size="36" src="folder" color="primary"></zn-icon>
    <zn-tile-property slot="properties" caption="Modified">Today</zn-tile-property>
  </zn-tile>

  <zn-tile caption="Images" description="156 files" href="/files/images">
    <zn-icon slot="image" size="36" src="folder" color="warning"></zn-icon>
    <zn-tile-property slot="properties" caption="Modified">Yesterday</zn-tile-property>
  </zn-tile>

  <zn-tile caption="Presentation.pptx" description="4.2 MB • PowerPoint">
    <zn-icon slot="image" size="36" src="description" color="error"></zn-icon>
    <zn-tile-property slot="properties" caption="Modified">2 days ago</zn-tile-property>
    <div slot="actions">
      <zn-button color="transparent" icon="download" square></zn-button>
      <zn-button color="transparent" icon="more_vert" square></zn-button>
    </div>
  </zn-tile>

  <zn-tile caption="Budget-2024.xlsx" description="1.8 MB • Excel">
    <zn-icon slot="image" size="36" src="description" color="success"></zn-icon>
    <zn-tile-property slot="properties" caption="Modified">Last week</zn-tile-property>
    <div slot="actions">
      <zn-button color="transparent" icon="download" square></zn-button>
      <zn-button color="transparent" icon="more_vert" square></zn-button>
    </div>
  </zn-tile>
</zn-sp>
```

### Inline Layout

Use the `inline` attribute to display the caption and description on the same line, separated by a small gap.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Status:" description="Active" inline>
    <zn-icon slot="image" size="32" src="check_circle" color="success"></zn-icon>
  </zn-tile>

  <zn-tile caption="Last Login:" description="2024-01-23 10:30 AM" inline>
    <zn-icon slot="image" size="32" src="schedule" color="info"></zn-icon>
  </zn-tile>

  <zn-tile caption="Location:" description="San Francisco, CA" inline>
    <zn-icon slot="image" size="32" src="location_on" color="error"></zn-icon>
  </zn-tile>
</zn-sp>
```

### Flush Tiles

The `flush` attribute removes all padding from the tile, while `flush-x` and `flush-y` remove horizontal and vertical padding respectively.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Flush Tile" description="No padding at all" flush>
    <zn-icon slot="image" size="32" src="info"></zn-icon>
  </zn-tile>

  <zn-tile caption="Flush X Tile" description="No horizontal padding" flush-x>
    <zn-icon slot="image" size="32" src="info"></zn-icon>
  </zn-tile>

  <zn-tile caption="Flush Y Tile" description="No vertical padding" flush-y>
    <zn-icon slot="image" size="32" src="info"></zn-icon>
  </zn-tile>
</zn-sp>
```

### Product Catalog

Example showing tiles used for a product catalog with images and pricing.

```html:preview
<zn-sp divide no-gap>
  <zn-tile caption="Wireless Headphones" description="Premium noise-canceling headphones" href="/products/headphones">
    <zn-icon slot="image" size="48" src="headphones" color="primary"></zn-icon>
    <zn-tile-property slot="properties" caption="Price">$299</zn-tile-property>
    <zn-tile-property slot="properties" caption="Stock">In Stock</zn-tile-property>
    <div slot="actions">
      <zn-button color="primary">Add to Cart</zn-button>
    </div>
  </zn-tile>

  <zn-tile caption="Smart Watch" description="Fitness tracking and notifications" href="/products/watch">
    <zn-icon slot="image" size="48" src="watch" color="info"></zn-icon>
    <zn-tile-property slot="properties" caption="Price">$399</zn-tile-property>
    <zn-tile-property slot="properties" caption="Stock">Low Stock</zn-tile-property>
    <div slot="actions">
      <zn-button color="primary">Add to Cart</zn-button>
    </div>
  </zn-tile>

  <zn-tile caption="Laptop Stand" description="Ergonomic aluminum design" href="/products/stand">
    <zn-icon slot="image" size="48" src="computer" color="secondary"></zn-icon>
    <zn-tile-property slot="properties" caption="Price">$79</zn-tile-property>
    <zn-tile-property slot="properties" caption="Stock">In Stock</zn-tile-property>
    <div slot="actions">
      <zn-button color="primary">Add to Cart</zn-button>
    </div>
  </zn-tile>
</zn-sp>
```

### Custom Slot Content

Use the default slot for completely custom tile content when you don't need the structured layout.

```html:preview
<zn-tile>
  <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div>
      <h3 style="margin: 0 0 5px 0;">Custom Content</h3>
      <p style="margin: 0; color: rgb(var(--zn-text-color));">You can put anything in the default slot</p>
    </div>
    <zn-chip type="success">Active</zn-chip>
  </div>
</zn-tile>
```

### Data URI Links

Use the `data-uri` attribute instead of `href` for internal navigation or custom click handling. Combine with `data-target` and `gaid` for tracking and analytics.

```html:preview
<zn-sp divide no-gap>
  <zn-tile
    caption="Navigate to Dashboard"
    description="Uses data-uri for custom routing"
    data-uri="/dashboard"
    data-target="main-content"
    gaid="tile-dashboard-click">
    <zn-icon slot="image" size="32" src="dashboard"></zn-icon>
  </zn-tile>

  <zn-tile
    caption="View Reports"
    description="Custom navigation handling"
    data-uri="/reports"
    gaid="tile-reports-click">
    <zn-icon slot="image" size="32" src="assessment"></zn-icon>
  </zn-tile>
</zn-sp>
```

## Usage Notes

### Responsive Behavior

Tiles are responsive and adapt to different screen sizes. On smaller screens (below `md` breakpoint):
- Properties in the `properties` slot are hidden automatically
- The tile maintains its core caption, description, and actions
- This ensures tiles remain functional on mobile devices

### Layout Structure

When using structured content (caption, description, properties, or actions), the tile automatically:
- Renders as a single-line row with a minimum height of `48px`, vertically centred
- Inherits the table content typography (`--zn-text-table-content-*`)
- Applies horizontal padding (`var(--zn-base-gap)`)
- Creates a horizontal layout: the leading image, caption and description sit on the left; properties and actions align to the right

### Hover Effects

When a tile has an `href` or `data-uri` attribute:
- The cursor changes to pointer
- On hover, the background changes to `var(--zn-color-neutral-100)`
- The entire tile area becomes clickable

### Slot Behavior

The tile uses different rendering logic based on slot usage:
- If only the default slot is used, it renders the slot content directly
- If any named slots (caption, description, properties, actions, image) are used, it switches to structured layout mode
- The caption can be provided via attribute or via the `caption` slot

### Content Overflow

Text content in tiles uses ellipsis overflow handling:
- Captions and descriptions are kept on a single line and truncated with ellipsis if too long
- The properties container hides its overflow to keep the row on a single line

## Tile Property Component

The `zn-tile-property` component is designed to work within the `properties` slot of tiles. It provides consistent formatting for metadata.

### Properties

- `caption` - The label for the property (e.g., "Status", "Modified", "Owner")
- `description` - Optional description text (can also use default slot)
- `icon` - Optional icon to display next to the property

### Example

```html:preview
<zn-tile caption="Project Status" description="Current project information">
  <zn-icon slot="image" size="32" src="folder"></zn-icon>
  <zn-tile-property slot="properties" caption="Status" icon="check_circle">Active</zn-tile-property>
  <zn-tile-property slot="properties" caption="Priority" icon="flag">High</zn-tile-property>
  <zn-tile-property slot="properties" caption="Due Date">Jan 30, 2024</zn-tile-property>
</zn-tile>
```

## CSS Parts

The following CSS parts are available for styling:

- `caption` - The tile caption text
- `description` - The tile description text
- `image` - The image slot container
- `properties` - The properties slot container
- `actions` - The actions slot container

## CSS Custom Properties

Tiles use the following CSS custom properties from the Zinc design system:

- `--zn-text-table-content-*` - Row typography (font-size, line-height, weight, color)
- `--zn-base-gap` - Horizontal padding around tile content
- `--zn-spacing-large` - Gap between properties and between left/right sections
- `--zn-spacing-small` - Gap between action buttons and image/content
- `--zn-color-neutral-100` - Hover background color
- `--zn-text-heading` - Bold caption text color
