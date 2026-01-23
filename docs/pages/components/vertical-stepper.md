---
meta:
  title: Vertical Stepper
  description: Vertical steppers display a sequence of steps in a vertical layout, ideal for showing detailed multi-step processes with individual step descriptions.
layout: component
---

```html:preview
<zn-vertical-stepper caption="Create Account" description="Enter your personal information" first active></zn-vertical-stepper>
<zn-vertical-stepper caption="Verify Email" description="Check your inbox for verification link" active></zn-vertical-stepper>
<zn-vertical-stepper caption="Complete Profile" description="Add additional details to your profile" last></zn-vertical-stepper>
```

## Examples

### Basic Vertical Stepper

Vertical steppers are composed of individual step items arranged vertically. Use the `first`, `active`, and `last` attributes to control appearance and connection lines.

```html:preview
<zn-vertical-stepper caption="Step One" description="This is the first step" first></zn-vertical-stepper>
<zn-vertical-stepper caption="Step Two" description="This is the second step"></zn-vertical-stepper>
<zn-vertical-stepper caption="Step Three" description="This is the final step" last></zn-vertical-stepper>
```

### Active State

Use the `active` attribute to highlight the current step in the process. The active step is visually distinguished from completed and upcoming steps.

```html:preview
<zn-vertical-stepper caption="Account Created" description="Your account has been created successfully" first></zn-vertical-stepper>
<zn-vertical-stepper caption="Email Verification" description="Verify your email address" active></zn-vertical-stepper>
<zn-vertical-stepper caption="Profile Setup" description="Complete your profile information" last></zn-vertical-stepper>
```

### With Custom Icons

Use the `icon` slot to add custom icons or indicators for each step.

```html:preview
<zn-vertical-stepper caption="Personal Details" description="Enter your name and contact information" first active>
  <zn-icon slot="icon" src="person"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Address" description="Provide your shipping address">
  <zn-icon slot="icon" src="home"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Payment" description="Add payment method" last>
  <zn-icon slot="icon" src="credit_card"></zn-icon>
</zn-vertical-stepper>
```

### Completed Steps with Icons

Show completed steps with check marks or success icons.

```html:preview
<zn-vertical-stepper caption="Registration" description="Account created successfully" first>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Verification" description="Email verified" active>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Payment Setup" description="Add your payment method">
  <zn-icon slot="icon" src="pending" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Complete Profile" description="Upload profile picture" last>
  <zn-icon slot="icon" src="pending" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
```

### Order Processing Workflow

A practical example showing an order fulfillment process with different step states.

```html:preview
<zn-vertical-stepper caption="Order Received" description="Order #12345 received on Jan 20, 2026" first>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Processing" description="Your order is being prepared" active>
  <zn-icon slot="icon" src="shopping_bag" style="color: rgb(var(--zn-primary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Shipped" description="Estimated delivery: Jan 25, 2026">
  <zn-icon slot="icon" src="local_shipping" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper caption="Delivered" description="Package will arrive at your doorstep" last>
  <zn-icon slot="icon" src="home" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
```

### Without First and Last Markers

Create continuous step lists by omitting the `first` and `last` attributes when steps are part of a larger scrollable list.

```html:preview
<zn-vertical-stepper caption="Introductory Step" description="Beginning of the process"></zn-vertical-stepper>
<zn-vertical-stepper caption="Middle Step" description="Ongoing process" active></zn-vertical-stepper>
<zn-vertical-stepper caption="Another Step" description="More to come"></zn-vertical-stepper>
```

### Installation Progress

Show detailed installation or setup progress with descriptive text for each phase.

```html:preview
<zn-vertical-stepper
  caption="Download"
  description="Downloading installer files (45 MB)"
  first>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Extract"
  description="Extracting packages and dependencies"
  active>
  <zn-icon slot="icon" src="folder_zip" style="color: rgb(var(--zn-primary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Install"
  description="Installing application components">
  <zn-icon slot="icon" src="pending" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Configure"
  description="Setting up initial configuration"
  last>
  <zn-icon slot="icon" src="pending" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
```

### Project Onboarding

A multi-step onboarding flow with clear descriptions for each phase.

```html:preview
<zn-vertical-stepper
  caption="Welcome"
  description="Introduction to the platform and key features"
  first>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Team Setup"
  description="Invite team members and assign roles"
  active>
  <zn-icon slot="icon" src="group_add" style="color: rgb(var(--zn-primary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Project Configuration"
  description="Set up your first project and workspace">
  <zn-icon slot="icon" src="settings" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Integration"
  description="Connect external tools and services">
  <zn-icon slot="icon" src="link" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Launch"
  description="Review settings and go live"
  last>
  <zn-icon slot="icon" src="rocket_launch" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
```

### Error State

Show error or warning states in your stepper workflow.

```html:preview
<zn-vertical-stepper
  caption="Validation"
  description="Form validation passed"
  first>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Payment Processing"
  description="Payment failed - card declined"
  active>
  <zn-icon slot="icon" src="error" style="color: rgb(var(--zn-error))"></zn-icon>
</zn-vertical-stepper>
<zn-vertical-stepper
  caption="Confirmation"
  description="Order confirmation email"
  last>
  <zn-icon slot="icon" src="pending" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
</zn-vertical-stepper>
```

### Dynamic Vertical Stepper

Update vertical stepper states dynamically based on user actions.

```html:preview
<div id="dynamic-vertical-steps">
  <zn-vertical-stepper
    id="v-step-1"
    caption="Step 1"
    description="Complete this step"
    first
    active>
    <zn-icon slot="icon" src="radio_button_checked"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper
    id="v-step-2"
    caption="Step 2"
    description="Pending">
    <zn-icon slot="icon" src="radio_button_unchecked"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper
    id="v-step-3"
    caption="Step 3"
    description="Pending"
    last>
    <zn-icon slot="icon" src="radio_button_unchecked"></zn-icon>
  </zn-vertical-stepper>
</div>
<br />
<zn-button id="v-next-step">Complete Current Step</zn-button>
<zn-button id="v-reset" color="secondary">Reset</zn-button>

<script type="module">
  let currentVStep = 1;
  const maxVSteps = 3;

  const nextBtn = document.getElementById('v-next-step');
  const resetBtn = document.getElementById('v-reset');

  function updateVerticalSteps() {
    for (let i = 1; i <= maxVSteps; i++) {
      const step = document.getElementById(`v-step-${i}`);
      const icon = step.querySelector('zn-icon');

      if (i < currentVStep) {
        // Completed step
        step.removeAttribute('active');
        icon.setAttribute('src', 'check_circle');
        icon.style.color = 'rgb(var(--zn-success))';
        step.description = 'Completed';
      } else if (i === currentVStep) {
        // Active step
        step.setAttribute('active', '');
        icon.setAttribute('src', 'radio_button_checked');
        icon.style.color = 'rgb(var(--zn-primary))';
        step.description = 'In Progress';
      } else {
        // Future step
        step.removeAttribute('active');
        icon.setAttribute('src', 'radio_button_unchecked');
        icon.style.color = 'rgb(var(--zn-text-secondary))';
        step.description = 'Pending';
      }
    }

    if (currentVStep > maxVSteps) {
      nextBtn.disabled = true;
    } else {
      nextBtn.disabled = false;
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentVStep <= maxVSteps) {
      currentVStep++;
      updateVerticalSteps();
    }
  });

  resetBtn.addEventListener('click', () => {
    currentVStep = 1;
    updateVerticalSteps();
  });
</script>
```

### Compact Vertical Stepper

Create a more compact layout by adjusting spacing with CSS.

```html:preview
<div class="compact-stepper">
  <zn-vertical-stepper caption="Login" description="User authenticated" first>
    <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper caption="Dashboard" description="Loading user data" active>
    <zn-icon slot="icon" src="dashboard"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper caption="Reports" description="View analytics" last>
    <zn-icon slot="icon" src="bar_chart"></zn-icon>
  </zn-vertical-stepper>
</div>

<style>
  .compact-stepper zn-vertical-stepper {
    margin: 8px 0;
  }
</style>
```

## Integration Patterns

### Combined with Horizontal Stepper

Combine vertical and horizontal steppers for complex workflows where the horizontal stepper shows high-level progress and vertical steppers show detailed sub-steps.

```html:preview
<zn-stepper
  label="Account Setup Process"
  caption="Step 2: Profile Configuration"
  steps="3"
  value="2"
  show-progress>
</zn-stepper>
<br /><br />
<div style="padding-left: 20px;">
  <zn-vertical-stepper
    caption="Basic Info"
    description="Name, email, and contact details"
    first>
    <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper
    caption="Profile Photo"
    description="Upload your profile picture"
    active>
    <zn-icon slot="icon" src="photo_camera" style="color: rgb(var(--zn-primary))"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper
    caption="Preferences"
    description="Set notification and privacy settings"
    last>
    <zn-icon slot="icon" src="tune" style="color: rgb(var(--zn-text-secondary))"></zn-icon>
  </zn-vertical-stepper>
</div>
```

### With Action Buttons

Add interactive elements next to each step for expanded functionality.

```html:preview
<div style="display: flex; align-items: center; gap: 10px;">
  <div style="flex: 1;">
    <zn-vertical-stepper
      caption="Review Changes"
      description="Check all modifications before committing"
      first
      active>
      <zn-icon slot="icon" src="preview"></zn-icon>
    </zn-vertical-stepper>
  </div>
  <zn-button size="small" icon="edit" color="transparent">Edit</zn-button>
</div>
<div style="display: flex; align-items: center; gap: 10px;">
  <div style="flex: 1;">
    <zn-vertical-stepper
      caption="Run Tests"
      description="Execute test suite">
      <zn-icon slot="icon" src="pending"></zn-icon>
    </zn-vertical-stepper>
  </div>
  <zn-button size="small" icon="play_arrow" color="transparent" disabled>Run</zn-button>
</div>
<div style="display: flex; align-items: center; gap: 10px;">
  <div style="flex: 1;">
    <zn-vertical-stepper
      caption="Deploy"
      description="Push changes to production"
      last>
      <zn-icon slot="icon" src="pending"></zn-icon>
    </zn-vertical-stepper>
  </div>
  <zn-button size="small" icon="publish" color="transparent" disabled>Deploy</zn-button>
</div>
```

### Nested Steps

Show hierarchical relationships by nesting vertical steppers or indenting them.

```html:preview
<zn-vertical-stepper
  caption="Phase 1: Planning"
  description="Define project scope and requirements"
  first>
  <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
</zn-vertical-stepper>

<div style="padding-left: 40px;">
  <zn-vertical-stepper
    caption="1.1 Research"
    description="Market analysis completed">
    <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
  </zn-vertical-stepper>
  <zn-vertical-stepper
    caption="1.2 Design"
    description="Wireframes and mockups">
    <zn-icon slot="icon" src="check_circle" style="color: rgb(var(--zn-success))"></zn-icon>
  </zn-vertical-stepper>
</div>

<zn-vertical-stepper
  caption="Phase 2: Development"
  description="Build and test features"
  active>
  <zn-icon slot="icon" src="code" style="color: rgb(var(--zn-primary))"></zn-icon>
</zn-vertical-stepper>

<zn-vertical-stepper
  caption="Phase 3: Deployment"
  description="Release to production"
  last>
  <zn-icon slot="icon" src="pending"></zn-icon>
</zn-vertical-stepper>
```
