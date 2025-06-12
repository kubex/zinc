---
meta:
  title: Alert
  description: Alerts are used to display important messages inline or as toast notifications.
layout: component
---

## Examples

### Basic Alert

```html:preview

<zn-alert caption="This is an alert">This is the Description</zn-alert>
```

### With Icon

```html:preview

<zn-alert caption="This is an alert" icon="House" level="grey">
This is the Description
  <zn-button slot="actions" color="transparent">View All</zn-button>
</zn-alert>
```

### Levels

```html:preview

<zn-alert caption="This is an alert" level="primary">This is the Description</zn-alert>
<zn-alert caption="This is an alert" level="error">This is the Description</zn-alert>
<zn-alert caption="This is an alert" level="info">This is the Description</zn-alert>
<zn-alert caption="This is an alert" level="success">This is the Description</zn-alert>
<zn-alert caption="This is an alert" level="warning">This is the Description</zn-alert>
```

### sizes

```html:preview

<zn-alert caption="This is an alert" size="small">This is the Description</zn-alert>
<zn-alert caption="This is an alert" size="medium">This is the Description</zn-alert>
<zn-alert caption="This is an alert" size="large">This is the Description</zn-alert>
```