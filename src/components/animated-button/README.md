# Animated Button Component

A stateful button component designed for purchase/payment flows with built-in loading, success, and error states, complete with smooth animations and automatic state management.

## Features

- **4 States**: Idle (blue), Processing (blue with shimmer), Success (green with animated fill and drawing checkmark), Failure (red with error)
- **Smooth Animations**:
  - Success state: Background fills from bottom with green color
  - Checkmark draws itself with a satisfying "swoosh" effect
  - Shimmer animation during processing
  - Shake animation on failure
- **Auto State Management**: Automatically resets from failure state after a configurable delay
- **Auto Redirect**: Redirects after successful purchase with configurable delay
- **Event-Driven**: Emit custom events for purchase flow integration
- **Accessible**: Supports `aria-live` regions and respects `prefers-reduced-motion`
- **Consistent Height**: Button maintains the same height across all states

## Installation

```typescript
import '@kubex/zinc/components/animated-button';
```

Or if auto-loading is enabled, just use the tag:

```html
<zn-animated-button></zn-animated-button>
```

## Basic Usage

```html
<zn-animated-button id="purchase-btn"></zn-animated-button>

<script>
  const button = document.getElementById('purchase-btn');

  button.addEventListener('zn-purchase', async (event) => {
    const { setSuccess, setFailure } = event.detail;

    try {
      const response = await fetch('/api/purchase', { method: 'POST' });

      if (response.ok) {
        setSuccess();
      } else {
        setFailure('Payment failed');
      }
    } catch (error) {
      setFailure(error.message);
    }
  });
</script>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `idle-text` | `string` | `'Purchase'` | Text displayed in idle state |
| `processing-text` | `string` | `'Purchasing'` | Text displayed in processing state |
| `success-text` | `string` | `'Success'` | Text displayed in success state |
| `failure-text` | `string` | `'Failed'` | Text displayed in failure state |
| `redirect-url` | `string` | `''` | URL to redirect to after success |
| `redirect-delay` | `number` | `1500` | Milliseconds to wait before redirecting (after success) |
| `failure-reset-delay` | `number` | `2000` | Milliseconds to wait before auto-resetting from failure |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `name` | `string` | `''` | Form control name |
| `value` | `string` | `''` | Form control value |

## Methods

### `purchase(): Promise<void>`

Programmatically trigger the purchase flow.

```javascript
const button = document.getElementById('purchase-btn');
await button.purchase();
```

### `setSuccess(): void`

Manually set the button to success state. Triggers the redirect timer.

```javascript
button.setSuccess();
```

### `setFailure(message?: string): void`

Manually set the button to failure state with an optional error message. Triggers the auto-reset timer.

```javascript
button.setFailure('Payment declined');
```

### `reset(): void`

Reset the button to idle state, clearing any timers.

```javascript
button.reset();
```

## Events

### `zn-purchase`

Emitted when the button is clicked in idle state. The event detail contains:

- `value`: The form control value
- `setSuccess()`: Function to set success state
- `setFailure(message?: string)`: Function to set failure state

```javascript
button.addEventListener('zn-purchase', (event) => {
  const { value, setSuccess, setFailure } = event.detail;

  // Implement purchase logic
  if (purchaseSuccessful) {
    setSuccess();
  } else {
    setFailure('Error message');
  }
});
```

**Note**: The event is cancelable. Call `event.preventDefault()` to prevent the state transition.

### `zn-redirect`

Emitted when the redirect timer completes after success. The event detail contains:

- `url`: The redirect URL

```javascript
button.addEventListener('zn-redirect', (event) => {
  console.log('Redirecting to:', event.detail.url);
});
```

## State Flow

```
       ┌─────────┐
       │  Idle   │ (Blue)
       │ Default │
       └────┬────┘
            │ Click
            ↓
       ┌─────────┐
       │Processing│ (Blue + Shimmer)
       │ Disabled │
       └────┬────┘
            │
      ┌─────┴─────┐
      │           │
      ↓           ↓
┌─────────┐  ┌─────────┐
│Success  │  │ Failure │ (Red + Error Icon)
│(Green + │  │ Disabled│
│ Check)  │  └────┬────┘
└────┬────┘       │
     │            │ Auto-reset (2s)
     │            ↓
     │       ┌─────────┐
     │       │  Idle   │
     │       └─────────┘
     │
     │ Redirect (1.5s)
     ↓
  [Redirect]
```

## Styling

The component uses CSS custom properties from the Zinc design system:

- `--zn-primary`: Primary color (blue, idle state)
- `--zn-color-success`: Success color (green)
- `--zn-color-error`: Error color (red)
- `--zn-transition-medium`: Transition duration for color changes
- `--zn-transition-fast`: Transition duration for interactions
- `--zn-border-radius-medium`: Border radius

### CSS Parts

The component doesn't expose CSS parts but follows BEM naming:

- `.purchase-button`: Main button element
- `.purchase-button--idle`: Idle state modifier
- `.purchase-button--processing`: Processing state modifier
- `.purchase-button--success`: Success state modifier
- `.purchase-button--failure`: Failure state modifier
- `.purchase-button__content`: Content wrapper
- `.purchase-button__text`: Text element
- `.purchase-button__spinner`: Spinning loading icon
- `.purchase-button__shimmer`: Shimmer animation overlay
- `.purchase-button__icon`: Icon element

## Accessibility

- The button includes `aria-live="polite"` for screen reader announcements of state changes
- The button includes `aria-busy` attribute during processing state
- Respects `prefers-reduced-motion` media query:
  - Disables all animations including success fill, checkmark drawing, and shimmer
  - Shows instant state changes for users who prefer reduced motion
- Proper focus states with visible outline
- Disabled state prevents interaction and is properly announced
- Consistent button height prevents layout shift that could confuse users

## Examples

### Simple Success Flow

```html
<zn-animated-button id="btn"></zn-animated-button>

<script>
  document.getElementById('btn').addEventListener('zn-purchase', async (e) => {
    const { setSuccess } = e.detail;
    await new Promise(r => setTimeout(r, 2000)); // Simulate API
    setSuccess();
  });
</script>
```

### With Error Handling

```html
<zn-animated-button
  id="btn"
  failure-text="Payment Failed"
></zn-animated-button>

<script>
  document.getElementById('btn').addEventListener('zn-purchase', async (e) => {
    const { setSuccess, setFailure } = e.detail;

    try {
      const response = await fetch('/api/purchase', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setSuccess();
      } else {
        setFailure(data.error || 'Payment failed');
      }
    } catch (error) {
      setFailure('Network error');
    }
  });
</script>
```

### Custom Text and Timing

```html
<zn-animated-button
  idle-text="Complete Purchase"
  processing-text="Processing Payment"
  success-text="Payment Complete"
  failure-text="Transaction Failed"
  redirect-url="/thank-you"
  redirect-delay="3000"
  failure-reset-delay="4000"
></zn-animated-button>
```

### Manual Control

```javascript
const button = document.getElementById('purchase-btn');

// Trigger purchase programmatically
await button.purchase();

// Or control state directly
button.setSuccess();
button.setFailure('Insufficient funds');
button.reset();
```

## Dependencies

- `zn-icon`: Icon component for spinner, success, and failure icons

## Browser Support

Works in all modern browsers that support:
- Web Components (Custom Elements)
- CSS Custom Properties
- CSS Animations
- ES Modules

## Testing

Run tests with:

```bash
npm test
```

See `purchase-button.test.ts` for test examples.
