---
meta:
  title: Badge
  description: Badges label the status or category of a record, such as "Active" or "Past due".
layout: component
---

```html:preview
<zn-badge>Neutral</zn-badge>
<zn-badge type="success">Active</zn-badge>
<zn-badge type="warning">Past due</zn-badge>
<zn-badge type="danger">Cancelled</zn-badge>
<zn-badge type="info">Trial</zn-badge>
<zn-badge type="ai">AI suggested</zn-badge>
<zn-badge type="success" dot>Completed</zn-badge>
<zn-badge type="danger" dot>Failed</zn-badge>
<zn-badge type="info" solid>VIP</zn-badge>
<zn-badge type="danger" solid>Urgent</zn-badge>
<zn-badge type="success" size="large" dot>Large</zn-badge>
```

## Examples

### Types

Use the `type` attribute to set the badge's colour: `neutral` (default), `success`, `warning`, `danger`, `info` or `ai`. Reserve `ai` for AI-generated content — it is the only type that carries an icon.

```html:preview
<zn-badge>Neutral</zn-badge>
<zn-badge type="success">Active</zn-badge>
<zn-badge type="warning">Past due</zn-badge>
<zn-badge type="danger">Cancelled</zn-badge>
<zn-badge type="info">Trial</zn-badge>
<zn-badge type="ai">AI suggested</zn-badge>
```

### Status Dot

Use `dot` to lead the label with a status indicator in the type colour.

```html:preview
<zn-badge type="success" dot>Completed</zn-badge>
<zn-badge type="warning" dot>Pending</zn-badge>
<zn-badge type="danger" dot>Failed</zn-badge>
<zn-badge dot>Draft</zn-badge>
```

### Solid

Use `solid` to fill the badge with its type colour for labels that need to stand out, such as VIP or urgent.

```html:preview
<zn-badge type="info" solid>VIP</zn-badge>
<zn-badge type="danger" solid>Urgent</zn-badge>
<zn-badge type="success" solid>Paid</zn-badge>
<zn-badge type="warning" solid>Overdue</zn-badge>
```

### Large

Use `size="large"` for a larger badge.

```html:preview
<zn-badge type="success" size="large" dot>Large</zn-badge>
<zn-badge type="ai" size="large">AI suggested</zn-badge>
<zn-badge type="danger" size="large" solid>Urgent</zn-badge>
```
