---
meta:
  title: Datepicker
  description: Datepickers allow users to select dates from an interactive calendar interface.
layout: component
---

## Examples

### Basic Datepicker with Label

Use the `label` attribute to give the datepicker an accessible label.

```html:preview
<zn-datepicker label="Event date"></zn-datepicker>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

### Help Text

Add descriptive help text to a datepicker with the `help-text` attribute. For help text that contains HTML, use the `help-text` slot instead.

```html:preview
<zn-datepicker label="Appointment date" help-text="Select your preferred date for the appointment"></zn-datepicker>
<br />
<zn-datepicker label="Appointment date">
  <div slot="help-text">Select your <strong>preferred date</strong> for the appointment</div>
</zn-datepicker>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when selecting a date. Use **help text** to communicate instructions or requirements for selecting a date without errors.
:::

```html:preview
<zn-datepicker label="Event date" label-tooltip="Choose a date that works best for your schedule. You can reschedule up to 24 hours before the event." help-text="Select a date at least 3 days from today"></zn-datepicker>
```

### Label with Context Note

Use the `context-note` attribute to add text that provides additional context or reference. For text that contains HTML, use the `context-note` slot. **Note:** On small screens the context note will wrap below the label if there isn't enough room next to the label.

:::tip
**Usage:** Use a **context note** to provide secondary contextual data, especially dynamic data, that would help people when selecting a date. Use **help text** to communicate instructions or requirements for selecting a date without errors.
:::

```html:preview
<zn-datepicker label="Delivery date" context-note="Next available: Jan 25" help-text="Standard delivery takes 3-5 business days"></zn-datepicker>
<br />
<zn-datepicker label="Delivery date" help-text="Standard delivery takes 3-5 business days">
  <div slot="context-note">Next available: <strong>Jan 25</strong></div>
</zn-datepicker>
```

### Placeholders

Use the `placeholder` attribute to add a placeholder.

```html:preview
<zn-datepicker label="Select date" placeholder="MM/DD/YYYY"></zn-datepicker>
```

### Initial Value

Set the `value` attribute to provide an initial date selection.

```html:preview
<zn-datepicker label="Event date" value="01/15/2026"></zn-datepicker>
```

### Disabled

Use the `disabled` attribute to disable a datepicker.

```html:preview
<zn-datepicker label="Event date" disabled></zn-datepicker>
```

### Read-only

Use the `readonly` attribute to make the datepicker read-only. Users can still open the calendar to view dates but cannot change the selection.

```html:preview
<zn-datepicker label="Contract start date" value="01/01/2026" readonly></zn-datepicker>
```

### Sizes

Use the `size` attribute to change a datepicker's size. Size `medium` is the default.

```html:preview
<zn-datepicker label="Small datepicker" size="small"></zn-datepicker>
<br />
<zn-datepicker label="Medium datepicker" size="medium"></zn-datepicker>
<br />
<zn-datepicker label="Large datepicker" size="large"></zn-datepicker>
```

### Range Selection

Use the `range` attribute to allow users to select a date range instead of a single date.

```html:preview
<zn-datepicker label="Event dates" range help-text="Select start and end dates for your event"></zn-datepicker>
```

### Disabling Past Dates

Use the `disable-past-dates` attribute to prevent users from selecting dates in the past. This is useful for scheduling future events or appointments.

```html:preview
<zn-datepicker label="Appointment date" disable-past-dates help-text="Only future dates can be selected"></zn-datepicker>
```

### Minimum Date

Use the `min-date` attribute to set the earliest selectable date. This overrides `disable-past-dates` if both are set. Accepts a date string or Date object.

```html:preview
<zn-datepicker label="Reservation date" min-date="01/20/2026" help-text="Reservations available starting January 20, 2026"></zn-datepicker>
```

### Maximum Date

Use the `max-date` attribute to set the latest selectable date. Accepts a date string or Date object.

```html:preview
<zn-datepicker label="Early bird registration" max-date="02/28/2026" help-text="Early bird pricing ends February 28, 2026"></zn-datepicker>
```

### Date Range Constraints

Combine `min-date` and `max-date` to constrain the selectable date range.

```html:preview
<zn-datepicker
  label="Conference dates"
  min-date="03/01/2026"
  max-date="03/15/2026"
  range
  help-text="Select dates within the conference period (March 1-15, 2026)">
</zn-datepicker>
```

### Prefix & Suffix Slots

Use the `prefix` and `suffix` slots to add icons or text elements.

:::warning
**Note:** `ts_form_for` doesn't support slots. Prefix and suffix icons cannot be added when rendering `zn-datepicker` with `ts_form_for`.
:::

```html:preview
<zn-datepicker label="Event date">
  <zn-icon src="event_available" slot="prefix"></zn-icon>
</zn-datepicker>
<br />
<zn-datepicker label="Deadline">
  <span slot="suffix" style="color: var(--zn-color-danger-600); font-weight: 500;">Required</span>
</zn-datepicker>
```

### Form Integration

Datepicker components work seamlessly with standard HTML forms. The datepicker's `name` attribute determines the key in the form data.

```html:preview
<form id="datepicker-form">
  <zn-datepicker name="startDate" label="Start date" required></zn-datepicker>
  <br />
  <zn-datepicker name="endDate" label="End date" required></zn-datepicker>
  <br />
  <zn-datepicker name="dateRange" label="Date range" range></zn-datepicker>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
  <zn-button type="reset">Reset</zn-button>
</form>

<script type="module">
  const form = document.getElementById('datepicker-form');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-datepicker')
  ]).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      alert('Form submitted!\n\n' + JSON.stringify(data, null, 2));
    });
  });
</script>
```

### Validation

Datepicker components support native HTML validation attributes like `required`. The component will show validation states and messages automatically.

```html:preview
<form id="validation-form" class="form-spacing">
  <zn-datepicker
    name="eventDate"
    label="Event date"
    required
    help-text="This field is required">
  </zn-datepicker>

  <zn-datepicker
    name="meetingDate"
    label="Meeting date"
    required
    disable-past-dates
    help-text="Please select a future date">
  </zn-datepicker>

  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const validationForm = document.getElementById('validation-form');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-datepicker')
  ]).then(() => {
    validationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(validationForm);
      const data = Object.fromEntries(formData);
      alert('Form is valid!\n\n' + JSON.stringify(data, null, 2));
    });
  });
</script>
```

You can also use custom validation with the `setCustomValidity()` method:

```html:preview
<form id="custom-validation-form">
  <zn-datepicker id="booking-date" name="bookingDate" label="Booking date"></zn-datepicker>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const customValidationForm = document.getElementById('custom-validation-form');
  const bookingDate = document.getElementById('booking-date');

  bookingDate.addEventListener('zn-change', () => {
    const selectedDate = new Date(bookingDate.value);
    const dayOfWeek = selectedDate.getDay();

    // Disallow weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      bookingDate.setCustomValidity('Bookings are only available on weekdays');
    } else {
      bookingDate.setCustomValidity('');
    }
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-datepicker')
  ]).then(() => {
    customValidationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (customValidationForm.reportValidity()) {
        alert('Form is valid!');
      }
    });
  });
</script>
```

### Events

The datepicker component emits several events you can listen to:

```html:preview
<div class="form-spacing">
  <zn-datepicker id="event-example" label="Select a date"></zn-datepicker>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
    <strong>Event Log:</strong>
    <div id="event-log" style="margin-top: 0.5rem; font-family: monospace; font-size: 0.875rem;"></div>
  </div>
</div>

<script type="module">
  const datepicker = document.getElementById('event-example');
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

  datepicker.addEventListener('zn-change', (e) => logEvent('zn-change', { value: e.target.value }));
  datepicker.addEventListener('zn-input', (e) => logEvent('zn-input'));
  datepicker.addEventListener('zn-focus', (e) => logEvent('zn-focus'));
  datepicker.addEventListener('zn-blur', (e) => logEvent('zn-blur'));
  datepicker.addEventListener('zn-invalid', (e) => logEvent('zn-invalid'));
</script>
```

### Programmatic Control

You can control the datepicker programmatically using its methods:

```html:preview
<div class="form-spacing">
  <zn-datepicker id="programmatic-datepicker" label="Programmatic control"></zn-datepicker>

  <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <zn-button id="focus-btn" size="small">Focus</zn-button>
    <zn-button id="blur-btn" size="small">Blur</zn-button>
    <zn-button id="set-value-btn" size="small">Set Value</zn-button>
    <zn-button id="clear-value-btn" size="small">Clear Value</zn-button>
    <zn-button id="check-validity-btn" size="small">Check Validity</zn-button>
  </div>
</div>

<script type="module">
  const datepicker = document.getElementById('programmatic-datepicker');

  document.getElementById('focus-btn').addEventListener('click', () => datepicker.focus());
  document.getElementById('blur-btn').addEventListener('click', () => datepicker.blur());
  document.getElementById('set-value-btn').addEventListener('click', () => {
    datepicker.value = '02/14/2026';
  });
  document.getElementById('clear-value-btn').addEventListener('click', () => {
    datepicker.value = '';
  });
  document.getElementById('check-validity-btn').addEventListener('click', () => {
    alert('Valid: ' + datepicker.checkValidity());
  });
</script>
```

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the label to the left of the control, but the possible orientations are nearly endless. The same technique works for inputs, textareas, selects, and similar form controls.

```html:preview
<zn-datepicker class="label-on-left" label="Date" help-text="Select a date"></zn-datepicker>
<zn-datepicker class="label-on-left" label="Range" range help-text="Select a date range"></zn-datepicker>

<style>
  .label-on-left {
    --label-width: 3.75rem;
    --gap-width: 1rem;
  }

  .label-on-left + .label-on-left {
    margin-top: var(--zn-spacing-medium);
  }

  .label-on-left::part(form-control) {
    display: grid;
    grid: auto / var(--label-width) 1fr;
    gap: var(--zn-spacing-3x-small) var(--gap-width);
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


