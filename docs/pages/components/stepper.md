---
meta:
  title: Stepper
  description: Steppers provide visual feedback about progress through a multi-step process or workflow, showing current position and total steps.
layout: component
---

```html:preview
<zn-stepper caption="Setup Progress" label="Installation Wizard" steps="5" value="3" show-progress></zn-stepper>
```

## Examples

### Basic Stepper

A basic stepper displays progress through a sequence of steps. Use the `steps` attribute to define the total number of steps and `value` to indicate the current step position.

```html:preview
<zn-stepper steps="4" value="2"></zn-stepper>
```

### With Caption

Use the `caption` attribute to add a descriptive label above the stepper. This helps users understand what process or workflow the stepper represents.

```html:preview
<zn-stepper caption="Account Setup" steps="5" value="2"></zn-stepper>
<br />
<zn-stepper caption="Order Processing" steps="6" value="4"></zn-stepper>
<br />
<zn-stepper caption="Project Onboarding" steps="3" value="1"></zn-stepper>
```

### With Label

Use the `label` attribute to display information above the caption. This is useful for showing the wizard or workflow name.

```html:preview
<zn-stepper label="New User Registration" caption="Personal Information" steps="5" value="1"></zn-stepper>
<br />
<zn-stepper label="Checkout Process" caption="Shipping Details" steps="4" value="2"></zn-stepper>
```

### Showing Progress Count

Use the `show-progress` attribute to display the current step number alongside the total number of steps (e.g., "2 / 5 steps").

```html:preview
<zn-stepper caption="Installation" steps="5" value="2" show-progress></zn-stepper>
<br />
<zn-stepper caption="Data Import" steps="10" value="7" show-progress></zn-stepper>
<br />
<zn-stepper caption="Configuration" steps="3" value="3" show-progress></zn-stepper>
```

### Complete Progress States

Examples showing different stages of a workflow, from start to completion.

```html:preview
<zn-stepper
  label="Project Setup Wizard"
  caption="Getting Started"
  steps="5"
  value="0"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  label="Project Setup Wizard"
  caption="Configure Settings"
  steps="5"
  value="2"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  label="Project Setup Wizard"
  caption="Review & Deploy"
  steps="5"
  value="4"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  label="Project Setup Wizard"
  caption="Complete!"
  steps="5"
  value="5"
  show-progress>
</zn-stepper>
```

### All Properties Combined

A comprehensive example showing all available properties working together.

```html:preview
<zn-stepper
  label="E-commerce Checkout"
  caption="Payment Information"
  steps="4"
  value="3"
  show-progress>
</zn-stepper>
```

### Dynamic Progress Updates

Steppers can be updated dynamically using JavaScript to reflect real-time progress through a workflow.

```html:preview
<zn-stepper
  id="dynamic-stepper"
  label="Form Wizard"
  caption="Step 1: Personal Details"
  steps="4"
  value="1"
  show-progress>
</zn-stepper>
<br />
<zn-button id="next-step">Next Step</zn-button>
<zn-button id="prev-step" color="secondary">Previous Step</zn-button>
<zn-button id="reset-stepper" color="transparent">Reset</zn-button>

<script type="module">
  const stepper = document.getElementById('dynamic-stepper');
  const nextBtn = document.getElementById('next-step');
  const prevBtn = document.getElementById('prev-step');
  const resetBtn = document.getElementById('reset-stepper');

  const stepNames = [
    'Personal Details',
    'Contact Information',
    'Preferences',
    'Review & Submit'
  ];

  function updateStepCaption() {
    const stepIndex = stepper.value - 1;
    if (stepIndex >= 0 && stepIndex < stepNames.length) {
      stepper.caption = `Step ${stepper.value}: ${stepNames[stepIndex]}`;
    } else if (stepper.value === 0) {
      stepper.caption = 'Getting Started';
    }
  }

  nextBtn.addEventListener('click', () => {
    if (stepper.value < stepper.steps) {
      stepper.value = stepper.value + 1;
      updateStepCaption();
      if (stepper.value === stepper.steps) {
        stepper.caption = 'Complete!';
      }
    }
  });

  prevBtn.addEventListener('click', () => {
    if (stepper.value > 0) {
      stepper.value = stepper.value - 1;
      updateStepCaption();
    }
  });

  resetBtn.addEventListener('click', () => {
    stepper.value = 1;
    updateStepCaption();
  });
</script>
```

### Multi-Step Form Wizard

A practical example showing a stepper integrated with a form wizard interface.

```html:preview
<zn-stepper
  id="wizard-stepper"
  label="Account Creation Wizard"
  caption="Step 1: Basic Information"
  steps="3"
  value="1"
  show-progress>
</zn-stepper>

<div id="wizard-content" style="margin-top: 20px; padding: 20px; border: 1px solid rgb(var(--zn-border-color)); border-radius: 4px;">
  <div class="wizard-step" data-step="1">
    <h3>Basic Information</h3>
    <p>Please enter your basic details to get started.</p>
  </div>
  <div class="wizard-step" data-step="2" style="display: none;">
    <h3>Account Settings</h3>
    <p>Configure your account preferences.</p>
  </div>
  <div class="wizard-step" data-step="3" style="display: none;">
    <h3>Confirmation</h3>
    <p>Review your information and complete the setup.</p>
  </div>
</div>

<div style="margin-top: 20px;">
  <zn-button id="wizard-next" color="default">Next</zn-button>
  <zn-button id="wizard-prev" color="secondary" style="display: none;">Previous</zn-button>
  <zn-button id="wizard-finish" color="success" style="display: none;">Finish</zn-button>
</div>

<script type="module">
  const wizardStepper = document.getElementById('wizard-stepper');
  const nextBtn = document.getElementById('wizard-next');
  const prevBtn = document.getElementById('wizard-prev');
  const finishBtn = document.getElementById('wizard-finish');
  const steps = document.querySelectorAll('.wizard-step');

  const stepTitles = [
    'Basic Information',
    'Account Settings',
    'Confirmation'
  ];

  function updateWizard() {
    const currentStep = wizardStepper.value;

    // Update stepper caption
    wizardStepper.caption = `Step ${currentStep}: ${stepTitles[currentStep - 1]}`;

    // Show/hide content
    steps.forEach((step, index) => {
      step.style.display = (index + 1 === currentStep) ? 'block' : 'none';
    });

    // Show/hide buttons
    prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
    nextBtn.style.display = currentStep < wizardStepper.steps ? 'inline-block' : 'none';
    finishBtn.style.display = currentStep === wizardStepper.steps ? 'inline-block' : 'none';
  }

  nextBtn.addEventListener('click', () => {
    if (wizardStepper.value < wizardStepper.steps) {
      wizardStepper.value++;
      updateWizard();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (wizardStepper.value > 1) {
      wizardStepper.value--;
      updateWizard();
    }
  });

  finishBtn.addEventListener('click', () => {
    alert('Wizard completed!');
  });

  updateWizard();
</script>
```

### Installation Progress Simulation

A realistic example simulating an installation or setup process with automatic progress updates.

```html:preview
<zn-stepper
  id="install-stepper"
  label="Software Installation"
  caption="Click Start to begin"
  steps="5"
  value="0"
  show-progress>
</zn-stepper>
<br />
<zn-button id="start-install" icon="download">Start Installation</zn-button>
<zn-button id="cancel-install" color="secondary" disabled>Cancel</zn-button>

<script type="module">
  const installStepper = document.getElementById('install-stepper');
  const startBtn = document.getElementById('start-install');
  const cancelBtn = document.getElementById('cancel-install');
  let installInterval;

  const installSteps = [
    'Downloading files...',
    'Extracting packages...',
    'Installing dependencies...',
    'Configuring settings...',
    'Finalizing installation...',
    'Installation complete!'
  ];

  startBtn.addEventListener('click', () => {
    installStepper.value = 0;
    startBtn.disabled = true;
    startBtn.loading = true;
    cancelBtn.disabled = false;

    let currentStep = 0;

    installInterval = setInterval(() => {
      if (currentStep < installStepper.steps) {
        currentStep++;
        installStepper.value = currentStep;
        installStepper.caption = installSteps[currentStep];
      } else {
        clearInterval(installInterval);
        installStepper.caption = installSteps[installSteps.length - 1];
        startBtn.disabled = false;
        startBtn.loading = false;
        cancelBtn.disabled = true;
      }
    }, 1500);
  });

  cancelBtn.addEventListener('click', () => {
    clearInterval(installInterval);
    installStepper.caption = 'Installation cancelled';
    startBtn.disabled = false;
    startBtn.loading = false;
    cancelBtn.disabled = true;
  });
</script>
```

### Multiple Steppers

Display multiple steppers to track different concurrent processes or workflows.

```html:preview
<zn-stepper
  label="Frontend Build"
  caption="Build Complete"
  steps="4"
  value="4"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  label="Backend Build"
  caption="Running Tests"
  steps="4"
  value="3"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  label="Database Migration"
  caption="Migrating Schema"
  steps="6"
  value="2"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  label="Asset Optimization"
  caption="Waiting to Start"
  steps="3"
  value="0"
  show-progress>
</zn-stepper>
```

### Minimal Stepper

A clean, minimal stepper without any text labels, useful for compact layouts or when context is provided elsewhere.

```html:preview
<zn-stepper steps="5" value="1"></zn-stepper>
<br />
<zn-stepper steps="5" value="3"></zn-stepper>
<br />
<zn-stepper steps="5" value="5"></zn-stepper>
```

### Progress Overflow

The stepper handles cases where the value exceeds the total steps by capping the visual progress at 100%.

```html:preview
<zn-stepper
  caption="Over Limit Example"
  steps="5"
  value="7"
  show-progress>
</zn-stepper>
```

### Different Step Counts

Steppers work with any number of steps, from simple two-step processes to complex multi-step workflows.

```html:preview
<zn-stepper caption="Two Steps" steps="2" value="1" show-progress></zn-stepper>
<br />
<zn-stepper caption="Five Steps" steps="5" value="3" show-progress></zn-stepper>
<br />
<zn-stepper caption="Ten Steps" steps="10" value="6" show-progress></zn-stepper>
<br />
<zn-stepper caption="Twenty Steps" steps="20" value="15" show-progress></zn-stepper>
```

## Customization

### Styling with CSS

Customize the appearance of the stepper using CSS custom properties and standard CSS.

```html:preview
<zn-stepper
  class="custom-stepper"
  label="Custom Styled Stepper"
  caption="With Custom Colors"
  steps="5"
  value="3"
  show-progress>
</zn-stepper>

<style>
  .custom-stepper .step-progress {
    background-color: rgb(var(--zn-success));
  }

  .custom-stepper .step {
    background-color: rgba(var(--zn-success), 0.3);
  }

  .custom-stepper .header {
    color: rgb(var(--zn-success));
  }

  .custom-stepper .label {
    font-weight: 700;
  }
</style>
```

### Themed Steppers

Create themed steppers for different use cases or states.

```html:preview
<zn-stepper
  class="success-stepper"
  caption="Success State"
  steps="4"
  value="4"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  class="warning-stepper"
  caption="Warning State"
  steps="4"
  value="2"
  show-progress>
</zn-stepper>
<br />
<zn-stepper
  class="error-stepper"
  caption="Error State"
  steps="4"
  value="1"
  show-progress>
</zn-stepper>

<style>
  .success-stepper .step-progress {
    background-color: rgb(var(--zn-success));
  }
  .success-stepper .step {
    background-color: rgba(var(--zn-success), 0.3);
  }

  .warning-stepper .step-progress {
    background-color: rgb(var(--zn-warning));
  }
  .warning-stepper .step {
    background-color: rgba(var(--zn-warning), 0.3);
  }

  .error-stepper .step-progress {
    background-color: rgb(var(--zn-error));
  }
  .error-stepper .step {
    background-color: rgba(var(--zn-error), 0.3);
  }
</style>
```

### Custom Height and Styling

Adjust the visual appearance of the stepper to match your design requirements.

```html:preview
<zn-stepper
  class="large-stepper"
  caption="Large Stepper"
  steps="4"
  value="2"
  show-progress>
</zn-stepper>

<style>
  .large-stepper .step-container {
    height: 20px;
  }

  .large-stepper .step {
    width: 24px;
    height: 24px;
    border-width: 4px;
  }

  .large-stepper .step-progress {
    height: 12px;
    top: 4px;
  }

  .large-stepper .step-line {
    height: 4px;
  }
</style>
```

## Wizard Patterns

### Using with Vertical Stepper

Combine horizontal and vertical steppers for comprehensive workflow navigation. The horizontal stepper shows overall progress while vertical steppers can show sub-steps within each main step.

```html:preview
<zn-stepper
  label="Multi-Stage Process"
  caption="Stage 2: Configuration"
  steps="3"
  value="2"
  show-progress>
</zn-stepper>
<br /><br />
<zn-vertical-stepper caption="Database Setup" description="Configure database connection" first active></zn-vertical-stepper>
<zn-vertical-stepper caption="API Keys" description="Enter your API credentials" active></zn-vertical-stepper>
<zn-vertical-stepper caption="Deployment" description="Deploy to production" last></zn-vertical-stepper>
```

### Progressive Disclosure

Use steppers to guide users through complex forms with progressive disclosure of information.

```html:preview
<zn-stepper
  id="disclosure-stepper"
  label="Registration Process"
  caption="Step 1 of 4"
  steps="4"
  value="1"
  show-progress>
</zn-stepper>
<br />
<p>Steppers help break down complex multi-step processes into manageable chunks, improving user experience and reducing cognitive load.</p>
```

### Validation States

Combine steppers with validation feedback to show progress and validation status.

```html:preview
<zn-stepper
  label="Form Validation"
  caption="Step 2: Validation Required"
  steps="3"
  value="2"
  show-progress>
</zn-stepper>
<br />
<zn-alert color="warning" open>
  Please complete all required fields before proceeding to the next step.
</zn-alert>
```
