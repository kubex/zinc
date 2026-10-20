---
meta:
  title: Data Table Filter
  description: The filter for data tables. A funnel opens a builder of field, operator and value rules, and the rules that apply show as removable chips.
layout: component
---

```html:preview

<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;title&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;:[&quot;eq&quot;]},{&quot;id&quot;:&quot;author&quot;,&quot;name&quot;:&quot;Author&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;genre&quot;,&quot;name&quot;:&quot;Genre&quot;,&quot;options&quot;:{&quot;action&quot;:&quot;Action&quot;,&quot;comedy&quot;:&quot;Comedy&quot;,&quot;drama&quot;:&quot;Drama&quot;,&quot;fantasy&quot;:&quot;Fantasy&quot;,&quot;horror&quot;:&quot;Horror&quot;,&quot;mystery&quot;:&quot;Mystery&quot;,&quot;romance&quot;:&quot;Romance&quot;,&quot;thriller&quot;:&quot;Thriller&quot;,&quot;sci-fi&quot;:&quot;ScienceFiction&quot;},&quot;maxOptionsVisible&quot;:&quot;3&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;rating&quot;,&quot;name&quot;:&quot;Rating&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;gte&quot;,&quot;lt&quot;,&quot;lte&quot;]},{&quot;id&quot;:&quot;created&quot;,&quot;name&quot;:&quot;Created&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]}]">
</zn-data-table-filter>
```

The funnel opens a popover headed **Filters · Show records that match all of these**. Each row is a rule: pick a field, an operator and a value, or remove the row with its trash button. **+ Add filter** adds a row for a field not yet used, **Clear all** removes every rule, and **Done** closes the popover. A rule applies once it has a field, an operator and a value, and while any row is still empty the heading says so. Closing the popover, with Done, Escape or a click outside it, drops the rows that are still empty.

The rules that apply show as chips after the funnel, and the funnel's badge counts them. A chip's text opens the popover again, and its X removes that rule. Inside a [`zn-data-table`](/components/data-table#filtering) or [`zn-report-table`](/components/report-table) the funnel sits in the header and the chips get a row of their own under it.

A rule starts on its field's **first declared operator**, and the operator list offers the rest. Picking another field resets the operator and the value. The value control follows the field:

- A field with `options`, or a `bool` field, gets a select. With `in` or `nin` it becomes a multi-select.
- A `number` field gets a number input, and a `date` or `dateTime` field a date input.
- Any other field gets a text input. With `in` or `nin`, separate values with commas.

With more than eight fields, the field select is searchable: open it and type, and the placeholder reads `Search N fields...`.

`default-filters` takes a comma-separated list of field ids. When the popover opens with nothing applied, it starts with an empty row for each of them, rather than one blank row.

```html:preview
<zn-data-table-filter
  default-filters="status"
  filters='[
    {"id":"status","name":"Status","options":{"open":"Open","closed":"Closed"},"operators":["eq","neq"]},
    {"id":"tag","name":"Tag","options":{"bug":"Bug","chore":"Chore","feature":"Feature"},"operators":["in","nin"]},
    {"id":"owner","name":"Owner","operators":["contains","eq"]}
  ]'>
</zn-data-table-filter>
```

The component emits `zn-filter-change` and exposes the query on `value`, encoded as `zn-query-builder` encodes it: base64 of `[{key, comparator, value}]`, or `''` when no rule applies. It only emits when that value changes. A multi-select's values are joined with spaces, and `activeCount` reports how many rules apply.

Setting `value` from outside rebuilds the rules, so a filter restored from a shared URL through `zn-data-table`'s [`sharable`](/components/data-table#shareable-url-state) sync shows its chips straight away.

### Typeahead

Inside a `zn-data-table`, a text field suggests values from the rows the table has already loaded, matched case-insensitively against what has been typed, keyed on the column whose name matches the field's id. Set `suggestions` yourself, as `{[fieldId]: string[]}`, to offer something else.

### Showing the Chips Elsewhere

Set another filter as a filter's `source` property and it shows only that filter's chips, while that filter stops showing its own. The tables use this to keep the funnel in their header and the chips in a row under it.

```html:preview
<div>
  <zn-data-table-filter id="chips-source"
    filters='[{"id":"status","name":"Status","options":{"open":"Open","closed":"Closed"},"operators":["eq"]}]'>
  </zn-data-table-filter>
  <zn-data-table-filter id="chips-row"></zn-data-table-filter>
</div>

<script>
  document.getElementById('chips-row').source = document.getElementById('chips-source');
</script>
```

## Examples

### Basic Text Filters

Create simple text-based filters with equality and fuzzy search operators.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;name&quot;,&quot;name&quot;:&quot;Name&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;email&quot;,&quot;name&quot;:&quot;Email&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;company&quot;,&quot;name&quot;:&quot;Company&quot;,&quot;operators&quot;:[&quot;eq&quot;]}]"
  name="text-filters">
</zn-data-table-filter>
```

### Number Filters with Operators

Use number fields with comparison operators: they read `is more than`, `is at least`, `is less than` and `is at most`.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;age&quot;,&quot;name&quot;:&quot;Age&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;gte&quot;,&quot;lt&quot;,&quot;lte&quot;]},{&quot;id&quot;:&quot;price&quot;,&quot;name&quot;:&quot;Price&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;lt&quot;]},{&quot;id&quot;:&quot;quantity&quot;,&quot;name&quot;:&quot;Quantity&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gte&quot;,&quot;lte&quot;]}]"
  name="number-filters">
</zn-data-table-filter>
```

### Date Filters

Filter by dates with before, after and equal operators. A `date` field takes a date, and a `dateTime` field a date and a time.

Values are encoded the way `zn-query-builder` encodes them, and changing the operator re-encodes the date. `dateSubmitFormat` picks the wire
format: `legacy` (the default — seconds for `eq`/`neq`, otherwise minutes from now, negated for
`before`), `timestamp` (milliseconds) or `iso`.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;created&quot;,&quot;name&quot;:&quot;Created Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]},{&quot;id&quot;:&quot;modified&quot;,&quot;name&quot;:&quot;Modified Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;before&quot;,&quot;after&quot;]},{&quot;id&quot;:&quot;due_date&quot;,&quot;name&quot;:&quot;Due Date&quot;,&quot;type&quot;:&quot;dateTime&quot;,&quot;dateSubmitFormat&quot;:&quot;iso&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]}]"
  name="date-filters">
</zn-data-table-filter>
```

### Dropdown Options

Use predefined options for select-based filtering.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;status&quot;,&quot;name&quot;:&quot;Status&quot;,&quot;options&quot;:{&quot;open&quot;:&quot;Open&quot;,&quot;in_progress&quot;:&quot;In Progress&quot;,&quot;closed&quot;:&quot;Closed&quot;},&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;priority&quot;,&quot;name&quot;:&quot;Priority&quot;,&quot;options&quot;:{&quot;low&quot;:&quot;Low&quot;,&quot;medium&quot;:&quot;Medium&quot;,&quot;high&quot;:&quot;High&quot;,&quot;critical&quot;:&quot;Critical&quot;},&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]}]"
  name="option-filters">
</zn-data-table-filter>
```

### Mixed Filter Types

Combine different field types in a single filter component.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;product&quot;,&quot;name&quot;:&quot;Product Name&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;category&quot;,&quot;name&quot;:&quot;Category&quot;,&quot;options&quot;:{&quot;electronics&quot;:&quot;Electronics&quot;,&quot;clothing&quot;:&quot;Clothing&quot;,&quot;books&quot;:&quot;Books&quot;},&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;price&quot;,&quot;name&quot;:&quot;Price&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;lt&quot;]},{&quot;id&quot;:&quot;in_stock&quot;,&quot;name&quot;:&quot;In Stock&quot;,&quot;type&quot;:&quot;boolean&quot;,&quot;operators&quot;:[&quot;eq&quot;]}]"
  name="mixed-filters">
</zn-data-table-filter>
```

### Employee Filter Example

A practical example for filtering employee data.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;employee_name&quot;,&quot;name&quot;:&quot;Employee Name&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;department&quot;,&quot;name&quot;:&quot;Department&quot;,&quot;options&quot;:{&quot;engineering&quot;:&quot;Engineering&quot;,&quot;sales&quot;:&quot;Sales&quot;,&quot;marketing&quot;:&quot;Marketing&quot;,&quot;hr&quot;:&quot;Human Resources&quot;,&quot;finance&quot;:&quot;Finance&quot;},&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;hire_date&quot;,&quot;name&quot;:&quot;Hire Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;before&quot;,&quot;after&quot;]},{&quot;id&quot;:&quot;salary&quot;,&quot;name&quot;:&quot;Salary&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;gt&quot;,&quot;lt&quot;]}]"
  name="employee-filters">
</zn-data-table-filter>
```

### E-commerce Filter Example

Filter products with various criteria.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;title&quot;,&quot;name&quot;:&quot;Product Title&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;brand&quot;,&quot;name&quot;:&quot;Brand&quot;,&quot;operators&quot;:[&quot;eq&quot;]},{&quot;id&quot;:&quot;category&quot;,&quot;name&quot;:&quot;Category&quot;,&quot;options&quot;:{&quot;electronics&quot;:&quot;Electronics&quot;,&quot;clothing&quot;:&quot;Clothing&quot;,&quot;home&quot;:&quot;Home &amp; Garden&quot;,&quot;sports&quot;:&quot;Sports&quot;,&quot;toys&quot;:&quot;Toys&quot;},&quot;maxOptionsVisible&quot;:3,&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;price&quot;,&quot;name&quot;:&quot;Price&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;gte&quot;,&quot;lt&quot;,&quot;lte&quot;]},{&quot;id&quot;:&quot;rating&quot;,&quot;name&quot;:&quot;Rating&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;gte&quot;]},{&quot;id&quot;:&quot;release_date&quot;,&quot;name&quot;:&quot;Release Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;before&quot;,&quot;after&quot;]}]"
  name="product-filters">
</zn-data-table-filter>
```

### Content Library Filter

Filter media content like books, movies, or articles.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;title&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;author&quot;,&quot;name&quot;:&quot;Author&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;genre&quot;,&quot;name&quot;:&quot;Genre&quot;,&quot;options&quot;:{&quot;action&quot;:&quot;Action&quot;,&quot;comedy&quot;:&quot;Comedy&quot;,&quot;drama&quot;:&quot;Drama&quot;,&quot;fantasy&quot;:&quot;Fantasy&quot;,&quot;horror&quot;:&quot;Horror&quot;,&quot;mystery&quot;:&quot;Mystery&quot;,&quot;romance&quot;:&quot;Romance&quot;,&quot;thriller&quot;:&quot;Thriller&quot;,&quot;sci-fi&quot;:&quot;Science Fiction&quot;},&quot;maxOptionsVisible&quot;:3,&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;rating&quot;,&quot;name&quot;:&quot;Rating&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;gte&quot;,&quot;lt&quot;,&quot;lte&quot;]},{&quot;id&quot;:&quot;published&quot;,&quot;name&quot;:&quot;Published Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]}]"
  name="content-filters">
</zn-data-table-filter>
```
