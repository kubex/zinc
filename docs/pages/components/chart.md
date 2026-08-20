---
meta:
  title: Data Chart
  description: Charts visualize data using line, bar, area, circular, statistical, hierarchical, and flow layouts powered by Apache ECharts.
layout: component
---

```html:preview
<zn-chart
  type="area"
  smooth
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;,&quot;Jul&quot;,&quot;Aug&quot;,&quot;Sep&quot;]"
  data="[{&quot;name&quot;:&quot;Series 1&quot;,&quot;data&quot;:[30,40,45,50,49,60,70,91,125]}]"
  height="300">
</zn-chart>
```

:::tip
The chart component is built on Apache ECharts, providing a powerful and flexible charting library with extensive customisation options. Visit the [Apache ECharts documentation](https://echarts.apache.org/en/option.html) for advanced configuration reference.
:::

## Examples

### Basic Line Chart

Use `type="line"` to create a line chart. The `data` attribute accepts an array of series objects, and `categories` defines the x-axis labels.

```html:preview
<zn-chart
  type="line"
  scale
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
  smooth
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
  scale
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
  scale
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;]"
  data="[{&quot;name&quot;:&quot;Small Markers&quot;,&quot;data&quot;:[30,40,35,50,49]}]"
  d-size="1"
  height="250">
</zn-chart>
<br />
<zn-chart
  type="line"
  scale
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

Use the `xaxis` attribute to specify the x-axis type. Common values include `datetime`, `category`, and `numeric`.

```html:preview
<zn-chart
  type="line"
  xaxis="datetime"
  data="[{&quot;name&quot;:&quot;Traffic&quot;,&quot;data&quot;:[{&quot;x&quot;:1609459200000,&quot;y&quot;:30},{&quot;x&quot;:1612137600000,&quot;y&quot;:40},{&quot;x&quot;:1614556800000,&quot;y&quot;:35},{&quot;x&quot;:1617235200000,&quot;y&quot;:50},{&quot;x&quot;:1619827200000,&quot;y&quot;:49},{&quot;x&quot;:1622505600000,&quot;y&quot;:60}]}]"
  height="300">
</zn-chart>
```

:::tip
When using `xaxis="datetime"`, provide data in the format `[{x: timestamp, y: value}]` where `x` is a Unix timestamp in milliseconds. The chart will automatically format the dates on the x-axis.
:::

### Enable Animations

By default, animations are disabled for better performance. Add the `enable-animations` attribute to animate on first render — bars grow from the baseline and lines draw in. Pass a number (milliseconds) to control the duration; bare `enable-animations` defaults to `1500`.

```html:preview
<zn-chart
  type="bar"
  categories="[&quot;A&quot;,&quot;B&quot;,&quot;C&quot;,&quot;D&quot;,&quot;E&quot;]"
  data="[{&quot;name&quot;:&quot;Values&quot;,&quot;data&quot;:[44,55,41,37,52]}]"
  enable-animations="2500"
  height="300">
</zn-chart>
```

### Smooth Lines

Add the `smooth` attribute to render line and area charts with curved segments instead of straight ones. Ignored for bar and sankey charts.

```html:preview
<zn-chart
  type="line"
  smooth
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;]"
  data="[{&quot;name&quot;:&quot;Revenue&quot;,&quot;data&quot;:[30,40,35,50,49,60]}]"
  height="300">
</zn-chart>
```

### Scaled Y-Axis

By default the y-axis starts at `0`. Add the `scale` attribute to adapt the y-axis to the data range — useful when values are clustered far from zero and you want to emphasise variation.

```html:preview
<zn-chart
  type="line"
  scale
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Temperature&quot;,&quot;data&quot;:[18,19,17,20,22]}]"
  y-axis-append="°C"
  height="300">
</zn-chart>
```

Pass a number to `scale` to add that percentage of padding on top and bottom of the data range (e.g. `scale="10"` adds 10% padding). Larger values make the axis "breathe" more around the data.

```html:preview
<zn-chart
  type="line"
  scale="10"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Temperature&quot;,&quot;data&quot;:[18,19,17,20,22]}]"
  y-axis-append="°C"
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

### Sankey Diagram

Use `type="sankey"` to render a Sankey flow diagram. Each item in the series `data` array is an edge with `source`, `target`, and `value`. Nodes are auto-derived from unique source/target values.

```html:preview
<zn-chart
  type="sankey"
  height="400"
  data="[{&quot;name&quot;:&quot;Payment Flow&quot;,&quot;data&quot;:[{&quot;source&quot;:&quot;Stripe&quot;,&quot;target&quot;:&quot;USD&quot;,&quot;value&quot;:1200},{&quot;source&quot;:&quot;Stripe&quot;,&quot;target&quot;:&quot;EUR&quot;,&quot;value&quot;:430},{&quot;source&quot;:&quot;USD&quot;,&quot;target&quot;:&quot;Captured&quot;,&quot;value&quot;:900},{&quot;source&quot;:&quot;USD&quot;,&quot;target&quot;:&quot;Declined&quot;,&quot;value&quot;:300},{&quot;source&quot;:&quot;EUR&quot;,&quot;target&quot;:&quot;Captured&quot;,&quot;value&quot;:380},{&quot;source&quot;:&quot;EUR&quot;,&quot;target&quot;:&quot;Declined&quot;,&quot;value&quot;:50}]}]">
</zn-chart>
```

### Pie Chart

Use `type="pie"` for part-to-whole data. The first series supplies the slice values and `categories` supplies their
names.

```html:preview
<zn-chart
  type="pie"
  categories="[&quot;Configuration suggestion&quot;,&quot;Insecure configuration&quot;]"
  data="[{&quot;name&quot;:&quot;Insights&quot;,&quot;data&quot;:[8,1]}]"
  height="300">
</zn-chart>
```

### Donut Chart

Use `type="donut"` for a pie chart with a hollow centre. Adjust the ring with `inner-radius` and `outer-radius`; both
accept an ECharts pixel value or percentage. Add `show-labels` to render labels beside the slices.

```html:preview
<zn-chart
  type="donut"
  inner-radius="45%"
  outer-radius="75%"
  colors="[&quot;#ffe29a&quot;,&quot;#f78ab3&quot;]"
  categories="[&quot;Configuration suggestion&quot;,&quot;Insecure configuration&quot;]"
  data="[{&quot;name&quot;:&quot;Insights&quot;,&quot;data&quot;:[8,1]}]"
  height="300">
</zn-chart>
```

### Scatter Chart

Use `type="scatter"` with `[x, y]` coordinate pairs. `d-size` controls point size, and `xaxis="datetime"` can be used
for time-based scatter plots.

```html:preview
<zn-chart
  type="scatter"
  d-size="14"
  data="[{&quot;name&quot;:&quot;Latency&quot;,&quot;data&quot;:[[12,110],[24,180],[38,140],[52,260],[70,220]]}]"
  height="300">
</zn-chart>
```

### Radar Chart

Use `type="radar"` with an `indicators` array describing each axis. Each normal series becomes one radar shape.

```html:preview
<zn-chart
  type="radar"
  indicators="[{&quot;name&quot;:&quot;Security&quot;,&quot;max&quot;:100},{&quot;name&quot;:&quot;Performance&quot;,&quot;max&quot;:100},{&quot;name&quot;:&quot;Reliability&quot;,&quot;max&quot;:100},{&quot;name&quot;:&quot;Usability&quot;,&quot;max&quot;:100}]"
  data="[{&quot;name&quot;:&quot;Current&quot;,&quot;data&quot;:[82,71,94,76]},{&quot;name&quot;:&quot;Target&quot;,&quot;data&quot;:[95,90,98,90]}]"
  height="320">
</zn-chart>
```

### Gauge Chart

Use `type="gauge"` for a single current value. `min-value`, `max-value`, and `y-axis-append` configure its range and
displayed unit.

```html:preview
<zn-chart
  type="gauge"
  min-value="0"
  max-value="100"
  y-axis-append="%"
  data="[{&quot;name&quot;:&quot;Security score&quot;,&quot;data&quot;:[82]}]"
  height="300">
</zn-chart>
```

### Funnel Chart

Use `type="funnel"` for ordered stages. Numeric values pair with `categories`, using the same compact format as pie
charts.

```html:preview
<zn-chart
  type="funnel"
  categories="[&quot;Visitors&quot;,&quot;Trials&quot;,&quot;Customers&quot;]"
  data="[{&quot;name&quot;:&quot;Conversion&quot;,&quot;data&quot;:[1000,320,85]}]"
  height="320">
</zn-chart>
```

### Heatmap Chart

Use `type="heatmap"` with x-axis `categories`, `y-categories`, and `[xIndex, yIndex, value]` data points. The visual
range is derived from the values unless `min-value` or `max-value` is provided.

```html:preview
<zn-chart
  type="heatmap"
  show-labels
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  y-categories="[&quot;API&quot;,&quot;Web&quot;,&quot;Worker&quot;]"
  data="[{&quot;name&quot;:&quot;Requests&quot;,&quot;data&quot;:[[0,0,5],[1,0,12],[2,0,8],[3,0,16],[4,0,11],[0,1,9],[1,1,15],[2,1,12],[3,1,20],[4,1,14],[0,2,3],[1,2,7],[2,2,5],[3,2,10],[4,2,8]]}]"
  height="320">
</zn-chart>
```

### Treemap Chart

Use `type="treemap"` with hierarchical `children` data to compare nested values by area.

```html:preview
<zn-chart
  type="treemap"
  data="[{&quot;name&quot;:&quot;Insights&quot;,&quot;data&quot;:[{&quot;name&quot;:&quot;Security&quot;,&quot;children&quot;:[{&quot;name&quot;:&quot;Configuration&quot;,&quot;value&quot;:8},{&quot;name&quot;:&quot;Insecure&quot;,&quot;value&quot;:1}]},{&quot;name&quot;:&quot;Performance&quot;,&quot;value&quot;:4}]}]"
  height="320">
</zn-chart>
```

### Sunburst Chart

Use `type="sunburst"` for radial hierarchical data. `inner-radius` and `outer-radius` adjust the occupied area.

```html:preview
<zn-chart
  type="sunburst"
  outer-radius="90%"
  data="[{&quot;name&quot;:&quot;Insights&quot;,&quot;data&quot;:[{&quot;name&quot;:&quot;Security&quot;,&quot;children&quot;:[{&quot;name&quot;:&quot;Configuration&quot;,&quot;value&quot;:8},{&quot;name&quot;:&quot;Insecure&quot;,&quot;value&quot;:1}]},{&quot;name&quot;:&quot;Performance&quot;,&quot;children&quot;:[{&quot;name&quot;:&quot;Latency&quot;,&quot;value&quot;:4}]}]}]"
  height="340">
</zn-chart>
```

### Cross-Chart Tooltip Sync

Use `sync-group="<id>"` on two or more charts to synchronise hover tooltips, zoom, and legend selection across them.

```html:preview
<zn-chart
  sync-group="demo-group"
  type="line"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Visits&quot;,&quot;data&quot;:[120,180,150,220,190]}]"
  height="250">
</zn-chart>
<br />
<zn-chart
  sync-group="demo-group"
  type="bar"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Signups&quot;,&quot;data&quot;:[12,18,15,22,19]}]"
  height="250">
</zn-chart>
```

### Custom Colors

Use the `colors` attribute to set the palette that cycles across series.

```html:preview
<zn-chart
  type="bar"
  colors="[&quot;#ff6c9c&quot;,&quot;#6483F2&quot;,&quot;#29bab5&quot;]"
  categories="[&quot;Q1&quot;,&quot;Q2&quot;,&quot;Q3&quot;]"
  data="[{&quot;name&quot;:&quot;A&quot;,&quot;data&quot;:[10,20,30]},{&quot;name&quot;:&quot;B&quot;,&quot;data&quot;:[15,25,35]},{&quot;name&quot;:&quot;C&quot;,&quot;data&quot;:[20,30,40]}]"
  height="300">
</zn-chart>
```

For a specific series colour, add a `color` property to the series object in the `data` array:

```html:preview
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;]"
  data="[{&quot;name&quot;:&quot;Revenue&quot;,&quot;color&quot;:&quot;hsl(210,70%,50%)&quot;,&quot;data&quot;:[10,20,30]}]"
  height="300">
</zn-chart>
```

### Dark Mode Support

The chart component automatically adapts to dark mode using the `t` attribute. The theme adjusts colors, gridlines, and text to match the current theme.

```html:preview
<zn-chart
  t="dark"
  type="area"
  scale
  smooth
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
  scale
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

When using `xaxis="datetime"`, use the coordinate format:

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

### Sankey Edge Format

When `type="sankey"`, each item in the series `data` array is an edge:

```json
[{
  "name": "Flow",
  "data": [
    {"source": "A", "target": "B", "value": 100},
    {"source": "A", "target": "C", "value": 50}
  ]
}]
```

Nodes are auto-derived from unique source/target values. To customise node appearance or ordering, include an explicit `nodes` key on the series object.

### Pie and Donut Data

Pie and donut charts use the first series. The standard numeric format pairs each value with the category at the same
index. You can alternatively pass ECharts-style named slices when each slice needs its own metadata or colour:

```json
[{
  "name": "Insights",
  "data": [
    {"name": "Configuration suggestion", "value": 8, "color": "#ffe29a"},
    {"name": "Insecure configuration", "value": 1, "color": "#f78ab3"}
  ]
}]
```

### Specialized Data Formats

- Scatter points use `[x, y]` or `{ "x": value, "y": value }`.
- Radar charts accept an `indicators` array of `{ "name": string, "min"?: number, "max"?: number }`; each series
  contains one value per indicator.
- Gauge charts use the first value in the first series.
- Funnel charts accept the same numeric/category or named-value formats as pie charts.
- Heatmaps use `[xIndex, yIndex, value]` points with `categories` and `y-categories`.
- Treemaps and sunbursts accept hierarchical nodes containing `name`, optional `value`, and optional recursive
  `children`.

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
- **Pie Charts**: Useful for compact part-to-whole comparisons with a small number of slices
- **Donut Charts**: Useful when a pie chart needs a lighter visual weight or centred annotation space
- **Scatter Charts**: Show relationships, distributions, and clusters between two numeric dimensions
- **Radar Charts**: Compare a small number of entities across a shared set of metrics
- **Gauge Charts**: Display one value against a meaningful bounded range
- **Funnel Charts**: Show progressive reduction through ordered stages
- **Heatmaps**: Reveal density and patterns across two categorical dimensions
- **Treemaps**: Compare hierarchical values by area
- **Sunburst Charts**: Explore hierarchical proportions across radial levels
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
