# Kitchen Sink Example Pages Design

## Overview

Create 17 comprehensive example pages to showcase Zinc UI library capabilities. These pages serve three purposes:
1. **Marketing/showcase** - Impress potential adopters with polished, real-world examples
2. **Developer reference** - Help users understand how to combine components into complete interfaces
3. **Testing/QA** - Ensure all components work together correctly in realistic scenarios

## Goals

- Demonstrate 88+ Zinc components in realistic contexts
- Cover common online business verticals: e-commerce, support/helpdesk, CRM, analytics
- Show varied layout patterns: dashboards, CRUD, workflows, navigation
- Static mockups with hardcoded data (minimal interactivity)
- Visual density varies by page type (dashboards dense, settings spacious)

---

## File Structure

```
/docs/pages/examples/
├── index.md                    # Gallery/index page listing all examples
├── /dashboard/
│   └── index.md               # Main Dashboard
├── /settings/
│   └── index.md               # Settings page
├── /users/
│   └── index.md               # User Management
├── /notifications/
│   └── index.md               # Notifications Center
├── /ecommerce/
│   ├── catalog.md             # Product Catalog
│   ├── orders.md              # Order Management
│   └── product-editor.md      # Product Editor
├── /support/
│   ├── tickets.md             # Ticket Queue
│   ├── ticket-detail.md       # Ticket Detail
│   └── knowledge-base.md      # Knowledge Base
├── /crm/
│   ├── contacts.md            # Contact List
│   ├── pipeline.md            # Deal Pipeline
│   └── contact-detail.md      # Contact Detail
├── /analytics/
│   ├── dashboard.md           # Analytics Dashboard
│   └── report-builder.md      # Report Builder
└── /onboarding/
    ├── wizard.md              # Onboarding Wizard
    └── empty-states.md        # Empty States Gallery
```

---

## Page Template & Layout

### New Layout: `/docs/_includes/layouts/example.njk`

A dedicated layout for kitchen sink examples that:
- Removes standard docs sidebar and header
- Provides a floating "back to examples" button
- Includes a toolbar to toggle light/dark theme
- Sets viewport to full width/height
- Includes all Zinc component imports

### Page Frontmatter Pattern

```yaml
---
layout: layouts/example.njk
title: Main Dashboard
description: Overview dashboard with stats, charts, and activity feed
category: Generic SaaS
tags: [dashboard, charts, stats, activity]
components: [stat, chart, data-table, tabs, panel]
---
```

The `components` array documents which Zinc components are demonstrated.

### Index Page

The `/examples/index.md` gallery will include:
- Category groupings
- Component tags for filtering
- Links to each example
- Thumbnail previews (optional, can add later)

---

## Visual Design Approach

### Consistent App Shell

Most pages share a common shell:
- **Sidebar** (`zn-sidebar`) - Navigation with icons, collapsible sections
- **Header** (`zn-header`) - Breadcrumbs, search, user menu
- **Main content area** - Page-specific content

Some pages (Onboarding Wizard, Empty States) intentionally break from this pattern.

### Data Realism

Static but believable mock data:
- Real-sounding company names, product names, people names
- Plausible numbers, dates, and status distributions
- Consistent entities across pages (same customers appear in CRM and Support)

### Responsive Behavior

Desktop-first with graceful adaptation:
- Sidebar collapses on smaller screens
- Tables become scrollable or stack
- Split panes become single-column

### Theme Support

All examples work in both light and dark themes using existing Zinc design tokens. Floating toolbar allows theme toggling.

---

## Page Specifications

### Section 1: Generic SaaS Foundation (4 pages)

#### Main Dashboard
**Purpose:** Overview/home screen
**Density:** Dense
**Components:**
- Top row: 4x `zn-stat` tiles (revenue, orders, customers, tickets)
- Middle row: `zn-chart` (line chart - trends) + `zn-chart` (bar chart - by category)
- Bottom row: `zn-data-table` (recent orders, 5 rows) + `zn-panel` (activity feed with timestamps)

#### Settings
**Purpose:** Account/app configuration
**Density:** Spacious
**Components:**
- `zn-tabs` for sections: Profile, Security, Notifications, Billing, Team
- Profile: Form with `zn-input`, `zn-file` (avatar), `zn-textarea`
- Security: Password change, `zn-toggle` for 2FA
- Notifications: Grid of `zn-toggle` switches with labels
- Billing: `zn-panel` with plan info, payment method, invoices table
- Team: Small `zn-data-table` with invite button, role `zn-select`

#### User Management
**Purpose:** CRUD table pattern
**Density:** Medium
**Components:**
- `zn-data-table` with columns: avatar, name, email, role, status, last active, actions
- `zn-data-table-filter` for role/status, `zn-data-table-search`
- `zn-bulk-actions` for delete, change role
- `zn-slideout` for add/edit user form

#### Notifications Center
**Purpose:** Activity/alerts
**Density:** Medium
**Components:**
- `zn-tabs`: All, Unread, Mentions, System
- List of notification items with icons, timestamps, read/unread states
- `zn-empty-state` for empty tabs
- Mark all read action in header

---

### Section 2: E-commerce (3 pages)

#### Product Catalog
**Purpose:** Browsable inventory
**Density:** Medium
**Components:**
- Filter sidebar: `zn-checkbox-group` (categories), `zn-input` (price range), `zn-select` (stock status)
- Grid/list view toggle with `zn-button-group`
- Product cards using `zn-tile` with image, name, price, stock badge
- `zn-pagination` at bottom
- `zn-bulk-actions` for publish, archive, delete

#### Order Management
**Purpose:** Order list + detail
**Density:** Dense
**Components:**
- `zn-data-table` with: order #, customer, items count, total, status chip, date, actions
- Status chips color-coded: pending (yellow), processing (blue), shipped (purple), delivered (green), cancelled (red)
- `zn-data-table-filter` for status, date range with `zn-datepicker`
- Row click opens `zn-slideout` with full order detail:
  - Customer info panel
  - Line items table
  - `zn-vertical-stepper` showing order timeline
  - Action buttons: refund, cancel, resend confirmation

#### Product Editor
**Purpose:** Complex form
**Density:** Spacious
**Components:**
- `zn-tabs`: Details, Media, Inventory, Pricing, SEO
- Details: `zn-input` (title), `zn-editor` (description), `zn-select` (category), `zn-checkbox-group` (tags)
- Media: `zn-file` with drag-drop, image gallery with reorder
- Inventory: SKU, quantity, low stock threshold, `zn-toggle` for track inventory
- Pricing: Base price, sale price, `zn-datepicker` for sale dates
- SEO: Meta title, description, URL slug preview
- Sticky footer with Save/Discard buttons

---

### Section 3: Support/Helpdesk (3 pages)

#### Ticket Queue
**Purpose:** Support inbox
**Density:** Dense
**Components:**
- `zn-data-table` with priority badges, assignee avatars, SLA countdown
- `zn-data-table-filter` for priority, status, assignee
- `zn-data-table-search` for ticket search
- `zn-bulk-actions` for bulk assign, close, change priority

#### Ticket Detail
**Purpose:** Conversation view
**Density:** Medium
**Components:**
- `zn-split-pane` layout
- Left pane: Conversation thread with message bubbles, `zn-editor` for reply
- Right sidebar: Customer info panel, ticket properties (status, priority, assignee), related tickets list
- Quick action buttons in header

#### Knowledge Base
**Purpose:** Help articles
**Density:** Spacious
**Components:**
- Tree navigation using nested `zn-menu` items
- `zn-input` search at top
- `zn-collapsible` sections for article content
- `zn-content-block` for article body
- Helpful/not helpful feedback buttons

---

### Section 4: CRM/Sales (3 pages)

#### Contact List
**Purpose:** Customer database
**Density:** Dense
**Components:**
- `zn-data-table` with inline edit capability
- Columns: avatar, name, company, email, phone, tags, last contact, actions
- `zn-data-table-filter` for tags, company, last contact date
- Export action button
- Company grouping option

#### Deal Pipeline
**Purpose:** Sales workflow
**Density:** Dense
**Components:**
- Column layout showing stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
- Deal cards with: company name, deal value, probability, owner avatar
- Stage totals at column headers
- Visual drag indicators (static, showing the pattern)
- `zn-stat` row showing pipeline totals

#### Contact Detail
**Purpose:** 360° customer view
**Density:** Medium
**Components:**
- Header with avatar, name, company, key stats (lifetime value, open deals)
- `zn-tabs`: Activity, Deals, Notes, Files
- Activity tab: Timeline of all interactions using `zn-vertical-stepper` style
- Deals tab: Small `zn-data-table` of associated deals
- Notes tab: List with `zn-editor` for new note
- Files tab: File list with upload
- Sidebar with quick contact info and edit button

---

### Section 5: Analytics/Reporting (2 pages)

#### Analytics Dashboard
**Purpose:** Data visualization heavy
**Density:** Dense
**Components:**
- Date range picker with `zn-datepicker` (start/end)
- Top row: 4-6 `zn-stat` tiles with trend arrows (↑ green, ↓ red)
- `zn-chart` (line) - Traffic over time
- `zn-chart` (bar) - Revenue by channel
- `zn-chart` (pie/donut) - Traffic sources
- `zn-chart` (area) - Conversion funnel
- Real-time indicator badge
- Export/share buttons

#### Report Builder
**Purpose:** Query/filter interface
**Density:** Medium
**Components:**
- `zn-query-builder` for defining report filters
- `zn-select` for chart type (line, bar, pie, table)
- `zn-select` for metrics and dimensions
- Live preview `zn-chart` showing current query results
- Save report `zn-button` opening `zn-dialog`
- Export options: CSV, PDF, PNG

---

### Section 6: Bonus/Specialized (2 pages)

#### Onboarding Wizard
**Purpose:** Multi-step flow
**Density:** Spacious
**Layout:** No app shell - centered card design
**Components:**
- `zn-stepper` showing 5 steps: Welcome, Profile, Team, Preferences, Complete
- Step 1: Welcome message with get started button
- Step 2: Profile form with `zn-input`, `zn-file` avatar
- Step 3: Team invite with email `zn-input` and role `zn-select`
- Step 4: Preferences with `zn-toggle` and `zn-checkbox-group`
- Step 5: Completion state with success icon and dashboard link
- Progress bar at top
- Back/Next buttons with validation

#### Empty States Gallery
**Purpose:** First-run experiences
**Density:** Spacious
**Layout:** Grid of examples
**Components:**
- Multiple `zn-empty-state` variations:
  - No search results
  - First-time/empty list
  - Error state
  - No permission
  - Maintenance mode
  - Loading complete but empty
- Each with appropriate icon, message, and CTA
- Shows both light and dark theme versions

---

## Component Coverage Summary

| Component | Pages Using It |
|-----------|----------------|
| `zn-data-table` | User Management, Orders, Tickets, Contacts, Deals |
| `zn-chart` | Dashboard, Analytics Dashboard, Report Builder |
| `zn-tabs` | Settings, Product Editor, Contact Detail, Notifications |
| `zn-slideout` | User Management, Orders |
| `zn-form controls` | Settings, Product Editor, Wizard, Report Builder |
| `zn-stat` | Dashboard, Analytics Dashboard, Pipeline |
| `zn-editor` | Product Editor, Ticket Detail, Contact Detail |
| `zn-split-pane` | Ticket Detail |
| `zn-query-builder` | Report Builder |
| `zn-stepper` | Wizard, Order Detail |
| `zn-empty-state` | Notifications, Empty States Gallery |
| `zn-bulk-actions` | User Management, Catalog, Tickets |
| `zn-pagination` | Catalog |
| `zn-collapsible` | Knowledge Base |

---

## Implementation Notes

1. **Start with the template** - Create the example layout first so all pages have consistent framing
2. **Build generic pages first** - Dashboard, Settings, User Management establish patterns others follow
3. **Reuse mock data** - Create a shared set of fake customers, products, orders that appear across pages
4. **Test both themes** - Verify each page looks good in light and dark mode
5. **Document components used** - Keep frontmatter `components` array accurate for the index page

---

## Success Criteria

- All 17 pages render without errors
- Each page demonstrates its listed components
- Pages look polished in both light and dark themes
- Index page provides easy navigation and filtering
- Developers can copy component patterns from examples
