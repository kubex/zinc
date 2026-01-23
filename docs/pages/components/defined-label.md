---
meta:
  title: Defined Label
  description: A labeled input component with dropdown suggestions for predefined label-value pairs. Supports custom labels, searchable options, and both select and text input fields for label values.
layout: component
---

```html:preview

<zn-defined-label
  allow-custom
  predefined-labels="[{&quot;name&quot;:&quot;asc2&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;one&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;outbound&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;two&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;another&quot;,&quot;options&quot;:[&quot;one&quot;,&quot;two&quot;,&quot;three&quot;]},{&quot;name&quot;:&quot;awesome&quot;,&quot;options&quot;:[&quot;one&quot;,&quot;two&quot;,&quot;three&quot;,&quot;four&quot;]}]">
</zn-defined-label>
```

## Examples

### Basic Usage with Text Input

Create labels with free-form text values by defining labels without options.

```html:preview
<zn-defined-label
  predefined-labels="[{&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;status&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;category&quot;,&quot;options&quot;:[]}]">
</zn-defined-label>
```

### Labels with Dropdown Options

Define labels with predefined value options for structured data entry.

```html:preview
<zn-defined-label
  predefined-labels="[{&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:[&quot;low&quot;,&quot;medium&quot;,&quot;high&quot;,&quot;critical&quot;]},{&quot;name&quot;:&quot;status&quot;,&quot;options&quot;:[&quot;open&quot;,&quot;in progress&quot;,&quot;closed&quot;]},{&quot;name&quot;:&quot;type&quot;,&quot;options&quot;:[&quot;bug&quot;,&quot;feature&quot;,&quot;improvement&quot;]}]">
</zn-defined-label>
```

### Allow Custom Labels

Enable users to create their own labels using the `allow-custom` attribute.

```html:preview
<zn-defined-label
  allow-custom
  predefined-labels="[{&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:[&quot;low&quot;,&quot;medium&quot;,&quot;high&quot;]},{&quot;name&quot;:&quot;status&quot;,&quot;options&quot;:[&quot;open&quot;,&quot;closed&quot;]}]">
</zn-defined-label>
```

### Mixed Input Types

Combine labels with dropdown options and free-text values.

```html:preview
<zn-defined-label
  allow-custom
  predefined-labels="[{&quot;name&quot;:&quot;department&quot;,&quot;options&quot;:[&quot;engineering&quot;,&quot;sales&quot;,&quot;marketing&quot;,&quot;support&quot;]},{&quot;name&quot;:&quot;project&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;version&quot;,&quot;options&quot;:[&quot;1.0&quot;,&quot;2.0&quot;,&quot;3.0&quot;]},{&quot;name&quot;:&quot;assignee&quot;,&quot;options&quot;:[]}]">
</zn-defined-label>
```

### Different Input Sizes

Control the input size using the `input-size` attribute.

```html:preview
<div class="form-spacing">
  <zn-defined-label
    input-size="small"
    predefined-labels="[{&quot;name&quot;:&quot;tag&quot;,&quot;options&quot;:[]}]">
  </zn-defined-label>

  <zn-defined-label
    input-size="medium"
    predefined-labels="[{&quot;name&quot;:&quot;tag&quot;,&quot;options&quot;:[]}]">
  </zn-defined-label>

  <zn-defined-label
    input-size="large"
    predefined-labels="[{&quot;name&quot;:&quot;tag&quot;,&quot;options&quot;:[]}]">
  </zn-defined-label>
</div>
```

### Disabled State

Disable the input using the `disabled` attribute.

```html:preview
<zn-defined-label
  disabled
  predefined-labels="[{&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:[&quot;low&quot;,&quot;medium&quot;,&quot;high&quot;]}]">
</zn-defined-label>
```

### Custom Name Attribute

Specify a custom form field name using the `name` attribute.

```html:preview
<form>
  <zn-defined-label
    name="custom-label"
    allow-custom
    predefined-labels="[{&quot;name&quot;:&quot;tag&quot;,&quot;options&quot;:[]}]">
  </zn-defined-label>
</form>
```

### Issue Tracking Labels

A practical example for issue tracking systems.

```html:preview
<zn-defined-label
  allow-custom
  predefined-labels="[{&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:[&quot;p0&quot;,&quot;p1&quot;,&quot;p2&quot;,&quot;p3&quot;]},{&quot;name&quot;:&quot;type&quot;,&quot;options&quot;:[&quot;bug&quot;,&quot;feature&quot;,&quot;task&quot;,&quot;epic&quot;]},{&quot;name&quot;:&quot;component&quot;,&quot;options&quot;:[&quot;frontend&quot;,&quot;backend&quot;,&quot;api&quot;,&quot;database&quot;]},{&quot;name&quot;:&quot;environment&quot;,&quot;options&quot;:[&quot;dev&quot;,&quot;staging&quot;,&quot;production&quot;]},{&quot;name&quot;:&quot;assignee&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;sprint&quot;,&quot;options&quot;:[]}]">
</zn-defined-label>
```

### Content Tagging

Use for tagging content with categories and metadata.

```html:preview
<zn-defined-label
  allow-custom
  predefined-labels="[{&quot;name&quot;:&quot;category&quot;,&quot;options&quot;:[&quot;article&quot;,&quot;tutorial&quot;,&quot;guide&quot;,&quot;reference&quot;]},{&quot;name&quot;:&quot;difficulty&quot;,&quot;options&quot;:[&quot;beginner&quot;,&quot;intermediate&quot;,&quot;advanced&quot;]},{&quot;name&quot;:&quot;language&quot;,&quot;options&quot;:[&quot;javascript&quot;,&quot;python&quot;,&quot;java&quot;,&quot;go&quot;]},{&quot;name&quot;:&quot;topic&quot;,&quot;options&quot;:[]},{&quot;name&quot;:&quot;author&quot;,&quot;options&quot;:[]}]">
</zn-defined-label>
```

### E-commerce Product Labels

Label products with attributes and characteristics.

```html:preview
<zn-defined-label
  allow-custom
  predefined-labels="[{&quot;name&quot;:&quot;size&quot;,&quot;options&quot;:[&quot;xs&quot;,&quot;s&quot;,&quot;m&quot;,&quot;l&quot;,&quot;xl&quot;,&quot;xxl&quot;]},{&quot;name&quot;:&quot;color&quot;,&quot;options&quot;:[&quot;red&quot;,&quot;blue&quot;,&quot;green&quot;,&quot;black&quot;,&quot;white&quot;]},{&quot;name&quot;:&quot;material&quot;,&quot;options&quot;:[&quot;cotton&quot;,&quot;polyester&quot;,&quot;wool&quot;,&quot;silk&quot;]},{&quot;name&quot;:&quot;season&quot;,&quot;options&quot;:[&quot;spring&quot;,&quot;summer&quot;,&quot;fall&quot;,&quot;winter&quot;]},{&quot;name&quot;:&quot;brand&quot;,&quot;options&quot;:[]}]">
</zn-defined-label>
```


