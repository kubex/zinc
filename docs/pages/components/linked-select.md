---
meta:
  title: Linked Select
  description:
layout: component
---

```html:preview

<zn-select name="departmentFid" id="departmentFid" label="Department" class="zn-mb" size="medium" placement="bottom"
           form="" data-optional="" data-valid="" data-user-valid="" open="">
  <zn-option value="" role="option" aria-selected="false" aria-disabled="false" tabindex="-1">Select Department
  </zn-option>
  <zn-option value="FID:DEP:1677585809:MZxvTiWlzBlSG" role="option" aria-selected="true" aria-disabled="false"
             tabindex="-1">Billing
  </zn-option>
  <zn-option value="FID:DEP:1677585809:Kd83L0aIhsGpB" role="option" aria-selected="false" aria-disabled="false"
             tabindex="-1">Sales
  </zn-option>
  <zn-option value="FID:DEP:1677585809:3mBpgQnrkzLSO" role="option" aria-selected="false" aria-disabled="false"
             tabindex="-1">
    Support
  </zn-option>
</zn-select>

<zn-linked-select linked-select="departmentFid" value="" name="queueFid" label="Queue"
                  options="{&quot;-&quot;:{&quot;-&quot;:&quot;Select Department&quot;},&quot;FID:DEP:1677585809:MZxvTiWlzBlSG&quot;:{&quot;-&quot;:&quot;Select Queue&quot;,&quot;FID:TKT:QUE:1677585809:DFP20NM0Q&quot;:&quot;Generic&quot;,&quot;FID:TKT:QUE:1678099064:8nGJ5OQfp&quot;:&quot;Money Back&quot;},&quot;FID:DEP:1677585809:Kd83L0aIhsGpB&quot;:{&quot;-&quot;:&quot;Select Queue&quot;,&quot;FID:TKT:QUE:1677585809:ma9I3ORGu&quot;:&quot;Generic&quot;},&quot;FID:DEP:1677585809:3mBpgQnrkzLSO&quot;:{&quot;-&quot;:&quot;Select Queue&quot;,&quot;FID:TKT:QUE:1677585809:cFvFFL8o6&quot;:&quot;Generic&quot;}}"
                  data-optional="" data-valid="" data-user-valid=""></zn-linked-select>
```

## Examples

### First Example

TODO

### Second Example

TODO


