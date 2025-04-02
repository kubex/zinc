---
meta:
  title: Data Select
  description:
layout: component
---

```html:preview

<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country"></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency"></zn-data-select>
  <zn-data-select label="Color" provider="color" name="color"></zn-data-select>
  <zn-data-select label="Common Countries "provider="common-countries" name="common-countries"></zn-data-select>
</div>
```

## Examples

### Show Prefix

```html:preview

<div class="form-spacing">
  <zn-data-select provider="country" name="country" show-prefix></zn-data-select>
  <zn-data-select provider="currency" name="currency" show-prefix></zn-data-select>
  <zn-data-select provider="color" name="color" show-prefix></zn-data-select>
</div>
```

### Clearable

```html:preview

<div class="form-spacing">
  <zn-data-select provider="country" name="country" clearable></zn-data-select>
  <zn-data-select provider="currency" name="currency" clearable></zn-data-select>
  <zn-data-select provider="color" name="color" clearable></zn-data-select>
</div>
```

### Filtered

If you only want to display a handful of the provider results, you can use the `filter` attribute to filter the
results.

```html:preview

<div class="form-spacing">
  <zn-data-select provider="country" name="country" filter="gb,us,fr,de"></zn-data-select>
  <zn-data-select provider="currency" name="currency" filter="gbp,usd,eur"></zn-data-select>
  <zn-data-select provider="color" name="color" filter="red,green,blue"></zn-data-select>
</div>
```