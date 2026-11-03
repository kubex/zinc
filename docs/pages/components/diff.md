---
meta:
  title: Diff
  description: Diffs compare two versions side by side, one column each, with every item aligned and tinted by how it changed.
layout: component
---

```html:preview
<zn-diff before-caption="Version 2" before-description="Published 30 Sep 2026"
         after-caption="Version 3" after-description="Published 12 Oct 2026">
  <zn-badge slot="after" type="success">Live</zn-badge>
  <zn-diff-row caption="Settings" heading></zn-diff-row>
  <zn-diff-row caption="Passing score" change="changed">
    <span slot="before">75%</span>
    <span slot="after">80%</span>
  </zn-diff-row>
  <zn-diff-row caption="Minimum scorer level">
    <span slot="before">Senior scorer</span>
    <span slot="after">Senior scorer</span>
  </zn-diff-row>
  <zn-diff-row caption="Resolution" heading></zn-diff-row>
  <zn-diff-row caption="Was personal data shared correctly?" change="added">
    <span slot="after">Yes / No · Compliance · score +15</span>
  </zn-diff-row>
  <zn-diff-row caption="Thanked the customer" change="removed" after-placeholder="Removed in version 3">
    <span slot="before">Yes / No · Empathy · score +5</span>
  </zn-diff-row>
</zn-diff>
```

## Examples

### Placeholders

An added item has nothing on the left and a removed item nothing on the right; that side is hatched with a placeholder. Set `before-placeholder` or `after-placeholder` to name the version.

```html:preview
<zn-diff before-caption="Version 1" after-caption="Version 2">
  <zn-diff-row caption="Closing tone" change="added" before-placeholder="Not in version 1">
    <span slot="after">Sad / Neutral / Happy · score +25</span>
  </zn-diff-row>
  <zn-diff-row caption="Offered a survey" change="removed" after-placeholder="Removed in version 2">
    <span slot="before">Yes / No · score +5</span>
  </zn-diff-row>
</zn-diff>
```
