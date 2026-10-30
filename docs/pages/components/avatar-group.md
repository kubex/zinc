---
meta:
  title: Avatar Group
  description: Overlapping avatars that show each person's name on hover, collapsing any past a limit into a "+N" count.
layout: component
---

```html:preview
<zn-avatar-group>
  <zn-icon src="Ben Brooks" library="avatar" size="md" color="success"></zn-icon>
  <zn-icon src="Jade Ellis" library="avatar" size="md" color="warning"></zn-icon>
  <zn-icon src="Kai Walsh" library="avatar" size="md" color="error"></zn-icon>
</zn-avatar-group>
```

## Examples

### Tooltips

Hovering or focusing an avatar shows its name in a tooltip: the avatar's `alt`, or its `src` when it has none. Each
avatar is lifted over its neighbours while hovered so it shows in full.

```html:preview
<zn-avatar-group>
  <zn-icon src="BB" alt="Ben Brooks (Support)" library="avatar" size="lg" color="success"></zn-icon>
  <zn-icon src="JE" alt="Jade Ellis (Sales)" library="avatar" size="lg" color="warning"></zn-icon>
  <zn-icon src="KW" alt="Kai Walsh (Billing)" library="avatar" size="lg" color="error"></zn-icon>
</zn-avatar-group>
```

### Maximum

Set `max` to show at most that many avatars. The rest are counted in a "+N" avatar whose tooltip lists their names.

```html:preview
<zn-avatar-group max="3">
  <zn-icon src="Ben Brooks" library="avatar" size="md" color="success"></zn-icon>
  <zn-icon src="Jade Ellis" library="avatar" size="md" color="warning"></zn-icon>
  <zn-icon src="Kai Walsh" library="avatar" size="md" color="error"></zn-icon>
  <zn-icon src="Ann Isaacs" library="avatar" size="md" color="violet"></zn-icon>
  <zn-icon src="Fiona Hart" library="avatar" size="md"></zn-icon>
  <zn-icon src="Harry Hill" library="avatar" size="md"></zn-icon>
  <zn-icon src="Mark Nolan" library="avatar" size="md"></zn-icon>
</zn-avatar-group>
```

### Presence

Avatars keep their presence dot inside a group.

```html:preview
<zn-avatar-group>
  <zn-icon src="Ben Brooks" library="avatar" size="md" color="success" presence="online"></zn-icon>
  <zn-icon src="Jade Ellis" library="avatar" size="md" color="warning" presence="away"></zn-icon>
  <zn-icon src="Kai Walsh" library="avatar" size="md" color="error" presence="busy"></zn-icon>
</zn-avatar-group>
```
