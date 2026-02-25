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

### Basic Select

Use the `label` attribute to give the select an accessible label. For labels that contain HTML, use the `label` slot instead.

```html:preview
<zn-select label="Select one option">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Initial Values

Use the `value` attribute to set the initial selection. You can also use the `selected` attribute on individual options.

```html:preview
<zn-select label="Select with initial value" value="option-2">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
</zn-select>
<br />
<zn-select label="Using selected attribute">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2" selected>Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
</zn-select>
```

When using `multiple`, the `value` attribute uses space-delimited values to select more than one option. Because of this, `<zn-option>` values cannot contain spaces. If you're accessing the `value` property through JavaScript, it will be an array.

### Help Text

Add descriptive help text to a select with the `help-text` attribute. For help texts that contain HTML, use the `help-text` slot instead.

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
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when selecting an option. Use **help text** to communicate instructions or requirements for choosing an option without errors.
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

Use the `context-note` attribute to add text that provides additional context or reference. For text that contains HTML, use the `context-note` slot. **Note:** On small screens the context note will wrap below the label if there isn't enough room next to the label.

:::tip
**Usage:** Use a **context note** to provide secondary contextual data, especially dynamic data, that would help people when choosing an option. Use **help text** to communicate instructions or requirements for choosing an option without errors.
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
**Usage:** Add a clear button only when **multiple** options can be selected. For the default single-choice use case (the most common for selects), include an empty option that people can select to "clear" the current selection.
:::

```html:preview
<zn-select label="Clearable multi-choice select" clearable multiple help-text="For multi-choice selects only, display an icon button to let people clear their selections">
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

### Search

Use the `search` attribute to allow users to type into the select to filter the list of options. When the dropdown opens, the input becomes editable and options are filtered as you type using case-insensitive substring matching against labels and values.

```html:preview
<zn-select label="Search for a country" search placeholder="Type to search...">
  <zn-option value="au">Australia</zn-option>
  <zn-option value="br">Brazil</zn-option>
  <zn-option value="ca">Canada</zn-option>
  <zn-option value="cn">China</zn-option>
  <zn-option value="fr">France</zn-option>
  <zn-option value="de">Germany</zn-option>
  <zn-option value="in">India</zn-option>
  <zn-option value="jp">Japan</zn-option>
  <zn-option value="mx">Mexico</zn-option>
  <zn-option value="uk">United Kingdom</zn-option>
  <zn-option value="us">United States</zn-option>
</zn-select>
```

### Search with Multiple Selection

Combine `search` with `multiple` to allow users to search and select multiple options. The search clears automatically after each selection so you can continue searching.

```html:preview
<zn-select label="Select your skills" search multiple clearable placeholder="Search skills...">
  <zn-option value="html">HTML</zn-option>
  <zn-option value="css">CSS</zn-option>
  <zn-option value="js">JavaScript</zn-option>
  <zn-option value="ts">TypeScript</zn-option>
  <zn-option value="react">React</zn-option>
  <zn-option value="vue">Vue</zn-option>
  <zn-option value="angular">Angular</zn-option>
  <zn-option value="node">Node.js</zn-option>
  <zn-option value="python">Python</zn-option>
  <zn-option value="go">Go</zn-option>
</zn-select>
```

### Disabled

Use the `disabled` attribute to disable the entire select. To disable just one option, put `disabled` on the `zn-option`.

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

### Sizes

Use the `size` attribute to change a select's size. Note that size does not apply to listbox options. Size `medium` is the selects default.

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

### Pill

Use the `pill` attribute to give selects rounded edges.

:::warning
**Note:** Pill-shaped selects are not a standard pattern in our Design System, and there is no Figma component for this option. Please check with the design team before using this option.
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

### Multiple Selection

To allow multiple options to be selected, use the `multiple` attribute. When this option is enabled, be sure to also add the `clearable` attribute to display a clear button. To set multiple values at once, set `value` to a space-delimited list of values.

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
Note that multi-select options may wrap, causing the control to expand vertically. You can use the `max-options-visible` attribute to control the maximum number of selected options to show at once.
:::

### Multiple with Limit

To limit the number of options that can be selected, use the `max-options` attribute.

```html:preview
<zn-select label="Select up to 3 options" value="option-1 option-2" multiple clearable max-options="3">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Maximum Visible Options

When using `multiple`, you can control how many selected options are displayed before showing a "+n" indicator using the `max-options-visible` attribute. Set to 0 to remove the limit.

```html:preview
<zn-select label="Show max 2 options" value="option-1 option-2 option-3 option-4" multiple clearable max-options-visible="2">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Grouping Options

Use `<zn-divider>` to group listbox items visually. You can also use `<small>` to provide labels for each group, but they won't be announced by most assistive devices.

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

### Placement

The preferred placement of the select's listbox can be set with the `placement` attribute. Note that the actual position may vary to ensure the panel remains in the viewport. Valid placements are `top` and `bottom`.

```html:preview
<zn-select label="Select an option" placement="top" help-text="This select's panel of options will try to open on top first if there is room">
  <zn-option value="option-1">Option 1</zn-option>
  <zn-option value="option-2">Option 2</zn-option>
  <zn-option value="option-3">Option 3</zn-option>
  <zn-option value="option-4">Option 4</zn-option>
  <zn-option value="option-5">Option 5</zn-option>
  <zn-option value="option-6">Option 6</zn-option>
</zn-select>
```

### Hoisting

Enable this option to prevent the listbox from being clipped when the component is placed inside a container with `overflow: auto|scroll`. Hoisting uses a fixed positioning strategy that works in many, but not all, scenarios.

```html:preview
<div style="overflow: auto; height: 150px; border: 1px solid var(--zn-color-neutral-200); padding: 1rem;">
  <zn-select label="With hoisting enabled" hoist>
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
    <zn-option value="option-4">Option 4</zn-option>
    <zn-option value="option-5">Option 5</zn-option>
    <zn-option value="option-6">Option 6</zn-option>
  </zn-select>
</div>
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
**Note:** If you find your use case requires a different size or color from the default, bring it up to the Design Team so that we can consider whether the pattern needs to be updated.
:::
:::warning
**Note:** `ts_form_for` doesn't support slots. Prefix icons cannot be added when rendering `zn-select` with `ts_form_for`.
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

### Checkbox Prefix

You can place a checkbox in the `prefix` slot to visually join it to the select. The checkbox will match the height of the control and can be interacted with independently (clicking or toggling it won't open the select).

```html:preview
<zn-select label="Notify me about" help-text="Use the checkbox to enable/disable notifications; choose a channel with the select">
  <zn-checkbox slot="prefix" aria-label="Enable notifications"></zn-checkbox>
  <zn-option value="email">Email</zn-option>
  <zn-option value="sms">SMS</zn-option>
  <zn-option value="push">Push</zn-option>
</zn-select>

<br />

<zn-select label="Large with checkbox" size="large" value="email">
  <zn-checkbox slot="prefix" size="large" aria-label="Enable notifications"></zn-checkbox>
  <zn-option value="email">Email</zn-option>
  <zn-option value="sms">SMS</zn-option>
  <zn-option value="push">Push</zn-option>
</zn-select>
```

### Custom Tags

When multiple options can be selected, you can provide custom tags by passing a function to the `getTag` property. Your function can return a string of HTML, a <a href="https://lit.dev/docs/templates/overview/">Lit Template</a>, or an [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). The `getTag()` function will be called for each option. The first argument is an `<zn-option>` element and the second argument is the tag's index (its position in the tag list).

Remember that custom tags are rendered in a shadow root. To style them, you can use the `style` attribute in your template or you can add your own [parts](/getting-started/customizing/#css-parts) and target them with the [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) selector.

:::warning
**Note:** In general, you shouldn't need to do this. If you are working on a design that requires custom styling for the tag, please ensure that there's not a standard tag in the design system that would work instead.
:::
:::warning
**Note:** `ts_form_for` doesn't support slots. Custom tags cannot be added when rendering `zn-select` with `ts_form_for`.
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
Be sure you trust the content you are outputting! Passing unsanitized user input to `getTag()` can result in XSS vulnerabilities.
:::

### Form Integration

Select components work seamlessly with standard HTML forms. The select's `name` attribute determines the key in the form data.

```html:preview
<form id="select-form">
  <zn-select name="favoriteColor" label="Favorite color" required>
    <zn-option value="red">Red</zn-option>
    <zn-option value="blue">Blue</zn-option>
    <zn-option value="green">Green</zn-option>
    <zn-option value="yellow">Yellow</zn-option>
  </zn-select>
  <br />
  <zn-select name="hobbies" label="Hobbies" multiple clearable>
    <zn-option value="reading">Reading</zn-option>
    <zn-option value="gaming">Gaming</zn-option>
    <zn-option value="cooking">Cooking</zn-option>
    <zn-option value="sports">Sports</zn-option>
  </zn-select>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
  <zn-button type="reset">Reset</zn-button>
</form>

<script type="module">
  const form = document.getElementById('select-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Validation

Select components support native HTML validation attributes like `required`. The component will show validation states and messages automatically.

```html:preview
<form id="validation-form" class="form-spacing">
  <zn-select name="country" label="Country" required help-text="This field is required">
    <zn-option value=""></zn-option>
    <zn-option value="us">United States</zn-option>
    <zn-option value="ca">Canada</zn-option>
    <zn-option value="uk">United Kingdom</zn-option>
    <zn-option value="au">Australia</zn-option>
  </zn-select>

  <zn-select name="interests" label="Select at least one interest" multiple clearable required help-text="Please select at least one option">
    <zn-option value="tech">Technology</zn-option>
    <zn-option value="art">Art</zn-option>
    <zn-option value="science">Science</zn-option>
    <zn-option value="music">Music</zn-option>
  </zn-select>

  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const validationForm = document.getElementById('validation-form');

  validationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(validationForm);
    const data = Object.fromEntries(formData);
    alert('Form is valid!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

You can also use custom validation with the `setCustomValidity()` method:

```html:preview
<form id="custom-validation-form">
  <zn-select id="age-range" name="ageRange" label="Age range">
    <zn-option value="under-18">Under 18</zn-option>
    <zn-option value="18-25">18-25</zn-option>
    <zn-option value="26-35">26-35</zn-option>
    <zn-option value="over-35">Over 35</zn-option>
  </zn-select>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const customValidationForm = document.getElementById('custom-validation-form');
  const ageRange = document.getElementById('age-range');

  ageRange.addEventListener('zn-change', () => {
    if (ageRange.value === 'under-18') {
      ageRange.setCustomValidity('You must be 18 or older to continue');
    } else {
      ageRange.setCustomValidity('');
    }
  });

  customValidationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (customValidationForm.reportValidity()) {
      alert('Form is valid!');
    }
  });
</script>
```

### Events

The select component emits several events you can listen to:

```html:preview
<div class="form-spacing">
  <zn-select id="event-example" label="Select an option" multiple clearable>
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
  </zn-select>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
    <strong>Event Log:</strong>
    <div id="event-log" style="margin-top: 0.5rem; font-family: monospace; font-size: 0.875rem;"></div>
  </div>
</div>

<script type="module">
  const select = document.getElementById('event-example');
  const eventLog = document.getElementById('event-log');

  function logEvent(eventName, detail) {
    const time = new Date().toLocaleTimeString();
    const message = `[${time}] ${eventName}${detail ? ': ' + JSON.stringify(detail) : ''}`;
    eventLog.innerHTML = message + '<br>' + eventLog.innerHTML;
    // Keep only last 5 events
    const lines = eventLog.innerHTML.split('<br>');
    if (lines.length > 5) {
      eventLog.innerHTML = lines.slice(0, 5).join('<br>');
    }
  }

  select.addEventListener('zn-change', (e) => logEvent('zn-change', { value: e.target.value }));
  select.addEventListener('zn-input', (e) => logEvent('zn-input'));
  select.addEventListener('zn-focus', (e) => logEvent('zn-focus'));
  select.addEventListener('zn-blur', (e) => logEvent('zn-blur'));
  select.addEventListener('zn-clear', (e) => logEvent('zn-clear'));
  select.addEventListener('zn-show', (e) => logEvent('zn-show'));
  select.addEventListener('zn-hide', (e) => logEvent('zn-hide'));
</script>
```

### Distinct Selects

Use the `distinct` attribute to link two selects so that selected values in one are hidden from the other. This is useful for scenarios where you want to prevent duplicate selections across multiple select controls.

```html:preview
<div class="form-spacing">
  <zn-select label="First select" multiple name="country-one" id="country-one" distinct="country-two">
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
    <zn-option value="option-4">Option 4</zn-option>
  </zn-select>
  <zn-select label="Second select" multiple name="country-two" id="country-two" distinct="country-one">
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
    <zn-option value="option-4">Option 4</zn-option>
  </zn-select>
</div>
```

### Conditional Selects

Use the `conditional` attribute to disable a select based on whether another select has a value. You can specify multiple select IDs separated by commas.

```html:preview
<div class="form-spacing">
  <zn-select label="Enable/disable the second select" multiple name="conditional-one" id="conditional-one" conditional="conditional-two">
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
  </zn-select>
  <zn-select label="This is disabled when first has value" multiple name="conditional-two" id="conditional-two" conditional="conditional-one">
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
  </zn-select>
</div>
```

### Programmatic Control

You can control the select programmatically using its methods:

```html:preview
<div class="form-spacing">
  <zn-select id="programmatic-select" label="Programmatic control" multiple clearable>
    <zn-option value="option-1">Option 1</zn-option>
    <zn-option value="option-2">Option 2</zn-option>
    <zn-option value="option-3">Option 3</zn-option>
    <zn-option value="option-4">Option 4</zn-option>
  </zn-select>

  <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <zn-button id="show-btn" size="small">Show</zn-button>
    <zn-button id="hide-btn" size="small">Hide</zn-button>
    <zn-button id="focus-btn" size="small">Focus</zn-button>
    <zn-button id="set-value-btn" size="small">Set Value</zn-button>
    <zn-button id="check-validity-btn" size="small">Check Validity</zn-button>
  </div>
</div>

<script type="module">
  const select = document.getElementById('programmatic-select');

  document.getElementById('show-btn').addEventListener('click', () => select.show());
  document.getElementById('hide-btn').addEventListener('click', () => select.hide());
  document.getElementById('focus-btn').addEventListener('click', () => select.focus());
  document.getElementById('set-value-btn').addEventListener('click', () => {
    select.value = ['option-2', 'option-3'];
  });
  document.getElementById('check-validity-btn').addEventListener('click', () => {
    alert('Valid: ' + select.checkValidity());
  });
</script>
```

### Keyboard Navigation

The select component supports comprehensive keyboard navigation:

- **Tab** - Move focus to/from the select
- **Enter** or **Space** - Open the dropdown (when closed) or select the current option (when open)
- **Escape** - Close the dropdown
- **Arrow Up/Down** - Navigate through options
- **Home/End** - Jump to first/last option
- **Type characters** - Jump to options starting with typed characters (type-to-select)

When `search` is enabled, **Space** types into the input instead of toggling the dropdown, and **Arrow Up/Down** skips filtered (hidden) options.

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the label to the left of the control.

```html:preview
<zn-select class="label-on-left" label="Country">
  <zn-option value="us">United States</zn-option>
  <zn-option value="ca">Canada</zn-option>
  <zn-option value="uk">United Kingdom</zn-option>
</zn-select>

<style>
  .label-on-left {
    --label-width: 5rem;
  }

  .label-on-left::part(form-control) {
    display: grid;
    grid: auto / var(--label-width) 1fr;
    gap: var(--zn-spacing-3x-small) var(--zn-spacing-medium);
    align-items: center;
  }

  .label-on-left::part(form-control-label) {
    text-align: right;
  }

  .label-on-left::part(form-control-help-text) {
    grid-column-start: 2;
  }
</style>
```
