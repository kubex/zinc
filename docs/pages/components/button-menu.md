---
meta:
  title: Button Menu
  description:
layout: component
---

```html:preview

<zn-button-menu limit="4">
  <zn-button id="trigger-something" color="error" primary>Cancel</zn-button>
  <zn-confirm type="error"
              trigger="trigger-something"
              caption="Cancel Action"
              content="Are you sure you want to cancel this action">
  </zn-confirm>

  <zn-button primary color="error" icon="house">Something sdf</zn-button>
  <zn-button id="trigger-anotherone" color="warning"  icon="house">Another One</zn-button>
  <zn-confirm type="error"
              trigger="trigger-anotherone"
              caption="Another Action"
              content="Are you sure you?">
  </zn-confirm>
</zn-button-menu>
```

## Examples

### Button Limit

You can limit the number of buttons that are shown in the menu. The rest will be hidden in a dropdown.

```html:preview

<zn-button-menu limit="2">
  <zn-button primary>Something sdf</zn-button>
  <zn-button >sd</zn-button>
  <zn-button secondary>fdf</zn-button>
  <zn-button secondary>fsdsfdf</zn-button>
  <zn-button >fd</zn-button>
  <zn-button category="edit">fdsfdf</zn-button>
  <zn-button primary category="edit">d</zn-button>
  <zn-button secondary category="view">dfsf</zn-button>
</zn-button-menu>
```

### Button Max (1)

```html:preview

<zn-button-menu max-level="1">
  <zn-button primary>Primary</zn-button>
  <zn-button secondary>Secondary</zn-button>
  <zn-button>Default</zn-button>
  <zn-button>Default 2</zn-button>
</zn-button-menu>
```

### Button Max (2)

```html:preview

<zn-button-menu max-level="2">
  <zn-button primary>Primary</zn-button>
  <zn-button secondary>Secondary</zn-button>
  <zn-button>Default</zn-button>
  <zn-button>Default 2</zn-button>
</zn-button-menu>
```

### Button Max (3)

```html:preview

<zn-button-menu max-level="3">
  <zn-button primary>Primary</zn-button>
  <zn-button secondary>Secondary</zn-button>
  <zn-button>Default</zn-button>
  <zn-button>Default 2</zn-button>
</zn-button-menu>
```

### Button Max (2) - No Primary / Secondary

```html:preview

<zn-button-menu max-level="2">
  <zn-button>Default</zn-button>
  <zn-button>Default 2</zn-button>
</zn-button-menu>
```

### Max Width

Below is an example of a button menu with a maximum width of 200px. The menu will not exceed this width, even if the
buttons inside it are wider.

```html:preview

<zn-button-menu max-width="300">
  <zn-button primary>Something sdf</zn-button>
  <zn-button >sd</zn-button>
  <zn-button secondary>fdf</zn-button>
  <zn-button secondary>fsdsfdf</zn-button>
  <zn-button >fd</zn-button>
  <zn-button category="edit">fdsfdf</zn-button>
  <zn-button primary category="edit">d</zn-button>
  <zn-button secondary category="view">dfsf</zn-button>
</zn-button-menu>
```

### No Gap

```html:preview

<zn-button-menu no-gap max-width="200">
  <zn-button primary>Something sdf</zn-button>
  <zn-button >sd</zn-button>
  <zn-button secondary>fdf</zn-button>
  <zn-button secondary>fsdsfdf</zn-button>
  <zn-button >fd</zn-button>
  <zn-button category="edit">fdsfdf</zn-button>
  <zn-button primary category="edit">d</zn-button>
  <zn-button secondary category="view">dfsf</zn-button>
</zn-button-menu>
```
