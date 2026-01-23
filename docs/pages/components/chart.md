---
meta:
  title: Data Chart
  description: Charts visualize data using various chart types powered by ApexCharts. Display line charts, bar charts, area charts, and more with full customization options.
layout: component
---

```html:preview
<zn-chart
  type="area"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;,&quot;Jul&quot;,&quot;Aug&quot;,&quot;Sep&quot;]"
  data="[{&quot;name&quot;:&quot;Series 1&quot;,&quot;data&quot;:[30,40,45,50,49,60,70,91,125]}]"
  height="300">
</zn-chart>
```

:::tip
The chart component is built on ApexCharts, providing a powerful and flexible charting library with extensive customization options. Visit the [ApexCharts documentation](https://apexcharts.com/docs/) for advanced configuration options.
:::

## Examples

### Basic Line Chart

Use `type="line"` to create a line chart. The `data` attribute accepts an array of series objects, and `categories` defines the x-axis labels.

```html:preview
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;]"
  data="[{&quot;name&quot;:&quot;Revenue&quot;,&quot;data&quot;:[30,40,35,50,49,60]},{&quot;name&quot;:&quot;Expenses&quot;,&quot;data&quot;:[20,29,25,35,39,45]}]"
  height="300">
</zn-chart>
```

### Bar Chart

Use `type="bar"` to create a vertical bar chart. Perfect for comparing values across categories.

```html:preview
<zn-chart
  type="bar"
  categories="[&quot;Q1&quot;,&quot;Q2&quot;,&quot;Q3&quot;,&quot;Q4&quot;]"
  data="[{&quot;name&quot;:&quot;Sales&quot;,&quot;data&quot;:[44,55,57,56]},{&quot;name&quot;:&quot;Returns&quot;,&quot;data&quot;:[13,23,20,8]}]"
  height="300">
</zn-chart>
```

### Area Chart

Use `type="area"` to create an area chart with filled regions under the line.

```html:preview
<zn-chart
  type="area"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;,&quot;Sat&quot;,&quot;Sun&quot;]"
  data="[{&quot;name&quot;:&quot;Active Users&quot;,&quot;data&quot;:[150,200,180,220,240,280,260]}]"
  height="300">
</zn-chart>
```

### Multiple Series

Charts support multiple data series. Each series appears with its own color and legend entry.

```html:preview
<zn-chart
  type="line"
  categories="[&quot;Week 1&quot;,&quot;Week 2&quot;,&quot;Week 3&quot;,&quot;Week 4&quot;]"
  data="[{&quot;name&quot;:&quot;Product A&quot;,&quot;data&quot;:[45,52,48,61]},{&quot;name&quot;:&quot;Product B&quot;,&quot;data&quot;:[35,41,36,46]},{&quot;name&quot;:&quot;Product C&quot;,&quot;data&quot;:[25,28,32,38]}]"
  height="350">
</zn-chart>
```

### Stacked Bar Chart

Use the `stacked` attribute to create stacked bar charts where series are stacked on top of each other.

```html:preview
<zn-chart
  type="bar"
  stacked
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;]"
  data="[{&quot;name&quot;:&quot;Direct&quot;,&quot;data&quot;:[44,55,41,37,22]},{&quot;name&quot;:&quot;Referral&quot;,&quot;data&quot;:[53,32,33,52,13]},{&quot;name&quot;:&quot;Organic&quot;,&quot;data&quot;:[12,17,11,9,15]}]"
  height="300">
</zn-chart>
```

### Stacked Area Chart

Stacked area charts work similarly to stacked bar charts but with area fills.

```html:preview
<zn-chart
  type="area"
  stacked
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;]"
  data="[{&quot;name&quot;:&quot;Desktop&quot;,&quot;data&quot;:[300,400,350,500,490,600]},{&quot;name&quot;:&quot;Mobile&quot;,&quot;data&quot;:[200,290,250,350,390,450]},{&quot;name&quot;:&quot;Tablet&quot;,&quot;data&quot;:[100,150,120,180,170,200]}]"
  height="300">
</zn-chart>
```

### Chart Heights

Use the `height` attribute to control the chart's height in pixels. The default height is 300px.

```html:preview
<zn-chart
  type="bar"
  categories="[&quot;Small&quot;,&quot;Medium&quot;,&quot;Large&quot;]"
  data="[{&quot;name&quot;:&quot;Orders&quot;,&quot;data&quot;:[12,19,15]}]"
  height="200">
</zn-chart>
<br />
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;]"
  data="[{&quot;name&quot;:&quot;Sales&quot;,&quot;data&quot;:[40,55,45,60]}]"
  height="400">
</zn-chart>
```

### Data Point Markers

Use the `d-size` attribute to control the size of data point markers on line and area charts. Default size is 1.

```html:preview
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;]"
  data="[{&quot;name&quot;:&quot;Small Markers&quot;,&quot;data&quot;:[30,40,35,50,49]}]"
  d-size="1"
  height="250">
</zn-chart>
<br />
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;]"
  data="[{&quot;name&quot;:&quot;Large Markers&quot;,&quot;data&quot;:[30,40,35,50,49]}]"
  d-size="6"
  height="250">
</zn-chart>
```

### Y-Axis Formatting

Use `y-axis-append` to add a suffix to y-axis labels and tooltip values. Common uses include units like `%`, `$`, `K`, `M`, etc.

```html:preview
<zn-chart
  type="bar"
  categories="[&quot;Product A&quot;,&quot;Product B&quot;,&quot;Product C&quot;]"
  data="[{&quot;name&quot;:&quot;Market Share&quot;,&quot;data&quot;:[25,35,40]}]"
  y-axis-append="%"
  height="300">
</zn-chart>
<br />
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;]"
  data="[{&quot;name&quot;:&quot;Revenue&quot;,&quot;data&quot;:[100,120,115,140]}]"
  y-axis-append="K"
  height="300">
</zn-chart>
```

### Time Series with X-Axis Type

Use the `x-axis` attribute to specify the x-axis type. Common values include `datetime`, `category`, and `numeric`.

```html:preview
<zn-chart
  type="line"
  x-axis="datetime"
  data="[{&quot;name&quot;:&quot;Traffic&quot;,&quot;data&quot;:[{&quot;x&quot;:1609459200000,&quot;y&quot;:30},{&quot;x&quot;:1612137600000,&quot;y&quot;:40},{&quot;x&quot;:1614556800000,&quot;y&quot;:35},{&quot;x&quot;:1617235200000,&quot;y&quot;:50},{&quot;x&quot;:1619827200000,&quot;y&quot;:49},{&quot;x&quot;:1622505600000,&quot;y&quot;:60}]}]"
  height="300">
</zn-chart>
```

:::tip
When using `x-axis="datetime"`, provide data in the format `[{x: timestamp, y: value}]` where `x` is a Unix timestamp in milliseconds. The chart will automatically format the dates on the x-axis.
:::

### Enable Animations

By default, animations are disabled for better performance. Use the `enable-animations` attribute to enable chart animations.

```html:preview
<zn-chart
  type="bar"
  categories="[&quot;A&quot;,&quot;B&quot;,&quot;C&quot;,&quot;D&quot;,&quot;E&quot;]"
  data="[{&quot;name&quot;:&quot;Values&quot;,&quot;data&quot;:[44,55,41,37,52]}]"
  enable-animations
  height="300">
</zn-chart>
```

### Single Series Chart

For simple visualizations, use a single data series without multiple comparisons.

```html:preview
<zn-chart
  type="area"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;,&quot;Jul&quot;,&quot;Aug&quot;]"
  data="[{&quot;name&quot;:&quot;Page Views&quot;,&quot;data&quot;:[1200,1900,1500,2200,2400,2800,2600,3100]}]"
  height="300">
</zn-chart>
```

### Empty State

When no data is available, the chart will display an empty state. Consider adding custom messaging around the chart component.

```html:preview
<zn-chart
  type="line"
  categories="[]"
  data="[]"
  height="300">
</zn-chart>
```

### Dark Mode Support

The chart component automatically adapts to dark mode using the `t` attribute. The theme adjusts colors, gridlines, and text to match the current theme.

```html:preview
<zn-chart
  t="dark"
  type="area"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Series 1&quot;,&quot;data&quot;:[30,40,35,50,49]},{&quot;name&quot;:&quot;Series 2&quot;,&quot;data&quot;:[25,35,30,45,42]}]"
  height="300">
</zn-chart>
```

### Responsive Charts

Charts automatically resize to fit their container. The width adapts to the parent element while height is controlled by the `height` attribute.

```html:preview
<div style="width: 100%; max-width: 600px;">
  <zn-chart
    type="bar"
    categories="[&quot;Mobile&quot;,&quot;Desktop&quot;,&quot;Tablet&quot;]"
    data="[{&quot;name&quot;:&quot;Sessions&quot;,&quot;data&quot;:[450,680,320]}]"
    height="300">
  </zn-chart>
</div>
```

### Combining Different Configurations

You can combine various attributes to create rich, informative charts.

```html:preview
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;,&quot;Jul&quot;,&quot;Aug&quot;]"
  data="[{&quot;name&quot;:&quot;Target&quot;,&quot;data&quot;:[80,85,82,90,88,95,92,98]},{&quot;name&quot;:&quot;Actual&quot;,&quot;data&quot;:[75,82,78,88,91,97,94,102]}]"
  d-size="4"
  y-axis-append="%"
  height="350"
  enable-animations>
</zn-chart>
```

## Data Format

The chart component accepts data in JSON format through the `data` attribute. The data should be an array of series objects.

### Basic Series Format

```json
[
  {
    "name": "Series Name",
    "data": [10, 20, 30, 40, 50]
  }
]
```

### Multiple Series Format

```json
[
  {
    "name": "Series 1",
    "data": [10, 20, 30, 40, 50]
  },
  {
    "name": "Series 2",
    "data": [15, 25, 35, 45, 55]
  }
]
```

### Time Series Format

When using `x-axis="datetime"`, use the coordinate format:

```json
[
  {
    "name": "Time Series",
    "data": [
      {"x": 1609459200000, "y": 30},
      {"x": 1612137600000, "y": 40},
      {"x": 1614556800000, "y": 35}
    ]
  }
]
```

### HTML Encoding

When using the data attribute in HTML, JSON must be properly encoded. Use `&quot;` for quotes:

```html
<zn-chart
  data="[{&quot;name&quot;:&quot;Sales&quot;,&quot;data&quot;:[10,20,30]}]"
  categories="[&quot;A&quot;,&quot;B&quot;,&quot;C&quot;]">
</zn-chart>
```

## JavaScript API

You can also interact with the chart component using JavaScript:

```javascript
// Get chart element
const chart = document.querySelector('zn-chart');

// Set data programmatically
chart.data = [
  { name: 'Series 1', data: [10, 20, 30, 40] }
];

// Set categories
chart.categories = ['Q1', 'Q2', 'Q3', 'Q4'];

// Change chart type
chart.type = 'bar';

// Update height
chart.height = 400;

// Enable animations
chart.enableAnimations = true;
```

## Best Practices

### Choosing Chart Types

- **Line Charts**: Best for showing trends over time or continuous data
- **Bar Charts**: Ideal for comparing discrete categories or values
- **Area Charts**: Good for showing cumulative totals or part-to-whole relationships over time
- **Stacked Charts**: Use when showing how categories contribute to a total

### Performance Considerations

- Keep the number of data points reasonable (under 1000 points for optimal performance)
- Disable animations by default for better initial render performance
- Use appropriate chart heights based on the amount of data being displayed
- Consider using the `live` mode only when necessary, as it can impact performance

### Accessibility

- Ensure chart data is also available in an accessible format (table, list, etc.)
- Use descriptive series names that clearly identify the data
- Choose appropriate colors that provide sufficient contrast
- Consider adding supplementary text descriptions for complex charts

### Data Formatting

- Use consistent units across related charts
- Round values appropriately for readability
- Use `y-axis-append` to add units or symbols to values
- Format dates consistently when using time series data


