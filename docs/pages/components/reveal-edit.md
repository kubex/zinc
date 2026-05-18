---
meta:
  title: Reveal Edit
  description: Reveal Edit combines inline reveal and editing in one component — it masks sensitive data by default, reveals it on hover, and lets users edit it in place by clicking the field or the edit button.
layout: component
---

Reveal Edit is designed for display-and-edit workflows where sensitive data should be masked at rest but editable without navigating away. Hovering reveals the real value; clicking the field or the edit button switches to an inline input with save and cancel actions.

```html:preview
<zn-reveal-edit name="email"
                value="john.doe@example.com"
                display-value="j***@example.com">
</zn-reveal-edit>
```

## Examples

### Basic Usage

Show a masked value in display mode. Hover to peek at the real value, click the field or the edit icon to edit it in place.

```html:preview
<zn-reveal-edit name="phone"
                value="555-123-1234"
                display-value="•••-•••-1234">
</zn-reveal-edit>
```

### Email Address

Mask email addresses while still allowing the user to reveal or update them.

```html:preview
<zn-reveal-edit name="email"
                value="john.doe@example.com"
                display-value="j***@example.com">
</zn-reveal-edit>
```

### API Key

Protect API keys by default and let authorised users edit them in place.

```html:preview
<zn-reveal-edit name="api-key"
                value="sk_live_1234567890abcdef"
                display-value="sk_live_••••••••••••••••"
                style="font-family: monospace;">
</zn-reveal-edit>
```

### Disabled State

When `disabled` is set, the edit button is hidden and the value cannot be changed. Hover reveal still works.

```html:preview
<zn-reveal-edit name="readonly-key"
                value="pk_live_abcdef1234567890"
                display-value="pk_live_••••••••••••••••"
                disabled>
</zn-reveal-edit>
```

### In a Settings Panel

A practical example showing editable credentials in a settings interface.

```html:preview
<div style="max-width: 600px; border: 1px solid var(--zn-color-neutral-200); border-radius: 8px; overflow: hidden;">
  <div style="padding: 1.5rem; background: var(--zn-color-neutral-50); border-bottom: 1px solid var(--zn-color-neutral-200);">
    <h3 style="margin: 0;">Account Settings</h3>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--zn-color-neutral-600);">
      Hover to reveal, click the field or edit icon to update
    </p>
  </div>

  <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
    <div style="display: grid; grid-template-columns: 160px 1fr; gap: 1rem; align-items: center;">
      <strong>Email</strong>
      <zn-reveal-edit name="email"
                      value="john.doe@example.com"
                      display-value="j***@example.com">
      </zn-reveal-edit>
    </div>

    <div style="display: grid; grid-template-columns: 160px 1fr; gap: 1rem; align-items: center;">
      <strong>Phone</strong>
      <zn-reveal-edit name="phone"
                      value="+1 (555) 123-5678"
                      display-value="+1 (•••) •••-5678">
      </zn-reveal-edit>
    </div>

    <div style="display: grid; grid-template-columns: 160px 1fr; gap: 1rem; align-items: center;">
      <strong>Webhook Secret</strong>
      <zn-reveal-edit name="webhook-secret"
                      value="whsec_1234567890abcdefghij"
                      display-value="whsec_••••••••••••••••••••"
                      style="font-family: monospace;">
      </zn-reveal-edit>
    </div>
  </div>
</div>
```

### In a Form

`zn-reveal-edit` participates in form submission like a standard input — the real `value` (not the masked `display-value`) is submitted under the given `name`.

```html:preview
<form id="settings-form" style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
  <div>
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email Address</label>
    <zn-reveal-edit name="email"
                    value="user@example.com"
                    display-value="u***@example.com">
    </zn-reveal-edit>
  </div>

  <div>
    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">API Key</label>
    <zn-reveal-edit name="api-key"
                    value="sk_live_abc123"
                    display-value="sk_live_••••••"
                    style="font-family: monospace;">
    </zn-reveal-edit>
  </div>

  <zn-button type="submit">Save Changes</zn-button>
</form>

<div id="form-output" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; display: none;">
  <strong>Submitted:</strong> <span id="form-data"></span>
</div>

<script type="module">
  document.getElementById('settings-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    document.getElementById('form-data').textContent = JSON.stringify(data);
    document.getElementById('form-output').style.display = 'block';
  });
</script>
```

### Listening for Events

Use the `zn-submit` event to react when the user saves a new value, and `zn-input` to track changes while typing.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <zn-reveal-edit id="tracked-field"
                  name="username"
                  value="jsmith"
                  display-value="j****">
  </zn-reveal-edit>

  <div id="event-log"
       style="padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; font-size: 0.875rem; min-height: 48px;">
    Interact with the field above to see events.
  </div>
</div>

<script type="module">
  const field = document.getElementById('tracked-field');
  const log = document.getElementById('event-log');

  field.addEventListener('zn-input', () => {
    log.textContent = `zn-input fired — current value: "${field.value}"`;
  });

  field.addEventListener('zn-submit', e => {
    log.textContent = `zn-submit fired — saved value: "${e.detail.value}"`;
  });
</script>
```

### Programmatic Control

You can read and set `value` programmatically at any time. Setting it while not in edit mode updates the revealed value on next hover or click.

```html:preview
<div style="display: flex; flex-direction: column; gap: 1rem;">
  <zn-reveal-edit id="prog-field"
                  name="secret"
                  value="original-secret"
                  display-value="•••••••••••••••">
  </zn-reveal-edit>

  <div style="display: flex; gap: 0.5rem;">
    <zn-button id="update-value">Set New Value</zn-button>
    <zn-button id="read-value" color="secondary">Read Value</zn-button>
  </div>

  <div id="prog-output"
       style="padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; font-size: 0.875rem; min-height: 48px;">
    Click a button above.
  </div>
</div>

<script type="module">
  const field = document.getElementById('prog-field');

  document.getElementById('update-value').addEventListener('click', () => {
    field.value = 'updated-secret-xyz';
    document.getElementById('prog-output').textContent = 'Value set to "updated-secret-xyz" — hover the field to confirm.';
  });

  document.getElementById('read-value').addEventListener('click', () => {
    document.getElementById('prog-output').textContent = `Current value: "${field.value}"`;
  });
</script>
```

### In a Table

Embed reveal-edit fields inside table cells for editable, masked tabular data.

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
        <zn-reveal-edit name="alice-email"
                        value="alice.j@example.com"
                        display-value="a***@example.com">
        </zn-reveal-edit>
      </td>
      <td style="padding: 0.5rem;">
        <zn-reveal-edit name="alice-phone"
                        value="555-123-1234"
                        display-value="•••-•••-1234">
        </zn-reveal-edit>
      </td>
    </tr>
    <tr style="border-bottom: 1px solid var(--zn-color-neutral-200);">
      <td style="padding: 0.5rem;">Bob Smith</td>
      <td style="padding: 0.5rem;">
        <zn-reveal-edit name="bob-email"
                        value="bob.smith@example.com"
                        display-value="b***@example.com">
        </zn-reveal-edit>
      </td>
      <td style="padding: 0.5rem;">
        <zn-reveal-edit name="bob-phone"
                        value="555-987-5678"
                        display-value="•••-•••-5678">
        </zn-reveal-edit>
      </td>
    </tr>
  </tbody>
</table>
```

### Best Practices

1. **Always provide both `value` and `display-value`** — `value` is the real data submitted to the server; `display-value` is what the user sees at rest.
2. **Use meaningful masking** — show enough context (e.g., the email domain or last 4 digits) so users know what they're looking at before revealing.
3. **Use `disabled` for read-only rows** — it hides the edit button and prevents click-to-edit while still allowing hover reveal.
4. **Listen to `zn-submit`** — this is your signal to persist the new value. Don't rely solely on form submission if you need to update the `display-value` after a successful save.
5. **Update `display-value` after save** — the component doesn't re-mask automatically; re-set `display-value` in your `zn-submit` handler once the server confirms the change.

```html:preview
<div style="max-width: 600px; display: flex; flex-direction: column; gap: 1.5rem;">
  <!-- Good: meaningful mask + handler that updates display-value -->
  <div style="padding: 1rem; border: 1px solid var(--zn-color-success-200); border-radius: 4px; background: var(--zn-color-success-50);">
    <div style="font-weight: 500; color: var(--zn-color-success-700); margin-bottom: 0.5rem;">
      ✓ Good Example
    </div>
    <zn-reveal-edit id="good-example"
                    name="email"
                    value="john.doe@example.com"
                    display-value="j***@example.com">
    </zn-reveal-edit>
    <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
      Domain shown for context. zn-submit handler will update display-value after the server confirms.
    </div>
  </div>

  <!-- Bad: no mask context, no submit handler -->
  <div style="padding: 1rem; border: 1px solid var(--zn-color-danger-200); border-radius: 4px; background: var(--zn-color-danger-50);">
    <div style="font-weight: 500; color: var(--zn-color-danger-700); margin-bottom: 0.5rem;">
      ✗ Avoid This
    </div>
    <zn-reveal-edit name="email"
                    value="john.doe@example.com"
                    display-value="••••••••••••••••••••">
    </zn-reveal-edit>
    <div style="font-size: 0.75rem; color: var(--zn-color-neutral-600); margin-top: 0.5rem;">
      Fully opaque mask gives no context. No zn-submit listener means edits aren't persisted.
    </div>
  </div>
</div>

<script type="module">
  // Good: update display-value after a successful save
  document.getElementById('good-example').addEventListener('zn-submit', async e => {
    const { value, element } = e.detail;
    // await yourApi.save(value);
    const [user, domain] = value.split('@');
    element.displayValue = `${user[0]}***@${domain}`;
  });
</script>
```
