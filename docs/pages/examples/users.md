---
meta:
  title: User Management
  description: CRUD table with filters, search, and bulk actions demonstrating data table patterns.
fullWidth: true
---

# User Management

A typical admin interface for managing users. Demonstrates `zn-data-table` with filters, search, bulk actions, and slideout forms.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header with actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <h2 style="margin: 0;">Users</h2>
      <zn-button icon="person_add">Add User</zn-button>
    </div>

    <!-- Filters and Search -->
    <zn-panel flush>
      <div style="display: flex; gap: var(--zn-spacing-md); padding: var(--zn-spacing-md); flex-wrap: wrap; align-items: flex-end;">
        <zn-input placeholder="Search users..." style="min-width: 250px;" icon="search"></zn-input>
        <zn-select label="Role" placeholder="All roles" style="min-width: 150px;">
          <zn-option value="">All roles</zn-option>
          <zn-option value="admin">Admin</zn-option>
          <zn-option value="member">Member</zn-option>
          <zn-option value="viewer">Viewer</zn-option>
        </zn-select>
        <zn-select label="Status" placeholder="All statuses" style="min-width: 150px;">
          <zn-option value="">All statuses</zn-option>
          <zn-option value="active">Active</zn-option>
          <zn-option value="inactive">Inactive</zn-option>
          <zn-option value="pending">Pending</zn-option>
        </zn-select>
        <zn-button color="secondary" size="small">Clear Filters</zn-button>
      </div>
    </zn-panel>

    <!-- Bulk Actions Bar -->
    <zn-bulk-actions>
      <span slot="count">3 selected</span>
      <zn-button size="small" color="secondary">Change Role</zn-button>
      <zn-button size="small" color="secondary">Deactivate</zn-button>
      <zn-button size="small" color="error">Delete</zn-button>
    </zn-bulk-actions>

    <!-- Users Table -->
    <zn-panel flush>
      <zn-data-table selectable>
        <table>
          <thead>
            <tr>
              <th data-sortable>Name</th>
              <th data-sortable>Email</th>
              <th data-sortable>Role</th>
              <th data-sortable>Status</th>
              <th data-sortable>Last Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  Sarah Wilson
                </div>
              </td>
              <td>sarah.wilson@company.com</td>
              <td><zn-chip size="small">Admin</zn-chip></td>
              <td><zn-status-indicator color="success">Active</zn-status-indicator></td>
              <td>2 minutes ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>Edit</zn-menu-item>
                    <zn-menu-item>View Activity</zn-menu-item>
                    <zn-menu-item>Reset Password</zn-menu-item>
                    <zn-menu-item type="danger">Deactivate</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  Michael Chen
                </div>
              </td>
              <td>michael.chen@company.com</td>
              <td><zn-chip size="small">Member</zn-chip></td>
              <td><zn-status-indicator color="success">Active</zn-status-indicator></td>
              <td>1 hour ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>Edit</zn-menu-item>
                    <zn-menu-item>View Activity</zn-menu-item>
                    <zn-menu-item>Reset Password</zn-menu-item>
                    <zn-menu-item type="danger">Deactivate</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  Emma Thompson
                </div>
              </td>
              <td>emma.thompson@company.com</td>
              <td><zn-chip size="small">Member</zn-chip></td>
              <td><zn-status-indicator color="warning">Pending</zn-status-indicator></td>
              <td>Never</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>Edit</zn-menu-item>
                    <zn-menu-item>Resend Invite</zn-menu-item>
                    <zn-menu-item type="danger">Cancel Invite</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  James Rodriguez
                </div>
              </td>
              <td>james.rodriguez@company.com</td>
              <td><zn-chip size="small">Viewer</zn-chip></td>
              <td><zn-status-indicator color="success">Active</zn-status-indicator></td>
              <td>3 days ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>Edit</zn-menu-item>
                    <zn-menu-item>View Activity</zn-menu-item>
                    <zn-menu-item>Reset Password</zn-menu-item>
                    <zn-menu-item type="danger">Deactivate</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  Lisa Park
                </div>
              </td>
              <td>lisa.park@company.com</td>
              <td><zn-chip size="small">Member</zn-chip></td>
              <td><zn-status-indicator color="error">Inactive</zn-status-indicator></td>
              <td>2 weeks ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>Edit</zn-menu-item>
                    <zn-menu-item>Reactivate</zn-menu-item>
                    <zn-menu-item type="danger">Delete</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
          </tbody>
        </table>
      </zn-data-table>
    </zn-panel>

    <!-- Pagination -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <span style="color: var(--zn-text-secondary);">Showing 1-5 of 24 users</span>
      <zn-pagination total="24" page-size="5" current-page="1"></zn-pagination>
    </div>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-data-table`, `zn-bulk-actions`, `zn-pagination`, `zn-input`, `zn-select`, `zn-dropdown`, `zn-menu`, `zn-menu-item`, `zn-status-indicator`, `zn-chip`
