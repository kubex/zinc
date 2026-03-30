---
meta:
  title: Notifications
  description: Notification center with tabs, empty states, and activity items.
fullWidth: true
---

# Notifications Center

A notification/activity center showing different notification types with tabs and empty states. Demonstrates `zn-tabs`, `zn-item`, and `zn-empty-state`.

```html:preview
<zn-pane>
  <zn-panel caption="Notifications" tabbed>
    <div slot="actions">
      <zn-button size="small" color="transparent">Mark all read</zn-button>
    </div>
    <zn-tabs>
      <zn-navbar slot="top">
        <li tab>All <zn-chip size="small">12</zn-chip></li>
        <li tab="unread">Unread <zn-chip size="small" color="error">3</zn-chip></li>
        <li tab="mentions">Mentions</li>
        <li tab="system">System</li>
      </zn-navbar>

      <!-- All Tab -->
      <zn-sp id="" divide no-gap>
        <zn-item label="New order #1284 received" description="Sarah Wilson placed an order for $234.50" style="background: var(--zn-color-primary-50);">
          <zn-icon slot="prefix" src="shopping_cart" style="color: var(--zn-color-primary);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">2 min ago</span>
        </zn-item>
        <zn-item label="Payment received" description="Invoice #INV-2024-001 has been paid">
          <zn-icon slot="prefix" src="payments" style="color: var(--zn-color-success);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">15 min ago</span>
        </zn-item>
        <zn-item label="New team member" description="Michael Chen accepted your invitation" style="background: var(--zn-color-primary-50);">
          <zn-icon slot="prefix" src="person_add" style="color: var(--zn-color-info);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">1 hour ago</span>
        </zn-item>
        <zn-item label="Ticket #847 resolved" description="Customer issue has been marked as resolved">
          <zn-icon slot="prefix" src="check_circle" style="color: var(--zn-color-success);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">2 hours ago</span>
        </zn-item>
        <zn-item label="Low stock alert" description="Product SKU-1234 is running low (5 remaining)" style="background: var(--zn-color-primary-50);">
          <zn-icon slot="prefix" src="inventory" style="color: var(--zn-color-warning);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">3 hours ago</span>
        </zn-item>
        <zn-item label="New product review" description="5-star review received for 'Premium Widget'">
          <zn-icon slot="prefix" src="star" style="color: var(--zn-color-warning);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">5 hours ago</span>
        </zn-item>
        <zn-item label="Weekly report ready" description="Your weekly sales report is now available">
          <zn-icon slot="prefix" src="assessment" style="color: var(--zn-color-info);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">1 day ago</span>
        </zn-item>
      </zn-sp>

      <!-- Unread Tab -->
      <zn-sp id="unread" divide no-gap>
        <zn-item label="New order #1284 received" description="Sarah Wilson placed an order for $234.50">
          <zn-icon slot="prefix" src="shopping_cart" style="color: var(--zn-color-primary);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">2 min ago</span>
        </zn-item>
        <zn-item label="New team member" description="Michael Chen accepted your invitation">
          <zn-icon slot="prefix" src="person_add" style="color: var(--zn-color-info);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">1 hour ago</span>
        </zn-item>
        <zn-item label="Low stock alert" description="Product SKU-1234 is running low (5 remaining)">
          <zn-icon slot="prefix" src="inventory" style="color: var(--zn-color-warning);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">3 hours ago</span>
        </zn-item>
      </zn-sp>

      <!-- Mentions Tab (Empty) -->
      <div id="mentions" style="padding: var(--zn-spacing-xl);">
        <zn-empty-state>
          <zn-icon slot="icon" src="alternate_email" style="font-size: 48px;"></zn-icon>
          <span slot="headline">No mentions yet</span>
          <span slot="description">When someone mentions you in a comment or note, it will appear here.</span>
        </zn-empty-state>
      </div>

      <!-- System Tab -->
      <zn-sp id="system" divide no-gap>
        <zn-item label="System maintenance scheduled" description="Planned maintenance on Feb 10, 2026 from 2-4 AM UTC">
          <zn-icon slot="prefix" src="engineering" style="color: var(--zn-color-warning);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">2 days ago</span>
        </zn-item>
        <zn-item label="New feature: Report Builder" description="Create custom reports with our new drag-and-drop builder">
          <zn-icon slot="prefix" src="new_releases" style="color: var(--zn-color-primary);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">1 week ago</span>
        </zn-item>
        <zn-item label="Security update applied" description="Your account security settings have been updated">
          <zn-icon slot="prefix" src="security" style="color: var(--zn-color-success);"></zn-icon>
          <span slot="actions" style="font-size: 12px; color: var(--zn-text-secondary);">2 weeks ago</span>
        </zn-item>
      </zn-sp>
    </zn-tabs>
  </zn-panel>
</zn-pane>
```

**Components demonstrated:** `zn-tabs`, `zn-navbar`, `zn-item`, `zn-icon`, `zn-chip`, `zn-empty-state`, `zn-panel`
