---
meta:
  title: Thumbnail Group
  description: Lays a set of thumbnails out as a single scrollable row, with a Show All toggle that expands them into a wrapping grid.
layout: component
---

A thumbnail group holds [thumbnails](/components/thumbnail) in one horizontally scrollable row. When they don't all fit,
a **Show All** toggle appears in the header; expanding drops the single-row restriction and reflows everything into a
wrapping grid. **Show Less** rolls it back to the row.

```html:preview
<zn-thumbnail-group caption="Landscape">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60" caption="Sonoma Horizon" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60" caption="Goa Beaches" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60" caption="Big Sur" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=60" caption="Yosemite Valley" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=60" caption="Hallstatt" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=60" caption="Falls" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=60" caption="Rolling Hills" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=600&q=60" caption="Coastline" icon="play_arrow"></zn-thumbnail>
</zn-thumbnail-group>
```

The toggle is only rendered when it's needed — a group whose thumbnails already fit shows no toggle at all.

```html:preview
<zn-thumbnail-group caption="Fits on one row">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
</zn-thumbnail-group>
```

## Examples

### Thumbnail Size and Shape

`thumbnail-width` sets the row's track width and, when expanded, the minimum column width the grid packs against.
`gap` sets the spacing between thumbnails, and `aspect-ratio` reshapes every thumbnail in the group.

```html:preview
<zn-thumbnail-group caption="Square, compact" thumbnail-width="120px" gap="8px" aspect-ratio="1 / 1">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60" caption="Sonoma Horizon"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60" caption="Goa Beaches"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60" caption="Big Sur"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=60" caption="Yosemite Valley"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=60" caption="Hallstatt"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=60" caption="Falls"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=60" caption="Rolling Hills"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=600&q=60" caption="Coastline"></zn-thumbnail>
</zn-thumbnail-group>
```

Those three attributes are shorthand for `--zn-thumbnail-width`, `--zn-thumbnail-gap` and
`--zn-thumbnail-aspect-ratio`, which you can set on the group directly instead. Because
[thumbnail](/components/thumbnail)'s custom properties all inherit, **any** of them — chip colours, corner radii,
preview sizing — can be set once on the group and will apply to every thumbnail in it.

```html:preview
<zn-thumbnail-group
  caption="Restyled from the group"
  style="--zn-thumbnail-width: 120px;
         --zn-thumbnail-gap: 8px;
         --zn-thumbnail-radius: 16px;
         --zn-thumbnail-chip-background: rgb(var(--zn-primary));
         --zn-thumbnail-selected-color: rgb(var(--zn-color-warning));">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day" icon="play_arrow" selected></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60" caption="Sonoma Horizon" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60" caption="Goa Beaches" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60" caption="Big Sur" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=60" caption="Yosemite Valley" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=60" caption="Hallstatt" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=60" caption="Falls" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=60" caption="Rolling Hills" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=600&q=60" caption="Coastline" icon="play_arrow"></zn-thumbnail>
</zn-thumbnail-group>
```

### Preview

Give the thumbnails a `full-uri` and clicking one opens a full-screen preview that grows out of its position in the
row. The preview opens in the browser's top layer, so it escapes the scrolling row instead of being clipped by it. See
[thumbnail](/components/thumbnail#preview) for the trigger options.

```html:preview
<zn-thumbnail-group caption="Landscape">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&q=50" full-uri="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=2000&q=80" caption="Tahoe Day" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=50" full-uri="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2000&q=80" caption="Sequoia Sunrise" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=50" full-uri="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2000&q=80" caption="Sonoma Horizon" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=50" full-uri="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=80" caption="Goa Beaches" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=50" full-uri="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80" caption="Big Sur" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&q=50" full-uri="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=2000&q=80" caption="Yosemite Valley" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=50" full-uri="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=80" caption="Hallstatt" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=50" full-uri="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=2000&q=80" caption="Falls" icon="play_arrow"></zn-thumbnail>
</zn-thumbnail-group>
```

### Selection

Add `selectable` and the group tracks a single selection for you: clicking a thumbnail moves the accent ring, updates
the group's `value`, and emits `zn-change`. A thumbnail marked `selected` in markup becomes the starting value.

```html:preview
<zn-thumbnail-group caption="Pick a still" selectable>
  <zn-thumbnail value="tahoe" src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day" selected></zn-thumbnail>
  <zn-thumbnail value="sequoia" src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
  <zn-thumbnail value="sonoma" src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60" caption="Sonoma Horizon"></zn-thumbnail>
  <zn-thumbnail value="goa" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60" caption="Goa Beaches"></zn-thumbnail>
</zn-thumbnail-group>
```

### Counting a Larger Set

When the row only holds the first page of a much larger set, set `total` so the toggle advertises the real size. The
toggle appears whenever `total` exceeds the number of slotted thumbnails, even if those all fit. Listen for `zn-expand`
to fetch and append the rest.

```html:preview
<zn-thumbnail-group caption="Landscape" total="79" id="thumbnail-group-lazy">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60" caption="Sonoma Horizon"></zn-thumbnail>
</zn-thumbnail-group>

<script>
  const group = document.getElementById('thumbnail-group-lazy');

  group.addEventListener('zn-expand', () => {
    // Load the rest of the set the first time the group is expanded.
    if (group.dataset.loaded) return;
    group.dataset.loaded = 'true';

    for (let i = 4; i <= group.total; i++) {
      const thumbnail = document.createElement('zn-thumbnail');
      thumbnail.caption = `Landscape ${i}`;
      thumbnail.src = `https://picsum.photos/seed/landscape-${i}/480/270`;
      group.append(thumbnail);
    }
  });
</script>
```

### Custom Labels

Override `show-all-label` and `show-less-label` for wording that suits the content. The count is appended to the
expand label in brackets.

```html:preview
<zn-thumbnail-group
  caption="Recordings"
  total="24"
  show-all-label="Browse all recordings"
  show-less-label="Collapse">
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
</zn-thumbnail-group>
```

### Header Actions

The `actions` slot sits in the header before the toggle.

```html:preview
<zn-thumbnail-group caption="Cityscape" total="41">
  <zn-button slot="actions" outline icon="upload">Upload</zn-button>
  <zn-thumbnail src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=60" caption="Dubai Skyline" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=60" caption="Dubai at Night" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1546412414-e1885259563a?w=600&q=60" caption="Dubai Creek" icon="play_arrow"></zn-thumbnail>
</zn-thumbnail-group>
```

### Always Showing the Toggle

`always-toggle` keeps the toggle on screen even when everything already fits — useful when the row is one of several
sibling groups and you want the headers to line up. `hide-toggle` does the opposite and suppresses it entirely,
leaving a plain scrolling row.

```html:preview
<zn-thumbnail-group caption="Always" always-toggle>
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
</zn-thumbnail-group>

<zn-thumbnail-group caption="Never" hide-toggle>
  <zn-thumbnail src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=60" caption="Tahoe Day"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60" caption="Sequoia Sunrise"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=60" caption="Sonoma Horizon"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=60" caption="Goa Beaches"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60" caption="Big Sur"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=60" caption="Yosemite Valley"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=60" caption="Hallstatt"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=60" caption="Falls"></zn-thumbnail>
</zn-thumbnail-group>
```

### Starting Expanded

Set `expanded` to open the grid on first paint, or call `show()` / `hide()` to drive it from script.

```html:preview
<zn-thumbnail-group caption="Cityscape" expanded>
  <zn-thumbnail src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=60" caption="Dubai Skyline" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=60" caption="Dubai at Night" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1546412414-e1885259563a?w=600&q=60" caption="Dubai Creek" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=60" caption="Dubai from Above" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=60" caption="Los Angeles Flyover" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1534190760961-74e8c1b5c3da?w=600&q=60" caption="Los Angeles Beach" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=600&q=60" caption="Los Angeles at Night" icon="play_arrow"></zn-thumbnail>
  <zn-thumbnail src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=60" caption="London Evening" icon="play_arrow"></zn-thumbnail>
</zn-thumbnail-group>
```
