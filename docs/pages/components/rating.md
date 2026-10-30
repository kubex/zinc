---
meta:
  title: Rating
  description: Ratings allow users to view and provide feedback using a star rating system.
layout: component
---

```html:preview
<zn-rating></zn-rating>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Rating

A basic rating component displays stars that can be clicked to set a rating value.

```html:preview
<zn-rating label="Rate this product"></zn-rating>
```

### With Value

Use the `value` attribute to set an initial rating value.

```html:preview
<zn-rating value="3" label="Product rating"></zn-rating>
```

### Maximum Rating

Use the `max` attribute to change the maximum number of stars. The default is 5.

```html:preview
<zn-rating max="10" value="7" label="Rate out of 10"></zn-rating>
<br />
<zn-rating max="3" value="2" label="Difficulty level"></zn-rating>
```

### Precision

Use the `precision` attribute to control the granularity of ratings. The default precision is 1 (whole stars).

```html:preview
<zn-rating value="2.5" precision="0.5" label="Half star precision"></zn-rating>
<br />
<zn-rating value="3.75" precision="0.25" label="Quarter star precision"></zn-rating>
<br />
<zn-rating value="3.33" precision="0.1" label="Tenth star precision"></zn-rating>
```

### Readonly

Use the `readonly` attribute to display a rating that cannot be changed. This is useful for showing existing ratings.

```html:preview
<zn-rating value="4" readonly label="Average rating"></zn-rating>
<br />
<zn-rating value="3.5" precision="0.5" readonly label="Customer reviews"></zn-rating>
```

### Disabled

Use the `disabled` attribute to disable the rating component.

```html:preview
<zn-rating disabled label="Rating disabled"></zn-rating>
<br />
<zn-rating value="3" disabled label="Rating disabled with value"></zn-rating>
```

### Help Text

Add descriptive help text to a rating with the `help-text` attribute. For help text that contains HTML, use the
`help-text` slot instead.

```html:preview
<zn-rating label="Rate this product" help-text="Select a star to rate this product."></zn-rating>
<br />
<zn-rating value="3" precision="0.5" label="Overall rating">
  <div slot="help-text">Ratings are <strong>public</strong> and can be changed at any time.</div>
</zn-rating>
```

Help text is styled to match [Input](/components/input) and follows the `size` attribute.

```html:preview
<zn-rating size="small" value="3" help-text="Small help text"></zn-rating>
<br />
<zn-rating size="medium" value="3" help-text="Medium help text"></zn-rating>
<br />
<zn-rating size="large" value="3" help-text="Large help text"></zn-rating>
```

### Sizes

Use the `size` attribute to change the rating size. Available sizes are `small`, `medium` (default), and `large`.

```html:preview
<zn-rating size="small" value="3" label="Small rating"></zn-rating>
<br />
<zn-rating size="medium" value="3" label="Medium rating"></zn-rating>
<br />
<zn-rating size="large" value="3" label="Large rating"></zn-rating>
```

### Custom Symbols

Use the `getSymbol` property to customize the symbols displayed. By default, the component uses star icons from the Material icon library.

```html:preview
<zn-rating id="custom-symbol-heart" value="3" label="Rate with hearts"></zn-rating>
<br />
<zn-rating id="custom-symbol-emoji" value="4" max="5" label="Rate with emojis"></zn-rating>

<script type="module">
  const heartRating = document.querySelector('#custom-symbol-heart');
  heartRating.getSymbol = () => '<zn-icon src="favorite" library="material"></zn-icon>';

  const emojiRating = document.querySelector('#custom-symbol-emoji');
  emojiRating.getSymbol = () => '<zn-icon src="sentiment_satisfied" library="material"></zn-icon>';
</script>
```

### Hover Effects

The rating component displays hover effects by default, scaling the hovered star and all preceding stars.

```html:preview
<zn-rating value="0" label="Hover to preview rating"></zn-rating>
```

:::tip
**Usage:** Hover effects provide visual feedback to help users understand which rating they will select. The hover effect is automatically disabled for `readonly` and `disabled` ratings.
:::

### Preview

Use the `preview` attribute to show the value next to the symbols. While the pointer moves across the symbols the
preview follows it, so the value being selected is visible before it is committed. Once the pointer leaves, the preview
falls back to the selected value.

```html:preview
<zn-rating preview label="Rate this product"></zn-rating>
<br />
<zn-rating preview value="2.5" precision="0.5" label="Half star precision"></zn-rating>
<br />
<zn-rating preview value="3.75" precision="0.25" max="10" size="large" label="Quarter star precision"></zn-rating>
```

The preview is formatted to match `precision`, so a rating with `precision="0.5"` previews `4.5` rather than `4`.
It also works with `readonly` and `disabled` ratings, where it simply displays the current value.

```html:preview
<zn-rating preview value="4.5" precision="0.5" readonly label="Average rating"></zn-rating>
<br />
<zn-rating preview value="3" disabled label="Rating disabled"></zn-rating>
```

Style the preview with the `--preview-color` and `--preview-size` custom properties, or the `preview` part.

```html:preview
<zn-rating
  preview
  value="4"
  label="Custom preview styling"
  style="--preview-color: #3B82F6; --preview-size: 1.25rem;"
></zn-rating>
```

### Form Integration

Ratings work seamlessly with forms and will be submitted with form data using the `name` attribute.

```html:preview
<form id="rating-form">
  <zn-rating name="product-rating" value="0" label="Rate this product" required></zn-rating>
  <br />
  <zn-rating name="service-rating" value="4" label="Rate our service"></zn-rating>
  <br /><br />
  <zn-button type="submit" color="primary">Submit Review</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('#rating-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    alert('Form submitted: ' + JSON.stringify(data, null, 2));
  });
</script>
```

### Interactive Example with Value Display

This example demonstrates how the rating value changes as you interact with the component.

```html:preview
<div>
  <zn-rating id="interactive-rating" value="0" precision="0.5" label="Rate your experience"></zn-rating>
  <div id="rating-value" style="margin-top: 1rem; padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
    <strong>Current Rating:</strong> <span id="rating-display">0</span> out of 5
  </div>
</div>

<script type="module">
  const rating = document.querySelector('#interactive-rating');
  const display = document.querySelector('#rating-display');

  // Update display when rating changes
  const updateDisplay = () => {
    display.textContent = rating.value || '0';
  };

  // Listen for value changes
  rating.addEventListener('click', updateDisplay);

  // Update initial display
  updateDisplay();
</script>
```

### Clearable Rating

Click on the currently selected rating to clear it and set the value back to 0.

```html:preview
<zn-rating value="3" label="Click selected rating to clear"></zn-rating>
```

:::tip
**Usage:** This feature allows users to remove their rating if they change their mind. Clicking on the currently selected star will reset the rating to 0.
:::

### Display Patterns

Common patterns for displaying ratings in user interfaces.

```html:preview
<div style="display: flex; align-items: center; gap: 0.5rem;">
  <zn-rating value="4.5" precision="0.5" readonly size="small"></zn-rating>
  <span style="font-size: 14px; color: #6D7176;">4.5 out of 5 (1,234 reviews)</span>
</div>

<br />

<div style="display: flex; align-items: center; gap: 0.5rem;">
  <zn-rating value="3.75" precision="0.25" readonly></zn-rating>
  <span style="font-weight: 600;">3.75</span>
</div>

<br />

<div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 1.5rem; max-width: 400px;">
  <h3 style="margin: 0 0 0.5rem 0; font-size: 18px;">Customer Reviews</h3>
  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
    <zn-rating value="4.2" precision="0.1" readonly></zn-rating>
    <span style="font-size: 20px; font-weight: 600;">4.2</span>
    <span style="color: #6D7176;">based on 856 reviews</span>
  </div>
  <zn-rating value="0" label="Rate this product"></zn-rating>
</div>
```

### Accessibility

The rating component includes ARIA attributes for accessibility:

- Uses `role="slider"` to indicate interactive rating control
- Provides `aria-label` for screen readers (set via the `label` attribute)
- Includes `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes
- Respects `aria-disabled` and `aria-readonly` states

```html:preview
<zn-rating value="3" label="Product quality rating" max="5"></zn-rating>
```

:::tip
**Best Practice:** Always provide a descriptive `label` attribute to ensure screen reader users understand what they are rating.
:::

### Touch Support

The rating component fully supports touch interactions for mobile devices.

```html:preview
<zn-rating value="0" label="Try on touch device"></zn-rating>
```

:::tip
**Usage:** Touch events are handled alongside mouse events, allowing users to drag their finger across the stars to preview and select a rating. The component will update the rating when the touch ends.
:::

### Custom Styling

Use CSS custom properties to customize the appearance of the rating component.

```html:preview
<style>
  .custom-rating {
    --symbol-color: #CBD5E1;
    --symbol-color-active: #3B82F6;
    --symbol-size: 2rem;
    --symbol-spacing: 8px;
  }

  .custom-rating-gold {
    --symbol-color: #E5E7EB;
    --symbol-color-active: #F59E0B;
    --symbol-size: 1.5rem;
  }
</style>

<zn-rating class="custom-rating" value="4" label="Custom blue rating"></zn-rating>
<br />
<zn-rating class="custom-rating-gold" value="3.5" precision="0.5" label="Custom gold rating"></zn-rating>
```

Available CSS custom properties:

- `--symbol-color` - Color of unfilled symbols
- `--symbol-color-active` - Color of filled/active symbols
- `--symbol-size` - Size of the symbols
- `--symbol-spacing` - Gap between symbols. The rating adds no padding of its own, so the first symbol sits flush with
  the component's edge and lines up with other form controls.
- `--preview-color` - Color of the preview value (see [Preview](#preview))
- `--preview-size` - Font size of the preview value

### Complete Example

Here's a comprehensive example demonstrating multiple rating features in a product review form:

```html:preview
<form id="complete-rating-form" style="max-width: 500px; padding: 1.5rem; border: 1px solid #E5E7EB; border-radius: 8px;">
  <h3 style="margin: 0 0 1.5rem 0;">Product Review</h3>

  <zn-rating
    name="overall-rating"
    value="0"
    label="Overall Rating"
    max="5"
    precision="0.5"
    required
  ></zn-rating>

  <br />

  <zn-rating
    name="quality-rating"
    value="0"
    label="Quality"
    max="5"
    size="small"
  ></zn-rating>

  <br />

  <zn-rating
    name="value-rating"
    value="0"
    label="Value for Money"
    max="5"
    size="small"
  ></zn-rating>

  <br />

  <zn-rating
    name="ease-rating"
    value="0"
    label="Ease of Use"
    max="5"
    size="small"
  ></zn-rating>

  <br /><br />
  <zn-button type="submit" color="primary">Submit Review</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<div id="review-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; display: none;">
  <strong>Review Data:</strong>
  <pre id="review-data" style="margin-top: 0.5rem; white-space: pre-wrap;"></pre>
</div>

<script type="module">
  const form = document.querySelector('#complete-rating-form');
  const output = document.querySelector('#review-output');
  const dataDisplay = document.querySelector('#review-data');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    dataDisplay.textContent = JSON.stringify(data, null, 2);
    output.style.display = 'block';
  });

  form.addEventListener('reset', () => {
    output.style.display = 'none';
  });
</script>
```


