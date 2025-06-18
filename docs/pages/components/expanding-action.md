---
meta:
  title: Expanding Action
  description:
layout: component
---

```html:preview
<zn-expanding-action icon="new_label" 
                     uri=""
                     method="fill"
                     count-uri=""
                     prefetch>
  This is the content here, this will probably be loaded from one of the URIs.
  if count uri is set, use that to retrieve the number to display as a notification
  if prefetch is set, we need to lod the uri which should have the count with it.
</zn-expanding-action>
```

## Multiple Examples

```html:preview
  <zn-expanding-action icon="edit_note"
                       method="fill"
                       count-uri="/note/count"
                       slot="actions"
                       prefetch>
    Hello there
  </zn-expanding-action>

  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="drop"
                       slot="actions">
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>
```