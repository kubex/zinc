---
meta:
  title: Analytics Dashboard
  description: Data visualization dashboard with multiple chart types and metrics.
fullWidth: true
---

# Analytics Dashboard

A data-rich analytics dashboard with various chart types and KPI metrics. Demonstrates `zn-chart`, `zn-stat`, `zn-datepicker`, and visualization layouts.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header with Date Range -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md);">
      <h2 style="margin: 0;">Analytics Overview</h2>
      <div style="display: flex; gap: var(--zn-spacing-sm); align-items: center;">
        <zn-datepicker range placeholder="Select date range" value="2026-01-01 - 2026-01-31"></zn-datepicker>
        <zn-button icon="refresh" color="secondary">Refresh</zn-button>
        <zn-button icon="download" color="secondary">Export</zn-button>
      </div>
    </div>

    <!-- KPI Stats Row -->
    <div style="padding: 0 var(--zn-spacing-md);">
      <zn-cols layout="1,1,1,1,1,1">
        <zn-stat caption="Total Visitors" value="48,352" trend="up" trend-value="+12.5%"></zn-stat>
        <zn-stat caption="Page Views" value="156,847" trend="up" trend-value="+8.3%"></zn-stat>
        <zn-stat caption="Bounce Rate" value="42.3%" trend="down" trend-value="-5.2%"></zn-stat>
        <zn-stat caption="Avg. Session" value="4m 23s" trend="up" trend-value="+15.1%"></zn-stat>
        <zn-stat caption="Conversions" value="1,284" trend="up" trend-value="+22.8%"></zn-stat>
        <zn-stat caption="Revenue" value="$48,352" trend="up" trend-value="+18.4%"></zn-stat>
      </zn-cols>
    </div>

    <!-- Main Charts Row -->
    <div style="padding: var(--zn-spacing-md);">
      <zn-cols layout="2,1">
        <zn-panel caption="Traffic Overview" description="Visitors over time">
          <zn-chart
            type="area"
            height="300"
            series='[{"name": "Visitors", "data": [3200, 3800, 4100, 3600, 4800, 5200, 5400, 5800, 6200, 5900, 6800, 7200, 6900, 7500, 8100, 7800, 8400, 8800, 8200, 9100, 9500, 8900, 9800, 10200, 9600, 10500, 10900, 10200, 11000, 11500]}, {"name": "Unique", "data": [2400, 2900, 3100, 2700, 3600, 3900, 4100, 4400, 4700, 4500, 5100, 5400, 5200, 5600, 6100, 5900, 6300, 6600, 6200, 6800, 7100, 6700, 7400, 7700, 7200, 7900, 8200, 7700, 8300, 8700]}]'
            categories='["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]'>
          </zn-chart>
        </zn-panel>
        <zn-panel caption="Traffic Sources">
          <zn-chart
            type="donut"
            height="300"
            series="[35, 25, 20, 15, 5]"
            labels='["Organic Search", "Direct", "Social Media", "Referral", "Email"]'>
          </zn-chart>
        </zn-panel>
      </zn-cols>
    </div>

    <!-- Secondary Charts Row -->
    <div style="padding: 0 var(--zn-spacing-md) var(--zn-spacing-md);">
      <zn-cols layout="1,1,1">
        <zn-panel caption="Revenue by Channel">
          <zn-chart
            type="bar"
            height="250"
            series='[{"name": "Revenue", "data": [18500, 12300, 9800, 5200, 2552]}]'
            categories='["Organic", "Direct", "Social", "Referral", "Email"]'>
          </zn-chart>
        </zn-panel>
        <zn-panel caption="Conversion Funnel">
          <zn-chart
            type="bar"
            height="250"
            horizontal="true"
            series='[{"name": "Users", "data": [48352, 28500, 12400, 4200, 1284]}]'
            categories='["Visitors", "Product Views", "Add to Cart", "Checkout", "Purchase"]'>
          </zn-chart>
        </zn-panel>
        <zn-panel caption="Device Breakdown">
          <zn-chart
            type="pie"
            height="250"
            series="[58, 32, 10]"
            labels='["Desktop", "Mobile", "Tablet"]'>
          </zn-chart>
        </zn-panel>
      </zn-cols>
    </div>

    <!-- Bottom Section -->
    <div style="padding: 0 var(--zn-spacing-md) var(--zn-spacing-md);">
      <zn-cols layout="1,1">
        <zn-panel caption="Top Pages" flush>
          <zn-data-table>
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Views</th>
                  <th>Bounce</th>
                  <th>Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>/products</td>
                  <td>24,521</td>
                  <td>35.2%</td>
                  <td>3:42</td>
                </tr>
                <tr>
                  <td>/pricing</td>
                  <td>18,347</td>
                  <td>28.1%</td>
                  <td>5:15</td>
                </tr>
                <tr>
                  <td>/features</td>
                  <td>15,892</td>
                  <td>42.3%</td>
                  <td>2:58</td>
                </tr>
                <tr>
                  <td>/blog</td>
                  <td>12,456</td>
                  <td>55.8%</td>
                  <td>4:21</td>
                </tr>
                <tr>
                  <td>/contact</td>
                  <td>8,234</td>
                  <td>22.4%</td>
                  <td>2:12</td>
                </tr>
              </tbody>
            </table>
          </zn-data-table>
        </zn-panel>
        <zn-panel caption="Real-time Activity">
          <div slot="actions">
            <zn-status-indicator color="success">Live</zn-status-indicator>
          </div>
          <zn-sp divide no-gap>
            <zn-item label="User from San Francisco viewed /products" description="Just now">
              <zn-icon slot="prefix" src="visibility"></zn-icon>
            </zn-item>
            <zn-item label="User from New York completed purchase" description="2 seconds ago">
              <zn-icon slot="prefix" src="shopping_cart" style="color: var(--zn-color-success);"></zn-icon>
            </zn-item>
            <zn-item label="User from London signed up" description="15 seconds ago">
              <zn-icon slot="prefix" src="person_add" style="color: var(--zn-color-info);"></zn-icon>
            </zn-item>
            <zn-item label="User from Tokyo viewed /pricing" description="23 seconds ago">
              <zn-icon slot="prefix" src="visibility"></zn-icon>
            </zn-item>
            <zn-item label="User from Berlin added item to cart" description="45 seconds ago">
              <zn-icon slot="prefix" src="add_shopping_cart" style="color: var(--zn-color-warning);"></zn-icon>
            </zn-item>
            <zn-item label="User from Sydney viewed /features" description="1 minute ago">
              <zn-icon slot="prefix" src="visibility"></zn-icon>
            </zn-item>
          </zn-sp>
        </zn-panel>
      </zn-cols>
    </div>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-chart`, `zn-stat`, `zn-datepicker`, `zn-data-table`, `zn-panel`, `zn-cols`, `zn-item`, `zn-status-indicator`
