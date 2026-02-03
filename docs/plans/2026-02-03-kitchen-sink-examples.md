# Kitchen Sink Examples Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 17 comprehensive example pages showcasing Zinc UI library capabilities across common business verticals.

**Architecture:** Each example page uses `html:preview` blocks within markdown files, rendered by the existing 11ty docs system. Pages live in `/docs/pages/examples/` with a new "Examples" section in the sidebar navigation.

**Tech Stack:** Markdown with Nunjucks frontmatter, Zinc web components, 11ty static site generator.

---

## Task 1: Create Examples Directory Structure

**Files:**
- Create: `docs/pages/examples/index.md`

**Step 1: Create the examples index page**

Create `docs/pages/examples/index.md`:

```markdown
---
meta:
  title: Kitchen Sink Examples
  description: Comprehensive example pages showcasing Zinc UI components in real-world layouts.
---

# Kitchen Sink Examples

These examples demonstrate how to combine Zinc components into complete, production-ready interfaces. Each example showcases different layout patterns, component combinations, and design approaches.

## Generic SaaS

| Example | Description |
|---------|-------------|
| [Main Dashboard](/examples/dashboard) | Overview with stats, charts, and activity feed |
| [Settings](/examples/settings) | Account configuration with tabs and forms |
| [User Management](/examples/users) | CRUD table with filters and bulk actions |
| [Notifications](/examples/notifications) | Activity center with tabs and empty states |

## E-commerce

| Example | Description |
|---------|-------------|
| [Product Catalog](/examples/ecommerce/catalog) | Filterable product grid with pagination |
| [Order Management](/examples/ecommerce/orders) | Order table with status and detail slideout |
| [Product Editor](/examples/ecommerce/product-editor) | Complex multi-tab form for product data |

## Support / Helpdesk

| Example | Description |
|---------|-------------|
| [Ticket Queue](/examples/support/tickets) | Support inbox with priority and bulk actions |
| [Ticket Detail](/examples/support/ticket-detail) | Split-pane conversation view |
| [Knowledge Base](/examples/support/knowledge-base) | Searchable help articles |

## CRM / Sales

| Example | Description |
|---------|-------------|
| [Contact List](/examples/crm/contacts) | Customer database with inline editing |
| [Deal Pipeline](/examples/crm/pipeline) | Sales stages with deal cards |
| [Contact Detail](/examples/crm/contact-detail) | 360° customer view with activity |

## Analytics

| Example | Description |
|---------|-------------|
| [Analytics Dashboard](/examples/analytics/dashboard) | Data visualization with multiple charts |
| [Report Builder](/examples/analytics/report-builder) | Query builder with live preview |

## Onboarding

| Example | Description |
|---------|-------------|
| [Onboarding Wizard](/examples/onboarding/wizard) | Multi-step flow with validation |
| [Empty States](/examples/onboarding/empty-states) | First-run experience gallery |
```

**Step 2: Commit**

```bash
git add docs/pages/examples/index.md
git commit -m "feat(docs): add kitchen sink examples index page"
```

---

## Task 2: Update Sidebar Navigation

**Files:**
- Modify: `docs/_includes/sidebar.njk`

**Step 1: Add Examples section to sidebar**

Edit `docs/_includes/sidebar.njk` to add a new section after Tutorials:

```nunjucks
<ul>
  <li>
    <h2>Tutorials</h2>
    <ul>
      <li><a href="/getting-started/form-controls">Form Controls</a></li>
      <li><a href="/getting-started/form-examples">Form Examples</a></li>
      <li><a href="/getting-started/table-examples">Table Examples</a></li>
      <li><a href="/getting-started/example-layout">Example Layout</a></li>
      <li><a href="/getting-started/example-page">Example Page</a></li>
    </ul>
  </li>
  <li>
    <h2>Examples</h2>
    <ul>
      <li><a href="/examples">Overview</a></li>
      <li><a href="/examples/dashboard">Dashboard</a></li>
      <li><a href="/examples/settings">Settings</a></li>
      <li><a href="/examples/users">User Management</a></li>
      <li><a href="/examples/notifications">Notifications</a></li>
      <li><a href="/examples/ecommerce/catalog">Product Catalog</a></li>
      <li><a href="/examples/ecommerce/orders">Orders</a></li>
      <li><a href="/examples/ecommerce/product-editor">Product Editor</a></li>
      <li><a href="/examples/support/tickets">Ticket Queue</a></li>
      <li><a href="/examples/support/ticket-detail">Ticket Detail</a></li>
      <li><a href="/examples/support/knowledge-base">Knowledge Base</a></li>
      <li><a href="/examples/crm/contacts">Contacts</a></li>
      <li><a href="/examples/crm/pipeline">Deal Pipeline</a></li>
      <li><a href="/examples/crm/contact-detail">Contact Detail</a></li>
      <li><a href="/examples/analytics/dashboard">Analytics</a></li>
      <li><a href="/examples/analytics/report-builder">Report Builder</a></li>
      <li><a href="/examples/onboarding/wizard">Onboarding Wizard</a></li>
      <li><a href="/examples/onboarding/empty-states">Empty States</a></li>
    </ul>
  </li>
  <li>
    <h2>Components</h2>
    <ul>
      {% for component in meta.components %}
        <li>
          <a href="/components/{{ component.tagName | removeZNPrefix }}">
            {{ component.name | classNameToComponentName }}
          </a>
        </li>
      {% endfor %}
    </ul>
  </li>
</ul>
```

**Step 2: Commit**

```bash
git add docs/_includes/sidebar.njk
git commit -m "feat(docs): add Examples section to sidebar navigation"
```

---

## Task 3: Main Dashboard Example

**Files:**
- Create: `docs/pages/examples/dashboard.md`

**Step 1: Create the dashboard example**

Create `docs/pages/examples/dashboard.md`:

```markdown
---
meta:
  title: Main Dashboard
  description: Overview dashboard with stats, charts, and activity feed demonstrating Zinc components.
fullWidth: true
---

# Main Dashboard

A typical SaaS dashboard showing key metrics, trends, and recent activity. Demonstrates `zn-stat`, `zn-chart`, `zn-data-table`, and `zn-panel` components.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Stats Row -->
    <zn-cols layout="1,1,1,1">
      <zn-stat caption="Total Revenue" value="$48,352" trend="up" trend-value="+12.5%"></zn-stat>
      <zn-stat caption="Orders" value="1,284" trend="up" trend-value="+8.2%"></zn-stat>
      <zn-stat caption="Customers" value="3,847" trend="up" trend-value="+4.1%"></zn-stat>
      <zn-stat caption="Open Tickets" value="23" trend="down" trend-value="-15.3%"></zn-stat>
    </zn-cols>

    <!-- Charts Row -->
    <zn-cols layout="2,1">
      <zn-panel caption="Revenue Trend" description="Last 30 days">
        <zn-chart
          type="area"
          height="250"
          series='[{"name": "Revenue", "data": [4200, 3800, 5100, 4600, 5800, 6200, 5400, 6800, 7200, 6900, 7800, 8100]}]'
          categories='["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]'>
        </zn-chart>
      </zn-panel>
      <zn-panel caption="Sales by Channel">
        <zn-chart
          type="donut"
          height="250"
          series="[44, 55, 13, 33]"
          labels='["Direct", "Organic", "Referral", "Social"]'>
        </zn-chart>
      </zn-panel>
    </zn-cols>

    <!-- Recent Orders & Activity -->
    <zn-cols layout="2,1">
      <zn-panel caption="Recent Orders" flush>
        <zn-data-table>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#1284</td>
                <td>Sarah Wilson</td>
                <td>$234.50</td>
                <td><zn-chip size="small" color="success">Delivered</zn-chip></td>
              </tr>
              <tr>
                <td>#1283</td>
                <td>Michael Chen</td>
                <td>$89.00</td>
                <td><zn-chip size="small" color="info">Shipped</zn-chip></td>
              </tr>
              <tr>
                <td>#1282</td>
                <td>Emma Thompson</td>
                <td>$156.25</td>
                <td><zn-chip size="small" color="warning">Processing</zn-chip></td>
              </tr>
              <tr>
                <td>#1281</td>
                <td>James Rodriguez</td>
                <td>$412.00</td>
                <td><zn-chip size="small" color="success">Delivered</zn-chip></td>
              </tr>
              <tr>
                <td>#1280</td>
                <td>Lisa Park</td>
                <td>$67.80</td>
                <td><zn-chip size="small" color="info">Shipped</zn-chip></td>
              </tr>
            </tbody>
          </table>
        </zn-data-table>
      </zn-panel>
      <zn-panel caption="Recent Activity">
        <zn-sp divide no-gap>
          <zn-item label="New order #1284" description="2 minutes ago">
            <zn-icon slot="prefix" src="shopping_cart"></zn-icon>
          </zn-item>
          <zn-item label="Customer signup" description="15 minutes ago">
            <zn-icon slot="prefix" src="person_add"></zn-icon>
          </zn-item>
          <zn-item label="Ticket resolved #847" description="1 hour ago">
            <zn-icon slot="prefix" src="check_circle"></zn-icon>
          </zn-item>
          <zn-item label="Product updated" description="2 hours ago">
            <zn-icon slot="prefix" src="inventory_2"></zn-icon>
          </zn-item>
          <zn-item label="New review received" description="3 hours ago">
            <zn-icon slot="prefix" src="star"></zn-icon>
          </zn-item>
        </zn-sp>
      </zn-panel>
    </zn-cols>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-pane`, `zn-sp`, `zn-cols`, `zn-stat`, `zn-panel`, `zn-chart`, `zn-data-table`, `zn-chip`, `zn-item`, `zn-icon`
```

**Step 2: Run dev server to verify**

```bash
cd /Users/brooke.bryan/code/kubex/zinc/.worktrees/kitchen-sink
npm run docs:dev
# Visit http://localhost:8080/examples/dashboard to verify
```

**Step 3: Commit**

```bash
git add docs/pages/examples/dashboard.md
git commit -m "feat(docs): add main dashboard kitchen sink example"
```

---

## Task 4: Settings Page Example

**Files:**
- Create: `docs/pages/examples/settings.md`

**Step 1: Create the settings example**

Create `docs/pages/examples/settings.md`:

```markdown
---
meta:
  title: Settings
  description: Account settings page with tabs, forms, and toggles demonstrating Zinc form components.
fullWidth: true
---

# Settings

A typical settings page with multiple sections organized by tabs. Demonstrates `zn-tabs`, `zn-input`, `zn-toggle`, `zn-select`, and form layout patterns.

```html:preview
<zn-pane>
  <zn-panel caption="Account Settings" description="Manage your account preferences" tabbed>
    <zn-tabs>
      <zn-navbar slot="top">
        <li tab>Profile</li>
        <li tab="security">Security</li>
        <li tab="notifications">Notifications</li>
        <li tab="billing">Billing</li>
        <li tab="team">Team</li>
      </zn-navbar>

      <!-- Profile Tab -->
      <zn-sp id="" style="padding: var(--zn-spacing-lg);">
        <zn-cols layout="200px,1">
          <div>
            <zn-file accept="image/*" style="width: 150px; height: 150px;">
              Upload Avatar
            </zn-file>
          </div>
          <zn-sp>
            <zn-cols layout="1,1">
              <zn-input label="First Name" value="Sarah"></zn-input>
              <zn-input label="Last Name" value="Wilson"></zn-input>
            </zn-cols>
            <zn-input label="Email" type="email" value="sarah.wilson@company.com"></zn-input>
            <zn-input label="Phone" type="tel" value="+1 (555) 123-4567"></zn-input>
            <zn-textarea label="Bio" placeholder="Tell us about yourself..." rows="3"></zn-textarea>
            <zn-select label="Timezone">
              <zn-option value="utc">UTC</zn-option>
              <zn-option value="est" selected>Eastern Time (EST)</zn-option>
              <zn-option value="pst">Pacific Time (PST)</zn-option>
              <zn-option value="gmt">GMT</zn-option>
            </zn-select>
            <div style="display: flex; gap: var(--zn-spacing-sm); justify-content: flex-end;">
              <zn-button color="secondary">Cancel</zn-button>
              <zn-button>Save Changes</zn-button>
            </div>
          </zn-sp>
        </zn-cols>
      </zn-sp>

      <!-- Security Tab -->
      <zn-sp id="security" style="padding: var(--zn-spacing-lg);">
        <zn-panel caption="Change Password">
          <zn-sp>
            <zn-input label="Current Password" type="password"></zn-input>
            <zn-cols layout="1,1">
              <zn-input label="New Password" type="password"></zn-input>
              <zn-input label="Confirm Password" type="password"></zn-input>
            </zn-cols>
            <zn-button>Update Password</zn-button>
          </zn-sp>
        </zn-panel>
        <zn-panel caption="Two-Factor Authentication">
          <zn-sp divide no-gap>
            <zn-item label="Enable 2FA" description="Add an extra layer of security to your account">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="Authenticator App" description="Use Google Authenticator or similar">
              <zn-chip slot="actions" size="small" color="success">Configured</zn-chip>
            </zn-item>
            <zn-item label="SMS Backup" description="Receive codes via text message">
              <zn-button slot="actions" size="small" color="secondary">Setup</zn-button>
            </zn-item>
          </zn-sp>
        </zn-panel>
      </zn-sp>

      <!-- Notifications Tab -->
      <zn-sp id="notifications" style="padding: var(--zn-spacing-lg);">
        <zn-panel caption="Email Notifications">
          <zn-sp divide no-gap>
            <zn-item label="Order updates" description="Receive emails when order status changes">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="New customers" description="Get notified when someone creates an account">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="Product reviews" description="Receive emails for new product reviews">
              <zn-toggle slot="actions"></zn-toggle>
            </zn-item>
            <zn-item label="Weekly digest" description="Summary of activity sent every Monday">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
          </zn-sp>
        </zn-panel>
        <zn-panel caption="Push Notifications">
          <zn-sp divide no-gap>
            <zn-item label="Desktop notifications" description="Show browser notifications">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="Sound alerts" description="Play sound for important events">
              <zn-toggle slot="actions"></zn-toggle>
            </zn-item>
          </zn-sp>
        </zn-panel>
      </zn-sp>

      <!-- Billing Tab -->
      <zn-sp id="billing" style="padding: var(--zn-spacing-lg);">
        <zn-cols layout="1,1">
          <zn-panel caption="Current Plan">
            <zn-sp>
              <zn-stat caption="Plan" value="Professional"></zn-stat>
              <zn-stat caption="Price" value="$49/month"></zn-stat>
              <zn-stat caption="Next billing" value="Feb 15, 2026"></zn-stat>
              <zn-button color="secondary">Change Plan</zn-button>
            </zn-sp>
          </zn-panel>
          <zn-panel caption="Payment Method">
            <zn-sp divide no-gap>
              <zn-item label="Visa ending in 4242" description="Expires 12/2027">
                <zn-icon slot="prefix" src="credit_card"></zn-icon>
                <zn-button slot="actions" size="small" color="secondary">Edit</zn-button>
              </zn-item>
            </zn-sp>
            <div style="margin-top: var(--zn-spacing-md);">
              <zn-button color="secondary" size="small">Add Payment Method</zn-button>
            </div>
          </zn-panel>
        </zn-cols>
        <zn-panel caption="Billing History" flush>
          <zn-data-table>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jan 15, 2026</td>
                  <td>Professional Plan</td>
                  <td>$49.00</td>
                  <td><zn-chip size="small" color="success">Paid</zn-chip></td>
                  <td><zn-button size="x-small" color="transparent">Download</zn-button></td>
                </tr>
                <tr>
                  <td>Dec 15, 2025</td>
                  <td>Professional Plan</td>
                  <td>$49.00</td>
                  <td><zn-chip size="small" color="success">Paid</zn-chip></td>
                  <td><zn-button size="x-small" color="transparent">Download</zn-button></td>
                </tr>
                <tr>
                  <td>Nov 15, 2025</td>
                  <td>Professional Plan</td>
                  <td>$49.00</td>
                  <td><zn-chip size="small" color="success">Paid</zn-chip></td>
                  <td><zn-button size="x-small" color="transparent">Download</zn-button></td>
                </tr>
              </tbody>
            </table>
          </zn-data-table>
        </zn-panel>
      </zn-sp>

      <!-- Team Tab -->
      <zn-sp id="team" style="padding: var(--zn-spacing-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zn-spacing-md);">
          <h3 style="margin: 0;">Team Members</h3>
          <zn-button size="small" icon="person_add">Invite Member</zn-button>
        </div>
        <zn-data-table>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                    <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                    <div>
                      <div>Sarah Wilson</div>
                      <div style="font-size: 12px; color: var(--zn-text-secondary);">sarah@company.com</div>
                    </div>
                  </div>
                </td>
                <td><zn-chip size="small">Owner</zn-chip></td>
                <td><zn-chip size="small" color="success">Active</zn-chip></td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                    <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                    <div>
                      <div>Michael Chen</div>
                      <div style="font-size: 12px; color: var(--zn-text-secondary);">michael@company.com</div>
                    </div>
                  </div>
                </td>
                <td><zn-chip size="small">Admin</zn-chip></td>
                <td><zn-chip size="small" color="success">Active</zn-chip></td>
                <td><zn-button size="x-small" color="transparent" icon="more_vert"></zn-button></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                    <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                    <div>
                      <div>Emma Thompson</div>
                      <div style="font-size: 12px; color: var(--zn-text-secondary);">emma@company.com</div>
                    </div>
                  </div>
                </td>
                <td><zn-chip size="small">Member</zn-chip></td>
                <td><zn-chip size="small" color="warning">Pending</zn-chip></td>
                <td><zn-button size="x-small" color="transparent" icon="more_vert"></zn-button></td>
              </tr>
            </tbody>
          </table>
        </zn-data-table>
      </zn-sp>
    </zn-tabs>
  </zn-panel>
</zn-pane>
```

**Components demonstrated:** `zn-tabs`, `zn-navbar`, `zn-input`, `zn-textarea`, `zn-select`, `zn-option`, `zn-toggle`, `zn-file`, `zn-data-table`, `zn-panel`, `zn-item`, `zn-stat`, `zn-chip`, `zn-button`
```

**Step 2: Verify in browser**

```bash
# Visit http://localhost:8080/examples/settings to verify
```

**Step 3: Commit**

```bash
git add docs/pages/examples/settings.md
git commit -m "feat(docs): add settings page kitchen sink example"
```

---

## Task 5: User Management Example

**Files:**
- Create: `docs/pages/examples/users.md`

**Step 1: Create the user management example**

Create `docs/pages/examples/users.md`:

```markdown
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
```

**Step 2: Commit**

```bash
git add docs/pages/examples/users.md
git commit -m "feat(docs): add user management kitchen sink example"
```

---

## Task 6: Notifications Center Example

**Files:**
- Create: `docs/pages/examples/notifications.md`

**Step 1: Create the notifications example**

Create `docs/pages/examples/notifications.md`:

```markdown
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
```

**Step 2: Commit**

```bash
git add docs/pages/examples/notifications.md
git commit -m "feat(docs): add notifications center kitchen sink example"
```

---

## Task 7: Product Catalog Example

**Files:**
- Create: `docs/pages/examples/ecommerce/catalog.md`

**Step 1: Create the ecommerce directory and catalog example**

Create `docs/pages/examples/ecommerce/catalog.md`:

```markdown
---
meta:
  title: Product Catalog
  description: E-commerce product catalog with filters, grid view, and pagination.
fullWidth: true
---

# Product Catalog

A product browsing interface with sidebar filters, grid/list toggle, and product cards. Demonstrates `zn-sidebar`, `zn-tile`, `zn-checkbox-group`, and `zn-pagination`.

```html:preview
<zn-sidebar>
  <!-- Filter Sidebar -->
  <div slot="side" style="padding: var(--zn-spacing-md);">
    <h3 style="margin-top: 0;">Filters</h3>

    <zn-sp>
      <zn-panel caption="Categories">
        <zn-checkbox-group>
          <zn-checkbox value="electronics" checked>Electronics</zn-checkbox>
          <zn-checkbox value="clothing">Clothing</zn-checkbox>
          <zn-checkbox value="home">Home & Garden</zn-checkbox>
          <zn-checkbox value="sports">Sports</zn-checkbox>
        </zn-checkbox-group>
      </zn-panel>

      <zn-panel caption="Price Range">
        <zn-sp>
          <zn-cols layout="1,1">
            <zn-input type="number" placeholder="Min" size="small"></zn-input>
            <zn-input type="number" placeholder="Max" size="small"></zn-input>
          </zn-cols>
        </zn-sp>
      </zn-panel>

      <zn-panel caption="Stock Status">
        <zn-radio-group value="all">
          <zn-radio value="all">All</zn-radio>
          <zn-radio value="in-stock">In Stock</zn-radio>
          <zn-radio value="low-stock">Low Stock</zn-radio>
          <zn-radio value="out-of-stock">Out of Stock</zn-radio>
        </zn-radio-group>
      </zn-panel>

      <zn-panel caption="Rating">
        <zn-checkbox-group>
          <zn-checkbox value="4">4 stars & up</zn-checkbox>
          <zn-checkbox value="3">3 stars & up</zn-checkbox>
          <zn-checkbox value="2">2 stars & up</zn-checkbox>
        </zn-checkbox-group>
      </zn-panel>

      <zn-button color="secondary" size="small" style="width: 100%;">Clear All Filters</zn-button>
    </zn-sp>
  </div>

  <!-- Main Content -->
  <zn-container padded style="background: var(--zn-color-neutral-50);">
    <zn-sp>
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--zn-spacing-sm);">
        <div>
          <h2 style="margin: 0;">Products</h2>
          <span style="color: var(--zn-text-secondary);">Showing 1-12 of 156 products</span>
        </div>
        <div style="display: flex; gap: var(--zn-spacing-sm); align-items: center;">
          <zn-input placeholder="Search products..." icon="search" size="small" style="width: 200px;"></zn-input>
          <zn-select size="small" style="width: 150px;">
            <zn-option value="newest" selected>Newest First</zn-option>
            <zn-option value="price-low">Price: Low to High</zn-option>
            <zn-option value="price-high">Price: High to Low</zn-option>
            <zn-option value="popular">Most Popular</zn-option>
          </zn-select>
          <zn-button-group>
            <zn-button size="small" icon="grid_view" color="secondary"></zn-button>
            <zn-button size="small" icon="view_list" color="transparent"></zn-button>
          </zn-button-group>
        </div>
      </div>

      <!-- Bulk Actions -->
      <zn-bulk-actions>
        <span slot="count">4 selected</span>
        <zn-button size="small" color="secondary">Publish</zn-button>
        <zn-button size="small" color="secondary">Archive</zn-button>
        <zn-button size="small" color="error">Delete</zn-button>
      </zn-bulk-actions>

      <!-- Product Grid -->
      <zn-cols layout="1,1,1,1">
        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Wireless Headphones">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$149.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Smart Watch Pro">
            <zn-chip size="small" color="warning">Low Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$299.99">
            <zn-rating value="5" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Bluetooth Speaker">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$79.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="USB-C Hub">
            <zn-chip size="small" color="error">Out of Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$59.99">
            <zn-rating value="3" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Mechanical Keyboard">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$129.99">
            <zn-rating value="5" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Webcam HD">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$89.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Laptop Stand">
            <zn-chip size="small" color="warning">Low Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$49.99">
            <zn-rating value="4" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>

        <zn-tile>
          <div slot="media" style="background: var(--zn-color-neutral-100); height: 150px; display: flex; align-items: center; justify-content: center;">
            <zn-icon src="image" style="font-size: 48px; color: var(--zn-color-neutral-300);"></zn-icon>
          </div>
          <zn-tile-property label="Wireless Mouse">
            <zn-chip size="small" color="success">In Stock</zn-chip>
          </zn-tile-property>
          <zn-tile-property label="$39.99">
            <zn-rating value="5" readonly size="small"></zn-rating>
          </zn-tile-property>
        </zn-tile>
      </zn-cols>

      <!-- Pagination -->
      <div style="display: flex; justify-content: center; padding: var(--zn-spacing-lg);">
        <zn-pagination total="156" page-size="12" current-page="1"></zn-pagination>
      </div>
    </zn-sp>
  </zn-container>
</zn-sidebar>
```

**Components demonstrated:** `zn-sidebar`, `zn-tile`, `zn-tile-property`, `zn-checkbox-group`, `zn-checkbox`, `zn-radio-group`, `zn-radio`, `zn-pagination`, `zn-bulk-actions`, `zn-rating`, `zn-button-group`
```

**Step 2: Commit**

```bash
git add docs/pages/examples/ecommerce/catalog.md
git commit -m "feat(docs): add product catalog kitchen sink example"
```

---

## Task 8: Order Management Example

**Files:**
- Create: `docs/pages/examples/ecommerce/orders.md`

**Step 1: Create the order management example**

Create `docs/pages/examples/ecommerce/orders.md`:

```markdown
---
meta:
  title: Order Management
  description: E-commerce order list with status indicators and detail slideout.
fullWidth: true
---

# Order Management

An order management interface showing orders with status, filters, and a detail slideout. Demonstrates `zn-data-table`, `zn-slideout`, and `zn-vertical-stepper`.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <h2 style="margin: 0;">Orders</h2>
      <zn-button icon="download">Export</zn-button>
    </div>

    <!-- Filters -->
    <zn-panel flush>
      <div style="display: flex; gap: var(--zn-spacing-md); padding: var(--zn-spacing-md); flex-wrap: wrap; align-items: flex-end;">
        <zn-input placeholder="Search orders..." icon="search" style="min-width: 200px;"></zn-input>
        <zn-select label="Status" placeholder="All statuses" style="min-width: 150px;">
          <zn-option value="">All</zn-option>
          <zn-option value="pending">Pending</zn-option>
          <zn-option value="processing">Processing</zn-option>
          <zn-option value="shipped">Shipped</zn-option>
          <zn-option value="delivered">Delivered</zn-option>
          <zn-option value="cancelled">Cancelled</zn-option>
        </zn-select>
        <zn-datepicker label="Date Range" range placeholder="Select date range"></zn-datepicker>
      </div>
    </zn-panel>

    <!-- Orders Table -->
    <zn-panel flush>
      <zn-data-table>
        <table>
          <thead>
            <tr>
              <th data-sortable>Order</th>
              <th data-sortable>Customer</th>
              <th>Items</th>
              <th data-sortable>Total</th>
              <th data-sortable>Status</th>
              <th data-sortable>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#1284</strong></td>
              <td>Sarah Wilson</td>
              <td>3 items</td>
              <td>$234.50</td>
              <td><zn-chip size="small" color="success">Delivered</zn-chip></td>
              <td>Feb 1, 2026</td>
              <td><zn-button size="x-small" color="transparent">View</zn-button></td>
            </tr>
            <tr>
              <td><strong>#1283</strong></td>
              <td>Michael Chen</td>
              <td>1 item</td>
              <td>$89.00</td>
              <td><zn-chip size="small" color="info">Shipped</zn-chip></td>
              <td>Feb 1, 2026</td>
              <td><zn-button size="x-small" color="transparent">View</zn-button></td>
            </tr>
            <tr>
              <td><strong>#1282</strong></td>
              <td>Emma Thompson</td>
              <td>2 items</td>
              <td>$156.25</td>
              <td><zn-chip size="small" color="warning">Processing</zn-chip></td>
              <td>Jan 31, 2026</td>
              <td><zn-button size="x-small" color="transparent">View</zn-button></td>
            </tr>
            <tr>
              <td><strong>#1281</strong></td>
              <td>James Rodriguez</td>
              <td>5 items</td>
              <td>$412.00</td>
              <td><zn-chip size="small" color="success">Delivered</zn-chip></td>
              <td>Jan 30, 2026</td>
              <td><zn-button size="x-small" color="transparent">View</zn-button></td>
            </tr>
            <tr>
              <td><strong>#1280</strong></td>
              <td>Lisa Park</td>
              <td>1 item</td>
              <td>$67.80</td>
              <td><zn-chip size="small" color="error">Cancelled</zn-chip></td>
              <td>Jan 30, 2026</td>
              <td><zn-button size="x-small" color="transparent">View</zn-button></td>
            </tr>
            <tr>
              <td><strong>#1279</strong></td>
              <td>David Kim</td>
              <td>2 items</td>
              <td>$198.50</td>
              <td><zn-chip size="small" color="neutral">Pending</zn-chip></td>
              <td>Jan 29, 2026</td>
              <td><zn-button size="x-small" color="transparent">View</zn-button></td>
            </tr>
          </tbody>
        </table>
      </zn-data-table>
    </zn-panel>

    <!-- Pagination -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <span style="color: var(--zn-text-secondary);">Showing 1-6 of 1,284 orders</span>
      <zn-pagination total="1284" page-size="6" current-page="1"></zn-pagination>
    </div>
  </zn-sp>
</zn-pane>

<!-- Order Detail Slideout Example -->
<zn-slideout label="Order #1283" open style="--size: 500px;">
  <zn-sp>
    <!-- Customer Info -->
    <zn-panel caption="Customer">
      <zn-sp divide no-gap>
        <zn-item label="Michael Chen" description="michael.chen@email.com">
          <zn-icon slot="prefix" src="account_circle" style="font-size: 32px;"></zn-icon>
        </zn-item>
        <zn-item label="Shipping Address">
          <div style="font-size: 14px; color: var(--zn-text-secondary);">
            123 Main Street<br>
            San Francisco, CA 94102<br>
            United States
          </div>
        </zn-item>
      </zn-sp>
    </zn-panel>

    <!-- Order Items -->
    <zn-panel caption="Items" flush>
      <zn-sp divide no-gap>
        <zn-item label="Wireless Headphones" description="SKU: WH-001 · Qty: 1">
          <span slot="actions">$89.00</span>
        </zn-item>
      </zn-sp>
      <div style="padding: var(--zn-spacing-md); border-top: 1px solid var(--zn-color-neutral-200);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-xs);">
          <span>Subtotal</span>
          <span>$89.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-xs);">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 600;">
          <span>Total</span>
          <span>$89.00</span>
        </div>
      </div>
    </zn-panel>

    <!-- Order Timeline -->
    <zn-panel caption="Order Timeline">
      <zn-vertical-stepper current="2">
        <zn-vertical-stepper-item label="Order Placed" description="Jan 31, 2026 at 2:34 PM" complete></zn-vertical-stepper-item>
        <zn-vertical-stepper-item label="Processing" description="Jan 31, 2026 at 3:15 PM" complete></zn-vertical-stepper-item>
        <zn-vertical-stepper-item label="Shipped" description="Feb 1, 2026 at 9:00 AM" complete></zn-vertical-stepper-item>
        <zn-vertical-stepper-item label="Delivered" description="Expected Feb 3, 2026"></zn-vertical-stepper-item>
      </zn-vertical-stepper>
    </zn-panel>
  </zn-sp>

  <div slot="footer" style="display: flex; gap: var(--zn-spacing-sm);">
    <zn-button color="secondary">Refund</zn-button>
    <zn-button color="secondary">Cancel Order</zn-button>
    <zn-button>Resend Confirmation</zn-button>
  </div>
</zn-slideout>
```

**Components demonstrated:** `zn-data-table`, `zn-slideout`, `zn-vertical-stepper`, `zn-vertical-stepper-item`, `zn-datepicker`, `zn-chip`, `zn-pagination`, `zn-panel`, `zn-item`
```

**Step 2: Commit**

```bash
git add docs/pages/examples/ecommerce/orders.md
git commit -m "feat(docs): add order management kitchen sink example"
```

---

## Task 9: Product Editor Example

**Files:**
- Create: `docs/pages/examples/ecommerce/product-editor.md`

**Step 1: Create the product editor example**

Create `docs/pages/examples/ecommerce/product-editor.md`:

```markdown
---
meta:
  title: Product Editor
  description: Complex multi-tab form for editing product data with rich text editor.
fullWidth: true
---

# Product Editor

A comprehensive product editing form with multiple tabs covering all product attributes. Demonstrates `zn-tabs`, `zn-editor`, `zn-file`, and complex form layouts.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; align-items: center; gap: var(--zn-spacing-md);">
        <zn-button icon="arrow_back" color="transparent" size="small"></zn-button>
        <div>
          <h2 style="margin: 0;">Edit Product</h2>
          <span style="color: var(--zn-text-secondary);">Wireless Headphones Pro</span>
        </div>
      </div>
      <div style="display: flex; gap: var(--zn-spacing-sm);">
        <zn-button color="secondary">Discard</zn-button>
        <zn-button>Save Changes</zn-button>
      </div>
    </div>

    <!-- Tabbed Content -->
    <zn-panel tabbed style="border: none;">
      <zn-tabs>
        <zn-navbar slot="top">
          <li tab>Details</li>
          <li tab="media">Media</li>
          <li tab="inventory">Inventory</li>
          <li tab="pricing">Pricing</li>
          <li tab="seo">SEO</li>
        </zn-navbar>

        <!-- Details Tab -->
        <div id="" style="padding: var(--zn-spacing-lg);">
          <zn-cols layout="2,1">
            <zn-sp>
              <zn-input label="Product Title" value="Wireless Headphones Pro" required></zn-input>

              <div>
                <label style="display: block; margin-bottom: var(--zn-spacing-xs); font-weight: 500;">Description</label>
                <zn-editor style="height: 200px;">
                  <p>Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions.</p>
                  <ul>
                    <li>Active Noise Cancellation</li>
                    <li>30-hour battery life</li>
                    <li>Premium memory foam ear cushions</li>
                    <li>Bluetooth 5.2 connectivity</li>
                  </ul>
                </zn-editor>
              </div>

              <zn-cols layout="1,1">
                <zn-select label="Category" required>
                  <zn-option value="electronics" selected>Electronics</zn-option>
                  <zn-option value="clothing">Clothing</zn-option>
                  <zn-option value="home">Home & Garden</zn-option>
                </zn-select>
                <zn-select label="Brand">
                  <zn-option value="acme" selected>ACME Audio</zn-option>
                  <zn-option value="sonic">Sonic</zn-option>
                  <zn-option value="beats">Beats</zn-option>
                </zn-select>
              </zn-cols>

              <div>
                <label style="display: block; margin-bottom: var(--zn-spacing-xs); font-weight: 500;">Tags</label>
                <zn-checkbox-group>
                  <zn-checkbox value="wireless" checked>Wireless</zn-checkbox>
                  <zn-checkbox value="bluetooth" checked>Bluetooth</zn-checkbox>
                  <zn-checkbox value="noise-cancelling" checked>Noise Cancelling</zn-checkbox>
                  <zn-checkbox value="premium">Premium</zn-checkbox>
                  <zn-checkbox value="new-arrival">New Arrival</zn-checkbox>
                </zn-checkbox-group>
              </div>
            </zn-sp>

            <zn-sp>
              <zn-panel caption="Status">
                <zn-sp>
                  <zn-select label="Visibility">
                    <zn-option value="published" selected>Published</zn-option>
                    <zn-option value="draft">Draft</zn-option>
                    <zn-option value="archived">Archived</zn-option>
                  </zn-select>
                  <zn-item label="Featured Product" description="Show on homepage">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                </zn-sp>
              </zn-panel>
            </zn-sp>
          </zn-cols>
        </div>

        <!-- Media Tab -->
        <div id="media" style="padding: var(--zn-spacing-lg);">
          <zn-sp>
            <div>
              <label style="display: block; margin-bottom: var(--zn-spacing-sm); font-weight: 500;">Product Images</label>
              <zn-file accept="image/*" multiple style="min-height: 150px;">
                Drag and drop images here, or click to browse
              </zn-file>
            </div>

            <zn-panel caption="Current Images">
              <zn-cols layout="1,1,1,1">
                <div style="position: relative; background: var(--zn-color-neutral-100); height: 120px; border-radius: var(--zn-border-radius-medium); display: flex; align-items: center; justify-content: center;">
                  <zn-icon src="image" style="font-size: 32px; color: var(--zn-color-neutral-400);"></zn-icon>
                  <zn-chip size="small" style="position: absolute; top: 8px; left: 8px;">Primary</zn-chip>
                  <zn-button icon="delete" size="x-small" color="error" style="position: absolute; top: 8px; right: 8px;"></zn-button>
                </div>
                <div style="position: relative; background: var(--zn-color-neutral-100); height: 120px; border-radius: var(--zn-border-radius-medium); display: flex; align-items: center; justify-content: center;">
                  <zn-icon src="image" style="font-size: 32px; color: var(--zn-color-neutral-400);"></zn-icon>
                  <zn-button icon="delete" size="x-small" color="error" style="position: absolute; top: 8px; right: 8px;"></zn-button>
                </div>
                <div style="position: relative; background: var(--zn-color-neutral-100); height: 120px; border-radius: var(--zn-border-radius-medium); display: flex; align-items: center; justify-content: center;">
                  <zn-icon src="image" style="font-size: 32px; color: var(--zn-color-neutral-400);"></zn-icon>
                  <zn-button icon="delete" size="x-small" color="error" style="position: absolute; top: 8px; right: 8px;"></zn-button>
                </div>
              </zn-cols>
            </zn-panel>
          </zn-sp>
        </div>

        <!-- Inventory Tab -->
        <div id="inventory" style="padding: var(--zn-spacing-lg);">
          <zn-cols layout="1,1">
            <zn-sp>
              <zn-input label="SKU" value="WH-PRO-001" required></zn-input>
              <zn-input label="Barcode" placeholder="Enter barcode"></zn-input>
              <zn-input label="Quantity" type="number" value="47"></zn-input>
              <zn-input label="Low Stock Threshold" type="number" value="10" help-text="Alert when stock falls below this level"></zn-input>
            </zn-sp>

            <zn-sp>
              <zn-panel caption="Inventory Settings">
                <zn-sp divide no-gap>
                  <zn-item label="Track Inventory" description="Monitor stock levels">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                  <zn-item label="Allow Backorders" description="Allow orders when out of stock">
                    <zn-toggle slot="actions"></zn-toggle>
                  </zn-item>
                  <zn-item label="Show Stock Count" description="Display remaining stock to customers">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                </zn-sp>
              </zn-panel>
            </zn-sp>
          </zn-cols>
        </div>

        <!-- Pricing Tab -->
        <div id="pricing" style="padding: var(--zn-spacing-lg);">
          <zn-cols layout="1,1">
            <zn-sp>
              <zn-input label="Base Price" type="number" value="149.99" prefix="$" required></zn-input>
              <zn-input label="Compare At Price" type="number" value="199.99" prefix="$" help-text="Original price shown crossed out"></zn-input>
              <zn-input label="Cost Per Item" type="number" value="65.00" prefix="$" help-text="For profit calculations"></zn-input>
            </zn-sp>

            <zn-sp>
              <zn-panel caption="Sale">
                <zn-sp>
                  <zn-item label="On Sale" description="Apply sale pricing">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                  <zn-cols layout="1,1">
                    <zn-datepicker label="Sale Start"></zn-datepicker>
                    <zn-datepicker label="Sale End"></zn-datepicker>
                  </zn-cols>
                </zn-sp>
              </zn-panel>

              <zn-panel caption="Tax">
                <zn-sp>
                  <zn-item label="Charge Tax" description="Apply tax to this product">
                    <zn-toggle slot="actions" checked></zn-toggle>
                  </zn-item>
                  <zn-select label="Tax Class">
                    <zn-option value="standard" selected>Standard Rate</zn-option>
                    <zn-option value="reduced">Reduced Rate</zn-option>
                    <zn-option value="zero">Zero Rate</zn-option>
                  </zn-select>
                </zn-sp>
              </zn-panel>
            </zn-sp>
          </zn-cols>
        </div>

        <!-- SEO Tab -->
        <div id="seo" style="padding: var(--zn-spacing-lg);">
          <zn-sp>
            <zn-panel caption="Search Engine Preview">
              <div style="padding: var(--zn-spacing-md); background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
                <div style="color: #1a0dab; font-size: 18px;">Wireless Headphones Pro - ACME Audio</div>
                <div style="color: #006621; font-size: 14px;">https://store.example.com/products/wireless-headphones-pro</div>
                <div style="color: #545454; font-size: 14px;">Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise cancellation, 30-hour battery life...</div>
              </div>
            </zn-panel>

            <zn-cols layout="1,1">
              <zn-sp>
                <zn-input label="Meta Title" value="Wireless Headphones Pro - ACME Audio" maxlength="60" help-text="60 characters max"></zn-input>
                <zn-textarea label="Meta Description" rows="3" maxlength="160" help-text="160 characters max">Experience premium sound quality with our Wireless Headphones Pro. Featuring advanced noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions.</zn-textarea>
              </zn-sp>

              <zn-sp>
                <zn-input label="URL Slug" value="wireless-headphones-pro" prefix="products/"></zn-input>
                <zn-input label="Canonical URL" placeholder="Leave blank for default"></zn-input>
              </zn-sp>
            </zn-cols>
          </zn-sp>
        </div>
      </zn-tabs>
    </zn-panel>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-tabs`, `zn-navbar`, `zn-editor`, `zn-file`, `zn-input`, `zn-textarea`, `zn-select`, `zn-checkbox-group`, `zn-toggle`, `zn-datepicker`, `zn-panel`, `zn-item`, `zn-cols`
```

**Step 2: Commit**

```bash
git add docs/pages/examples/ecommerce/product-editor.md
git commit -m "feat(docs): add product editor kitchen sink example"
```

---

## Task 10-17: Remaining Example Pages

The remaining tasks follow the same pattern. For brevity, here are the files to create with their key components:

### Task 10: Ticket Queue (`docs/pages/examples/support/tickets.md`)
- DataTable with priority badges and SLA indicators
- Bulk actions for assign/close
- Filters by status, priority, assignee

### Task 11: Ticket Detail (`docs/pages/examples/support/ticket-detail.md`)
- Split-pane layout with conversation thread
- Customer info sidebar
- Reply editor with attachments

### Task 12: Knowledge Base (`docs/pages/examples/support/knowledge-base.md`)
- Tree navigation for categories
- Search functionality
- Collapsible article sections

### Task 13: Contact List (`docs/pages/examples/crm/contacts.md`)
- DataTable with inline editing
- Company grouping
- Quick filters and export

### Task 14: Deal Pipeline (`docs/pages/examples/crm/pipeline.md`)
- Kanban-style columns for sales stages
- Deal cards with value and probability
- Stage totals and summary stats

### Task 15: Contact Detail (`docs/pages/examples/crm/contact-detail.md`)
- Customer header with key metrics
- Tabbed sections (Activity, Deals, Notes, Files)
- Activity timeline

### Task 16: Analytics Dashboard (`docs/pages/examples/analytics/dashboard.md`)
- Multiple chart types (line, bar, pie, area)
- Date range picker
- Stat tiles with trends

### Task 17: Report Builder (`docs/pages/examples/analytics/report-builder.md`)
- Query builder interface
- Chart type selector
- Live preview and export

### Task 18: Onboarding Wizard (`docs/pages/examples/onboarding/wizard.md`)
- Multi-step stepper
- Form validation per step
- Progress indication

### Task 19: Empty States Gallery (`docs/pages/examples/onboarding/empty-states.md`)
- Various empty state scenarios
- Different illustrations and CTAs
- Light/dark theme examples

---

## Final Task: Verify and Commit All

**Step 1: Start docs dev server and verify all pages**

```bash
npm run docs:dev
```

Visit each page and verify it renders correctly in both light and dark themes.

**Step 2: Create final commit if any fixes needed**

```bash
git add -A
git commit -m "feat(docs): complete kitchen sink examples collection"
```

---

## Summary

| Task | Page | Status |
|------|------|--------|
| 1 | Index & Directory Structure | Pending |
| 2 | Sidebar Navigation | Pending |
| 3 | Main Dashboard | Pending |
| 4 | Settings | Pending |
| 5 | User Management | Pending |
| 6 | Notifications | Pending |
| 7 | Product Catalog | Pending |
| 8 | Order Management | Pending |
| 9 | Product Editor | Pending |
| 10 | Ticket Queue | Pending |
| 11 | Ticket Detail | Pending |
| 12 | Knowledge Base | Pending |
| 13 | Contact List | Pending |
| 14 | Deal Pipeline | Pending |
| 15 | Contact Detail | Pending |
| 16 | Analytics Dashboard | Pending |
| 17 | Report Builder | Pending |
| 18 | Onboarding Wizard | Pending |
| 19 | Empty States Gallery | Pending |
