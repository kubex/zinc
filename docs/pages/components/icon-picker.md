---
meta:
  title: Icon Picker
  description: Icon pickers allow users to select an icon, library, and colour via a modal dialog.
layout: component
---

## Examples

### Basic Icon Picker

A basic icon picker with a label. Click the trigger to open the selection dialog.

```html:preview
<zn-icon-picker name="basic" label="Choose an Icon"></zn-icon-picker>
```

### With a Pre-selected Icon

Set the `icon` and `library` attributes to pre-populate the picker.

```html:preview
<zn-icon-picker name="preset" label="Page Icon" icon="home" library="material"></zn-icon-picker>
```

### With Colour

Set the `color` attribute to apply a colour to the icon.

```html:preview
<zn-icon-picker name="colored" label="Coloured Icon" icon="star" library="material" color="#e91e63"></zn-icon-picker>
```

### Without Colour Option

Use the `no-color` attribute to hide the colour picker from the selection dialog.

```html:preview
<zn-icon-picker name="no-color" label="Icon Only" icon="settings" no-color></zn-icon-picker>
```

### Without Library Option

Use the `no-library` attribute to hide the library selector, locking it to the default library.

```html:preview
<zn-icon-picker name="no-lib" label="Default Library Only" icon="check_circle" no-library></zn-icon-picker>
```

### Without Colour or Library

Both options can be removed together for a minimal icon-only picker.

```html:preview
<zn-icon-picker name="minimal" label="Minimal Picker" icon="edit" no-color no-library></zn-icon-picker>
```

### Brand Icons

Pre-select the `brands` library to show Kubex brand icons.

```html:preview
<zn-icon-picker name="brand" label="Brand Icon" icon="chargehive" library="brands"></zn-icon-picker>
```

### Line Icons

Use the `line` library for Lineicons.

```html:preview
<zn-icon-picker name="line" label="Line Icon" icon="heart" library="line"></zn-icon-picker>
```

### Gravatar

Use the `gravatar` library to display a Gravatar from an email address.

```html:preview
<zn-icon-picker name="grav" label="Gravatar" icon="user@example.com" library="gravatar" no-color></zn-icon-picker>
```

### Avatar

Use the `avatar` library to generate initials from a name.

```html:preview
<zn-icon-picker name="av" label="Avatar" icon="John Smith" library="avatar" no-color></zn-icon-picker>
```

### Help Text

Add descriptive text below the picker with the `help-text` attribute.

```html:preview
<zn-icon-picker name="help" label="Navigation Icon" help-text="This icon will be displayed in the sidebar menu"></zn-icon-picker>
```

### Disabled

Use the `disabled` attribute to prevent interaction.

```html:preview
<zn-icon-picker name="disabled" label="Disabled Picker" icon="lock" disabled></zn-icon-picker>
```

### In a Form

The icon picker integrates with forms using hidden inputs. The field names follow the pattern `{name}[icon]`, `{name}[library]`, and `{name}[color]`.

```html:preview
<form id="icon-form" onsubmit="return false;">
  <zn-icon-picker name="menu-icon" label="Menu Icon" icon="dashboard" library="material" color="#1976d2"></zn-icon-picker>
  <br>
  <zn-button type="submit" onclick="
    const form = document.getElementById('icon-form');
    const data = new FormData(form);
    const entries = [...data.entries()].map(([k,v]) => k + ': ' + v).join('\n');
    alert(entries);
  ">Show Form Data</zn-button>
</form>
```
