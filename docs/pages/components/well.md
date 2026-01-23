---
meta:
  title: Well
  description: Wells are used to display informational content in a subtle, contained format with optional icons and inline display.
layout: component
---

```html:preview
<zn-well icon="calendar_month">Triggers every <strong>5 minutes</strong></zn-well>
```

## Examples

### Basic Well

A basic well component displays content in a subtle, bordered container with a light background.

```html:preview
<zn-well>This is a basic well with simple text content.</zn-well>
```

### With Icon

Use the `icon` attribute to add an icon to the left side of the well content. The icon uses the Material Icons library.

```html:preview
<zn-well icon="schedule">Scheduled for execution</zn-well>
<br />
<zn-well icon="calendar_month">Triggers every <strong>5 minutes</strong></zn-well>
<br />
<zn-well icon="info">Additional information available</zn-well>
<br />
<zn-well icon="cloud_upload">Automatically syncs to cloud storage</zn-well>
```

### Inline Display

Use the `inline` attribute to display the well as an inline-flex element, allowing it to flow with surrounding content.

```html:preview
<p>
  This text is followed by
  <zn-well inline icon="timer">a 30-second timeout</zn-well>
  and continues here.
</p>
```

### Inline vs Block

Compare the difference between inline and block (default) display modes.

```html:preview
<div>
  <p>Block well (default):</p>
  <zn-well icon="notification_important">This well spans the full width of its container</zn-well>
</div>
<br />
<div>
  <p>Inline well:</p>
  <p>
    Text before
    <zn-well inline icon="notification_important">inline well here</zn-well>
    text after
  </p>
</div>
```

### With Action Slot

Use the `action` slot to add interactive elements or additional information to the right side of the well.

```html:preview
<zn-well icon="schedule">
  Triggers every <strong>5 minutes</strong>
  <zn-button slot="action" color="transparent" size="small">Edit</zn-button>
</zn-well>
<br />
<zn-well icon="cloud_sync">
  Last sync: 2 minutes ago
  <zn-button slot="action" color="primary" size="small">Sync Now</zn-button>
</zn-well>
```

### Multiple Action Items

The action slot can contain multiple elements for more complex interactions.

```html:preview
<zn-well icon="settings">
  Configuration status: Active
  <div slot="action" style="display: flex; gap: 8px;">
    <zn-button color="transparent" size="small">Configure</zn-button>
    <zn-button color="transparent" size="small">Disable</zn-button>
  </div>
</zn-well>
```

### Rich Content

Wells can contain rich HTML content including formatted text, links, and nested elements.

```html:preview
<zn-well icon="description">
  <div>
    <strong>Document Type:</strong> Configuration File<br />
    <small style="color: var(--zn-color-text-muted);">Last modified: 01/23/26</small>
  </div>
  <zn-button slot="action" color="transparent" size="small">View</zn-button>
</zn-well>
<br />
<zn-well icon="folder_open">
  <div>
    <p style="margin: 0;"><strong>Project Files</strong></p>
    <p style="margin: 4px 0 0 0;">
      <small>Contains 24 files | 12.5 MB total</small>
    </p>
  </div>
  <zn-button slot="action" color="primary" size="small">Open</zn-button>
</zn-well>
```

### Status Indicators

Wells are perfect for displaying status information with icons and formatted content.

```html:preview
<zn-well icon="check_circle">
  <strong>Deployment successful</strong> - Version 1.2.3 deployed to production
</zn-well>
<br />
<zn-well icon="sync">
  <strong>Syncing...</strong> - 45% complete
</zn-well>
<br />
<zn-well icon="warning">
  <strong>Warning:</strong> Low disk space - 2.1 GB remaining
</zn-well>
<br />
<zn-well icon="error">
  <strong>Build failed</strong> - See logs for details
  <zn-button slot="action" color="error" size="small">View Logs</zn-button>
</zn-well>
```

### Schedule and Timing Information

Use wells to display scheduling and timing details.

```html:preview
<zn-well icon="schedule">
  Runs every <strong>Monday at 9:00 AM</strong>
  <zn-button slot="action" color="transparent" size="small">Edit Schedule</zn-button>
</zn-well>
<br />
<zn-well icon="timer">
  Timeout: <strong>5 minutes</strong>
</zn-well>
<br />
<zn-well icon="event">
  Next execution: <strong>Tomorrow at 3:00 PM</strong>
</zn-well>
```

### Configuration Details

Display configuration information in a clean, organized format.

```html:preview
<zn-well icon="dns">
  <div>
    <strong>Database Connection</strong><br />
    <small>PostgreSQL • us-east-1 • Read/Write</small>
  </div>
  <zn-button slot="action" color="transparent" size="small">Test Connection</zn-button>
</zn-well>
<br />
<zn-well icon="storage">
  <div>
    <strong>Cache Configuration</strong><br />
    <small>Redis • 500 MB limit • TTL: 3600s</small>
  </div>
  <zn-button slot="action" color="transparent" size="small">Clear Cache</zn-button>
</zn-well>
```

### Without Icon

Wells work perfectly fine without an icon for simpler, cleaner displays.

```html:preview
<zn-well>Simple well without an icon</zn-well>
<br />
<zn-well>
  <strong>Important:</strong> Configuration changes require a restart
  <zn-button slot="action" color="warning" size="small">Restart Now</zn-button>
</zn-well>
```

### Inline Wells in Lists

Combine inline wells with other content for compact information display.

```html:preview
<ul>
  <li>Task 1: Complete <zn-well inline icon="schedule">Due in 2 hours</zn-well></li>
  <li>Task 2: In Progress <zn-well inline icon="sync">50% complete</zn-well></li>
  <li>Task 3: Done <zn-well inline icon="check_circle">Completed</zn-well></li>
</ul>
```

### Real-World Use Cases

#### Cron Job Information

```html:preview
<div style="display: flex; flex-direction: column; gap: 12px;">
  <zn-well icon="schedule">
    <strong>Daily Backup</strong><br />
    Triggers every day at <strong>2:00 AM UTC</strong>
    <div slot="action" style="display: flex; gap: 8px;">
      <zn-button color="transparent" size="small">Edit</zn-button>
      <zn-button color="transparent" size="small">Run Now</zn-button>
    </div>
  </zn-well>

  <zn-well icon="update">
    <strong>Weekly Reports</strong><br />
    Triggers every <strong>Monday at 9:00 AM</strong>
    <div slot="action" style="display: flex; gap: 8px;">
      <zn-button color="transparent" size="small">Edit</zn-button>
      <zn-button color="primary" size="small">View Reports</zn-button>
    </div>
  </zn-well>
</div>
```

#### System Resource Information

```html:preview
<div style="display: flex; flex-direction: column; gap: 12px;">
  <zn-well icon="memory">
    <div>
      <strong>Memory Usage</strong><br />
      <small>2.4 GB / 8.0 GB (30%)</small>
    </div>
  </zn-well>

  <zn-well icon="storage">
    <div>
      <strong>Disk Space</strong><br />
      <small>45.2 GB / 100 GB (45%)</small>
    </div>
    <zn-button slot="action" color="transparent" size="small">Details</zn-button>
  </zn-well>

  <zn-well icon="speed">
    <div>
      <strong>CPU Load</strong><br />
      <small>12% average over last hour</small>
    </div>
  </zn-well>
</div>
```

#### Integration Status

```html:preview
<div style="display: flex; flex-direction: column; gap: 12px;">
  <zn-well icon="cloud_done">
    <strong>AWS S3</strong> - Connected
    <zn-button slot="action" color="transparent" size="small">Configure</zn-button>
  </zn-well>

  <zn-well icon="sync">
    <strong>GitHub</strong> - Syncing
    <zn-button slot="action" color="transparent" size="small">View Status</zn-button>
  </zn-well>

  <zn-well icon="check_circle">
    <strong>Stripe</strong> - Active • Webhook configured
    <zn-button slot="action" color="transparent" size="small">Settings</zn-button>
  </zn-well>
</div>
```

#### Workflow Steps

```html:preview
<div style="display: flex; flex-direction: column; gap: 12px;">
  <zn-well icon="filter_1">
    <strong>Step 1:</strong> Data Collection
    <span slot="action"><small style="color: var(--zn-color-text-muted);">Completed</small></span>
  </zn-well>

  <zn-well icon="filter_2">
    <strong>Step 2:</strong> Processing
    <span slot="action"><small style="color: var(--zn-color-text-success);">In Progress (65%)</small></span>
  </zn-well>

  <zn-well icon="filter_3">
    <strong>Step 3:</strong> Validation
    <span slot="action"><small style="color: var(--zn-color-text-muted);">Pending</small></span>
  </zn-well>

  <zn-well icon="filter_4">
    <strong>Step 4:</strong> Export Results
    <span slot="action"><small style="color: var(--zn-color-text-muted);">Pending</small></span>
  </zn-well>
</div>
```