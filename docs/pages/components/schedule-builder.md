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
  "timezone": "UTC",
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
`12:00–18:00` becomes a single `08:00–18:00`. Times are 24 hour `HH:MM` regardless of the
`time-format` used for display, and `timezone` names the timezone they are expressed in — see
[Timezones](#timezones).

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

### Timezones

A schedule has two timezones: the one it is **stored** in, and the one it is **shown** in.

- `save-timezone` is the timezone the value is written in. It defaults to `UTC` as soon as the
  schedule is timezone-aware, so hours land in your database in one canonical zone.
- `display-timezone` is the timezone the grid and the list are drawn in. It defaults to
  `save-timezone`, and accepts `auto` for the viewer's own timezone.
- `show-timezone` adds a picker so the viewer can read the same schedule in any timezone.

Switching the display timezone never changes the value — the same hours are simply labelled in
another zone, and `zn-change` doesn't fire. Edits work the other way around: you drag or type in the
zone you are looking at, and the component converts back to `save-timezone` before storing.

```html:preview
<zn-schedule-builder
  id="tz-demo"
  show-timezone
  display-timezone="Europe/London"
  start-hour="0"
  end-hour="24"
  hide-summary
  value='{"timezone":"UTC","days":{"mon":["08:00-18:00"],"tue":["08:00-18:00"],"wed":["08:00-18:00"],"thu":["08:00-18:00"],"fri":["08:00-16:00"]}}'>
</zn-schedule-builder>

<pre id="tz-demo-output" style="margin-top: 1rem"></pre>

<script>
  const tzBuilder = document.querySelector('#tz-demo');
  const tzOutput = document.querySelector('#tz-demo-output');

  const printTz = () => (tzOutput.textContent = `stored (UTC):\n${JSON.stringify(tzBuilder.schedule.days, null, 2)}`);

  tzBuilder.addEventListener('zn-change', printTz);
  printTz();
</script>
```

Pick a timezone far from UTC and the blocks slide, wrapping onto the next day — or onto Monday, from
the end of Sunday — while the stored hours below stay put.

#### Which Timezones the Picker Offers

`timezones` takes IANA names, or one of three named sets:

| Set | Zones | What it is |
| --- | --- | --- |
| `en` | 6 | US Eastern, Central, Mountain and Pacific, the UK, and Australia — listed under those names rather than their IANA ones. For an English-speaking audience who would rather not read `America/Los_Angeles`. |
| `offsets` | ~42 | One zone per UTC offset. The default — enough to read a schedule from anywhere without a long list, though the city standing in for each offset is arbitrary. |
| `common` | ~90 | Every offset in use, plus the business and population centres that share one — so Berlin, Paris, Madrid and Rome all appear rather than one standing for the rest. Includes the half and quarter-hour zones (India, Iran, Nepal, Newfoundland, central Australia, Chatham). |
| `all` | ~420 | Everything `Intl.supportedValuesOf('timeZone')` reports. Complete, but full of aliases and zones nobody selects. |

`common` is the one to reach for whenever real users pick their own timezone; `offsets` suits an
internal tool where the offset is all that matters; `en` suits a product whose customers are all in
the US, the UK or Australia.

```html:preview
<zn-schedule-builder
  show-timezone
  timezones="en"
  display-timezone="Europe/London"
  view="form"
  value='{"timezone":"UTC","days":{"mon":["13:00-21:00"],"tue":["13:00-21:00"]}}'>
</zn-schedule-builder>
```

```html:preview
<zn-schedule-builder
  show-timezone
  timezones="common"
  display-timezone="auto"
  view="form"
  value='{"timezone":"UTC","days":{"mon":["13:00-21:00"],"tue":["13:00-21:00"]}}'>
</zn-schedule-builder>
```

Sets and explicit names can be mixed — `timezones="en Asia/Tokyo"` adds Tokyo to the six above, and a
set's friendly name wins over a later plain listing of the same zone. The viewer's own timezone plus
both configured zones are always added, so the current selection is never missing from the list.

```html:preview
<zn-schedule-builder
  show-timezone
  display-timezone="America/New_York"
  timezones="UTC Europe/London America/New_York Asia/Tokyo"
  view="form"
  value='{"timezone":"UTC","days":{"mon":["13:00-21:00"],"tue":["13:00-21:00"]}}'>
</zn-schedule-builder>
```

Reading the hours in code follows the same split: `schedule`, `value` and `getDay()` are in the save
timezone, while `displayedDays` and `setDisplayDay()` are in the display timezone.

:::tip
A weekly pattern has no date of its own, so there is no way to know whether daylight saving applies
to it. Offsets are resolved against today by default; set `reference-date` to a `YYYY-MM-DD` date to
pin them to a specific point in the year.
:::

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
