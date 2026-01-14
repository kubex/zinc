---
meta:
  title: Inline Edit
  description:
layout: component
---

```html:preview

<zn-sp>
  <form action="#" method="get">
    <zn-inline-edit caption="Something" name="something" input-type="textarea" value="Awesome" edit-text="Edit"></zn-inline-edit>
  </form>
  <zn-inline-edit caption="Something" value="1" action="#" method="GET"
                  options="{&quot;1&quot;: &quot;Option 1&quot;,&quot;2&quot;: &quot;Option 2&quot;}">
  </zn-inline-edit>
  <zn-inline-edit provider="color" caption="Something" name="something" value="gb" edit-text="Edit"></zn-inline-edit>
</zn-sp>
```

## Examples

### Inline Example

```html:preview

<zn-sp>
  <form action="#" method="get">
    <zn-inline-edit caption="Something" name="something" value="Awesome" inline></zn-inline-edit>
  </form>
  <zn-inline-edit caption="Something" value="1" action="#" method="GET" inline
                  options="{&quot;1&quot;: &quot;Option 1&quot;,&quot;2&quot;: &quot;Option 2&quot;}">
  </zn-inline-edit>
</zn-sp>
```

### Second Example

TODO


