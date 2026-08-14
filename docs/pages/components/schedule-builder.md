---
meta:
  title: Schedule Builder
  description: Builds a weekly opening-hours schedule as a drag-to-paint calendar or a compact list of time ranges, and posts the result as JSON.
layout: component
---

```html:preview
<zn-schedule-builder
  name="opening-hours"
  value='{
    "timezone": "Europe/London",
    "days": {
      "mon": ["08:00-18:00"],
      "tue": ["08:00-18:00"],
      "wed": ["08:00-18:00"],
      "thu": ["08:30-18:00"],
      "fri": ["08:00-18:00"],
      "sat": ["09:00-13:00"],
      "sun": []
    },
    "exceptions": [
      {"label": "All-hands offsite", "date": "2026-08-28", "ranges": ["08:00-13:00"]},
      {"label": "Systems maintenance", "date": "2026-09-14", "ranges": ["10:00-18:00"]},
      {"label": "Christmas Eve — early close", "date": "2026-12-24", "ranges": ["08:00-13:00"]}
    ]
  }'>
</zn-schedule-builder>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section
on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## The Value

The schedule is serialised to JSON and exposed three ways:

- as the `value` attribute/property — a JSON string, which is what gets submitted with the form;
- as the `schedule` property — the same data as a plain object;
- as the `zn-change` event, emitted whenever the schedule changes.

```json
{
  "timezone": "Europe/London",
  "days": {
    "mon": [{ "start": "08:00", "end": "18:00" }],
    "tue": [{ "start": "08:00", "end": "12:00" }, { "start": "13:30", "end": "18:00" }],
    "wed": [], "thu": [], "fri": [], "sat": [], "sun": []
  },
  "exceptions": [
    { "label": "Christmas Eve — early close", "date": "2026-12-24", "ranges": [{ "start": "08:00", "end": "13:00" }] }
  ]
}
```

Ranges are always sorted, and overlapping or touching ranges are merged, so `08:00–12:00` plus
`12:00–18:00` becomes a single `08:00–18:00`. Times are 24 hour `HH:MM` in the schedule's own
timezone, regardless of the `time-format` used for display.

When you write the value yourself you can use the `"08:00-18:00"` shorthand instead of
`{"start": "08:00", "end": "18:00"}`, and you can pass a bare day map without the `days` wrapper.
Both are normalised on the way in.

## Examples

### Views

The builder has two views. `calendar` is a drag-to-paint week grid; `form` is a compact list of time
ranges that fits inside a normal settings form. Use the `view` attribute to choose the starting
view, and `no-toggle` to remove the switcher and lock the component to one of them.

```html:preview
<zn-schedule-builder
  view="form"
  value='{"mon":["08:00-18:00"],"tue":["08:00-18:00"],"wed":["08:00-12:00","13:30-18:00"],"thu":["08:00-18:00"],"fri":["08:00-16:00"],"sat":["09:00-13:00"],"sun":[]}'>
</zn-schedule-builder>
```

In the form view, click a range to edit it, and use **Add range** to split a day into multiple
periods. In the calendar view, drag across the grid to open hours and drag over open hours to close
them — a drag can span several days at once.

### Open and Closed Labels

`open-label` and `closed-label` name the two states. They appear in the calendar legend, against
days with no hours, and in the exception annotations, so use whatever wording fits the thing being
scheduled — availability, cover, staffing, opening hours.

```html:preview
<zn-schedule-builder
  open-label="On call"
  closed-label="Off"
  start-hour="8"
  end-hour="20"
  hide-summary
  value='{"mon":["09:00-17:00"],"tue":["09:00-17:00"],"wed":["09:00-17:00"],"thu":["09:00-17:00"],"fri":["09:00-13:00"]}'>
</zn-schedule-builder>
```

### Labels and Help Text

```html:preview
<zn-schedule-builder
  label="Opening hours"
  help-text="Customers can only book appointments during these hours."
  view="form"
  value='{"mon":["09:00-17:00"],"tue":["09:00-17:00"],"wed":["09:00-17:00"],"thu":["09:00-17:00"],"fri":["09:00-17:00"]}'>
</zn-schedule-builder>
```

### Grid Range and Granularity

`start-hour` and `end-hour` set the window the calendar draws, and `interval` sets both the grid
granularity and the step of the time inputs in the form view. The interval must be one of `5`, `10`,
`15`, `20`, `30` or `60` minutes.

```html:preview
<zn-schedule-builder
  start-hour="7"
  end-hour="13"
  interval="15"
  hide-summary
  value='{"mon":["08:00-12:00"],"tue":["08:15-11:45"],"wed":["08:00-12:00"],"thu":["08:00-12:00"],"fri":["08:00-11:00"]}'>
</zn-schedule-builder>
```

### Exceptions

Exceptions are dated deviations from the weekly pattern. The builder never edits them — it displays
them, and carries them through the value untouched — so the surrounding application stays in charge
of how they are created.

Hours an exception removes are drawn in a lighter shade in the calendar, and annotated against the
day in the form view. An exception can be a single `date`, or a `from`/`to` window, and can either
close the day outright (`closed`) or replace its hours (`ranges`).

Only exceptions that change the repeating weekly pattern are drawn against it: ones that name their
`days`, and ones whose date window covers at least a full week. A one-off date is a single
occurrence rather than a pattern, so it is carried through the value untouched but leaves the grid
alone.

```html:preview
<zn-schedule-builder
  view="form"
  value='{
    "days": {
      "mon": ["08:00-18:00"],
      "tue": ["08:00-18:00"],
      "wed": ["08:00-18:00"],
      "thu": ["08:00-18:00"],
      "fri": ["08:00-16:00"],
      "sat": ["09:00-13:00"],
      "sun": []
    },
    "exceptions": [
      {"label": "Summer Fridays", "from": "2026-06-01", "to": "2026-08-29", "days": ["fri"], "ranges": ["08:00-16:00"]},
      {"label": "Bank holiday", "date": "2026-08-31", "closed": true}
    ]
  }'>
</zn-schedule-builder>
```

### Week Start and Time Format

```html:preview
<zn-schedule-builder
  week-start="sun"
  time-format="12"
  view="form"
  value='{"mon":["08:00-18:00"],"sat":["09:00-13:00"],"sun":["10:00-16:00"]}'>
</zn-schedule-builder>
```

### Readonly and Disabled

Use `readonly` to display a schedule without any editing affordances, and `disabled` to grey it out
and take it out of form submission.

```html:preview
<zn-schedule-builder
  readonly
  view="form"
  value='{"mon":["08:00-18:00"],"tue":["08:00-18:00"],"wed":["08:00-18:00"],"thu":["08:00-18:00"],"fri":["08:00-18:00"],"sat":["09:00-13:00"]}'>
</zn-schedule-builder>
```

### Reading the Value from JavaScript

```html:preview
<zn-schedule-builder
  id="schedule-demo"
  view="form"
  value='{"mon":["09:00-17:00"],"tue":["09:00-17:00"]}'>
</zn-schedule-builder>

<pre id="schedule-demo-output" style="margin-top: 1rem"></pre>

<script>
  const builder = document.querySelector('#schedule-demo');
  const output = document.querySelector('#schedule-demo-output');

  const print = () => (output.textContent = JSON.stringify(builder.schedule, null, 2));

  builder.addEventListener('zn-change', print);
  print();
</script>
```

### In a Form

The schedule posts as a single JSON field named after the control.

```html:preview
<form class="schedule-form">
  <zn-schedule-builder
    name="opening-hours"
    label="Opening hours"
    required
    view="form"
    value='{"mon":["09:00-17:00"],"tue":["09:00-17:00"],"wed":["09:00-17:00"],"thu":["09:00-17:00"],"fri":["09:00-17:00"]}'>
  </zn-schedule-builder>

  <br />
  <zn-button type="submit">Submit</zn-button>
</form>

<script>
  const form = document.querySelector('.schedule-form');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    alert(data.get('opening-hours'));
  });
</script>
```

## Accessibility

The form view is fully keyboard operable: ranges are buttons, editing a range gives you two native
time inputs, and <kbd>Enter</kbd> or <kbd>Escape</kbd> closes the editor. The calendar view is a
pointer-driven surface, so offer the form view (the default toggle does) wherever keyboard-only
users need to edit a schedule.
