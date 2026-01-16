---
meta:
  title: Animated Button
  description: A stateful button component for purchase flows with built-in loading, success, and error states with smooth animations.
layout: component
---

```html:preview
<zn-animated-button></zn-animated-button>

<script>
  document.querySelector('zn-animated-button').addEventListener('zn-purchase', async (event) => {
    const { setSuccess } = event.detail;
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSuccess();
  });
</script>
```

The Animated Button component manages the complete purchase flow through four distinct states: Idle (blue), Processing (blue with shimmer animation), Success (green with animated color fill and drawing checkmark), and Failure (red with error message). It automatically handles state transitions, disables during processing to prevent double-submission, and includes smooth, professional animations throughout including a satisfying "swoosh" checkmark that draws itself on success.

## Examples

### Basic Usage

The button emits a `zn-purchase` event when clicked. Use the provided `setSuccess()` and `setFailure()` functions to control the button state based on your purchase logic.

```html:preview
<zn-animated-button id="basic-example"></zn-animated-button>

<script>
  document.getElementById('basic-example').addEventListener('zn-purchase', async (event) => {
    const { setSuccess, setFailure } = event.detail;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random success or failure for demo
    if (Math.random() > 0.3) {
      setSuccess();
    } else {
      setFailure('Payment declined');
    }
  });
</script>
```

### Custom Text Labels

Customize the text displayed in each state using the text attributes.

```html:preview
<zn-animated-button
  id="custom-text-example"
  idle-text="Buy Now"
  processing-text="Processing Payment"
  success-text="Payment Complete"
  failure-text="Transaction Failed"
></zn-animated-button>

<script>
  document.getElementById('custom-text-example').addEventListener('zn-purchase', async (event) => {
    const { setSuccess } = event.detail;
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSuccess();
  });
</script>
```

### Error Handling

Display custom error messages when the purchase fails. The button automatically resets to idle state after 2 seconds.

```html:preview
<zn-animated-button id="error-example"></zn-animated-button>

<script>
  document.getElementById('error-example').addEventListener('zn-purchase', async (event) => {
    const { setFailure } = event.detail;
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFailure('Insufficient funds');
  });
</script>
```

### Manual State Control

Control the button state programmatically using the component's methods.

```html:preview
<zn-animated-button id="manual-example"></zn-animated-button>

<br><br>

<zn-button-group>
  <zn-button color="success" onclick="document.getElementById('manual-example').setSuccess()">
    Trigger Success
  </zn-button>
  <zn-button color="error" onclick="document.getElementById('manual-example').setFailure('Network error')">
    Trigger Failure
  </zn-button>
  <zn-button color="secondary" onclick="document.getElementById('manual-example').reset()">
    Reset
  </zn-button>
</zn-button-group>
```

### Redirect After Success

Specify a redirect URL to automatically navigate after successful purchase. The redirect happens after a configurable delay (default 1.5 seconds).

```html:preview
<zn-animated-button
  id="redirect-example"
  redirect-url="/thank-you"
  redirect-delay="2000"
></zn-animated-button>

<script>
  const redirectButton = document.getElementById('redirect-example');

  redirectButton.addEventListener('zn-purchase', async (event) => {
    const { setSuccess } = event.detail;
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess();
  });

  redirectButton.addEventListener('zn-redirect', (event) => {
    alert('Would redirect to: ' + event.detail.url);
    // Prevent actual redirect for demo
    redirectButton.reset();
  });
</script>
```

### Custom Timing

Control how long the button stays in success state before redirecting and how long it stays in failure state before resetting.

```html:preview
<zn-animated-button
  id="timing-example"
  redirect-delay="3000"
  failure-reset-delay="4000"
></zn-animated-button>

<br><br>

<zn-button-group>
  <zn-button color="success" onclick="document.getElementById('timing-example').setSuccess()">
    Success (3s delay)
  </zn-button>
  <zn-button color="error" onclick="document.getElementById('timing-example').setFailure('Error')">
    Failure (4s reset)
  </zn-button>
</zn-button-group>
```

### Disabled State

The button can be disabled to prevent interaction.

```html:preview
<zn-animated-button disabled></zn-animated-button>
```

### Integration with Form

The Purchase Button implements the `ZincFormControl` interface and can be used in forms.

```html:preview
<form id="purchase-form">
  <zn-form-group>
    <label>Amount</label>
    <zn-input name="amount" type="number" value="100" required></zn-input>
  </zn-form-group>

  <zn-form-group>
    <zn-animated-button
      id="form-example"
      name="purchase"
      value="submit"
    ></zn-animated-button>
  </zn-form-group>
</form>

<script>
  document.getElementById('form-example').addEventListener('zn-purchase', async (event) => {
    const { setSuccess, setFailure } = event.detail;
    const form = document.getElementById('purchase-form');

    if (!form.checkValidity()) {
      setFailure('Please fill in all fields');
      return;
    }

    const formData = new FormData(form);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    setSuccess();
  });
</script>
```

## State Flow

The button transitions through four states:

1. **Idle** (Default): Blue background, shows idle text, ready for interaction
2. **Processing**: Triggered on click, button becomes disabled, shows spinner icon and shimmer animation
3. **Success**: Green background with animated check icon, auto-redirects after delay
4. **Failure**: Red background with error icon and message, auto-resets to Idle after delay

## Events

### `zn-purchase`

Emitted when the button is clicked in idle state. The event detail contains:

- `value`: The form control value
- `setSuccess()`: Function to transition to success state
- `setFailure(message?: string)`: Function to transition to failure state

```javascript
button.addEventListener('zn-purchase', async (event) => {
  const { value, setSuccess, setFailure } = event.detail;

  try {
    const response = await fetch('/api/purchase', {
      method: 'POST',
      body: JSON.stringify({ value })
    });

    if (response.ok) {
      setSuccess();
    } else {
      setFailure('Payment failed');
    }
  } catch (error) {
    setFailure(error.message);
  }
});
```

### `zn-redirect`

Emitted when the redirect timer completes after success state. The event detail contains:

- `url`: The redirect URL

```javascript
button.addEventListener('zn-redirect', (event) => {
  console.log('Redirecting to:', event.detail.url);
  // Custom redirect logic can be implemented here
});
```

## Methods

### `purchase(): Promise<void>`

Programmatically trigger the purchase flow.

```javascript
await button.purchase();
```

### `setSuccess(): void`

Manually transition to success state. Starts the redirect timer.

```javascript
button.setSuccess();
```

### `setFailure(message?: string): void`

Manually transition to failure state with optional error message. Starts the auto-reset timer.

```javascript
button.setFailure('Payment declined');
```

### `reset(): void`

Reset the button to idle state, clearing any active timers.

```javascript
button.reset();
```

## Accessibility

- The button includes `aria-live="polite"` for screen reader announcements of state changes
- The button includes `aria-busy` attribute during processing state
- All animations respect the `prefers-reduced-motion` media query
- Focus states are clearly visible with proper outline styling
- Disabled state prevents all interaction and is properly announced to assistive technologies
