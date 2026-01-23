---
meta:
  title: Stat
  description: Stats display key metrics, KPIs, and statistics with optional comparison indicators and formatting options.
layout: component
---

```html:preview
<zn-stat caption="Total Revenue" description="This month" amount="48250" previous="42100" currency="$" show-delta></zn-stat>
```

## Examples

### Basic Stat

A basic stat displays a caption, description, and amount.

```html:preview
<zn-stat caption="Total Users" description="Active accounts" amount="1247"></zn-stat>
```

### Currency Formatting

Use the `currency` attribute to automatically format monetary values with proper comma separators and decimal places.

```html:preview
<zn-cols>
  <zn-stat caption="Monthly Revenue" description="January 2026" amount="125750.50" currency="$" color="success"></zn-stat>
  <zn-stat caption="Total Sales" description="This quarter" amount="487999.99" currency="$" color="info"></zn-stat>
  <zn-stat caption="Outstanding Balance" description="Accounts receivable" amount="23450" currency="$" color="warning"></zn-stat>
</zn-cols>
```

### Percentage Values

Use `type="percent"` to display percentage metrics.

```html:preview
<zn-cols>
  <zn-stat caption="Conversion Rate" description="Last 30 days" amount="4.8" type="percent" color="success"></zn-stat>
  <zn-stat caption="Bounce Rate" description="Website visitors" amount="32.5" type="percent" color="warning"></zn-stat>
  <zn-stat caption="Growth" description="Year over year" amount="127.3" type="percent" color="info"></zn-stat>
</zn-cols>
```

### Time Duration

Use `type="time"` to display time values in seconds, which will be formatted as HH:MM:SS or MM:SS.

```html:preview
<zn-cols>
  <zn-stat caption="Avg. Session Time" description="User engagement" amount="245" type="time" color="info"></zn-stat>
  <zn-stat caption="Processing Time" description="Last job" amount="3665" type="time" color="success"></zn-stat>
  <zn-stat caption="Response Time" description="API average" amount="45" type="time" color="primary"></zn-stat>
</zn-cols>
```

### Delta Comparison

Use the `show-delta` attribute with `previous` to show the percentage change from a previous period.

```html:preview
<zn-cols>
  <zn-stat caption="New Users" description="This week" amount="324" previous="280" show-delta color="success"></zn-stat>
  <zn-stat caption="Revenue" description="This month" amount="45600" previous="52300" currency="$" show-delta color="error"></zn-stat>
  <zn-stat caption="Conversion Rate" description="Last 30 days" amount="3.2" previous="3.2" type="percent" show-delta color="neutral"></zn-stat>
</zn-cols>
```

### Color Variants

Use the `color` attribute to set the semantic color of the stat. Available colors: `primary`, `error`, `info`, `warning`, `success`, and `neutral`.

```html:preview
<zn-cols>
  <zn-stat caption="Active" description="Status" amount="99.8" type="percent" color="primary"></zn-stat>
  <zn-stat caption="Critical Errors" description="Last hour" amount="3" color="error"></zn-stat>
  <zn-stat caption="Notifications" description="Unread" amount="24" color="info"></zn-stat>
  <zn-stat caption="Warnings" description="System alerts" amount="7" color="warning"></zn-stat>
  <zn-stat caption="Completed" description="Tasks today" amount="42" color="success"></zn-stat>
  <zn-stat caption="Pending" description="In queue" amount="156" color="neutral"></zn-stat>
</zn-cols>
```

### Dashboard KPIs

A common use case is displaying multiple KPIs in a dashboard layout.

```html:preview
<zn-cols>
  <zn-stat
    caption="Total Revenue"
    description="All time"
    amount="2847500"
    previous="2650000"
    currency="$"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Active Customers"
    description="Current subscribers"
    amount="4582"
    previous="4201"
    show-delta
    color="info">
  </zn-stat>

  <zn-stat
    caption="Avg Order Value"
    description="Last 30 days"
    amount="127.50"
    previous="115.80"
    currency="$"
    show-delta
    color="primary">
  </zn-stat>

  <zn-stat
    caption="Satisfaction Rate"
    description="Customer feedback"
    amount="94.7"
    previous="92.3"
    type="percent"
    show-delta
    color="success">
  </zn-stat>
</zn-cols>
```

### Sales Metrics

Display sales-related statistics with currency formatting.

```html:preview
<zn-cols>
  <zn-stat
    caption="Today's Sales"
    description="Updated 5 min ago"
    amount="12450.75"
    currency="$"
    color="success">
  </zn-stat>

  <zn-stat
    caption="This Week"
    description="7 day total"
    amount="84922"
    previous="78100"
    currency="$"
    show-delta
    color="info">
  </zn-stat>

  <zn-stat
    caption="This Month"
    description="Month to date"
    amount="342678.50"
    previous="298450"
    currency="$"
    show-delta
    color="primary">
  </zn-stat>

  <zn-stat
    caption="Annual Goal"
    description="78% complete"
    amount="3847250"
    currency="$"
    color="warning">
  </zn-stat>
</zn-cols>
```

### Performance Metrics

Track system or application performance indicators.

```html:preview
<zn-cols>
  <zn-stat
    caption="Uptime"
    description="Last 30 days"
    amount="99.97"
    type="percent"
    color="success">
  </zn-stat>

  <zn-stat
    caption="API Response"
    description="Average latency"
    amount="127"
    type="time"
    color="info">
  </zn-stat>

  <zn-stat
    caption="Error Rate"
    description="Last 24 hours"
    amount="0.08"
    previous="0.12"
    type="percent"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Queue Time"
    description="Processing delay"
    amount="43"
    previous="28"
    type="time"
    show-delta
    color="warning">
  </zn-stat>
</zn-cols>
```

### User Engagement

Display user-related metrics and engagement statistics.

```html:preview
<zn-cols>
  <zn-stat
    caption="Page Views"
    description="Last 7 days"
    amount="847523"
    previous="792100"
    show-delta
    color="info">
  </zn-stat>

  <zn-stat
    caption="Unique Visitors"
    description="This week"
    amount="34782"
    previous="31245"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Avg. Session"
    description="User engagement"
    amount="342"
    previous="298"
    type="time"
    show-delta
    color="primary">
  </zn-stat>

  <zn-stat
    caption="Return Rate"
    description="Returning users"
    amount="64.8"
    previous="62.1"
    type="percent"
    show-delta
    color="success">
  </zn-stat>
</zn-cols>
```

### E-commerce Dashboard

A complete e-commerce metrics dashboard.

```html:preview
<zn-cols>
  <zn-stat
    caption="Orders Today"
    description="Real-time"
    amount="147"
    previous="132"
    show-delta
    color="primary">
  </zn-stat>

  <zn-stat
    caption="Cart Abandonment"
    description="Last 24 hours"
    amount="28.4"
    previous="31.7"
    type="percent"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Inventory Value"
    description="Current stock"
    amount="487250"
    currency="$"
    color="info">
  </zn-stat>

  <zn-stat
    caption="Refund Rate"
    description="This month"
    amount="2.3"
    previous="1.8"
    type="percent"
    show-delta
    color="warning">
  </zn-stat>
</zn-cols>
```

### Financial Summary

Display financial metrics with appropriate formatting.

```html:preview
<zn-cols>
  <zn-stat
    caption="Net Profit"
    description="Q4 2025"
    amount="847500.25"
    previous="792340.50"
    currency="$"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Operating Costs"
    description="This quarter"
    amount="234890"
    previous="248750"
    currency="$"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Profit Margin"
    description="After expenses"
    amount="28.4"
    previous="26.7"
    type="percent"
    show-delta
    color="primary">
  </zn-stat>

  <zn-stat
    caption="Cash Flow"
    description="Monthly average"
    amount="142750"
    currency="$"
    color="info">
  </zn-stat>
</zn-cols>
```

### SaaS Metrics

Key metrics for SaaS businesses.

```html:preview
<zn-cols>
  <zn-stat
    caption="MRR"
    description="Monthly recurring revenue"
    amount="284750"
    previous="267890"
    currency="$"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Churn Rate"
    description="Customer attrition"
    amount="3.2"
    previous="4.1"
    type="percent"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="CAC"
    description="Customer acquisition cost"
    amount="127.50"
    previous="142.80"
    currency="$"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="LTV:CAC"
    description="Lifetime value ratio"
    amount="4.8"
    previous="4.2"
    show-delta
    color="info">
  </zn-stat>
</zn-cols>
```

### Marketing Campaign

Track marketing campaign performance.

```html:preview
<zn-cols>
  <zn-stat
    caption="Impressions"
    description="Campaign reach"
    amount="1847523"
    previous="1592340"
    show-delta
    color="info">
  </zn-stat>

  <zn-stat
    caption="Click Rate"
    description="CTR"
    amount="3.8"
    previous="2.9"
    type="percent"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Cost Per Click"
    description="Average CPC"
    amount="1.42"
    previous="1.68"
    currency="$"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="ROAS"
    description="Return on ad spend"
    amount="487"
    previous="412"
    type="percent"
    show-delta
    color="primary">
  </zn-stat>
</zn-cols>
```

### Support Dashboard

Display customer support metrics.

```html:preview
<zn-cols>
  <zn-stat
    caption="Open Tickets"
    description="Requires attention"
    amount="47"
    previous="62"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Avg Response Time"
    description="First reply"
    amount="892"
    previous="1247"
    type="time"
    show-delta
    color="success">
  </zn-stat>

  <zn-stat
    caption="Resolution Rate"
    description="First contact"
    amount="78.4"
    previous="73.2"
    type="percent"
    show-delta
    color="info">
  </zn-stat>

  <zn-stat
    caption="Satisfaction"
    description="CSAT score"
    amount="94.7"
    previous="92.1"
    type="percent"
    show-delta
    color="success">
  </zn-stat>
</zn-cols>
```

### Status Overview

Simple status indicators without delta comparisons.

```html:preview
<zn-cols>
  <zn-stat
    caption="System Status"
    description="All systems operational"
    amount="100"
    type="percent"
    color="success">
  </zn-stat>

  <zn-stat
    caption="Active Sessions"
    description="Current users"
    amount="1847"
    color="info">
  </zn-stat>

  <zn-stat
    caption="Queue Length"
    description="Pending jobs"
    amount="23"
    color="warning">
  </zn-stat>

  <zn-stat
    caption="Failed Jobs"
    description="Requires intervention"
    amount="2"
    color="error">
  </zn-stat>
</zn-cols>
```

### Large Numbers

Stats automatically format large numbers with currency symbols.

```html:preview
<zn-cols>
  <zn-stat
    caption="Total Valuation"
    description="Company worth"
    amount="12500000"
    currency="$"
    color="primary">
  </zn-stat>

  <zn-stat
    caption="Total Users"
    description="Platform wide"
    amount="8472831"
    color="info">
  </zn-stat>

  <zn-stat
    caption="Transactions"
    description="All time"
    amount="24789532"
    color="success">
  </zn-stat>
</zn-cols>
```

