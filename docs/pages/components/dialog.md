---
meta:
  title: Dialog
  description: 'Dialogs, also called "modals", appear above the page and require the users immediate attention.'
layout: component
---

## Examples

### Basic Dialog

This is a basic dialog. It has a trigger button that opens the dialog. The dialog has a close button and two buttons in
the footer.

```html:preview

<zn-button id="dialog-trigger">Open Basic dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger" label="Dialog">
  This is the dialog’s body.

  <zn-button color="default" slot="footer">Do Something</zn-button>
  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
</zn-dialog>
```

### Dialog Variants

Use the header-icon slot to display an sl-icon to the left of the dialog header (label).

Use this pattern for confirmation dialogs, when asking people to confirm that they want to take an action, and for
informational dialogs.

Set the dialog variant (default or warning) to apply the right color theme to the icon: default for confirmation of
neutral actions (like submitting a form), and warning for confirmation of destructive actions (like canceling or
deleting something).

```html:preview

<zn-button id="dialog-trigger">Open Default Dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger" label="Dialog">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  If you need to, you can cancel this request after submitting it. Are you sure you want to submit it now?

  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
  <zn-button color="default" slot="footer" type="submit">Do Something</zn-button>
</zn-dialog>

<zn-button id="dialog-trigger-2">Open Warning Dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger-2" label="Dialog" variant="warning">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  If you need to, you can cancel this request after submitting it. Are you sure you want to submit it now?

  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
  <zn-button color="warning" slot="footer">Do Something</zn-button>
</zn-dialog>

<zn-button id="dialog-trigger-3" color="warning">Open Announcement Dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger-3" label="Meet your new Monthly Numbers dashboard" variant="announcement">
  <div slot="announcement-intro">Welcome!</div>
  <zn-icon src="info" slot="header-icon"></zn-icon>
  If you need to, you can cancel this request after submitting it. Are you sure you want to submit it now?

  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
  <zn-button color="default" slot="footer">Do Something</zn-button>
  <div slot="footer-text"><a href="#">Learn more about Monthly Numbers</a></div>
</zn-dialog>
```

### Dialogs as Forms

Use dialogs as forms when you need to collect information from users. This example shows a dialog with a form inside it.

```html:preview

<form method="post" action="#" style="display: inline-block">
  <zn-button id="dialog-trigger">Open Form Dialog</zn-button>
  <zn-dialog class="dialog-basic" trigger="dialog-trigger" label="Dialog" size="large">
    <zn-icon src="info" slot="header-icon"></zn-icon>

    <zn-form-group
      label="Profile"
      label-tooltip="huh"
      help-text="This information will be displayed publicly so be careful what you share">

      <div class="form-spacing">
        <zn-input type="text" name="name" label="Name" required></zn-input>
        <zn-select label="Favorite Animal" clearable required>
          <zn-option value="birds">Birds</zn-option>
          <zn-option value="cats">Cats</zn-option>
          <zn-option value="dogs">Dogs</zn-option>
          <zn-option value="other">Other</zn-option>
        </zn-select>

        <zn-textarea name="comment" label="Comment" required></zn-textarea>

        <zn-checkbox required>Check me before submitting</zn-checkbox>

        <br>
        <zn-checkbox-group label="Checkbox group" help-text="Select at least one" label-tooltip="Do you need help?"
                           required>
          <zn-checkbox value="I'm option 1">Option 1</zn-checkbox>
          <zn-checkbox value="I'm option 2">Option 2</zn-checkbox>
          <zn-checkbox value="I'm option 3">Option 3</zn-checkbox>
        </zn-checkbox-group>
      </div>
    </zn-form-group>

    <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
    <zn-button color="default" slot="footer" type="submit">Submit</zn-button>
  </zn-dialog>
```

### Dialog Sizes

Dialogs come in three different sizes: `small`, `medium`, and `large`. The default size is `medium`.

```html:preview

<zn-button id="dialog-trigger">Open Small Dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger" label="Dialog" size="small">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This is a small dialog.

  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
  <zn-button color="default" slot="footer">Do Something</zn-button>
</zn-dialog>

<zn-button id="dialog-trigger-2">Open Medium Dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger-2" label="Dialog">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This is a medium dialog.

  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
  <zn-button color="default" slot="footer">Do Something</zn-button>
</zn-dialog>

<zn-button id="dialog-trigger-3">Open Large Dialog</zn-button>
<zn-dialog class="dialog-basic" trigger="dialog-trigger-3" label="Dialog" size="large">
  <zn-icon src="info" slot="header-icon"></zn-icon>
  This is a large dialog.

  <zn-button color="secondary" slot="footer" dialog-closer>Close Dialog</zn-button>
  <zn-button color="default" slot="footer">Do Something</zn-button>
</zn-dialog>
```