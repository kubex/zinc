---
meta:
  title: Radio Group
  description:
layout: component
---

```html:preview
<zn-radio-group>
  <zn-radio value="1">Option 1</zn-radio>
  <zn-radio value="2">Option 2</zn-radio>
  <zn-radio value="3">Option 3</zn-radio>
</zn-radio-group>
```

## Examples

### Basic Radio Group

A basic radio group lays out multiple radio items vertically.

```html:preview
<zn-radio-group label="Financial products permissions" name="a">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
```

### Help Text

Add descriptive help text to a radio group with the `help-text` attribute. For help texts that contain HTML, use the
`help-text` slot instead.

```html:preview
<zn-radio-group label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" name="a">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when
making a selection from the radio group. Use **help text** to communicate instructions or requirements for making a
selection without errors.
:::

```html:preview
<zn-radio-group name="a" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" label-tooltip="These apply to cash account only">
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
```

### Horizontal Radio Group

Use the `horizontal` attribute to lay out multiple radio items horizontally.

:::tip
**Making the horizontal radio group responsive:** Use a container query to adjust the layout of the radio group's
`form-control-input` part (which wraps the radio items) at a custom target breakpoint (the container's width when the
horizontal layout breaks). In the example below, a container query checks the width of the radio group container and
switches the layout to vertical (setting `flex-direction` to `column`) when the container becomes too narrow for a
horizontal layout.
:::

```html:preview
<zn-radio-group name="a" id="permissions" label="Financial products permissions" horizontal>
  <zn-radio value="manage-transfers">Manage transfers</zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>

<style>
  zn-radio-group[id="permissions"] {
    container-type: inline-size;
    container-name: permissions;
  }

  @container permissions (max-width: 400px) {
    zn-radio-group[id="permissions"]::part(form-control-input) {
      flex-direction: column;
    }
  }
</style>
```

### Contained Radio Group

Use the `contained` attribute to draw a card-like container around each radio item in the radio group. This style
is useful for giving more emphasis to the list of options.

This option can be combined with the `horizontal` attribute.

```html:preview
<zn-radio-group name="a" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" contained>
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export">Export transactions</zn-radio>
</zn-radio-group>
<br/>
<br/>
<zn-radio-group name="b" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" contained horizontal>
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
</zn-radio-group>
```

:::tip
When [radios](/components/radio) are wrapped with the Radio Group , adding the `contained` attribute to the
parent Radio Group or to _any_ radio in the group will create `contained` radios for the entire group.
:::

### Disabling Options

Radios can be disabled by adding the `disabled` attribute to the respective options inside the radio group.

```html:preview
<zn-radio-group name="a"  label="Financial products permissions" help-text="Exporting is currently disabled for all users" required>
  <zn-radio value="initiate-outbound">Initiate outbound transfers</zn-radio>
  <zn-radio value="approve-outbound">Approve outbound transfers </zn-radio>
  <zn-radio value="export" disabled>Export transactions</zn-radio>
</zn-radio-group>
```
