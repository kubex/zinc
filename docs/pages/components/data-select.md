---
meta:
  title: Data Select
  description: A select component with built-in data providers for common options like countries, currencies, colors, and phone prefixes. Supports icons, filtering, multiple selection, and all standard select features.
layout: component
---

```html:preview

<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country" multiple></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency"></zn-data-select>
  <zn-data-select label="Color" provider="color" name="color"></zn-data-select>
</div>
```

## Examples

### Data Providers

The component includes built-in providers for common data types.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country"></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency"></zn-data-select>
  <zn-data-select label="Color" provider="color" name="color"></zn-data-select>
  <zn-data-select label="Phone Prefix" provider="phone" name="phone"></zn-data-select>
</div>
```

### With Default Values

Set a default selected value using the `value` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country" value="GB"></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency" value="USD"></zn-data-select>
  <zn-data-select label="Color" provider="color" name="color" value="blue"></zn-data-select>
</div>
```

### Icon Position

Control where the icon appears using the `icon-position` attribute. Options are `start`, `end`, or `none` (default).

```html:preview
<div class="form-spacing">
  <zn-data-select label="Icon at Start" provider="country" name="country" value="GB" icon-position="start"></zn-data-select>
  <zn-data-select label="Icon at End" provider="country" name="country" value="US" icon-position="end"></zn-data-select>
  <zn-data-select label="No Icon" provider="country" name="country" value="FR" icon-position="none"></zn-data-select>
</div>
```

### Icon Only

Display only the icon without text using the `icon-only` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select provider="color" name="color" value="red" icon-only></zn-data-select>
  <zn-data-select provider="country" name="country" value="GB" icon-only></zn-data-select>
  <zn-data-select provider="currency" name="currency" value="USD" icon-only></zn-data-select>
</div>
```

### Multiple Selection

Allow selecting multiple options using the `multiple` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Countries" provider="country" name="countries" multiple></zn-data-select>
  <zn-data-select label="Currencies" provider="currency" name="currencies" multiple></zn-data-select>
  <zn-data-select label="Colors" provider="color" name="colors" multiple></zn-data-select>
</div>
```

### Clearable

Add a clear button to reset the selection using the `clearable` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country" value="GB" clearable></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency" value="USD" clearable></zn-data-select>
  <zn-data-select label="Color" provider="color" name="color" value="blue" clearable></zn-data-select>
</div>
```

### Filtered Options

Use the `filter` attribute to show only specific options from the provider.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Major Countries" provider="country" name="country" filter="gb,us,fr,de,jp,cn"></zn-data-select>
  <zn-data-select label="Common Currencies" provider="currency" name="currency" filter="gbp,usd,eur,jpy"></zn-data-select>
  <zn-data-select label="Primary Colors" provider="color" name="color" filter="red,green,blue"></zn-data-select>
</div>
```

### Sizes

Control the size of the select using the `size` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Small" provider="country" name="country" size="small" value="GB"></zn-data-select>
  <zn-data-select label="Medium" provider="country" name="country" size="medium" value="US"></zn-data-select>
  <zn-data-select label="Large" provider="country" name="country" size="large" value="FR"></zn-data-select>
</div>
```

### With Help Text

Provide additional context using the `help-text` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country"
                  provider="country"
                  name="country"
                  help-text="Select your country of residence"></zn-data-select>
</div>
```

### Required Field

Mark fields as required using the `required` attribute.

```html:preview
<form>
  <div class="form-spacing">
    <zn-data-select label="Country" provider="country" name="country" required></zn-data-select>
    <zn-data-select label="Currency" provider="currency" name="currency" required></zn-data-select>
    <zn-button type="submit" color="success">Submit</zn-button>
  </div>
</form>
```

### Disabled State

Disable the select using the `disabled` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country" value="GB" disabled></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency" value="USD" disabled></zn-data-select>
</div>
```

### With Label Tooltip

Add a tooltip to the label using the `label-tooltip` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country"
                  provider="country"
                  name="country"
                  label-tooltip="This is used for shipping and tax calculations"></zn-data-select>
</div>
```

### With Context Note

Add contextual information using the `context-note` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Currency"
                  provider="currency"
                  name="currency"
                  context-note="Optional"></zn-data-select>
</div>
```

### Placement Options

Control where the dropdown menu appears using the `placement` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Opens Below" provider="country" name="country" placement="bottom"></zn-data-select>
  <zn-data-select label="Opens Above" provider="country" name="country" placement="top"></zn-data-select>
</div>
```

### Allow All Option

Include an "All" option at the top of the list using the `allow-all` attribute.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Country" provider="country" name="country" allow-all></zn-data-select>
  <zn-data-select label="Currency" provider="currency" name="currency" allow-all></zn-data-select>
</div>
```

### Common Currencies

For the currency provider, use `allow-common` to include a "Common Currencies" option.

```html:preview
<div class="form-spacing">
  <zn-data-select label="Currency" provider="currency" name="currency" allow-common></zn-data-select>
</div>
```

### Complete Form Example

A complete form using data-select components.

```html:preview
<form>
  <div class="form-spacing">
    <zn-data-select label="Country"
                    provider="country"
                    name="country"
                    required
                    clearable
                    icon-position="start"
                    help-text="Select your country"></zn-data-select>

    <zn-data-select label="Currency"
                    provider="currency"
                    name="currency"
                    required
                    clearable
                    help-text="Preferred currency for transactions"></zn-data-select>

    <zn-data-select label="Accent Color"
                    provider="color"
                    name="color"
                    icon-position="start"
                    help-text="Choose your preferred theme color"></zn-data-select>

    <zn-button type="submit" color="success">Save Preferences</zn-button>
  </div>
</form>
```