---
meta:
  title: Priority List
  description: Priority lists allow users to reorder items via drag-and-drop or keyboard, assigning a numerical priority to each position.
layout: component
---

## Examples

### Basic Priority List

Use the `label` attribute to give the list an accessible label. Each child element must have a `value` attribute that
uniquely identifies it.

```html:preview
<zn-priority-list label="Task Priority">
  <div value="bug-fixes">Bug Fixes</div>
  <div value="new-features">New Features</div>
  <div value="documentation">Documentation</div>
  <div value="testing">Testing</div>
</zn-priority-list>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Help Text

Add descriptive help text with the `help-text` attribute. For help text that contains HTML, use the `help-text` slot
instead.

```html:preview
<zn-priority-list label="Deployment Order" help-text="Drag items to set the deployment sequence">
  <div value="database">Database Migrations</div>
  <div value="backend">Backend Services</div>
  <div value="frontend">Frontend App</div>
  <div value="cdn">CDN Cache Invalidation</div>
</zn-priority-list>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

```html:preview
<zn-priority-list label="Processing Order" label-tooltip="Items will be processed from highest to lowest priority" help-text="Drag to reorder">
  <div value="validation">Input Validation</div>
  <div value="transform">Data Transformation</div>
  <div value="enrichment">Data Enrichment</div>
  <div value="storage">Storage</div>
</zn-priority-list>
```

### Initial Order

Use the `order` attribute to define the initial display order as a comma-separated list of item keys. Items not listed
in `order` are appended at the end in their DOM order.

```html:preview
<zn-priority-list label="Release Pipeline" order="testing,staging,production,development">
  <div value="development">Development</div>
  <div value="testing">Testing</div>
  <div value="staging">Staging</div>
  <div value="production">Production</div>
</zn-priority-list>
```

### Custom Priority Start

Use the `priority-start` attribute to change the starting priority number. This is useful when priorities don't start at
1.

```html:preview
<zn-priority-list label="Priority Queue" priority-start="0">
  <div value="critical">Critical</div>
  <div value="high">High</div>
  <div value="medium">Medium</div>
  <div value="low">Low</div>
</zn-priority-list>
```

### Sizes

Use the `size` attribute to change the size of the list items.

```html:preview
<zn-priority-list label="Small" size="small">
  <div value="a">Item A</div>
  <div value="b">Item B</div>
  <div value="c">Item C</div>
</zn-priority-list>
<br />
<zn-priority-list label="Medium" size="medium">
  <div value="a">Item A</div>
  <div value="b">Item B</div>
  <div value="c">Item C</div>
</zn-priority-list>
<br />
<zn-priority-list label="Large" size="large">
  <div value="a">Item A</div>
  <div value="b">Item B</div>
  <div value="c">Item C</div>
</zn-priority-list>
```

### Disabled

Use the `disabled` attribute to prevent reordering.

```html:preview
<zn-priority-list label="Locked Order" disabled>
  <div value="first">First</div>
  <div value="second">Second</div>
  <div value="third">Third</div>
</zn-priority-list>
```

### Rich Content

Slotted items can contain any HTML content, not just text.

```html:preview
<zn-priority-list label="Feature Roadmap">
  <div value="auth">
    <strong>Authentication</strong>
    <br /><small>OAuth2 + SSO integration</small>
  </div>
  <div value="dashboard">
    <strong>Dashboard</strong>
    <br /><small>Analytics and reporting</small>
  </div>
  <div value="api">
    <strong>Public API</strong>
    <br /><small>REST and GraphQL endpoints</small>
  </div>
  <div value="mobile">
    <strong>Mobile App</strong>
    <br /><small>iOS and Android support</small>
  </div>
</zn-priority-list>
```

### Item Actions

Use the `action-{value}` slot to add interactive elements (buttons, links, etc.) to the right side of each item. Actions are fully clickable and won't interfere with drag behaviour.

```html:preview
<zn-priority-list id="action-list" label="Task Queue">
  <div value="deploy">Deploy to Production</div>
  <zn-button slot="action-deploy" size="small" variant="text" theme="danger" onclick="this.closest('zn-priority-list').querySelector('[value=deploy]').remove()">
    <zn-icon src="delete" size="16"></zn-icon>
  </zn-button>

  <div value="review">Code Review</div>
  <zn-button slot="action-review" size="small" variant="text" theme="danger" onclick="this.closest('zn-priority-list').querySelector('[value=review]').remove()">
    <zn-icon src="delete" size="16"></zn-icon>
  </zn-button>

  <div value="test">Run Test Suite</div>
  <zn-button slot="action-test" size="small" variant="text" theme="danger" onclick="this.closest('zn-priority-list').querySelector('[value=test]').remove()">
    <zn-icon src="delete" size="16"></zn-icon>
  </zn-button>
</zn-priority-list>
```

### Form Submission

When a `name` is set, the component generates hidden inputs for each item as `name[itemValue]=priority`. This example
shows the submitted form data.

```html:preview
<form id="priority-form">
  <zn-priority-list name="priority" label="Reorder and Submit">
    <div value="alpha">Alpha</div>
    <div value="beta">Beta</div>
    <div value="gamma">Gamma</div>
  </zn-priority-list>
  <br />
  <zn-button type="submit">Submit</zn-button>
</form>

<br />
<pre id="priority-output">Submit the form to see the data</pre>

<script type="module">
  const form = document.getElementById('priority-form');
  const output = document.getElementById('priority-output');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    const entries = [...formData.entries()].map(([key, val]) => `${key} = ${val}`);
    output.textContent = entries.join('\n');
  });
</script>
```

### Listening for Changes

Use the `zn-reorder` event to react to order changes. Call `getPriorityMap()` on the component to get the current
priority assignments.

```html:preview
<zn-priority-list id="event-list" label="Reorder to see events">
  <div value="red">Red</div>
  <div value="green">Green</div>
  <div value="blue">Blue</div>
</zn-priority-list>

<br />
<pre id="event-output">Reorder items to see the priority map</pre>

<script type="module">
  const list = document.getElementById('event-list');
  const output = document.getElementById('event-output');

  list.addEventListener('zn-reorder', () => {
    const map = list.getPriorityMap();
    output.textContent = JSON.stringify(map, null, 2);
  });
</script>
```

### Keyboard Navigation

Focus any item and use the keyboard to reorder:

- **Arrow Up** — Move the focused item up one position
- **Arrow Down** — Move the focused item down one position
- **Home** — Move the focused item to the top
- **End** — Move the focused item to the bottom
