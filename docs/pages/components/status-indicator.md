---
meta:
  title: Status Indicator
  description: Status indicators are small circular elements used to display the state or status of an item, feature, or service.
layout: component
---

```html:preview
<zn-status-indicator type="info"></zn-status-indicator>
<zn-status-indicator type="success"></zn-status-indicator>
<zn-status-indicator type="warning"></zn-status-indicator>
<zn-status-indicator type="error"></zn-status-indicator>
```

## Examples

### Basic Status Indicator

A basic status indicator displays as a small circular dot with the default info color.

```html:preview
<zn-status-indicator></zn-status-indicator>
```

### Types

Use the `type` attribute to set the semantic meaning and color of the status indicator. Available types are: `info` (default), `success`, `warning`, and `error`.

```html:preview
<zn-status-indicator type="info"></zn-status-indicator>
<zn-status-indicator type="success"></zn-status-indicator>
<zn-status-indicator type="warning"></zn-status-indicator>
<zn-status-indicator type="error"></zn-status-indicator>
```

### With Labels

Status indicators are commonly used alongside text labels to provide context.

```html:preview
<div style="display: flex; gap: 8px; align-items: center;">
  <zn-status-indicator type="success"></zn-status-indicator>
  <span>Online</span>
</div>
<br />
<div style="display: flex; gap: 8px; align-items: center;">
  <zn-status-indicator type="warning"></zn-status-indicator>
  <span>Away</span>
</div>
<br />
<div style="display: flex; gap: 8px; align-items: center;">
  <zn-status-indicator type="error"></zn-status-indicator>
  <span>Offline</span>
</div>
<br />
<div style="display: flex; gap: 8px; align-items: center;">
  <zn-status-indicator type="info"></zn-status-indicator>
  <span>Idle</span>
</div>
```

### Service Status

Status indicators are useful for displaying the health of services or systems.

```html:preview
<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid var(--zn-color-border); border-radius: 4px;">
    <span>API Service</span>
    <div style="display: flex; gap: 8px; align-items: center;">
      <zn-status-indicator type="success"></zn-status-indicator>
      <span>Operational</span>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid var(--zn-color-border); border-radius: 4px;">
    <span>Database</span>
    <div style="display: flex; gap: 8px; align-items: center;">
      <zn-status-indicator type="warning"></zn-status-indicator>
      <span>Degraded</span>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid var(--zn-color-border); border-radius: 4px;">
    <span>Cache Server</span>
    <div style="display: flex; gap: 8px; align-items: center;">
      <zn-status-indicator type="error"></zn-status-indicator>
      <span>Down</span>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid var(--zn-color-border); border-radius: 4px;">
    <span>CDN</span>
    <div style="display: flex; gap: 8px; align-items: center;">
      <zn-status-indicator type="success"></zn-status-indicator>
      <span>Operational</span>
    </div>
  </div>
</div>
```

### User Presence

Display user availability status with status indicators.

```html:preview
<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-secondary); display: flex; align-items: center; justify-content: center;">
      <zn-icon name="person" size="24"></zn-icon>
      <div style="position: absolute; bottom: 0; right: 0;">
        <zn-status-indicator type="success"></zn-status-indicator>
      </div>
    </div>
    <span>John Doe - Available</span>
  </div>
  <div style="display: flex; gap: 12px; align-items: center;">
    <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-secondary); display: flex; align-items: center; justify-content: center;">
      <zn-icon name="person" size="24"></zn-icon>
      <div style="position: absolute; bottom: 0; right: 0;">
        <zn-status-indicator type="warning"></zn-status-indicator>
      </div>
    </div>
    <span>Jane Smith - Away</span>
  </div>
  <div style="display: flex; gap: 12px; align-items: center;">
    <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; background: var(--zn-color-secondary); display: flex; align-items: center; justify-content: center;">
      <zn-icon name="person" size="24"></zn-icon>
      <div style="position: absolute; bottom: 0; right: 0;">
        <zn-status-indicator type="error"></zn-status-indicator>
      </div>
    </div>
    <span>Bob Johnson - Offline</span>
  </div>
</div>
```

### List Items

Status indicators work well in lists to show item states.

```html:preview
<div style="display: flex; flex-direction: column; gap: 4px;">
  <div style="display: flex; gap: 8px; align-items: center; padding: 8px;">
    <zn-status-indicator type="success"></zn-status-indicator>
    <span>Payment processed successfully</span>
  </div>
  <div style="display: flex; gap: 8px; align-items: center; padding: 8px;">
    <zn-status-indicator type="warning"></zn-status-indicator>
    <span>Order pending confirmation</span>
  </div>
  <div style="display: flex; gap: 8px; align-items: center; padding: 8px;">
    <zn-status-indicator type="error"></zn-status-indicator>
    <span>Failed to verify email address</span>
  </div>
  <div style="display: flex; gap: 8px; align-items: center; padding: 8px;">
    <zn-status-indicator type="info"></zn-status-indicator>
    <span>New notification received</span>
  </div>
</div>
```

### Custom Colors

Use the `--indicator-color` CSS variable to customize the indicator color for specific use cases.

```html:preview
<zn-status-indicator style="--indicator-color: 128, 90, 213;"></zn-status-indicator>
<zn-status-indicator style="--indicator-color: 236, 72, 153;"></zn-status-indicator>
<zn-status-indicator style="--indicator-color: 16, 185, 129;"></zn-status-indicator>
<zn-status-indicator style="--indicator-color: 245, 158, 11;"></zn-status-indicator>
```

Note: The `--indicator-color` variable expects RGB values without the `rgb()` wrapper, as it uses `rgba()` internally for opacity control.

### Legend

Status indicators can be used in legends to explain color-coded information.

```html:preview
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <div style="display: flex; gap: 6px; align-items: center;">
    <zn-status-indicator type="success"></zn-status-indicator>
    <span style="font-size: 14px;">Completed</span>
  </div>
  <div style="display: flex; gap: 6px; align-items: center;">
    <zn-status-indicator type="warning"></zn-status-indicator>
    <span style="font-size: 14px;">In Progress</span>
  </div>
  <div style="display: flex; gap: 6px; align-items: center;">
    <zn-status-indicator type="error"></zn-status-indicator>
    <span style="font-size: 14px;">Failed</span>
  </div>
  <div style="display: flex; gap: 6px; align-items: center;">
    <zn-status-indicator type="info"></zn-status-indicator>
    <span style="font-size: 14px;">Pending</span>
  </div>
</div>
```

### Table Integration

Status indicators are commonly used in tables to show row or cell status.

```html:preview
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="border-bottom: 1px solid var(--zn-color-border);">
      <th style="text-align: left; padding: 12px;">Status</th>
      <th style="text-align: left; padding: 12px;">Task</th>
      <th style="text-align: left; padding: 12px;">Assignee</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid var(--zn-color-border);">
      <td style="padding: 12px;">
        <zn-status-indicator type="success"></zn-status-indicator>
      </td>
      <td style="padding: 12px;">Deploy to production</td>
      <td style="padding: 12px;">John Doe</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--zn-color-border);">
      <td style="padding: 12px;">
        <zn-status-indicator type="warning"></zn-status-indicator>
      </td>
      <td style="padding: 12px;">Code review pending</td>
      <td style="padding: 12px;">Jane Smith</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--zn-color-border);">
      <td style="padding: 12px;">
        <zn-status-indicator type="error"></zn-status-indicator>
      </td>
      <td style="padding: 12px;">Tests failing</td>
      <td style="padding: 12px;">Bob Johnson</td>
    </tr>
    <tr>
      <td style="padding: 12px;">
        <zn-status-indicator type="info"></zn-status-indicator>
      </td>
      <td style="padding: 12px;">Update documentation</td>
      <td style="padding: 12px;">Alice Williams</td>
    </tr>
  </tbody>
</table>
```
