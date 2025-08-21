---
meta:
  title: Select
  description: Selects allow you to choose items from a menu of predefined options.
layout: component
unusedProperties: |
  - Size `small`
  - Booleans `pill`
---

## Examples

### Basic Select with Label

Use the `label` attribute to give the select an accessible label. For labels that contain HTML, use the `label` slot
instead.

```html:preview

<form method="get" action="#">
  <zn-select name="something" label="Select one option" value="0">
    <zn-option value="0">Option 0</zn-option>
    <zn-option value="1">Option 1</zn-option>
    <zn-option value="2">Option 2</zn-option>
    <zn-option value="3">Option 3</zn-option>
    <zn-option value="4">Option 4</zn-option>
    <zn-option value="5">Option 5</zn-option>
    <zn-option value="6">Option 6</zn-option>
  </zn-select>
  
  <br>
  
  <zn-button type="submit">Submit</zn-button>
</form>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Help Text

Add descriptive help text to a select with the `help-text` attribute. For help texts that contain HTML, use the
`help-text` slot instead.

```html:preview
<zn-select label="Skill level" help-text="Select one option that best describes your current skill level">
  <zn-option value="1">Novice</zn-option>
  <zn-option value="2">Intermediate</zn-option>
  <zn-option value="3">Advanced</zn-option>
  <zn-option value="4">Expert</zn-option>
</zn-select>
<br>
<zn-select label="Skill level">
  <zn-option value="1">Novice</zn-option>
  <zn-option value="2">Intermediate</zn-option>
  <zn-option value="3">Advanced</zn-option>
  <zn-option value="4">Expert</zn-option>
  <div slot="help-text">Select one option that best describes your <strong>current</strong> skill level</div>
</zn-select>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when
selecting an option. Use **help text** to communicate instructions or requirements for choosing an option without
errors.
:::

```html:preview
<zn-select label="Skill level" label-tooltip="Although skill doesn't always map to years of experience, the following is a general guide: Novice (Less than 1 year); Intermediate (1-2 years); Advanced (3-5 years); Expert (5+ years)" help-text="Select one option that best describes your current skill level">
  <zn-option value="1">Novice</zn-option>
  <zn-option value="2">Intermediate</zn-option>
  <zn-option value="3">Advanced</zn-option>
  <zn-option value="4">Expert</zn-option>
</zn-select>
```

### Label with Context Note

Use the `context-note` attribute to add text that provides additional context or reference. For text that contains HTML,
use the `context-note` slot. **Note:** On small screens the context note will wrap below the label if there isn't enough
room next to the label.

:::tip
**Usage:** Use a **context note** to provide secondary contextual data, especially dynamic data, that would help people
when choosing an option. Use **help text** to communicate instructions or requirements for choosing an option without
errors.
:::

```html:preview
<zn-select label="Skill level" help-text="Select one option that best describes your current skill level">
  <div slot="context-note"><a href="javascript;" class="ts-text-link">See open positions by skill level</a></div>
  <zn-option value="1">Novice</zn-option>
  <zn-option value="2">Intermediate</zn-option>
  <zn-option value="3">Advanced</zn-option>
  <zn-option value="4">Expert</zn-option>
</zn-select>
```

### Placeholders

Use the `placeholder` attribute to add a placeholder.

```html:preview
<zn-select placeholder="Select one">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
</zn-select>
```

### Clearable

Use the `clearable` attribute to make the control clearable. The clear button only appears when an option is selected.

:::tip
**Usage:** Add a clear button only when **multiple** options can be selected. For the default single-choice use case (
the most common for selects), include an empty option that people can select to "clear" the current selection.
:::

```html:preview
<zn-select label="Clearable multi-choice select" clearable multiple value="option-1 option-2" help-text="For multi-choice selects only, display an icon button to let people clear their selections">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br />
<zn-select label="Clearable single-choice select" help-text="Add an empty value option to allow people to clear their selection in a single-choice select">
  <zn-option value=""></zn-option>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Pill

Use the `pill` attribute to give selects rounded edges.

:::warning
**Note:** Pill-shaped selects are not a standard pattern in our Design System, and there is no Figma component for this
option. Please check with the design team before using this option.
:::

```html:preview
<zn-select label="Medium pill" pill>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br />
<zn-select label="Large pill" size="large" pill>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Disabled

Use the `disabled` attribute to disable the entire select. To disable just one option, put `disabled` on the
`zn-option`.

```html:preview
<zn-select label="Disabled select" disabled>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br/>
<zn-select label="Select with disabled option">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3" disabled>Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>

```

### Multiple

To allow multiple options to be selected, use the `multiple` attribute. When this option is enabled, be sure to also add
the `clearable` attribute to display a clear button. To set multiple values at once, set `value` to a space-delimited
list of values.

```html:preview
<zn-select label="Select one or more" value="option-1 option-2 option-3" multiple clearable>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

:::tip
Note that multi-select options may wrap, causing the control to expand vertically. You can use the `max-options-visible`
attribute to control the maximum number of selected options to show at once.
:::

### Multiple with a limit

To limit the number of options that can be selected, use the `max-options` attribute.

```html:preview
<zn-select label="Select one or more" value="option-1 option-2" multiple clearable max-options="3">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Setting Initial Values

Use the `value` attribute to set the initial selection.

When using `multiple`, the `value` _attribute_ uses space-delimited values to select more than one option. Because of
this, `<zn-option>` values cannot contain spaces. If you're accessing the `value` _property_ through Javascript, it will
be an array.

```html:preview
<zn-select label="Select one or more" value="option-1 option-2" multiple clearable>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
</zn-select>
```

### Grouping Options

Use `<zn-divider>` to group listbox items visually. You can also use `<small>` to provide labels for each group, but
they won't be announced by most assistive devices.

:::warning
**Note:** `ts_form_for` doesn't support grouping select options with labels and dividers.
:::

```html:preview
<zn-select label="Select an option from one of the groups">
  <zn-option value=""></zn-option>
  <small>Section 1</small>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-divider></zn-divider>
  <small>Section 2</small>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Sizes

Use the `size` attribute to change a select's size. Note that size does not apply to listbox options. Size `medium` is
the selects default.

```html:preview
<zn-select label="Medium input">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br />
<zn-select label="Medium input" size="medium">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br />
<zn-select label="Large input" size="large">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Placement

The preferred placement of the select's listbox can be set with the `placement` attribute. Note that the actual position
may vary to ensure the panel remains in the viewport. Valid placements are `top` and `bottom`.

```html:preview
<zn-select label="Select an option" placement="top" help-text="This select’s panel of options will try to open on top first if there is room">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Prefix Icons

Use the `prefix` slot to prepend an icon to the select.

Follow these general guidelines when adding prefix icons to the select:

- Use the `zn-icon` component
- Use `library="fa"` (our default Font Awesome icon set)
- Use the `Regular` icon style, which means you don't need to add a `fas-` or other prefix to the icon name
  - See [icons sets](/components/icon/#icon-sets) for more about Font Awesome icon styles
- In general **don't** resize icons or change their color from the default already set by the `zn-select` component

:::warning
**Note:** If you find your use case requires a different size or color from the default, bring it up to the Design Team
so that we can consider whether the pattern needs to be updated.
:::
:::warning
**Note:** `ts_form_for` doesn't support slots. Prefix icons cannot be added when rendering `zn-select` with
`ts_form_for`.
:::

```html:preview
<zn-select label="Prefix icon example: DO">
  <zn-icon src="rocket_launch" slot="prefix"></zn-icon>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br />
<zn-select label="Prefix icon example: DON'T">
  <zn-icon  src="rocket_launch" style="font-size: 1.25rem; color:mediumaquamarine;" slot="prefix"></zn-icon>
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
<br />
<zn-select label="Prefix icon example: POSSIBLE EXCEPTION" help-text="An icon that is hard to read at the default size" value="option-1">
  <zn-icon src="account_circle_off" slot="prefix"></zn-icon>
  <zn-option value="option-1">Option 1 (default alignment)</zn-option>
  <zn-option value="option-2">Option 2 (default alignment)</zn-option>
  <zn-option value="option-3">Option 3 (default alignment)</zn-option>
  <zn-option value="option-4">Option 4 (default alignment)</zn-option></zn-select>
<br />
<zn-select label="Prefix icon example: RESIZED" help-text="Same icon as above, resized. Note that a larger prefix icon will push the option text out of alignment." value="option-1">
  <zn-icon  src="account_circle_off" size="24" slot="prefix"></zn-icon>
  <zn-option value="option-1">Option 1 (shifted 4px right due to icon size)</zn-option>
  <zn-option value="option-2">Option 2 (shifted 4px right due to icon size)</zn-option>
  <zn-option value="option-3">Option 3 (shifted 4px right due to icon size)</zn-option>
  <zn-option value="option-4">Option 4 (shifted 4px right due to icon size)</zn-option>
</zn-select>
```

### Custom Tags

When multiple options can be selected, you can provide custom tags by passing a function to the `getTag` property. Your
function can return a string of HTML, a <a href="https://lit.dev/docs/templates/overview/">Lit Template</a>, or an [
`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). The `getTag()` function will be called for
each option. The first argument is an `<zn-option>` element and the second argument is the tag's index (its position in
the tag list).

Remember that custom tags are rendered in a shadow root. To style them, you can use the `style` attribute in your
template or you can add your own [parts](/getting-started/customizing/#css-parts) and target them with the [
`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) selector.

:::warning
**Note:** In general, you shouldn't need to do this. If you are working on a design that requires custom styling for the
tag, please ensure that there's not a standard tag in the design system that would work instead.
:::
:::warning
**Note:** `ts_form_for` doesn't support slots. Custom tags cannot be added when rendering `zn-select` with
`ts_form_for`.
:::

```html:preview
<zn-select
  placeholder="Select one"
  value="email phone"
  multiple
  clearable
  class="custom-tag"
>
  <zn-option value="email">
    <zn-icon slot="prefix" name="envelope" library="fa"></zn-icon>
    Email
  </zn-option>
  <zn-option value="phone">
    <zn-icon slot="prefix" name="phone" library="fa"></zn-icon>
    Phone
  </zn-option>
  <zn-option value="chat">
    <zn-icon slot="prefix" name="comment" library="fa"></zn-icon>
    Chat
  </zn-option>
</zn-select>

<script type="module">
  const select = document.querySelector('.custom-tag');

  select.getTag = (option, index) => {
    // Use the same icon used in the <zn-option>
    const name = option.querySelector('zn-icon[slot="prefix"]').name;

    // You can return a string, a Lit Template, or an HTMLElement here
    return `
      <zn-tag removable>
        <zn-icon library="fa" name="${name}" style="padding-inline-end: .5rem;"></zn-icon>
        ${option.getTextLabel()}
      </zn-tag>
    `;
  };
</script>
```

:::warning
Be sure you trust the content you are outputting! Passing unsanitized user input to `getTag()` can result in XSS
vulnerabilities.
:::