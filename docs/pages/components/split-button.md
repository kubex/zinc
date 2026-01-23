---
meta:
  title: Split Button
  description: Split buttons combine a primary action button with a dropdown menu for related secondary actions.
layout: component
---

Split buttons are useful when you have a primary action that users will perform most often, but you also want to provide quick access to related alternative actions. They consist of a main button that triggers the default action and a dropdown button that reveals additional options.

```html:preview
<zn-split-button caption="Save Document" href="#save">
  <zn-menu slot="menu">
    <zn-menu-item href="#save-as">Save As...</zn-menu-item>
    <zn-menu-item href="#save-copy">Save a Copy</zn-menu-item>
    <zn-menu-item href="#save-template">Save as Template</zn-menu-item>
  </zn-menu>
</zn-split-button>
```

## Examples

### Basic Split Button with Links

Use the `caption` attribute to set the text for the primary button. The `href` attribute on the main component sets the primary action link.

```html:preview
<zn-split-button caption="View Details" href="/details">
  <zn-menu slot="menu">
    <zn-menu-item href="/edit">Edit</zn-menu-item>
    <zn-menu-item href="/duplicate">Duplicate</zn-menu-item>
    <zn-menu-item href="/archive">Archive</zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Form Submit with Different Values

Split buttons integrate with forms and can submit different values depending on which option is selected. Use the `type`, `name`, and `value` attributes to configure form behavior.

When the primary button is clicked, it submits with the `defaultValue` (which is the initial `value`). When a menu item is clicked, it updates the `value` before submitting.

```html:preview
<form id="example-form" onsubmit="event.preventDefault(); alert('Form submitted with value: ' + this.action.value);">
  <zn-input name="email" label="Email" value="user@example.com"></zn-input>
  <br />
  <zn-split-button type="submit" name="action" value="send-close" caption="Send and Close">
    <zn-menu slot="menu">
      <zn-menu-item value="send">Send</zn-menu-item>
      <zn-menu-item value="send-draft">Send as Draft</zn-menu-item>
      <zn-menu-item value="schedule">Schedule Send</zn-menu-item>
    </zn-menu>
  </zn-split-button>
</form>
```

### Button Types

Like regular buttons, split buttons support different types for form interactions: `submit`, `button`, and `reset`.

```html:preview
<form id="type-form" onsubmit="event.preventDefault(); alert('Form submitted');">
  <zn-input name="username" label="Username"></zn-input>
  <br />

  <zn-split-button type="submit" name="submit-action" value="save" caption="Save">
    <zn-menu slot="menu">
      <zn-menu-item value="save-exit">Save and Exit</zn-menu-item>
      <zn-menu-item value="save-new">Save and New</zn-menu-item>
    </zn-menu>
  </zn-split-button>

  <zn-split-button type="reset" caption="Reset Form">
    <zn-menu slot="menu">
      <zn-menu-item onclick="alert('Clear all clicked')">Clear All</zn-menu-item>
      <zn-menu-item onclick="alert('Reset to defaults clicked')">Reset to Defaults</zn-menu-item>
    </zn-menu>
  </zn-split-button>
</form>
```

### Menu with Icons

Add icons to menu items for better visual clarity using the `prefix` slot.

```html:preview
<zn-split-button caption="Export Data" href="#export">
  <zn-menu slot="menu">
    <zn-menu-item href="#export-pdf">
      <zn-icon slot="prefix" src="picture_as_pdf" size="20"></zn-icon>
      Export as PDF
    </zn-menu-item>
    <zn-menu-item href="#export-csv">
      <zn-icon slot="prefix" src="grid_on" size="20"></zn-icon>
      Export as CSV
    </zn-menu-item>
    <zn-menu-item href="#export-json">
      <zn-icon slot="prefix" src="code" size="20"></zn-icon>
      Export as JSON
    </zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Complex Menu Options

Split buttons can contain complex menus with submenus, dividers, and various menu item features.

```html:preview
<zn-split-button caption="Publish Now" type="button">
  <zn-menu slot="menu">
    <zn-menu-item value="publish-schedule">
      <zn-icon slot="prefix" src="schedule" size="20"></zn-icon>
      Schedule Publish
    </zn-menu-item>
    <zn-menu-item value="publish-draft">
      <zn-icon slot="prefix" src="draft" size="20"></zn-icon>
      Save as Draft
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item value="publish-settings">
      Publish Settings
      <zn-menu slot="submenu">
        <zn-menu-item type="checkbox" value="notify-subscribers" checked>
          Notify Subscribers
        </zn-menu-item>
        <zn-menu-item type="checkbox" value="send-email">
          Send Email Notification
        </zn-menu-item>
        <zn-menu-item type="checkbox" value="post-social" checked>
          Post to Social Media
        </zn-menu-item>
      </zn-menu>
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item value="preview">
      <zn-icon slot="prefix" src="visibility" size="20"></zn-icon>
      Preview Before Publishing
    </zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Action Menu with Different Severities

Use colored menu items to indicate the severity or importance of different actions.

```html:preview
<zn-split-button caption="Approve Request" type="button">
  <zn-menu slot="menu">
    <zn-menu-item value="approve-conditions" color="info">
      <zn-icon slot="prefix" src="info" size="20"></zn-icon>
      Approve with Conditions
    </zn-menu-item>
    <zn-menu-item value="approve-review" color="warning">
      <zn-icon slot="prefix" src="flag" size="20"></zn-icon>
      Approve and Flag for Review
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item value="reject" color="error">
      <zn-icon slot="prefix" src="cancel" size="20"></zn-icon>
      Reject Request
    </zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Custom Trigger

You can provide a completely custom trigger by using the `trigger` slot. This overrides the default button group appearance.

```html:preview
<zn-split-button>
  <zn-button-group slot="trigger">
    <zn-button color="success" icon="check">Accept</zn-button>
    <zn-button color="success" icon="keyboard_arrow_down"></zn-button>
  </zn-button-group>
  <zn-menu slot="menu">
    <zn-menu-item value="accept-all">
      <zn-icon slot="prefix" src="done_all" size="20"></zn-icon>
      Accept All
    </zn-menu-item>
    <zn-menu-item value="accept-conditionally">
      <zn-icon slot="prefix" src="check_circle_outline" size="20"></zn-icon>
      Accept with Conditions
    </zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Real-World Example: Email Actions

A practical example showing how split buttons work in a typical email application scenario.

```html:preview
<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <zn-split-button caption="Reply" type="button">
    <zn-menu slot="menu">
      <zn-menu-item value="reply-all">
        <zn-icon slot="prefix" src="reply_all" size="20"></zn-icon>
        Reply All
      </zn-menu-item>
      <zn-menu-item value="forward">
        <zn-icon slot="prefix" src="forward" size="20"></zn-icon>
        Forward
      </zn-menu-item>
    </zn-menu>
  </zn-split-button>

  <zn-split-button caption="Archive" type="button">
    <zn-menu slot="menu">
      <zn-menu-item value="archive-mark-read">
        <zn-icon slot="prefix" src="mark_email_read" size="20"></zn-icon>
        Archive and Mark as Read
      </zn-menu-item>
      <zn-menu-item value="archive-mute">
        <zn-icon slot="prefix" src="notifications_off" size="20"></zn-icon>
        Archive and Mute Thread
      </zn-menu-item>
    </zn-menu>
  </zn-split-button>

  <zn-split-button caption="Move to" type="button">
    <zn-menu slot="menu">
      <zn-menu-item value="inbox">
        <zn-icon slot="prefix" src="inbox" size="20"></zn-icon>
        Inbox
      </zn-menu-item>
      <zn-menu-item value="spam">
        <zn-icon slot="prefix" src="report" size="20"></zn-icon>
        Spam
      </zn-menu-item>
      <zn-menu-item value="trash" color="error">
        <zn-icon slot="prefix" src="delete" size="20"></zn-icon>
        Trash
      </zn-menu-item>
    </zn-menu>
  </zn-split-button>
</div>
```

### Dropdown Placement

The dropdown uses `placement="bottom-end"` by default, positioning the menu at the bottom-right of the button group. The split button wraps a `zn-dropdown` component internally.

```html:preview
<zn-split-button caption="Default Placement">
  <zn-menu slot="menu">
    <zn-menu-item>Option 1</zn-menu-item>
    <zn-menu-item>Option 2</zn-menu-item>
    <zn-menu-item>Option 3</zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Form Integration Example

A complete form example showing how split buttons work with form validation and submission.

```html:preview
<form id="complete-form" style="max-width: 400px;">
  <zn-input name="title" label="Document Title" required></zn-input>
  <br />
  <zn-textarea name="content" label="Content" rows="4"></zn-textarea>
  <br />

  <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
    <zn-button type="button" color="transparent" onclick="this.closest('form').reset()">
      Cancel
    </zn-button>

    <zn-split-button type="submit" name="save-action" value="save" caption="Save">
      <zn-menu slot="menu">
        <zn-menu-item value="save-close">Save and Close</zn-menu-item>
        <zn-menu-item value="save-new">Save and Create New</zn-menu-item>
        <zn-menu-item value="save-preview">Save and Preview</zn-menu-item>
      </zn-menu>
    </zn-split-button>
  </div>
</form>

<script>
  document.getElementById('complete-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    alert(`Form submitted with action: ${data['save-action']}\nTitle: ${data.title}`);
  });
</script>
```

### Events

Split buttons work with the standard menu events. Listen for the `zn-menu-select` event to handle menu item selections.

```html:preview
<zn-split-button id="event-split-button" caption="Perform Action" type="button">
  <zn-menu slot="menu">
    <zn-menu-item value="action1">Action 1</zn-menu-item>
    <zn-menu-item value="action2">Action 2</zn-menu-item>
    <zn-menu-item value="action3">Action 3</zn-menu-item>
  </zn-menu>
</zn-split-button>

<div id="event-output" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  <strong>Last action:</strong> <span id="last-action">None</span>
</div>

<script>
  const splitButton = document.getElementById('event-split-button');
  const lastAction = document.getElementById('last-action');

  splitButton.addEventListener('zn-menu-select', (e) => {
    lastAction.textContent = e.detail.value || 'Primary button clicked';
  });

  splitButton.addEventListener('click', (e) => {
    if (e.target === splitButton.button) {
      lastAction.textContent = 'Primary action (default value)';
    }
  });
</script>
```

### Programmatic Control

You can programmatically control the split button and access its internal components.

```html:preview
<zn-split-button id="prog-split-button" caption="Action" type="button" value="default-action">
  <zn-menu slot="menu">
    <zn-menu-item value="option1">Option 1</zn-menu-item>
    <zn-menu-item value="option2">Option 2</zn-menu-item>
  </zn-menu>
</zn-split-button>

<div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
  <zn-button id="show-dropdown" size="small">Show Dropdown</zn-button>
  <zn-button id="hide-dropdown" size="small">Hide Dropdown</zn-button>
  <zn-button id="get-value" size="small" color="info">Get Current Value</zn-button>
  <zn-button id="set-value" size="small" color="success">Set Value to 'option1'</zn-button>
</div>

<div id="prog-output" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  <strong>Status:</strong> <span id="prog-status">Ready</span>
</div>

<script>
  const progSplitButton = document.getElementById('prog-split-button');
  const progStatus = document.getElementById('prog-status');

  document.getElementById('show-dropdown').addEventListener('click', () => {
    progSplitButton.dropdown.show();
    progStatus.textContent = 'Dropdown shown';
  });

  document.getElementById('hide-dropdown').addEventListener('click', () => {
    progSplitButton.dropdown.hide();
    progStatus.textContent = 'Dropdown hidden';
  });

  document.getElementById('get-value').addEventListener('click', () => {
    progStatus.textContent = `Current value: ${progSplitButton.value}`;
  });

  document.getElementById('set-value').addEventListener('click', () => {
    progSplitButton.value = 'option1';
    progStatus.textContent = `Value set to: ${progSplitButton.value}`;
  });
</script>
```
