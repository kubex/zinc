---
meta:
  title: Data Table Filter
  description: A comprehensive filtering component that opens a slideout panel with a query builder interface. Supports text, number, date fields, dropdown options, and multiple filter operators.
layout: component
---

```html:preview

<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;title&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;:[&quot;eq&quot;]},{&quot;id&quot;:&quot;author&quot;,&quot;name&quot;:&quot;Author&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;fuzzy&quot;]},{&quot;id&quot;:&quot;genre&quot;,&quot;name&quot;:&quot;Genre&quot;,&quot;options&quot;:{&quot;action&quot;:&quot;Action&quot;,&quot;comedy&quot;:&quot;Comedy&quot;,&quot;drama&quot;:&quot;Drama&quot;,&quot;fantasy&quot;:&quot;Fantasy&quot;,&quot;horror&quot;:&quot;Horror&quot;,&quot;mystery&quot;:&quot;Mystery&quot;,&quot;romance&quot;:&quot;Romance&quot;,&quot;thriller&quot;:&quot;Thriller&quot;,&quot;sci-fi&quot;:&quot;ScienceFiction&quot;},&quot;maxOptionsVisible&quot;:&quot;3&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]},{&quot;id&quot;:&quot;rating&quot;,&quot;name&quot;:&quot;Rating&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;gte&quot;,&quot;lt&quot;,&quot;lte&quot;]},{&quot;id&quot;:&quot;created&quot;,&quot;name&quot;:&quot;Created&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]}]">
</zn-data-table-filter>
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

Use number type filters with comparison operators like equal, greater than, less than.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;age&quot;,&quot;name&quot;:&quot;Age&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;gte&quot;,&quot;lt&quot;,&quot;lte&quot;]},{&quot;id&quot;:&quot;price&quot;,&quot;name&quot;:&quot;Price&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gt&quot;,&quot;lt&quot;]},{&quot;id&quot;:&quot;quantity&quot;,&quot;name&quot;:&quot;Quantity&quot;,&quot;type&quot;:&quot;number&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;gte&quot;,&quot;lte&quot;]}]"
  name="number-filters">
</zn-data-table-filter>
```

### Date Filters

Filter by dates with before, after, and equal operators.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;created&quot;,&quot;name&quot;:&quot;Created Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]},{&quot;id&quot;:&quot;modified&quot;,&quot;name&quot;:&quot;Modified Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;before&quot;,&quot;after&quot;]},{&quot;id&quot;:&quot;due_date&quot;,&quot;name&quot;:&quot;Due Date&quot;,&quot;type&quot;:&quot;date&quot;,&quot;operators&quot;:[&quot;eq&quot;,&quot;before&quot;,&quot;after&quot;]}]"
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

### Limited Options Display

Control how many options are initially visible using `maxOptionsVisible`.

```html:preview
<zn-data-table-filter
  filters="[{&quot;id&quot;:&quot;category&quot;,&quot;name&quot;:&quot;Category&quot;,&quot;options&quot;:{&quot;cat1&quot;:&quot;Category 1&quot;,&quot;cat2&quot;:&quot;Category 2&quot;,&quot;cat3&quot;:&quot;Category 3&quot;,&quot;cat4&quot;:&quot;Category 4&quot;,&quot;cat5&quot;:&quot;Category 5&quot;,&quot;cat6&quot;:&quot;Category 6&quot;},&quot;maxOptionsVisible&quot;:3,&quot;operators&quot;:[&quot;eq&quot;,&quot;in&quot;]}]"
  name="limited-options">
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
