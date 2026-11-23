---
meta:
  title: Menu Group
  description: An app sidebar's rows, with rows nested under a parent, collapsing to icon tiles with the shell's sidebar.
layout: component
---

Give an app sidebar's `zn-menu-item` rows `variant="navigation"` for the sidebar look: rounded rows, a fill on hover
and for the open page (set `active` on its row), and the label cut off with an ellipsis. Use `count` for a count pill.
`zn-menu-group` hangs rows under a parent row (`slot="parent"`), joined by a line down from its icon, and gives its
rows the navigation look itself.

```html:preview
<div style="width: 240px">
  <zn-menu-item variant="navigation" href="#"><zn-icon slot="prefix" src="search@lu" size="16"></zn-icon>Search</zn-menu-item>
  <zn-menu-label variant="navigation">Departments</zn-menu-label>
  <zn-menu-group>
    <zn-menu-item slot="parent" href="#" count="3"><zn-icon slot="prefix" src="headset@lu" size="16"></zn-icon>Support</zn-menu-item>
    <zn-menu-item href="#" count="1" active><zn-icon slot="prefix" src="mail@lu" size="14"></zn-icon>Email</zn-menu-item>
    <zn-menu-item href="#" count="2"><zn-icon slot="prefix" src="message-circle@lu" size="14"></zn-icon>Chat</zn-menu-item>
  </zn-menu-group>
  <zn-menu-item variant="navigation" href="#" count="0"><zn-icon slot="prefix" src="receipt@lu" size="16"></zn-icon>Billing</zn-menu-item>
</div>
```

## Examples

### Folding

Add `folded` to hide the nested rows, except when one of them is the open page.

### Section Headings

A `zn-menu-label` with `variant="navigation"` is the sidebar's section heading, and collapses to a dot. Put controls in
its `actions` slot, such as a settings dropdown's trigger (`icon-button="x-small"` fits it): they stay faint until the
heading is hovered or focused, or a dropdown among them is open.

```html:preview
<div style="width: 240px">
  <zn-menu-label variant="navigation">
    Departments
    <zn-dropdown slot="actions" placement="right-start" panel>
      <zn-button slot="trigger" icon="ellipsis@lu" icon-button="x-small" plain label="Department settings"></zn-button>
      <zn-toggle label="Hide empty queues" menu></zn-toggle>
    </zn-dropdown>
  </zn-menu-label>
  <zn-menu-item variant="navigation" href="#" count="3"><zn-icon slot="prefix" src="headset@lu" size="16"></zn-icon>Support</zn-menu-item>
</div>
```

### Collapsing With the Shell

Navigation rows, groups and headings collapse together with the shell's sidebar: rows become icon tiles with their
labels in tooltips, the nested rows' line and indent drop away, and headings become dots. The labels leave before the
sidebar narrows and return once it has mostly opened, and each row's shape morphs into its tile alongside.

The shell calls `setNavigationCollapsed` as its sidebar starts to open or close, and sets `--zn-navigation-duration`
to the length of its own transition. Every sidebar follows, including those inside app spaces the shell can't reach,
and one that loads later starts in the current state.

```js
import {setNavigationCollapsed} from '@kubex/zinc';

setNavigationCollapsed(true);
```

### Theming

The colours come from `--zn-navigation-*` variables, which pass down into app spaces, so a shell sets them once on its
sidebar for every app's: `--zn-navigation-text`, `--zn-navigation-hover-text`, `--zn-navigation-hover-background`,
`--zn-navigation-selected-text`, `--zn-navigation-selected-background`, `--zn-navigation-accent`,
`--zn-navigation-border` and `--zn-navigation-font-size`. A shell that paints its own moving selection sets
`--zn-navigation-selected-background` to `transparent`.
