---
meta:
  title: Date Range
  description: A button showing a date range that opens a two-month calendar with quick ranges.
layout: component
---

```html:preview
<zn-date-range from="2026-10-07" to="2026-10-20"></zn-date-range>
```

## Examples

### Basic Date Range

Click the button to open the picker. A quick range on the left applies straight away. On the calendar, click a first day and then a last day, then press Apply. The dates can also be typed in the From and To fields. Escape, Cancel or a click outside closes the picker without changing anything.

When `from` and `to` are missing, the range is today.

```html:preview
<zn-date-range></zn-date-range>
```

### Limiting the Range

Use `max` and `min` to limit which days can be picked. Days outside the limits are greyed out.

```html:preview
<zn-date-range from="2026-10-01" to="2026-10-15" min="2026-09-01" max="2026-10-20"></zn-date-range>
```

### Custom Quick Ranges

Pass `presets` as a JSON array of `{label, from, to}` to replace the default quick ranges (Today, Yesterday, Last 7, 14 and 30 days, This month, Last month and Last 90 days). Quick ranges are cut to `min` and `max`; one that lies wholly outside them is greyed out.

```html:preview
<zn-date-range from="2026-07-01" to="2026-09-30"
               presets='[
                 {"label":"Q1 2026","from":"2026-01-01","to":"2026-03-31"},
                 {"label":"Q2 2026","from":"2026-04-01","to":"2026-06-30"},
                 {"label":"Q3 2026","from":"2026-07-01","to":"2026-09-30"}
               ]'></zn-date-range>
```

### Note

Use `note` for a short line under the calendar, such as how the range is used.

```html:preview
<zn-date-range from="2026-10-19" to="2026-10-20" note="Day Compare sets the first day against the last."></zn-date-range>
```

### Forms

Give the date range a `name` and it submits `name[from]` and `name[to]` with its form.

```html:preview
<form class="date-range-form">
  <zn-date-range name="period" from="2026-10-01" to="2026-10-20"></zn-date-range>
  <br><br>
  <zn-button type="submit" color="primary">Submit</zn-button>
  <pre class="date-range-form__output"></pre>
</form>

<script type="module">
  const form = document.querySelector('.date-range-form');
  const output = form.querySelector('.date-range-form__output');

  form.addEventListener('submit', event => {
    event.preventDefault();
    output.textContent = [...new FormData(form)].map(([key, value]) => `${key} = ${value}`).join('\n');
  });
</script>
```

### Listening for Changes

`zn-change` is emitted when a range is applied, by Apply or a quick range, with `{from, to}` in its detail. Picking days without pressing Apply does not emit it.

```html:preview
<div class="date-range-events">
  <zn-date-range from="2026-10-13" to="2026-10-20"></zn-date-range>
  <p class="date-range-events__output">Pick a range and press Apply.</p>
</div>

<script type="module">
  const container = document.querySelector('.date-range-events');
  const output = container.querySelector('.date-range-events__output');

  container.querySelector('zn-date-range').addEventListener('zn-change', event => {
    output.textContent = `Applied ${event.detail.from} to ${event.detail.to}`;
  });
</script>
```

### Opening from Script

Call `show()` and `hide()` to open and close the picker.

```html:preview
<div class="date-range-methods">
  <zn-date-range from="2026-10-13" to="2026-10-20"></zn-date-range>
  <zn-button size="small" color="secondary">Open picker</zn-button>
</div>

<script type="module">
  const container = document.querySelector('.date-range-methods');
  const range = container.querySelector('zn-date-range');

  container.querySelector('zn-button').addEventListener('click', async event => {
    event.stopPropagation();
    await customElements.whenDefined('zn-date-range');
    range.show();
  });
</script>
```
