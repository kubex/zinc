---
meta:
  title: Editor
  description:
layout: component
---

```html:preview

<zn-editor></zn-editor>


<script>
  let cannedResponses = [
    {
      title:   'Hello',
      content: 'Hello, how can I help you?'
      command: 'hello'
    },
    {
      title:   'Goodbye',
      content: 'Goodbye, have a nice day!'
      command: 'goodbye'
    }
  ];

  let editor = document.querySelector('zn-editor');
  editor.setAttribute('canned-responses', JSON.stringify(cannedResponses));
</script>
```

## Examples

### First Example

TODO

### Second Example

TODO


