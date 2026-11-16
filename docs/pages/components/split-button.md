---
meta:
  title: Split Button
  description: Split buttons combine a primary action button with a dropdown menu for related secondary actions.
layout: component
---

A split button pairs the action people take most often with a menu of related alternatives. The main button runs the
primary action; the caret opens the menu.

```html:preview
<zn-split-button caption="Save" href="#save">
  <zn-menu slot="menu">
    <zn-menu-item href="#save-as">Save as…</zn-menu-item>
    <zn-menu-item href="#save-copy">Save a copy</zn-menu-item>
    <zn-menu-item href="#save-template">Save as template</zn-menu-item>
  </zn-menu>
</zn-split-button>
```

## Examples

### Email Actions

A message toolbar where each button runs the common action and its menu holds the variants.

```html:preview
<div style="display: flex; gap: var(--zn-spacing-small); flex-wrap: wrap;">
  <zn-split-button caption="Reply" type="button">
    <zn-menu slot="menu">
      <zn-menu-item value="reply-all">
        <zn-icon slot="prefix" src="reply-all@lu" size="18"></zn-icon>
        Reply all
      </zn-menu-item>
      <zn-menu-item value="forward">
        <zn-icon slot="prefix" src="forward@lu" size="18"></zn-icon>
        Forward
      </zn-menu-item>
    </zn-menu>
  </zn-split-button>

  <zn-split-button caption="Archive" type="button">
    <zn-menu slot="menu">
      <zn-menu-item value="archive-read">
        <zn-icon slot="prefix" src="mail-check@lu" size="18"></zn-icon>
        Archive and mark as read
      </zn-menu-item>
      <zn-menu-item value="archive-mute">
        <zn-icon slot="prefix" src="bell-off@lu" size="18"></zn-icon>
        Archive and mute thread
      </zn-menu-item>
    </zn-menu>
  </zn-split-button>

  <zn-split-button caption="Move to" type="button">
    <zn-menu slot="menu">
      <zn-menu-item value="inbox">
        <zn-icon slot="prefix" src="inbox@lu" size="18"></zn-icon>
        Inbox
      </zn-menu-item>
      <zn-menu-item value="spam">
        <zn-icon slot="prefix" src="shield-alert@lu" size="18"></zn-icon>
        Spam
      </zn-menu-item>
      <hr>
      <zn-menu-item value="trash" color="error">
        <zn-icon slot="prefix" src="trash-2@lu" size="18"></zn-icon>
        Trash
      </zn-menu-item>
    </zn-menu>
  </zn-split-button>
</div>
```

### Form Submit

Set `type="submit"` with a `name` and `value` to submit from a form. The main button submits the initial `value`; a
menu item submits its own `value` instead.

```html:preview
<form id="split-button-form" style="display: flex; flex-direction: column; gap: var(--zn-spacing-medium); max-width: 400px;">
  <zn-input name="email" label="Email" value="user@example.com"></zn-input>
  <zn-split-button type="submit" name="action" value="send-close" caption="Send and close">
    <zn-menu slot="menu">
      <zn-menu-item value="send">Send</zn-menu-item>
      <zn-menu-item value="send-draft">Save as draft</zn-menu-item>
      <zn-menu-item value="schedule">Schedule send</zn-menu-item>
    </zn-menu>
  </zn-split-button>
</form>

<script type="module">
  document.getElementById('split-button-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert(`Submitted action: ${new FormData(e.target).get('action')}`);
  });
</script>
```

### Icons and Dividers

Put an icon in a menu item's `prefix` slot, split groups with an `<hr>`, and use `color="error"` for a destructive
action.

```html:preview
<zn-split-button caption="Approve" type="button">
  <zn-menu slot="menu">
    <zn-menu-item value="approve-conditions">
      <zn-icon slot="prefix" src="circle-check@lu" size="18"></zn-icon>
      Approve with conditions
    </zn-menu-item>
    <zn-menu-item value="approve-flag">
      <zn-icon slot="prefix" src="flag@lu" size="18"></zn-icon>
      Approve and flag for review
    </zn-menu-item>
    <hr>
    <zn-menu-item value="reject" color="error">
      <zn-icon slot="prefix" src="circle-x@lu" size="18"></zn-icon>
      Reject
    </zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Custom Trigger

Replace the default buttons with your own in the `trigger` slot, for example to change their color.

```html:preview
<zn-split-button>
  <zn-button-group slot="trigger">
    <zn-button color="success" icon="check@lu">Accept</zn-button>
    <zn-button color="success" icon="chevron-down@lu" label="More options"></zn-button>
  </zn-button-group>
  <zn-menu slot="menu">
    <zn-menu-item value="accept-all">
      <zn-icon slot="prefix" src="check-check@lu" size="18"></zn-icon>
      Accept all
    </zn-menu-item>
    <zn-menu-item value="accept-conditions">
      <zn-icon slot="prefix" src="circle-check@lu" size="18"></zn-icon>
      Accept with conditions
    </zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Events

Listen for `zn-menu-select` to react to a menu item. The `value` property holds the chosen item's value, or the initial
value after the main button is clicked.

```html:preview
<zn-split-button id="split-button-events" caption="Run" type="button" value="run">
  <zn-menu slot="menu">
    <zn-menu-item value="run-tests">Run tests</zn-menu-item>
    <zn-menu-item value="run-lint">Run lint</zn-menu-item>
  </zn-menu>
</zn-split-button>

<p>Last action: <strong id="split-button-last">None</strong></p>

<script type="module">
  const splitButton = document.getElementById('split-button-events');
  const last = document.getElementById('split-button-last');

  splitButton.addEventListener('zn-menu-select', (e) => last.textContent = e.detail.value);
  splitButton.addEventListener('click', (e) => {
    if (e.composedPath().includes(splitButton.button)) last.textContent = splitButton.value;
  });
</script>
```
