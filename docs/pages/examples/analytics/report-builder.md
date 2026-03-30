---
meta:
  title: Report Builder
  description: Custom report builder with query interface and chart preview.
fullWidth: true
---

# Report Builder

A custom report creation interface with query builder, chart selection, and live preview. Demonstrates `zn-query-builder`, chart configuration, and builder patterns.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--zn-spacing-md); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; align-items: center; gap: var(--zn-spacing-md);">
        <zn-button icon="arrow_back" color="transparent" size="small"></zn-button>
        <div>
          <h2 style="margin: 0;">New Report</h2>
          <span style="color: var(--zn-text-secondary);">Untitled Report</span>
        </div>
      </div>
      <div style="display: flex; gap: var(--zn-spacing-sm);">
        <zn-button color="secondary">Save Draft</zn-button>
        <zn-button icon="download">Export</zn-button>
      </div>
    </div>

    <zn-sidebar>
      <!-- Configuration Panel -->
      <div slot="side" style="padding: var(--zn-spacing-md); border-right: 1px solid var(--zn-color-neutral-200);">
        <zn-sp>
          <zn-panel caption="Data Source">
            <zn-select label="Select data" value="orders">
              <zn-option value="orders">Orders</zn-option>
              <zn-option value="customers">Customers</zn-option>
              <zn-option value="products">Products</zn-option>
              <zn-option value="traffic">Website Traffic</zn-option>
            </zn-select>
          </zn-panel>

          <zn-panel caption="Time Range">
            <zn-sp>
              <zn-select label="Period" value="last30">
                <zn-option value="last7">Last 7 days</zn-option>
                <zn-option value="last30">Last 30 days</zn-option>
                <zn-option value="last90">Last 90 days</zn-option>
                <zn-option value="ytd">Year to date</zn-option>
                <zn-option value="custom">Custom range</zn-option>
              </zn-select>
              <zn-select label="Granularity" value="day">
                <zn-option value="hour">Hourly</zn-option>
                <zn-option value="day">Daily</zn-option>
                <zn-option value="week">Weekly</zn-option>
                <zn-option value="month">Monthly</zn-option>
              </zn-select>
            </zn-sp>
          </zn-panel>

          <zn-panel caption="Metrics">
            <zn-checkbox-group>
              <zn-checkbox value="revenue" checked>Revenue</zn-checkbox>
              <zn-checkbox value="orders" checked>Order Count</zn-checkbox>
              <zn-checkbox value="aov">Avg. Order Value</zn-checkbox>
              <zn-checkbox value="customers">Customers</zn-checkbox>
              <zn-checkbox value="units">Units Sold</zn-checkbox>
            </zn-checkbox-group>
          </zn-panel>

          <zn-panel caption="Group By">
            <zn-select label="Dimension" value="channel">
              <zn-option value="none">No grouping</zn-option>
              <zn-option value="channel">Sales Channel</zn-option>
              <zn-option value="product">Product Category</zn-option>
              <zn-option value="region">Region</zn-option>
              <zn-option value="customer">Customer Type</zn-option>
            </zn-select>
          </zn-panel>

          <zn-panel caption="Visualization">
            <zn-sp>
              <div>
                <label style="display: block; margin-bottom: var(--zn-spacing-xs); font-weight: 500;">Chart Type</label>
                <zn-button-group>
                  <zn-button size="small" icon="show_chart" color="secondary"></zn-button>
                  <zn-button size="small" icon="bar_chart" color="transparent"></zn-button>
                  <zn-button size="small" icon="pie_chart" color="transparent"></zn-button>
                  <zn-button size="small" icon="table_chart" color="transparent"></zn-button>
                </zn-button-group>
              </div>
              <zn-item label="Show trend line" description="Display trend overlay">
                <zn-toggle slot="actions" checked></zn-toggle>
              </zn-item>
              <zn-item label="Show data labels" description="Display values on chart">
                <zn-toggle slot="actions"></zn-toggle>
              </zn-item>
            </zn-sp>
          </zn-panel>
        </zn-sp>
      </div>

      <!-- Main Preview Area -->
      <zn-container padded style="background: var(--zn-color-neutral-50);">
        <zn-sp>
          <!-- Filters Section -->
          <zn-panel caption="Filters">
            <zn-query-builder>
              <zn-query-builder-group>
                <zn-query-builder-rule>
                  <zn-select slot="field" value="status" size="small">
                    <zn-option value="status">Order Status</zn-option>
                    <zn-option value="channel">Channel</zn-option>
                    <zn-option value="amount">Amount</zn-option>
                  </zn-select>
                  <zn-select slot="operator" value="equals" size="small">
                    <zn-option value="equals">equals</zn-option>
                    <zn-option value="not_equals">not equals</zn-option>
                    <zn-option value="contains">contains</zn-option>
                  </zn-select>
                  <zn-select slot="value" value="completed" size="small">
                    <zn-option value="completed">Completed</zn-option>
                    <zn-option value="pending">Pending</zn-option>
                    <zn-option value="cancelled">Cancelled</zn-option>
                  </zn-select>
                </zn-query-builder-rule>
                <zn-query-builder-rule>
                  <zn-select slot="field" value="amount" size="small">
                    <zn-option value="status">Order Status</zn-option>
                    <zn-option value="channel">Channel</zn-option>
                    <zn-option value="amount">Amount</zn-option>
                  </zn-select>
                  <zn-select slot="operator" value="greater" size="small">
                    <zn-option value="equals">equals</zn-option>
                    <zn-option value="greater">greater than</zn-option>
                    <zn-option value="less">less than</zn-option>
                  </zn-select>
                  <zn-input slot="value" type="number" value="100" size="small" style="width: 100px;"></zn-input>
                </zn-query-builder-rule>
              </zn-query-builder-group>
            </zn-query-builder>
          </zn-panel>

          <!-- Chart Preview -->
          <zn-panel caption="Preview" description="Revenue and Orders by Sales Channel">
            <zn-chart
              type="line"
              height="350"
              series='[{"name": "Revenue", "data": [12500, 14200, 11800, 15600, 18200, 16500, 19800, 22100, 20500, 24200, 21800, 25500, 23200, 27800, 25100, 29500, 26800, 31200, 28500, 33500, 30200, 35800, 32500, 38200, 34800, 40500, 36200, 42800, 38500, 45200]}, {"name": "Orders", "data": [85, 92, 78, 105, 118, 108, 132, 145, 138, 158, 148, 168, 155, 182, 172, 195, 178, 208, 192, 225, 205, 242, 218, 258, 235, 275, 248, 292, 265, 310]}]'
              categories='["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]'>
            </zn-chart>
          </zn-panel>

          <!-- Summary Stats -->
          <zn-cols layout="1,1,1,1">
            <zn-stat caption="Total Revenue" value="$847,500"></zn-stat>
            <zn-stat caption="Total Orders" value="5,847"></zn-stat>
            <zn-stat caption="Avg. Order Value" value="$145"></zn-stat>
            <zn-stat caption="Growth" value="+24.5%" trend="up"></zn-stat>
          </zn-cols>

          <!-- Export Options -->
          <zn-panel caption="Export Options">
            <div style="display: flex; gap: var(--zn-spacing-md); flex-wrap: wrap;">
              <zn-button color="secondary" icon="picture_as_pdf">Export PDF</zn-button>
              <zn-button color="secondary" icon="grid_on">Export CSV</zn-button>
              <zn-button color="secondary" icon="image">Export PNG</zn-button>
              <zn-button color="secondary" icon="schedule">Schedule Report</zn-button>
            </div>
          </zn-panel>
        </zn-sp>
      </zn-container>
    </zn-sidebar>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-query-builder`, `zn-query-builder-group`, `zn-query-builder-rule`, `zn-chart`, `zn-stat`, `zn-select`, `zn-checkbox-group`, `zn-toggle`, `zn-button-group`, `zn-sidebar`, `zn-panel`
