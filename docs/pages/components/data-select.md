---
meta:
  title: Data Select
  description:
layout: component
---

```html:preview

<div class="form-spacing">
  <zn-data-select provider="country" name="country"></zn-data-select>
  <zn-data-select provider="currency" name="currency"></zn-data-select>
  <zn-data-select provider="color" name="color"></zn-data-select>
</div>
```

## Examples

### Hide Prefix

```html:preview

<div class="form-spacing">
  <zn-data-select provider="country" name="country" hide-prefix></zn-data-select>
  <zn-data-select provider="currency" name="currency" hide-prefix></zn-data-select>
  <zn-data-select provider="color" name="color" hide-prefix></zn-data-select>
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