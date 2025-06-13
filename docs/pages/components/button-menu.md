---
meta:
  title: Button Menu
  description:
layout: component
---

```html:preview

<zn-button-menu>
  <zn-button primary color="error" icon="house">Something sdf</zn-button>
  <zn-button  icon="house">sd</zn-button>
  <zn-button  icon="person" primary>One</zn-button>
  <zn-button  icon="person" primary>Two</zn-button>
  <zn-button  icon="house" secondary color="success">fdf</zn-button>
  <zn-button  icon="house" secondary>fsdsfdf</zn-button>
  <zn-button  icon="house">fd</zn-button>
  <zn-button category="edit" icon="Home">Home</zn-button>
  <zn-button color="warning" category="edit">WARNING</zn-button>
  <zn-button  icon="house" primary category="edit">ddsfdsfdsf</zn-button>
  <zn-button  icon="house" category="edit">34kjnsdfkjdsnf</zn-button>
  <zn-button primary category="edit">dsfdf</zn-button>
  <zn-button  icon="house" category="view">dfsf</zn-button>
  <zn-button  icon="house" category="view">sdfdsfdsfds</zn-button>
  <zn-button category="view">dfsdfdsfdsfdsfsf</zn-button>
</zn-button-menu>
```

## Examples

### Button Limit

You can limit the number of buttons that are shown in the menu. The rest will be hidden in a dropdown.

```html:preview

<zn-button-menu limit-buttons="2">
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

### Max Width

Below is an example of a button menu with a maximum width of 200px. The menu will not exceed this width, even if the
buttons inside it are wider.

```html:preview

<zn-button-menu max-width="200">
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
