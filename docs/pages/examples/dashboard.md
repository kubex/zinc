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
