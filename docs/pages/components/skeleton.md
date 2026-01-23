---
meta:
  title: Skeleton
  description: Skeletons are placeholder elements that indicate content is loading, improving perceived performance and user experience.
layout: component
fullWidth: true
---

```html:preview
<zn-skeleton></zn-skeleton>
```

Skeleton loaders provide visual placeholders while content is being loaded, helping users understand that something is happening and reducing perceived wait time. They create a better user experience by showing the approximate shape and layout of content before it arrives.

## Examples

### Basic Skeleton

A basic skeleton with default dimensions provides a simple loading placeholder.

```html:preview
<zn-skeleton></zn-skeleton>
```

### Custom Dimensions

Use the `width` and `height` attributes to match the skeleton to your content's dimensions.

```html:preview
<div style="display: grid; gap: 10px;">
  <zn-skeleton width="200px" height="20px"></zn-skeleton>
  <zn-skeleton width="300px" height="20px"></zn-skeleton>
  <zn-skeleton width="250px" height="20px"></zn-skeleton>
</div>
```

### Height Variations

Use the `height` attribute to create skeletons of different heights for various content types.

```html:preview
<div style="display: grid; gap: 10px;">
  <zn-skeleton height="20px"></zn-skeleton>
  <zn-skeleton height="40px"></zn-skeleton>
  <zn-skeleton height="60px"></zn-skeleton>
  <zn-skeleton height="100px"></zn-skeleton>
</div>
```

### Width Variations

Use the `width` attribute to control skeleton width. Percentages and fixed values are both supported.

```html:preview
<div style="display: grid; gap: 10px;">
  <zn-skeleton width="25%"></zn-skeleton>
  <zn-skeleton width="50%"></zn-skeleton>
  <zn-skeleton width="75%"></zn-skeleton>
  <zn-skeleton width="100%"></zn-skeleton>
</div>
```

### Border Radius

Use the `radius` attribute to match your content's border radius and create different shapes.

```html:preview
<div style="display: grid; gap: 10px;">
  <zn-skeleton radius="0"></zn-skeleton>
  <zn-skeleton radius="4px"></zn-skeleton>
  <zn-skeleton radius="8px"></zn-skeleton>
  <zn-skeleton radius="16px"></zn-skeleton>
  <zn-skeleton radius="50px"></zn-skeleton>
</div>
```

### Animation Speed

Use the `speed` attribute to control the animation speed. Slower animations can feel more polished, while faster animations suggest quicker loading.

```html:preview
<div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; align-items: center;">
  <strong>Fast (1.5s):</strong>
  <zn-skeleton speed="1.5s"></zn-skeleton>

  <strong>Default (3s):</strong>
  <zn-skeleton speed="3s"></zn-skeleton>

  <strong>Slow (5s):</strong>
  <zn-skeleton speed="5s"></zn-skeleton>
</div>
```

### Circular Skeletons

Create circular skeleton loaders perfect for avatars by using equal width and height with a large border radius.

```html:preview
<div style="display: flex; gap: 16px; align-items: center;">
  <zn-skeleton width="40px" height="40px" radius="50%"></zn-skeleton>
  <zn-skeleton width="60px" height="60px" radius="50%"></zn-skeleton>
  <zn-skeleton width="80px" height="80px" radius="50%"></zn-skeleton>
  <zn-skeleton width="100px" height="100px" radius="50%"></zn-skeleton>
</div>
```

### Text Line Skeletons

Create text-like loading patterns with varying widths to simulate paragraphs.

```html:preview
<div style="display: grid; gap: 8px; max-width: 600px;">
  <zn-skeleton width="100%" height="16px"></zn-skeleton>
  <zn-skeleton width="95%" height="16px"></zn-skeleton>
  <zn-skeleton width="98%" height="16px"></zn-skeleton>
  <zn-skeleton width="85%" height="16px"></zn-skeleton>
  <zn-skeleton width="92%" height="16px"></zn-skeleton>
  <zn-skeleton width="60%" height="16px"></zn-skeleton>
</div>
```

### Card Skeleton

Combine multiple skeleton elements to create a complete card loading state.

```html:preview
<div style="max-width: 400px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <zn-skeleton width="100%" height="200px" radius="8px"></zn-skeleton>
  <div style="margin-top: 16px;">
    <zn-skeleton width="70%" height="24px" radius="4px"></zn-skeleton>
    <div style="margin-top: 12px;">
      <zn-skeleton width="100%" height="16px" radius="4px"></zn-skeleton>
      <div style="margin-top: 8px;">
        <zn-skeleton width="100%" height="16px" radius="4px"></zn-skeleton>
      </div>
      <div style="margin-top: 8px;">
        <zn-skeleton width="80%" height="16px" radius="4px"></zn-skeleton>
      </div>
    </div>
    <div style="margin-top: 16px; display: flex; gap: 8px;">
      <zn-skeleton width="100px" height="36px" radius="4px"></zn-skeleton>
      <zn-skeleton width="100px" height="36px" radius="4px"></zn-skeleton>
    </div>
  </div>
</div>
```

### User Profile Skeleton

Create a user profile loading state with avatar and text lines.

```html:preview
<div style="display: flex; gap: 16px; align-items: start; max-width: 500px;">
  <zn-skeleton width="64px" height="64px" radius="50%"></zn-skeleton>
  <div style="flex: 1; display: grid; gap: 10px;">
    <zn-skeleton width="60%" height="20px" radius="4px"></zn-skeleton>
    <zn-skeleton width="40%" height="16px" radius="4px"></zn-skeleton>
    <zn-skeleton width="90%" height="14px" radius="4px"></zn-skeleton>
  </div>
</div>
```

### List Item Skeletons

Create loading states for list items with consistent patterns.

```html:preview
<div style="display: grid; gap: 16px; max-width: 600px;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <zn-skeleton width="48px" height="48px" radius="8px"></zn-skeleton>
    <div style="flex: 1; display: grid; gap: 8px;">
      <zn-skeleton width="70%" height="18px"></zn-skeleton>
      <zn-skeleton width="50%" height="14px"></zn-skeleton>
    </div>
  </div>
  <div style="display: flex; gap: 12px; align-items: center;">
    <zn-skeleton width="48px" height="48px" radius="8px"></zn-skeleton>
    <div style="flex: 1; display: grid; gap: 8px;">
      <zn-skeleton width="65%" height="18px"></zn-skeleton>
      <zn-skeleton width="45%" height="14px"></zn-skeleton>
    </div>
  </div>
  <div style="display: flex; gap: 12px; align-items: center;">
    <zn-skeleton width="48px" height="48px" radius="8px"></zn-skeleton>
    <div style="flex: 1; display: grid; gap: 8px;">
      <zn-skeleton width="75%" height="18px"></zn-skeleton>
      <zn-skeleton width="55%" height="14px"></zn-skeleton>
    </div>
  </div>
</div>
```

### Table Row Skeletons

Create loading states for table rows.

```html:preview
<div style="max-width: 800px;">
  <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 100px; gap: 16px; padding: 12px; border-bottom: 1px solid #e0e0e0;">
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
  </div>
  <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 100px; gap: 16px; padding: 12px; border-bottom: 1px solid #e0e0e0;">
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
  </div>
  <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 100px; gap: 16px; padding: 12px; border-bottom: 1px solid #e0e0e0;">
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
    <zn-skeleton height="20px"></zn-skeleton>
  </div>
</div>
```

### Form Skeletons

Create loading states for form fields.

```html:preview
<div style="max-width: 500px; display: grid; gap: 20px;">
  <div>
    <zn-skeleton width="120px" height="16px" radius="4px"></zn-skeleton>
    <div style="margin-top: 8px;">
      <zn-skeleton width="100%" height="40px" radius="4px"></zn-skeleton>
    </div>
  </div>
  <div>
    <zn-skeleton width="150px" height="16px" radius="4px"></zn-skeleton>
    <div style="margin-top: 8px;">
      <zn-skeleton width="100%" height="40px" radius="4px"></zn-skeleton>
    </div>
  </div>
  <div>
    <zn-skeleton width="100px" height="16px" radius="4px"></zn-skeleton>
    <div style="margin-top: 8px;">
      <zn-skeleton width="100%" height="80px" radius="4px"></zn-skeleton>
    </div>
  </div>
  <zn-skeleton width="120px" height="42px" radius="4px"></zn-skeleton>
</div>
```

### Dynamic Loading Simulation

A practical example showing how to toggle between loading and loaded states.

```html:preview
<div id="skeleton-demo">
  <div id="content-container"></div>
  <br />
  <zn-button id="toggle-loading">Toggle Loading State</zn-button>
</div>

<script type="module">
  const container = document.getElementById('content-container');
  const button = document.getElementById('toggle-loading');
  let isLoading = true;

  function renderSkeleton() {
    container.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: start; max-width: 500px;">
        <zn-skeleton width="64px" height="64px" radius="50%"></zn-skeleton>
        <div style="flex: 1; display: grid; gap: 10px;">
          <zn-skeleton width="60%" height="20px"></zn-skeleton>
          <zn-skeleton width="40%" height="16px"></zn-skeleton>
          <zn-skeleton width="90%" height="14px"></zn-skeleton>
          <zn-skeleton width="85%" height="14px"></zn-skeleton>
        </div>
      </div>
    `;
  }

  function renderContent() {
    container.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: start; max-width: 500px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0;">Jane Doe</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Senior Software Engineer</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            Passionate about building great user experiences and writing clean, maintainable code.
            Loves working with modern web technologies.
          </p>
        </div>
      </div>
    `;
  }

  // Initial render
  renderSkeleton();

  button.addEventListener('click', () => {
    isLoading = !isLoading;
    if (isLoading) {
      renderSkeleton();
    } else {
      renderContent();
    }
  });
</script>
```

### Data Grid Skeleton

Create a complete data grid loading state.

```html:preview
<div style="max-width: 900px;">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px;">
      <zn-skeleton width="100%" height="140px" radius="6px"></zn-skeleton>
      <div style="margin-top: 12px;">
        <zn-skeleton width="80%" height="18px"></zn-skeleton>
        <div style="margin-top: 8px;">
          <zn-skeleton width="60%" height="14px"></zn-skeleton>
        </div>
      </div>
    </div>
    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px;">
      <zn-skeleton width="100%" height="140px" radius="6px"></zn-skeleton>
      <div style="margin-top: 12px;">
        <zn-skeleton width="75%" height="18px"></zn-skeleton>
        <div style="margin-top: 8px;">
          <zn-skeleton width="55%" height="14px"></zn-skeleton>
        </div>
      </div>
    </div>
    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px;">
      <zn-skeleton width="100%" height="140px" radius="6px"></zn-skeleton>
      <div style="margin-top: 12px;">
        <zn-skeleton width="85%" height="18px"></zn-skeleton>
        <div style="margin-top: 8px;">
          <zn-skeleton width="65%" height="14px"></zn-skeleton>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Properties

The skeleton component exposes the following attributes and properties:

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `speed` | `speed` | `string` | `"3s"` | Animation speed for the shimmer effect. Accepts any valid CSS time value (e.g., "1.5s", "2000ms"). |
| `width` | `width` | `string` | `"100%"` | Width of the skeleton element. Accepts any valid CSS width value (e.g., "200px", "50%", "10rem"). |
| `height` | `height` | `string` | `"20px"` | Height of the skeleton element. Accepts any valid CSS height value (e.g., "40px", "3rem", "10vh"). |
| `radius` | `radius` | `string` | `"4px"` | Border radius of the skeleton element. Accepts any valid CSS border-radius value (e.g., "0", "8px", "50%"). |

## Behavior

### Animation

The skeleton component uses a CSS-based shimmer animation that moves a lighter gradient across the skeleton surface. This animation:

- Runs continuously in a loop
- Moves from right to left across the element
- Uses a semi-transparent white overlay on a light gray background
- Respects user's motion preferences (see Accessibility section)

### Responsive Design

All dimension properties (`width`, `height`) accept any valid CSS units, making skeletons fully responsive:

- Use percentages for fluid layouts: `width="50%"`
- Use viewport units for screen-relative sizing: `height="10vh"`
- Use fixed units for precise control: `width="200px"`
- Combine with container queries for advanced responsiveness

### Stacking and Layout

Skeletons are block-level elements by default and can be easily arranged using standard CSS layout techniques:

- Use flexbox for horizontal arrangements
- Use grid for complex layouts
- Use standard spacing (margin/padding) for gaps
- Nest within containers to match your actual content structure

## Accessibility

The skeleton component is designed with accessibility in mind:

### Motion Preferences

The component respects the `prefers-reduced-motion` media query:
- When users prefer reduced motion, the shimmer animation is disabled
- The skeleton displays as a static gray block without movement
- This prevents motion sickness and respects user preferences

### Screen Readers

When implementing skeleton loaders:
- Consider adding `aria-busy="true"` to the parent container while loading
- Add `aria-live="polite"` to announce when content has loaded
- Include visually hidden text indicating loading state if needed

### Loading State Communication

Best practices for communicating loading states:
- Provide visual indication of approximate content shape
- Ensure loading states don't trap keyboard focus
- Announce completion of loading to screen reader users
- Consider a loading timeout with error handling

## Styling

The skeleton component uses CSS custom properties for styling:

### CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--skeleton-speed` | `3s` | Duration of the shimmer animation |
| `--skeleton-width` | `100%` | Width of the skeleton element |
| `--skeleton-height` | `20px` | Height of the skeleton element |
| `--skeleton-border-radius` | `4px` | Border radius of the skeleton element |

### Customization

You can customize skeletons using CSS:

```css
zn-skeleton {
  --skeleton-speed: 2s;
}

/* Target specific skeletons */
.fast-skeleton {
  --skeleton-speed: 1s;
}

/* Adjust colors using CSS */
zn-skeleton::part(skeleton) {
  background-color: #e0e0e0;
}
```

## Best Practices

### When to Use Skeletons

- Use skeletons for content that takes more than 300ms to load
- Ideal for list views, cards, tables, and form layouts
- Best for structured content with predictable layouts
- Great for improving perceived performance

### Design Guidelines

- Match skeleton shapes to your actual content as closely as possible
- Use consistent animation speeds across your application
- Keep skeletons simple and avoid over-complicating the loading state
- Ensure skeletons have similar visual weight to the actual content

### Performance Considerations

- Skeletons are lightweight and use CSS animations (GPU-accelerated)
- Avoid rendering hundreds of skeleton elements simultaneously
- Consider progressive loading for very long lists
- Use skeletons in combination with proper data fetching strategies

### Layout Shift Prevention

To prevent cumulative layout shift (CLS):
- Ensure skeleton dimensions match loaded content exactly
- Reserve space for all content that will appear
- Don't change layout structure between skeleton and content
- Test with real data to verify layout stability

### Common Patterns

**Card Grids**: Use consistent skeleton patterns across grid items
```html
<!-- Each card has the same skeleton structure -->
<div class="card">
  <zn-skeleton width="100%" height="200px"></zn-skeleton>
  <zn-skeleton width="80%" height="24px"></zn-skeleton>
  <zn-skeleton width="60%" height="16px"></zn-skeleton>
</div>
```

**Progressive Loading**: Show skeletons first, then progressively load content
```javascript
// Show skeleton
showSkeleton();
// Fetch data
const data = await fetchData();
// Replace skeleton with content
renderContent(data);
```

**Partial Updates**: Keep loaded content visible while updating portions
```html
<!-- Keep header loaded, show skeleton for body -->
<div class="content">
  <div class="header">Loaded Content</div>
  <zn-skeleton width="100%" height="200px"></zn-skeleton>
</div>
```

### What to Avoid

- Don't use skeletons for instant content (< 300ms load time)
- Avoid overly detailed or complex skeleton patterns
- Don't use different skeleton patterns for the same content type
- Avoid using skeletons indefinitely (implement timeouts/error states)
- Don't make skeletons look exactly like content (maintain distinction)