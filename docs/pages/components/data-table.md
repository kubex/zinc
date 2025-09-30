---
meta:
  title: Data Table
  description:
layout: component
fullWidth: true
---

```html:preview

<zn-data-table empty-state-caption="No customers found" empty-state-icon="person_off" data-uri="/data/data-table.json"
               method="GET"
               headers="[{&quot;key&quot;:&quot;label&quot,&quot;label&quot;:&quot;ID&quot;, &quot;required&quot;:true, &quot;default&quot;: true},
{&quot;key&quot;:&quot;One&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
{&quot;key&quot;:&quot;Two&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
{&quot;key&quot;:&quot;Three&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
{&quot;key&quot;:&quot;Four&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true}]">
  
  <zn-data-table-sort slot="sort">
    <!-- Need to configure default, and available sort columns
     Future enhancement: allow multi-column sort !-->
  </zn-data-table-sort>

  <zn-data-table-filter auto-submit="true" debounce="1000" slot="filter">
    <zn-input name="search" placeholder="Search customers..." icon="search" debounce="300" clearable></zn-input>
  </zn-data-table-filter>

</zn-data-table>
```

## Examples

### Custom Empty State

```html:preview

<zn-data-table data-uri="/data/data-table.json" standalone hide-checkboxes method="GET"
               headers="[{&quot;key&quot;:&quot;label&quot,&quot;label&quot;:&quot;ID&quot;, &quot;required&quot;:true, &quot;default&quot;: true},
{&quot;key&quot;:&quot;One&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
{&quot;key&quot;:&quot;Two&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
{&quot;key&quot;:&quot;Three&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
{&quot;key&quot;:&quot;Four&quot;,&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true}]">

  <zn-empty-state slot="empty">
    <zn-button>Create new customer</zn-button>
  </zn-empty-state>

  <zn-data-table-sort slot="sort">
    <!-- Need to configure default, and available sort columns
     Future enhancement: allow multi-column sort !-->
  </zn-data-table-sort>

  <zn-data-table-filter auto-submit="true" debounce="1000" slot="filter">
    <!-- Allow auto submit on filter change with debounce 
     Should be possible to build your own forms for filtering here 
     Current filter builder could be a different component as a query-builder, that can expand -->
    <zn-input name="search" placeholder="Search customers..." icon="search" debounce="300" clearable></zn-input>
  </zn-data-table-filter>

</zn-data-table>
```

### Custom Filter Actions

```html:preview

<zn-data-table data-uri="/data/products-table.json" standalone method="GET"
               headers="[{&quot;key&quot;:&quot;name&quot;,&quot;label&quot;:&quot;Name&quot;},
  {&quot;key&quot;:&quot;category&quot;,&quot;label&quot;:&quot;Category&quot;},
  {&quot;key&quot;:&quot;price&quot;,&quot;label&quot;:&quot;Price&quot;},
  {&quot;key&quot;:&quot;discountPercentage&quot;,&quot;label&quot;:&quot;Discount %&quot;},
  {&quot;key&quot;:&quot;stock&quot;,&quot;label&quot;:&quot;Stock&quot;},
  {&quot;key&quot;:&quot;rating&quot;,&quot;label&quot;:&quot;Rating&quot;}]">

  <zn-panel flush-x slot="filter-top">
    <zn-tabs>
      <zn-navbar slot="top">
        <li tab>Quick Search</li>
        <li tab="product">Product Search</li>
      </zn-navbar>

      <zn-sp gap="sm">
        <zn-form-group
          label="Quick Search"
          label-tooltip="Quickly filter results in the table"
          help-text="Use the fields to filter results in the table, then click Search">
          <zn-input type="price" name="price" label="Price" span="3"></zn-input>
          <zn-select name="category" span="3" label="Category" clearable>
            <zn-option value="beauty">Beauty</zn-option>
          </zn-select>
        </zn-form-group>

        <zn-button type="submit">Search</zn-button>
      </zn-sp>

      <zn-sp id="product" flush-y>
        <zn-query-builder
          filters="[{&quot;id&quot;:&quot;title&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;: [&quot;eq&quot;]},
  {&quot;id&quot;:&quot;category&quot;,&quot;name&quot;:&quot;Category&quot;,&quot;options&quot;:{&quot;beauty&quot;:&quot;Beauty&quot;},&quot;operators&quot;:[&quot;eq&quot;]}]"
          name="query"></zn-query-builder>
        <zn-button type="submit">Submit</zn-button>
      </zn-sp>
    </zn-tabs>
  </zn-panel>


</zn-data-table>
```