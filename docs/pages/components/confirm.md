---
meta:
  title: Confirm
  description: A confirmation dialog component that prompts users before performing critical actions. Supports various types (error, warning, success, info), custom content, form validation, and loading states.
layout: component
---

```html:preview
<zn-button id="action-trigger">Trigger Confirm Content</zn-button>
<zn-confirm trigger="action-trigger"
                    type="error"
                    caption="Do Something"
                    content="Are you sure you want to do that?">
</zn-confirm>

<zn-button id="action-trigger-2">Trigger Confirm Content with Form</zn-button>
<zn-confirm trigger="action-trigger-2"
                    type="error"
                    caption="Do Something"
                    content="Are you sure you want to do that?">

                    <form class="form-spacing">
                      <zn-input label="Name" required></zn-input>
                      <zn-input label="Email" type="email" required></zn-input>
                    </form>
</zn-confirm>
```

## Examples

### Confirmation Types

Use different types to indicate the severity or nature of the action.

```html:preview
<zn-button id="error-trigger">Error Confirmation</zn-button>
<zn-confirm trigger="error-trigger"
            type="error"
            caption="Delete Item"
            content="Are you sure you want to delete this item? This action cannot be undone.">
</zn-confirm>

<zn-button id="warning-trigger">Warning Confirmation</zn-button>
<zn-confirm trigger="warning-trigger"
            type="warning"
            caption="Change Status"
            content="Changing the status will affect related items. Continue?">
</zn-confirm>

<zn-button id="success-trigger">Success Confirmation</zn-button>
<zn-confirm trigger="success-trigger"
            type="success"
            caption="Complete Task"
            content="Mark this task as complete?">
</zn-confirm>

<zn-button id="info-trigger">Info Confirmation</zn-button>
<zn-confirm trigger="info-trigger"
            type="info"
            caption="View Details"
            content="Would you like to view the full details?">
</zn-confirm>
```

### Custom Button Text

Customize the confirm and cancel button text using the `confirm-text` and `cancel-text` attributes.

```html:preview
<zn-button id="custom-text-trigger">Delete Account</zn-button>
<zn-confirm trigger="custom-text-trigger"
            type="error"
            caption="Delete Account"
            content="This will permanently delete your account and all associated data."
            confirm-text="Yes, Delete"
            cancel-text="Keep Account">
</zn-confirm>
```

### Dialog Sizes

Control the dialog size with the `size` attribute.

```html:preview
<zn-button id="small-trigger">Small Dialog</zn-button>
<zn-confirm trigger="small-trigger"
            type="warning"
            size="small"
            caption="Quick Action"
            content="This is a small confirmation dialog.">
</zn-confirm>

<zn-button id="medium-trigger">Medium Dialog</zn-button>
<zn-confirm trigger="medium-trigger"
            type="warning"
            size="medium"
            caption="Standard Action"
            content="This is a medium-sized confirmation dialog.">
</zn-confirm>

<zn-button id="large-trigger">Large Dialog</zn-button>
<zn-confirm trigger="large-trigger"
            type="warning"
            size="large"
            caption="Complex Action"
            content="This is a large confirmation dialog with more space for detailed information.">
</zn-confirm>
```

### With Form Content

Include form fields within the confirmation dialog for gathering additional information.

```html:preview
<zn-button id="form-trigger">Update Settings</zn-button>
<zn-confirm trigger="form-trigger"
            type="info"
            caption="Update Settings"
            content="Please provide the following information:">
  <form class="form-spacing">
    <zn-input label="Name" required></zn-input>
    <zn-input label="Email" type="email" required></zn-input>
    <zn-textarea label="Reason for change"></zn-textarea>
  </form>
</zn-confirm>
```

### Announcement Variant

Use the announcement variant for important notifications that require acknowledgment.

```html:preview
<zn-button id="announcement-trigger">View Announcement</zn-button>
<zn-confirm trigger="announcement-trigger"
            variant="announcement"
            type="warning"
            caption="Important System Update"
            content="The system will undergo maintenance tonight from 10 PM to 2 AM. During this time, all services will be unavailable.">
  <form class="form-spacing">
    <zn-input label="Name" required></zn-input>
    <zn-input label="Email" type="email" required></zn-input>
  </form>
</zn-confirm>
```

### Without Icon

Hide the icon using the `hide-icon` attribute for a cleaner appearance.

```html:preview
<zn-button id="no-icon-trigger">Simple Confirm</zn-button>
<zn-confirm trigger="no-icon-trigger"
            type="info"
            caption="Continue?"
            content="Do you want to proceed with this action?"
            hide-icon>
</zn-confirm>
```

### With Loading State

Use the `show-loading` attribute to display a loading state after confirmation.

```html:preview
<zn-button id="loading-trigger">Submit Data</zn-button>
<zn-confirm trigger="loading-trigger"
            type="success"
            caption="Submit Data"
            content="Ready to submit your data?"
            show-loading>
</zn-confirm>
```

### With Footer Text

Add additional information in the footer using the `footer-text` attribute or slot.

```html:preview
<zn-button id="footer-trigger">Delete Files</zn-button>
<zn-confirm trigger="footer-trigger"
            type="error"
            caption="Delete Files"
            content="This will delete all selected files permanently."
            footer-text="This action cannot be undone and files cannot be recovered.">
</zn-confirm>
```

### Multiple Triggers

Use the same trigger ID on multiple buttons to open the same confirmation dialog.

```html:preview
<zn-button id="multi-trigger">Delete from List</zn-button>
<zn-button id="multi-trigger" color="error">Delete from Table</zn-button>
<zn-button id="multi-trigger" color="transparent">Delete from Grid</zn-button>

<zn-confirm trigger="multi-trigger"
            type="error"
            caption="Delete Item"
            content="Are you sure you want to delete this item?">
</zn-confirm>
```

### Form with Action

Specify a form action URL that will be submitted when confirmed.

```html:preview
<zn-button id="action-trigger-form">Submit to Server</zn-button>
<zn-confirm trigger="action-trigger-form"
            type="success"
            caption="Submit Form"
            content="Ready to submit?"
            action="/api/submit">
</zn-confirm>
```


