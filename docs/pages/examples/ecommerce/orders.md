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
