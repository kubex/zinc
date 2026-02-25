---
meta:
  title: Option Group
  description: Option groups organize options within a select under labeled headers.
layout: component
---

## Examples

### Basic Option Group

Use `<zn-opt-group>` inside a `<zn-select>` to group related options under a labeled header. Set the `label` attribute to provide the group heading.

```html:preview
<zn-select label="Select a fruit">
  <zn-opt-group label="Citrus">
    <zn-option value="orange">Orange</zn-option>
    <zn-option value="lemon">Lemon</zn-option>
    <zn-option value="lime">Lime</zn-option>
  </zn-opt-group>
  <zn-opt-group label="Berries">
    <zn-option value="strawberry">Strawberry</zn-option>
    <zn-option value="blueberry">Blueberry</zn-option>
    <zn-option value="raspberry">Raspberry</zn-option>
  </zn-opt-group>
</zn-select>
```

### Disabled Group

Use the `disabled` attribute to disable all options within a group. Disabled groups propagate the disabled state to their child options automatically.

```html:preview
<zn-select label="Select a plan">
  <zn-opt-group label="Available">
    <zn-option value="basic">Basic</zn-option>
    <zn-option value="pro">Pro</zn-option>
  </zn-opt-group>
  <zn-opt-group label="Coming Soon" disabled>
    <zn-option value="enterprise">Enterprise</zn-option>
    <zn-option value="unlimited">Unlimited</zn-option>
  </zn-opt-group>
</zn-select>
```

### With Search

When used inside a `<zn-select>` with the `search` attribute, group headers automatically hide when all of their child options are filtered out by the search query.

```html:preview
<zn-select label="Select a country" search placeholder="Type to search...">
  <zn-opt-group label="North America">
    <zn-option value="us">United States</zn-option>
    <zn-option value="ca">Canada</zn-option>
    <zn-option value="mx">Mexico</zn-option>
  </zn-opt-group>
  <zn-opt-group label="Europe">
    <zn-option value="gb">United Kingdom</zn-option>
    <zn-option value="de">Germany</zn-option>
    <zn-option value="fr">France</zn-option>
  </zn-opt-group>
  <zn-opt-group label="Asia">
    <zn-option value="jp">Japan</zn-option>
    <zn-option value="cn">China</zn-option>
    <zn-option value="in">India</zn-option>
  </zn-opt-group>
</zn-select>
```

### Mixed Grouped and Ungrouped

You can mix standalone options with grouped options in the same select.

```html:preview
<zn-select label="Select an option">
  <zn-option value="none">None</zn-option>
  <zn-opt-group label="Group A">
    <zn-option value="a1">Option A1</zn-option>
    <zn-option value="a2">Option A2</zn-option>
  </zn-opt-group>
  <zn-opt-group label="Group B">
    <zn-option value="b1">Option B1</zn-option>
    <zn-option value="b2">Option B2</zn-option>
  </zn-opt-group>
</zn-select>
```

### Multiple Selection with Groups

Option groups work with multi-select. Use `multiple` and `clearable` on the parent `<zn-select>`.

```html:preview
<zn-select label="Select your skills" multiple clearable search placeholder="Search skills...">
  <zn-opt-group label="Frontend">
    <zn-option value="html">HTML</zn-option>
    <zn-option value="css">CSS</zn-option>
    <zn-option value="js">JavaScript</zn-option>
    <zn-option value="ts">TypeScript</zn-option>
  </zn-opt-group>
  <zn-opt-group label="Backend">
    <zn-option value="node">Node.js</zn-option>
    <zn-option value="go">Go</zn-option>
    <zn-option value="python">Python</zn-option>
    <zn-option value="php">PHP</zn-option>
  </zn-opt-group>
</zn-select>
```
