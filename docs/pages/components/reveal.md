---
meta:
  title: Reveal
  description: Reveals temporarily hide sensitive information and show it on hover or click, useful for displaying masked data like email addresses, passwords, or API keys.
layout: component
---

Reveals provide an interactive way to protect sensitive information while still making it accessible to users when needed. They're ideal for masking email addresses, phone numbers, API keys, or any other data that should be hidden by default but can be viewed on demand.

```html:preview
<zn-reveal duration="3000"
           initial="******@hotmail.com"
           revealed="john.doe@hotmail.com">
</zn-reveal>
```

## Examples

### Basic Usage

A simple reveal that shows the full content on hover and hides it when the mouse leaves.

```html:preview
<zn-reveal initial="***-***-1234"
           revealed="555-123-1234">
</zn-reveal>
```

### Email Address Masking

Mask email addresses to protect them from bots and scrapers while still allowing users to view them.

```html:preview
<zn-reveal initial="j***@example.com"
           revealed="john.doe@example.com">
</zn-reveal>
```

### API Key Protection

Hide API keys and tokens by default, revealing them only when users interact with them.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <strong>API Key:</strong>
    <zn-reveal initial="sk_live_••••••••••••••••"
               revealed="sk_live_1234567890abcdef">
    </zn-reveal>
  </div>

  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <strong>Secret:</strong>
    <zn-reveal initial="••••••••••••••••••••"
               revealed="super_secret_key_xyz">
    </zn-reveal>
  </div>
</div>
```

### With Duration (Temporary Reveal)

Use the `duration` attribute to automatically hide the content after a specified time (in milliseconds) when clicked.

```html:preview
<zn-reveal duration="3000"
           initial="******@hotmail.com"
           revealed="john.doe@hotmail.com">
</zn-reveal>
<p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
  Click to reveal for 3 seconds
</p>
```

### Permanent Toggle

When `duration` is set to `0` or not provided while clicking, the reveal will toggle between states permanently until clicked again.

```html:preview
<zn-reveal duration="0"
           initial="Password: ••••••••"
           revealed="Password: MyP@ssw0rd">
</zn-reveal>
<p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
  Click to toggle on/off
</p>
```

### Short Duration

Use shorter durations for quick peeks at sensitive information.

```html:preview
<zn-reveal duration="1500"
           initial="Card: •••• •••• •••• 5678"
           revealed="Card: 1234 5678 9012 5678">
</zn-reveal>
<p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
  Click to reveal for 1.5 seconds
</p>
```

### Long Duration

Use longer durations when users need more time to read or copy the information.

```html:preview
<zn-reveal duration="5000"
           initial="Recovery Code: ••••-••••-••••"
           revealed="Recovery Code: AB12-CD34-EF56">
</zn-reveal>
<p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
  Click to reveal for 5 seconds
</p>
```

### Social Security Number

Mask sensitive personal information like social security numbers.

```html:preview
<zn-reveal initial="SSN: •••-••-1234"
           revealed="SSN: 123-45-1234">
</zn-reveal>
```

### Hover-Only Behavior

Without a duration or with hover, the content is revealed only while hovering and hidden when the mouse leaves.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <div>
    <strong>Username:</strong>
    <zn-reveal initial="u********"
               revealed="user12345">
    </zn-reveal>
  </div>

  <div>
    <strong>Email:</strong>
    <zn-reveal initial="e****@example.com"
               revealed="email@example.com">
    </zn-reveal>
  </div>
</div>
<p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
  Hover to reveal
</p>
```

### Click and Hover Combined

When duration is set, clicking toggles temporarily while hovering still works. After clicking, the content remains revealed for the duration, and hovering won't hide it until the duration expires.

```html:preview
<zn-reveal duration="4000"
           initial="Token: ••••••••••••"
           revealed="Token: abc123xyz789">
</zn-reveal>
<p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
  Hover to peek, click to lock for 4 seconds
</p>
```

### Partial Masking Patterns

Different approaches to masking information while still providing context.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <div>
    <strong>Email (prefix):</strong>
    <zn-reveal initial="john***@gmail.com"
               revealed="john.doe.smith@gmail.com">
    </zn-reveal>
  </div>

  <div>
    <strong>Email (suffix):</strong>
    <zn-reveal initial="j***e@example.com"
               revealed="john.doe@example.com">
    </zn-reveal>
  </div>

  <div>
    <strong>Phone (last 4):</strong>
    <zn-reveal initial="(•••) •••-5678"
               revealed="(555) 123-5678">
    </zn-reveal>
  </div>

  <div>
    <strong>IP Address:</strong>
    <zn-reveal initial="192.168.***.***"
               revealed="192.168.1.100">
    </zn-reveal>
  </div>
</div>
```

### In a Table

Use reveals within table cells to protect sensitive data in tabular layouts.

```html:preview
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="border-bottom: 2px solid var(--zn-color-neutral-200);">
      <th style="text-align: left; padding: 0.5rem;">Name</th>
      <th style="text-align: left; padding: 0.5rem;">Email</th>
      <th style="text-align: left; padding: 0.5rem;">Phone</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid var(--zn-color-neutral-200);">
      <td style="padding: 0.5rem;">Alice Johnson</td>
      <td style="padding: 0.5rem;">
        <zn-reveal initial="a***@example.com"
                   revealed="alice.j@example.com">
        </zn-reveal>
      </td>
      <td style="padding: 0.5rem;">
        <zn-reveal initial="•••-•••-1234"
                   revealed="555-123-1234">
        </zn-reveal>
      </td>
    </tr>
    <tr style="border-bottom: 1px solid var(--zn-color-neutral-200);">
      <td style="padding: 0.5rem;">Bob Smith</td>
      <td style="padding: 0.5rem;">
        <zn-reveal initial="b***@example.com"
                   revealed="bob.smith@example.com">
        </zn-reveal>
      </td>
      <td style="padding: 0.5rem;">
        <zn-reveal initial="•••-•••-5678"
                   revealed="555-987-5678">
        </zn-reveal>
      </td>
    </tr>
  </tbody>
</table>
```

### In a Form

Integrate reveals into forms for password fields or sensitive input displays.

```html:preview
<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
  <div>
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
      Current Password
    </label>
    <zn-reveal duration="2000"
               initial="••••••••"
               revealed="MyP@ssw0rd"
               style="width: 100%; display: block; padding: 0.5rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
    </zn-reveal>
  </div>

  <div>
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
      Email Address
    </label>
    <zn-reveal initial="user***@example.com"
               revealed="user.name@example.com"
               style="width: 100%; display: block; padding: 0.5rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
    </zn-reveal>
  </div>
</div>
```

### Settings Panel Example

A practical example showing credential management in a settings interface.

```html:preview
<div style="max-width: 600px; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px; overflow: hidden;">
  <div style="padding: 1.5rem; background: var(--zn-color-neutral-50); border-bottom: 1px solid var(--zn-color-neutral-200);">
    <h3 style="margin: 0;">API Credentials</h3>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      Manage your API access credentials
    </p>
  </div>

  <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong>Public Key</strong>
        <zn-chip size="small" type="success">Active</zn-chip>
      </div>
      <zn-reveal duration="5000"
                 initial="pk_live_••••••••••••••••••••"
                 revealed="pk_live_abcdef1234567890"
                 style="font-family: monospace; padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 4px; display: block;">
      </zn-reveal>
      <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--zn-color-neutral-600);">
        Click to reveal for 5 seconds
      </div>
    </div>

    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong>Secret Key</strong>
        <zn-chip size="small" type="warning">Sensitive</zn-chip>
      </div>
      <zn-reveal duration="5000"
                 initial="sk_live_••••••••••••••••••••"
                 revealed="sk_live_xyz7890abcdef1234"
                 style="font-family: monospace; padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 4px; display: block;">
      </zn-reveal>
      <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--zn-color-neutral-600);">
        Click to reveal for 5 seconds
      </div>
    </div>

    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong>Webhook Secret</strong>
        <zn-chip size="small" type="info">Optional</zn-chip>
      </div>
      <zn-reveal duration="5000"
                 initial="whsec_••••••••••••••••••••"
                 revealed="whsec_1234567890abcdefghij"
                 style="font-family: monospace; padding: 0.75rem; background: var(--zn-color-neutral-100); border-radius: 4px; display: block;">
      </zn-reveal>
      <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--zn-color-neutral-600);">
        Click to reveal for 5 seconds
      </div>
    </div>
  </div>
</div>
```

### User Profile Example

Show masked personal information that can be revealed on demand.

```html:preview
<div style="max-width: 500px; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px; padding: 1.5rem;">
  <h3 style="margin: 0 0 1rem 0;">Personal Information</h3>

  <div style="display: grid; gap: 1rem;">
    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 1rem; align-items: center;">
      <span style="font-weight: 500;">Email:</span>
      <zn-reveal initial="j***@example.com"
                 revealed="john.doe@example.com">
      </zn-reveal>
    </div>

    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 1rem; align-items: center;">
      <span style="font-weight: 500;">Phone:</span>
      <zn-reveal initial="+1 (•••) •••-5678"
                 revealed="+1 (555) 123-5678">
      </zn-reveal>
    </div>

    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 1rem; align-items: center;">
      <span style="font-weight: 500;">SSN:</span>
      <zn-reveal duration="3000"
                 initial="•••-••-6789"
                 revealed="123-45-6789">
      </zn-reveal>
    </div>

    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 1rem; align-items: center;">
      <span style="font-weight: 500;">Address:</span>
      <zn-reveal initial="123 Main St, ••••••"
                 revealed="123 Main St, Anytown, CA 12345">
      </zn-reveal>
    </div>
  </div>
</div>
```

### Programmatic Control

Control the reveal state programmatically using JavaScript.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <div>
    <strong>Secret Code:</strong>
    <zn-reveal id="programmatic-reveal"
               duration="0"
               initial="••••••••"
               revealed="ABC12345">
    </zn-reveal>
  </div>

  <div style="display: flex; gap: 0.5rem;">
    <zn-button id="trigger-click">Trigger Click</zn-button>
    <zn-button id="trigger-hover" color="secondary">Trigger Hover</zn-button>
    <zn-button id="trigger-leave" color="info">Trigger Leave</zn-button>
  </div>
</div>

<script type="module">
  const reveal = document.getElementById('programmatic-reveal');

  document.getElementById('trigger-click').addEventListener('click', () => {
    reveal.handleToggleReveal();
  });

  document.getElementById('trigger-hover').addEventListener('click', () => {
    reveal.handleMouseEnter();
  });

  document.getElementById('trigger-leave').addEventListener('click', () => {
    reveal.handleMouseLeave();
  });
</script>
```

### State Monitoring

Monitor when the reveal is shown or hidden using event listeners or observers.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <div>
    <strong>Monitored Secret:</strong>
    <zn-reveal id="monitored-reveal"
               duration="2000"
               initial="Hidden: ••••••••"
               revealed="Revealed: SECRET123">
    </zn-reveal>
  </div>

  <div id="state-display" style="padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
    <strong>State:</strong> <span id="state-value">Hidden</span><br>
    <strong>Interactions:</strong> <span id="interaction-count">0</span>
  </div>
</div>

<script type="module">
  const reveal = document.getElementById('monitored-reveal');
  const stateValue = document.getElementById('state-value');
  const interactionCount = document.getElementById('interaction-count');
  let count = 0;

  // Monitor click events
  reveal.addEventListener('click', () => {
    count++;
    interactionCount.textContent = count;
    stateValue.textContent = 'Revealed (click)';
    stateValue.style.color = 'var(--zn-color-success)';
  });

  // Monitor mouse enter
  reveal.addEventListener('mouseenter', () => {
    if (!reveal._isToggled) {
      stateValue.textContent = 'Revealed (hover)';
      stateValue.style.color = 'var(--zn-color-info)';
    }
  });

  // Monitor mouse leave
  reveal.addEventListener('mouseleave', () => {
    if (!reveal._isToggled) {
      stateValue.textContent = 'Hidden';
      stateValue.style.color = 'var(--zn-color-neutral-600)';
    }
  });
</script>
```

### Custom Styling

Apply custom styles to match your design system.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <zn-reveal initial="Standard: ••••••"
             revealed="Standard: abc123"
             style="padding: 0.5rem 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  </zn-reveal>

  <zn-reveal initial="Primary: ••••••"
             revealed="Primary: def456"
             style="padding: 0.5rem 1rem; background: var(--zn-color-primary-50); border: 1px solid var(--zn-color-primary-200); border-radius: 4px; color: var(--zn-color-primary-700);">
  </zn-reveal>

  <zn-reveal initial="Success: ••••••"
             revealed="Success: ghi789"
             style="padding: 0.5rem 1rem; background: var(--zn-color-success-50); border: 1px solid var(--zn-color-success-200); border-radius: 4px; color: var(--zn-color-success-700);">
  </zn-reveal>

  <zn-reveal initial="Monospace: ••••••"
             revealed="Monospace: jkl012"
             style="padding: 0.5rem 1rem; background: var(--zn-color-neutral-900); color: var(--zn-color-neutral-100); border-radius: 4px; font-family: 'Courier New', monospace;">
  </zn-reveal>
</div>
```

### Best Practices

Here are some best practices when using the reveal component:

1. **Use appropriate masking patterns** - Show enough context (like email domain) so users know what they're revealing
2. **Set appropriate durations** - Use 3-5 seconds for data that needs to be copied, 1-2 seconds for quick verification
3. **Provide visual feedback** - Style the component so it's clear it's interactive
4. **Consider security context** - Use longer durations or permanent toggles for less sensitive data, shorter durations for highly sensitive data
5. **Add helper text** - Include instructions like "Click to reveal" or "Hover to show" when the interaction pattern isn't obvious
6. **Use in combination with other security measures** - Reveals are for UI convenience, not true security

```html:preview
<div style="max-width: 600px; display: flex; flex-direction: column; gap: 1.5rem;">
  <!-- Good: Clear context and instructions -->
  <div style="padding: 1rem; border: 1px solid var(--zn-color-success-200); border-radius: 4px; background: var(--zn-color-success-50);">
    <div style="font-weight: 500; color: var(--zn-color-success-700); margin-bottom: 0.5rem;">
      ✓ Good Example
    </div>
    <div style="margin-bottom: 0.5rem;">
      <strong>API Key:</strong>
      <zn-reveal duration="5000"
                 initial="pk_live_••••••••••••1234"
                 revealed="pk_live_abc123def456789"
                 style="font-family: monospace; padding: 0.25rem 0.5rem; background: white; border-radius: 4px; margin-left: 0.5rem;">
      </zn-reveal>
    </div>
    <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600);">
      Click to reveal for 5 seconds. Last 4 digits shown for reference.
    </div>
  </div>

  <!-- Bad: No context -->
  <div style="padding: 1rem; border: 1px solid var(--zn-color-danger-200); border-radius: 4px; background: var(--zn-color-danger-50);">
    <div style="font-weight: 500; color: var(--zn-color-danger-700); margin-bottom: 0.5rem;">
      ✗ Avoid This
    </div>
    <zn-reveal initial="••••••••••••••••••••"
               revealed="pk_live_abc123def456789">
    </zn-reveal>
    <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
      No context about what this is or how to interact with it.
    </div>
  </div>
</div>
```
