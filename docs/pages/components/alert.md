---
meta:
  title: Alert
  description: Alerts are used to display important messages inline or as toast notifications.
layout: component
---

## Examples

### Basic Alert

```html:preview

<zn-alert caption="This is an alert" description="This is a description"></zn-alert>
```

### With Icon

```html:preview

<zn-alert caption="This is an alert" description="This is a description" icon="House"></zn-alert>
```

### Levels

```html:preview

<zn-alert caption="This is an alert" description="This is a description" level="primary"></zn-alert>
<zn-alert caption="This is an alert" description="This is a description" level="error"></zn-alert>
<zn-alert caption="This is an alert" description="This is a description" level="info"></zn-alert>
<zn-alert caption="This is an alert" description="This is a description" level="success"></zn-alert>
<zn-alert caption="This is an alert" description="This is a description" level="warning"></zn-alert>
```

### sizes

```html:preview

<zn-alert caption="This is an alert" description="This is a description" size="small"></zn-alert>
<zn-alert caption="This is an alert" description="This is a description" size="medium"></zn-alert>
<zn-alert caption="This is an alert" description="This is a description" size="large"></zn-alert>
```