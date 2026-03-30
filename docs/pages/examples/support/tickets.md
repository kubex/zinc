---
meta:
  title: Ticket Queue
  description: Support ticket queue with priority badges, filters, and bulk actions.
fullWidth: true
---

# Ticket Queue

A support inbox showing tickets with priority, status, and SLA information. Demonstrates `zn-data-table` with badges, filters, and bulk operations.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <h2 style="margin: 0;">Support Tickets</h2>
      <zn-button icon="add">New Ticket</zn-button>
    </div>

    <!-- Filters -->
    <zn-panel flush>
      <div style="display: flex; gap: var(--zn-spacing-md); padding: var(--zn-spacing-md); flex-wrap: wrap; align-items: flex-end;">
        <zn-input placeholder="Search tickets..." icon="search" style="min-width: 200px;"></zn-input>
        <zn-select label="Status" placeholder="All statuses" style="min-width: 130px;">
          <zn-option value="">All</zn-option>
          <zn-option value="open">Open</zn-option>
          <zn-option value="pending">Pending</zn-option>
          <zn-option value="resolved">Resolved</zn-option>
          <zn-option value="closed">Closed</zn-option>
        </zn-select>
        <zn-select label="Priority" placeholder="All priorities" style="min-width: 130px;">
          <zn-option value="">All</zn-option>
          <zn-option value="urgent">Urgent</zn-option>
          <zn-option value="high">High</zn-option>
          <zn-option value="normal">Normal</zn-option>
          <zn-option value="low">Low</zn-option>
        </zn-select>
        <zn-select label="Assignee" placeholder="All agents" style="min-width: 150px;">
          <zn-option value="">All agents</zn-option>
          <zn-option value="sarah">Sarah Wilson</zn-option>
          <zn-option value="michael">Michael Chen</zn-option>
          <zn-option value="unassigned">Unassigned</zn-option>
        </zn-select>
      </div>
    </zn-panel>

    <!-- Bulk Actions -->
    <zn-bulk-actions>
      <span slot="count">2 selected</span>
      <zn-button size="small" color="secondary">Assign</zn-button>
      <zn-button size="small" color="secondary">Change Priority</zn-button>
      <zn-button size="small" color="secondary">Close</zn-button>
    </zn-bulk-actions>

    <!-- Tickets Table -->
    <zn-panel flush>
      <zn-data-table selectable>
        <table>
          <thead>
            <tr>
              <th data-sortable>Ticket</th>
              <th data-sortable>Subject</th>
              <th data-sortable>Customer</th>
              <th data-sortable>Priority</th>
              <th data-sortable>Status</th>
              <th>Assignee</th>
              <th data-sortable>SLA</th>
              <th data-sortable>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#847</strong></td>
              <td>Cannot complete checkout process</td>
              <td>John Smith</td>
              <td><zn-chip size="small" color="error">Urgent</zn-chip></td>
              <td><zn-status-indicator color="warning">Pending</zn-status-indicator></td>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
                  <zn-icon src="account_circle" style="font-size: 20px;"></zn-icon>
                  Sarah W.
                </div>
              </td>
              <td><zn-chip size="small" color="error">Breached</zn-chip></td>
              <td>5 min ago</td>
            </tr>
            <tr>
              <td><strong>#846</strong></td>
              <td>Order not received after 2 weeks</td>
              <td>Emily Davis</td>
              <td><zn-chip size="small" color="warning">High</zn-chip></td>
              <td><zn-status-indicator color="info">Open</zn-status-indicator></td>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
                  <zn-icon src="account_circle" style="font-size: 20px;"></zn-icon>
                  Michael C.
                </div>
              </td>
              <td><zn-chip size="small" color="warning">2h left</zn-chip></td>
              <td>15 min ago</td>
            </tr>
            <tr>
              <td><strong>#845</strong></td>
              <td>Question about return policy</td>
              <td>Robert Johnson</td>
              <td><zn-chip size="small" color="neutral">Normal</zn-chip></td>
              <td><zn-status-indicator color="info">Open</zn-status-indicator></td>
              <td>
                <span style="color: var(--zn-text-secondary);">Unassigned</span>
              </td>
              <td><zn-chip size="small" color="success">8h left</zn-chip></td>
              <td>1 hour ago</td>
            </tr>
            <tr>
              <td><strong>#844</strong></td>
              <td>Product damaged during shipping</td>
              <td>Maria Garcia</td>
              <td><zn-chip size="small" color="warning">High</zn-chip></td>
              <td><zn-status-indicator color="warning">Pending</zn-status-indicator></td>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
                  <zn-icon src="account_circle" style="font-size: 20px;"></zn-icon>
                  Sarah W.
                </div>
              </td>
              <td><zn-chip size="small" color="success">6h left</zn-chip></td>
              <td>2 hours ago</td>
            </tr>
            <tr>
              <td><strong>#843</strong></td>
              <td>How to update billing information</td>
              <td>David Brown</td>
              <td><zn-chip size="small" color="info">Low</zn-chip></td>
              <td><zn-status-indicator color="success">Resolved</zn-status-indicator></td>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
                  <zn-icon src="account_circle" style="font-size: 20px;"></zn-icon>
                  Michael C.
                </div>
              </td>
              <td><zn-chip size="small" color="success">Met</zn-chip></td>
              <td>3 hours ago</td>
            </tr>
            <tr>
              <td><strong>#842</strong></td>
              <td>Discount code not working</td>
              <td>Jennifer Lee</td>
              <td><zn-chip size="small" color="neutral">Normal</zn-chip></td>
              <td><zn-status-indicator color="neutral">Closed</zn-status-indicator></td>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-xs);">
                  <zn-icon src="account_circle" style="font-size: 20px;"></zn-icon>
                  Sarah W.
                </div>
              </td>
              <td><zn-chip size="small" color="success">Met</zn-chip></td>
              <td>1 day ago</td>
            </tr>
          </tbody>
        </table>
      </zn-data-table>
    </zn-panel>

    <!-- Pagination -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <span style="color: var(--zn-text-secondary);">Showing 1-6 of 47 tickets</span>
      <zn-pagination total="47" page-size="6" current-page="1"></zn-pagination>
    </div>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-data-table`, `zn-bulk-actions`, `zn-pagination`, `zn-input`, `zn-select`, `zn-chip`, `zn-status-indicator`, `zn-panel`
