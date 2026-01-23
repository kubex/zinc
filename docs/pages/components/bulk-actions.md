---
meta:
  title: Bulk Actions
  description: A dynamic form builder component that allows users to create multiple field-value pairs for bulk operations. Supports various input types including text, select options, numbers, dates, and booleans.
layout: component
---

```html:preview

<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;agent&quot;,&quot;name&quot;:&quot;agent&quot;,&quot;options&quot;:{&quot;agent1&quot;:&quot;Agent 1&quot;,&quot;agent2&quot;:&quot;Agent 2&quot;}},{&quot;id&quot;:&quot;company&quot;,&quot;name&quot;:&quot;company&quot;,&quot;options&quot;:{&quot;company1&quot;:&quot;Company 1&quot;,&quot;company2&quot;:&quot;Company 2&quot;}},{&quot;id&quot;:&quot;impact&quot;,&quot;name&quot;:&quot;impact&quot;,&quot;options&quot;:{&quot;0&quot;:&quot;None&quot;,&quot;10&quot;:&quot;Minor&quot;,&quot;20&quot;:&quot;Moderate&quot;,&quot;30&quot;:&quot;Significant&quot;,&quot;40&quot;:&quot;Extensive&quot;}},{&quot;id&quot;:&quot;priority&quot;,&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:{&quot;priority1&quot;:&quot;Priority 1&quot;,&quot;priority2&quot;:&quot;Priority 2&quot;}}]"
  name="actions">
  </zn-bulk-actions>
```

## Examples

### Basic Usage with Options

Create a bulk actions component with predefined dropdown options for each action.

```html:preview
<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;status&quot;,&quot;name&quot;:&quot;status&quot;,&quot;options&quot;:{&quot;open&quot;:&quot;Open&quot;,&quot;in_progress&quot;:&quot;In Progress&quot;,&quot;closed&quot;:&quot;Closed&quot;}},{&quot;id&quot;:&quot;assignee&quot;,&quot;name&quot;:&quot;assignee&quot;,&quot;options&quot;:{&quot;john&quot;:&quot;John Doe&quot;,&quot;jane&quot;:&quot;Jane Smith&quot;,&quot;bob&quot;:&quot;Bob Johnson&quot;}}]"
  name="ticket-actions">
</zn-bulk-actions>
```

### Text Input Fields

Use text input fields for free-form data entry by omitting the `options` property.

```html:preview
<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;tag&quot;,&quot;name&quot;:&quot;tag&quot;},{&quot;id&quot;:&quot;note&quot;,&quot;name&quot;:&quot;note&quot;},{&quot;id&quot;:&quot;reference&quot;,&quot;name&quot;:&quot;reference&quot;}]"
  name="text-actions">
</zn-bulk-actions>
```

### Number Input Fields

Use the `type: "number"` property to create number input fields.

```html:preview
<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;quantity&quot;,&quot;name&quot;:&quot;quantity&quot;,&quot;type&quot;:&quot;number&quot;},{&quot;id&quot;:&quot;price&quot;,&quot;name&quot;:&quot;price&quot;,&quot;type&quot;:&quot;number&quot;},{&quot;id&quot;:&quot;discount&quot;,&quot;name&quot;:&quot;discount&quot;,&quot;type&quot;:&quot;number&quot;}]"
  name="number-actions">
</zn-bulk-actions>
```

### Date Input Fields

Use the `type: "date"` property to create date picker fields.

```html:preview
<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;start_date&quot;,&quot;name&quot;:&quot;start date&quot;,&quot;type&quot;:&quot;date&quot;},{&quot;id&quot;:&quot;end_date&quot;,&quot;name&quot;:&quot;end date&quot;,&quot;type&quot;:&quot;date&quot;},{&quot;id&quot;:&quot;due_date&quot;,&quot;name&quot;:&quot;due date&quot;,&quot;type&quot;:&quot;date&quot;}]"
  name="date-actions">
</zn-bulk-actions>
```

### Boolean Input Fields

Use the `type: "bool"` or `type: "boolean"` property to create true/false dropdown fields.

```html:preview
<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;active&quot;,&quot;name&quot;:&quot;active&quot;,&quot;type&quot;:&quot;bool&quot;},{&quot;id&quot;:&quot;featured&quot;,&quot;name&quot;:&quot;featured&quot;,&quot;type&quot;:&quot;boolean&quot;},{&quot;id&quot;:&quot;visible&quot;,&quot;name&quot;:&quot;visible&quot;,&quot;type&quot;:&quot;bool&quot;}]"
  name="boolean-actions">
</zn-bulk-actions>
```

### Mixed Input Types

Combine different input types in a single bulk actions component.

```html:preview
<zn-bulk-actions
  actions="[{&quot;id&quot;:&quot;category&quot;,&quot;name&quot;:&quot;category&quot;,&quot;options&quot;:{&quot;bug&quot;:&quot;Bug&quot;,&quot;feature&quot;:&quot;Feature&quot;,&quot;improvement&quot;:&quot;Improvement&quot;}},{&quot;id&quot;:&quot;effort&quot;,&quot;name&quot;:&quot;effort (hours)&quot;,&quot;type&quot;:&quot;number&quot;},{&quot;id&quot;:&quot;blocked&quot;,&quot;name&quot;:&quot;blocked&quot;,&quot;type&quot;:&quot;bool&quot;},{&quot;id&quot;:&quot;deadline&quot;,&quot;name&quot;:&quot;deadline&quot;,&quot;type&quot;:&quot;date&quot;},{&quot;id&quot;:&quot;description&quot;,&quot;name&quot;:&quot;description&quot;}]"
  name="mixed-actions">
</zn-bulk-actions>
```

### In a Form Context

Use bulk actions within a form to collect structured data for submission.

```html:preview
<form>
  <h3>Update Multiple Items</h3>
  <zn-bulk-actions
    actions="[{&quot;id&quot;:&quot;priority&quot;,&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:{&quot;low&quot;:&quot;Low&quot;,&quot;medium&quot;:&quot;Medium&quot;,&quot;high&quot;:&quot;High&quot;,&quot;critical&quot;:&quot;Critical&quot;}},{&quot;id&quot;:&quot;department&quot;,&quot;name&quot;:&quot;department&quot;,&quot;options&quot;:{&quot;eng&quot;:&quot;Engineering&quot;,&quot;sales&quot;:&quot;Sales&quot;,&quot;support&quot;:&quot;Support&quot;}}]"
    name="bulk-update">
  </zn-bulk-actions>
  <br />
  <zn-button type="submit" color="success">Apply Changes</zn-button>
</form>
```


