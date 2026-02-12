---
meta:
  title: Contact List
  description: CRM contact database with inline editing and filters.
fullWidth: true
---

# Contact List

A customer database interface with inline editing, company information, and activity tracking. Demonstrates `zn-data-table`, `zn-inline-edit`, and filtering patterns.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <h2 style="margin: 0;">Contacts</h2>
      <div style="display: flex; gap: var(--zn-spacing-sm);">
        <zn-button icon="download" color="secondary">Export</zn-button>
        <zn-button icon="person_add">Add Contact</zn-button>
      </div>
    </div>

    <!-- Filters -->
    <zn-panel flush>
      <div style="display: flex; gap: var(--zn-spacing-md); padding: var(--zn-spacing-md); flex-wrap: wrap; align-items: flex-end;">
        <zn-input placeholder="Search contacts..." icon="search" style="min-width: 200px;"></zn-input>
        <zn-select label="Company" placeholder="All companies" style="min-width: 150px;">
          <zn-option value="">All companies</zn-option>
          <zn-option value="acme">Acme Corp</zn-option>
          <zn-option value="globex">Globex Inc</zn-option>
          <zn-option value="initech">Initech</zn-option>
        </zn-select>
        <zn-select label="Tags" placeholder="All tags" style="min-width: 150px;">
          <zn-option value="">All tags</zn-option>
          <zn-option value="vip">VIP</zn-option>
          <zn-option value="lead">Lead</zn-option>
          <zn-option value="customer">Customer</zn-option>
        </zn-select>
        <zn-select label="Last Contact" placeholder="Any time" style="min-width: 150px;">
          <zn-option value="">Any time</zn-option>
          <zn-option value="today">Today</zn-option>
          <zn-option value="week">This week</zn-option>
          <zn-option value="month">This month</zn-option>
          <zn-option value="older">Older</zn-option>
        </zn-select>
      </div>
    </zn-panel>

    <!-- Contacts Table -->
    <zn-panel flush>
      <zn-data-table>
        <table>
          <thead>
            <tr>
              <th data-sortable>Name</th>
              <th data-sortable>Company</th>
              <th data-sortable>Email</th>
              <th>Phone</th>
              <th>Tags</th>
              <th data-sortable>Last Contact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  <zn-inline-edit value="Sarah Johnson"></zn-inline-edit>
                </div>
              </td>
              <td>
                <zn-inline-edit value="Acme Corp"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="sarah@acme.com"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="+1 (555) 123-4567"></zn-inline-edit>
              </td>
              <td>
                <div style="display: flex; gap: var(--zn-spacing-xs);">
                  <zn-chip size="small" color="success">VIP</zn-chip>
                  <zn-chip size="small">Customer</zn-chip>
                </div>
              </td>
              <td>Today</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>View Profile</zn-menu-item>
                    <zn-menu-item>Add Note</zn-menu-item>
                    <zn-menu-item>Create Deal</zn-menu-item>
                    <zn-menu-item type="danger">Delete</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  <zn-inline-edit value="Michael Chen"></zn-inline-edit>
                </div>
              </td>
              <td>
                <zn-inline-edit value="Globex Inc"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="mchen@globex.com"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="+1 (555) 234-5678"></zn-inline-edit>
              </td>
              <td>
                <div style="display: flex; gap: var(--zn-spacing-xs);">
                  <zn-chip size="small" color="info">Lead</zn-chip>
                </div>
              </td>
              <td>Yesterday</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>View Profile</zn-menu-item>
                    <zn-menu-item>Add Note</zn-menu-item>
                    <zn-menu-item>Create Deal</zn-menu-item>
                    <zn-menu-item type="danger">Delete</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  <zn-inline-edit value="Emma Thompson"></zn-inline-edit>
                </div>
              </td>
              <td>
                <zn-inline-edit value="Acme Corp"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="emma@acme.com"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="+1 (555) 345-6789"></zn-inline-edit>
              </td>
              <td>
                <div style="display: flex; gap: var(--zn-spacing-xs);">
                  <zn-chip size="small">Customer</zn-chip>
                </div>
              </td>
              <td>3 days ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>View Profile</zn-menu-item>
                    <zn-menu-item>Add Note</zn-menu-item>
                    <zn-menu-item>Create Deal</zn-menu-item>
                    <zn-menu-item type="danger">Delete</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  <zn-inline-edit value="James Rodriguez"></zn-inline-edit>
                </div>
              </td>
              <td>
                <zn-inline-edit value="Initech"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="james@initech.com"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="+1 (555) 456-7890"></zn-inline-edit>
              </td>
              <td>
                <div style="display: flex; gap: var(--zn-spacing-xs);">
                  <zn-chip size="small" color="success">VIP</zn-chip>
                  <zn-chip size="small">Customer</zn-chip>
                </div>
              </td>
              <td>1 week ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>View Profile</zn-menu-item>
                    <zn-menu-item>Add Note</zn-menu-item>
                    <zn-menu-item>Create Deal</zn-menu-item>
                    <zn-menu-item type="danger">Delete</zn-menu-item>
                  </zn-menu>
                </zn-dropdown>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                  <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                  <zn-inline-edit value="Lisa Park"></zn-inline-edit>
                </div>
              </td>
              <td>
                <zn-inline-edit value="Globex Inc"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="lpark@globex.com"></zn-inline-edit>
              </td>
              <td>
                <zn-inline-edit value="+1 (555) 567-8901"></zn-inline-edit>
              </td>
              <td>
                <div style="display: flex; gap: var(--zn-spacing-xs);">
                  <zn-chip size="small" color="info">Lead</zn-chip>
                </div>
              </td>
              <td>2 weeks ago</td>
              <td>
                <zn-dropdown>
                  <zn-button slot="trigger" size="x-small" color="transparent" icon="more_vert"></zn-button>
                  <zn-menu>
                    <zn-menu-item>View Profile</zn-menu-item>
                    <zn-menu-item>Add Note</zn-menu-item>
                    <zn-menu-item>Create Deal</zn-menu-item>
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
      <span style="color: var(--zn-text-secondary);">Showing 1-5 of 128 contacts</span>
      <zn-pagination total="128" page-size="5" current-page="1"></zn-pagination>
    </div>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-data-table`, `zn-inline-edit`, `zn-pagination`, `zn-input`, `zn-select`, `zn-dropdown`, `zn-menu`, `zn-menu-item`, `zn-chip`
