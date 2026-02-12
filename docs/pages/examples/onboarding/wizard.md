---
meta:
  title: Onboarding Wizard
  description: Multi-step onboarding flow with forms and progress indication.
fullWidth: true
---

# Onboarding Wizard

A multi-step onboarding flow guiding users through initial setup. Demonstrates `zn-stepper`, form validation, and wizard patterns.

```html:preview
<div style="min-height: 600px; display: flex; align-items: center; justify-content: center; background: var(--zn-color-neutral-100); padding: var(--zn-spacing-xl);">
  <zn-panel style="max-width: 600px; width: 100%;">
    <!-- Progress Stepper -->
    <div style="padding: var(--zn-spacing-lg); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <zn-stepper current="2">
        <zn-stepper-item label="Welcome" complete></zn-stepper-item>
        <zn-stepper-item label="Profile" complete></zn-stepper-item>
        <zn-stepper-item label="Team"></zn-stepper-item>
        <zn-stepper-item label="Preferences"></zn-stepper-item>
        <zn-stepper-item label="Complete"></zn-stepper-item>
      </zn-stepper>
    </div>

    <!-- Step Content: Team (Current Step) -->
    <div style="padding: var(--zn-spacing-lg);">
      <h2 style="margin: 0 0 var(--zn-spacing-xs) 0;">Invite your team</h2>
      <p style="color: var(--zn-text-secondary); margin: 0 0 var(--zn-spacing-lg) 0;">Collaborate with your teammates by inviting them to join your workspace.</p>

      <zn-sp>
        <!-- Team Member 1 -->
        <zn-cols layout="2,1,auto">
          <zn-input label="Email" type="email" placeholder="teammate@company.com" value="sarah@acme.com"></zn-input>
          <zn-select label="Role">
            <zn-option value="admin">Admin</zn-option>
            <zn-option value="member" selected>Member</zn-option>
            <zn-option value="viewer">Viewer</zn-option>
          </zn-select>
          <div style="padding-top: 28px;">
            <zn-button icon="close" color="transparent" size="small"></zn-button>
          </div>
        </zn-cols>

        <!-- Team Member 2 -->
        <zn-cols layout="2,1,auto">
          <zn-input label="Email" type="email" placeholder="teammate@company.com" value="michael@acme.com"></zn-input>
          <zn-select label="Role">
            <zn-option value="admin" selected>Admin</zn-option>
            <zn-option value="member">Member</zn-option>
            <zn-option value="viewer">Viewer</zn-option>
          </zn-select>
          <div style="padding-top: 28px;">
            <zn-button icon="close" color="transparent" size="small"></zn-button>
          </div>
        </zn-cols>

        <!-- Team Member 3 (Empty) -->
        <zn-cols layout="2,1,auto">
          <zn-input label="Email" type="email" placeholder="teammate@company.com"></zn-input>
          <zn-select label="Role">
            <zn-option value="admin">Admin</zn-option>
            <zn-option value="member" selected>Member</zn-option>
            <zn-option value="viewer">Viewer</zn-option>
          </zn-select>
          <div style="padding-top: 28px;">
            <zn-button icon="close" color="transparent" size="small"></zn-button>
          </div>
        </zn-cols>

        <zn-button color="secondary" icon="add" size="small">Add another</zn-button>

        <zn-alert type="info">
          <strong>Tip:</strong> Team members will receive an email invitation with instructions to set up their account.
        </zn-alert>
      </zn-sp>
    </div>

    <!-- Navigation Footer -->
    <div style="display: flex; justify-content: space-between; padding: var(--zn-spacing-lg); border-top: 1px solid var(--zn-color-neutral-200);">
      <zn-button color="secondary">Back</zn-button>
      <div style="display: flex; gap: var(--zn-spacing-sm);">
        <zn-button color="transparent">Skip for now</zn-button>
        <zn-button>Continue</zn-button>
      </div>
    </div>
  </zn-panel>
</div>
```

## Other Steps (for reference)

### Step 1: Welcome

```html:preview
<div style="min-height: 500px; display: flex; align-items: center; justify-content: center; background: var(--zn-color-neutral-100); padding: var(--zn-spacing-xl);">
  <zn-panel style="max-width: 500px; width: 100%; text-align: center;">
    <div style="padding: var(--zn-spacing-xl);">
      <zn-icon src="rocket_launch" style="font-size: 64px; color: var(--zn-color-primary); margin-bottom: var(--zn-spacing-md);"></zn-icon>
      <h1 style="margin: 0 0 var(--zn-spacing-sm) 0;">Welcome to Acme Platform</h1>
      <p style="color: var(--zn-text-secondary); margin: 0 0 var(--zn-spacing-lg) 0;">Let's get you set up in just a few steps. This should only take about 2 minutes.</p>
      <zn-button size="large">Get Started</zn-button>
    </div>
  </zn-panel>
</div>
```

### Step 5: Complete

```html:preview
<div style="min-height: 500px; display: flex; align-items: center; justify-content: center; background: var(--zn-color-neutral-100); padding: var(--zn-spacing-xl);">
  <zn-panel style="max-width: 500px; width: 100%; text-align: center;">
    <div style="padding: var(--zn-spacing-xl);">
      <zn-icon src="check_circle" style="font-size: 80px; color: var(--zn-color-success); margin-bottom: var(--zn-spacing-md);"></zn-icon>
      <h1 style="margin: 0 0 var(--zn-spacing-sm) 0;">You're all set!</h1>
      <p style="color: var(--zn-text-secondary); margin: 0 0 var(--zn-spacing-lg) 0;">Your workspace is ready. We've sent invitations to your team members.</p>

      <zn-sp>
        <zn-alert type="success">
          <strong>2 invitations sent</strong> to sarah@acme.com and michael@acme.com
        </zn-alert>

        <zn-button size="large">Go to Dashboard</zn-button>

        <div style="margin-top: var(--zn-spacing-md);">
          <zn-button color="transparent" size="small">Take a product tour</zn-button>
        </div>
      </zn-sp>
    </div>
  </zn-panel>
</div>
```

**Components demonstrated:** `zn-stepper`, `zn-stepper-item`, `zn-input`, `zn-select`, `zn-button`, `zn-alert`, `zn-panel`, `zn-icon`
