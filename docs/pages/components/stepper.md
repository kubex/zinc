---
meta:
  title: Stepper
  description: Steppers provide visual feedback about progress through a multi-step process or workflow, showing current position and total steps.
layout: component
---

A stepper shows how far someone is through a fixed number of steps. Set `steps` to the total and `value` to the steps
reached; each reached step fills in and the current one is highlighted.

```html:preview
<zn-stepper label="Merchant onboarding" caption="Bank details" steps="5" value="3" show-progress></zn-stepper>
```

## Examples

### Caption and Label

`caption` names the current step. `label` adds a smaller line above it, typically the name of the workflow.

```html:preview
<zn-stepper caption="Shipping details" steps="4" value="2"></zn-stepper>
<br />
<zn-stepper label="Checkout" caption="Shipping details" steps="4" value="2"></zn-stepper>
```

### Progress Count

Add `show-progress` to show the count beside the caption. A `value` above `steps` is treated as complete.

```html:preview
<zn-stepper caption="Getting started" steps="5" value="0" show-progress></zn-stepper>
<br />
<zn-stepper caption="Configure settings" steps="5" value="2" show-progress></zn-stepper>
<br />
<zn-stepper caption="Complete" steps="5" value="5" show-progress></zn-stepper>
```

### Wizard

Update `value` and `caption` as someone moves between steps; the fill animates to the new step.

```html:preview
<zn-stepper id="stepper-wizard" label="Create account" steps="3" value="1" show-progress></zn-stepper>
<br />
<zn-button id="stepper-back" color="secondary">Back</zn-button>
<zn-button id="stepper-next">Next</zn-button>

<script type="module">
  const stepper = document.getElementById('stepper-wizard');
  const back = document.getElementById('stepper-back');
  const next = document.getElementById('stepper-next');
  const titles = ['Basic information', 'Account settings', 'Confirmation'];

  function render() {
    stepper.caption = titles[stepper.value - 1];
    back.disabled = stepper.value === 1;
    next.disabled = stepper.value === stepper.steps;
  }

  back.addEventListener('click', () => { stepper.value--; render(); });
  next.addEventListener('click', () => { stepper.value++; render(); });
  render();
</script>
```

### Colors

Set `--zn-stepper-progress-color` to change the fill and reached steps; the current step's halo follows it.
`--zn-stepper-track-color` and `--zn-stepper-marker-color` change the track and upcoming steps.

```html:preview
<zn-stepper caption="Deployed" steps="4" value="4" show-progress
            style="--zn-stepper-progress-color: var(--zn-color-success-solid)"></zn-stepper>
<br />
<zn-stepper caption="Waiting for approval" steps="4" value="2" show-progress
            style="--zn-stepper-progress-color: var(--zn-color-warning-solid)"></zn-stepper>
<br />
<zn-stepper caption="Payment failed" steps="4" value="1" show-progress
            style="--zn-stepper-progress-color: var(--zn-color-danger-solid)"></zn-stepper>
```
