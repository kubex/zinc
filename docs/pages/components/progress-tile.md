---
meta:
  title: Progress Tile
  description:
layout: component
---

```html:preview

<zn-progress-tile
  id="progress-tile"
  caption="John Doe"
  status="Active"
  avatar="JohnDoe@avatar"
  wait-time="60">
</zn-progress-tile>

<script>
  // set start time to current time for demo purposes - 10 seconds ago
  const startTime = Math.floor(Date.now() / 1000) - 40;
  const progressTile = document.getElementById('progress-tile');

  progressTile.setAttribute('start-time', startTime);
  
</script>
```

## Examples

### First Example

TODO

### Second Example

TODO


