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
               headers="{&quot;id&quot;:{&quot;label&quot;:&quot;ID&quot;, &quot;required&quot;:true, &quot;default&quot;: true},
&quot;name&quot;:{&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
&quot;email&quot;:{&quot;label&quot;:&quot;Email&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
&quot;phone&quot;:{&quot;label&quot;:&quot;Phone&quot;, &quot;required&quot;:false, &quot;default&quot;: false, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
&quot;createdAt&quot;:{&quot;label&quot;:&quot;Created At&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true}}">
  
  <zn-data-table-sort>
    <!-- Need to configure default, and available sort columns
     Future enhancement: allow multi-column sort !-->
  </zn-data-table-sort>

  <zn-data-table-filter auto-submit="true" debounce="1000">
    <zn-input name="search" placeholder="Search customers..." icon="search" debounce="300" clearable></zn-input>
  </zn-data-table-filter>

</zn-data-table>
```

## Examples

### Custom Empty State

```html:preview

<zn-data-table data-uri="/data/data-table.json" standalone hide-checkboxes method="GET"
               headers="{&quot;id&quot;:{&quot;label&quot;:&quot;ID&quot;, &quot;required&quot;:true, &quot;default&quot;: true},
&quot;name&quot;:{&quot;label&quot;:&quot;Name&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
&quot;email&quot;:{&quot;label&quot;:&quot;Email&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
&quot;phone&quot;:{&quot;label&quot;:&quot;Phone&quot;, &quot;required&quot;:false, &quot;default&quot;: false, &quot;sortable&quot;:true, &quot;filterable&quot;:true},
&quot;createdAt&quot;:{&quot;label&quot;:&quot;Created At&quot;, &quot;required&quot;:true, &quot;default&quot;: true, &quot;sortable&quot;:true, &quot;filterable&quot;:true}}">

  <zn-empty-state slot="empty">
    <zn-button>Create new customer</zn-button>
  </zn-empty-state>

  <zn-data-table-sort>
    <!-- Need to configure default, and available sort columns
     Future enhancement: allow multi-column sort !-->
  </zn-data-table-sort>

  <zn-data-table-filter auto-submit="true" debounce="1000">
    <!-- Allow auto submit on filter change with debounce 
     Should be possible to build your own forms for filtering here 
     Current filter builder could be a different component as a query-builder, that can expand -->
    <zn-input name="search" placeholder="Search customers..." icon="search" debounce="300" clearable></zn-input>
  </zn-data-table-filter>

</zn-data-table>
```