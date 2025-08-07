---
meta:
  title: Skeleton
  description:
layout: component
fullWidth: true
---

```html:preview

<zn-skeleton></zn-skeleton>
```

## Examples

### Animation Speed

```html:preview

<div
  style="display: grid; grid-template-columns: 75px 1fr; justify-content: center; align-items: center; gap: 10px; width: 450px;">
  <p style="place-self: end;"><b>Fast:</b></p>
  <zn-skeleton speed="1.5s"></zn-skeleton>
</div>
<div
  style="display: grid; grid-template-columns: 75px 1fr; justify-content: center; align-items: center; gap: 10px; width: 450px;">
  <p style="place-self: end;"><b>Average:</b></p>
  <zn-skeleton speed="3s"></zn-skeleton>
</div>
<div
  style="display: grid; grid-template-columns: 75px 1fr; justify-content: center; align-items: center; gap: 10px; width: 450px;">
  <p style="place-self: end;"><b>Slow:</b></p>
  <zn-skeleton speed="5s"></zn-skeleton>
</div>
```

### Height

```html:preview

<div style="display: grid; gap: 10px;">
  <zn-skeleton height="25px"></zn-skeleton>
  <zn-skeleton height="50px"></zn-skeleton>
  <zn-skeleton height="75px"></zn-skeleton>
  <zn-skeleton height="100px"></zn-skeleton>
</div>
```

### Width

```html:preview

<div style="display: grid; gap: 10px;">
  <zn-skeleton width="50px"></zn-skeleton>
  <zn-skeleton width="100px"></zn-skeleton>
  <zn-skeleton width="500px"></zn-skeleton>
  <zn-skeleton width="975px"></zn-skeleton>
</div>
```

### Border Radius

```html:preview

<div style="display: grid; gap: 10px;">
  <zn-skeleton radius="0"></zn-skeleton>
  <zn-skeleton radius="4px"></zn-skeleton>
  <zn-skeleton radius="50px"></zn-skeleton>
</div>
```