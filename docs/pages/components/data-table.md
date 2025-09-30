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

### Filter-top Slot

Add complex filtering options to the top of the table using the `filter-top` slot.

```html:preview

<zn-data-table data-uri="/data/products-table.json" method="GET"
               no-initial-load
               headers="[{&quot;key&quot;:&quot;name&quot;,&quot;label&quot;:&quot;Name&quot;},
  {&quot;key&quot;:&quot;category&quot;,&quot;label&quot;:&quot;Category&quot;},
  {&quot;key&quot;:&quot;price&quot;,&quot;label&quot;:&quot;Price&quot;},
  {&quot;key&quot;:&quot;discountPercentage&quot;,&quot;label&quot;:&quot;Discount %&quot;},
  {&quot;key&quot;:&quot;stock&quot;,&quot;label&quot;:&quot;Stock&quot;},
  {&quot;key&quot;:&quot;rating&quot;,&quot;label&quot;:&quot;Rating&quot;}]">

  <zn-empty-state slot="empty-state" icon="inventory_2" caption="No products found">
    <p>Use the filters to search for products</p>
  </zn-empty-state>

  <zn-filter-wrapper slot="filter-top" button="Submit">
    <div class="form-spacing">
      <zn-input type="price" name="price" label="Price" span="3"></zn-input>
      <zn-select name="category" span="3" label="Category" clearable>
        <zn-option value="beauty">Beauty</zn-option>
      </zn-select>
      <zn-button type="primary" submit>Search</zn-button>
    </div>
  </zn-filter-wrapper>
</zn-data-table>
```

### Filter-top Slot with Tabs

Add complex filtering options to the top of the table using the `filter-top` slot.

```html:preview

<zn-data-table data-uri="/data/products-table.json" method="GET"
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
        <zn-filter-wrapper with-submit>
          <zn-form-group
            label="Quick Search"
            label-tooltip="Quickly filter results in the table"
            help-text="Use the fields to filter results in the table, then click Search">
            <zn-input type="price" name="price" label="Price" span="3"></zn-input>
            <zn-select name="category" span="3" label="Category" clearable>
              <zn-option value="beauty">Beauty</zn-option>
            </zn-select>
          </zn-form-group>
        </zn-filter-wrapper>
      </zn-sp>

      <zn-sp id="product" flush-y>
        <zn-filter-wrapper with-submit>
          <zn-filter-builder
            filters="[{&quot;id&quot;:&quot;title&quot;,&quot;name&quot;:&quot;Title&quot;,&quot;operators&quot;: [&quot;eq&quot;]},
  {&quot;id&quot;:&quot;category&quot;,&quot;name&quot;:&quot;Category&quot;,&quot;options&quot;:{&quot;beauty&quot;:&quot;Beauty&quot;},&quot;operators&quot;:[&quot;eq&quot;]}]"
            name="query">
          </zn-filter-builder>
        </zn-filter-wrapper>
      </zn-sp>
    </zn-tabs>
  </zn-panel>


</zn-data-table>
```