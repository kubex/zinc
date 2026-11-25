---
meta:
  title: Kanban
  description: A board of columns whose cards can be dragged from one column to another.
layout: component
---

A board is a row of `zn-kanban-column` elements, each holding `zn-kanban-item` cards. Drag a card to move it within
its column or into another one. While dragging, the other columns outline where the card can go; Escape, or letting
go outside the board, puts it back. Columns count their own cards and show an empty state when they have none. When
the columns don't fit, the row scrolls sideways and fades at each edge that has more columns past it.

```html:preview
<zn-kanban id="kanban-preview">
  <zn-kanban-column value="lead" caption="Lead" meta="£1.4m" description="First contact made">
    <zn-kanban-item value="tidewater">
      <strong>Tidewater Streaming</strong>
      <span>£820k / month · Stripe</span>
      <zn-badge type="warning">6 days in stage</zn-badge>
    </zn-kanban-item>
    <zn-kanban-item value="harbour">
      <strong>Harbour &amp; Pine</strong>
      <span>£580k / month · Adyen</span>
    </zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column value="qualified" caption="Qualified" meta="£2.1m" description="Volume and PSP confirmed">
    <zn-kanban-item value="northwind">
      <strong>Northwind Games</strong>
      <span>£2.1m / month · Checkout.com</span>
    </zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column value="proposal" caption="Proposal" description="Pricing sent"></zn-kanban-column>
  <zn-kanban-column value="won" caption="Won" description="Contract signed"></zn-kanban-column>
</zn-kanban>
```

## Examples

### Listening for moves

`zn-move` fires when a card is dropped somewhere new. Its `detail` holds the `item`, the column it came `from`, the
column it went `to` and its new `index` in that column. Cancel the event to put the card back.

```html:preview
<zn-kanban id="kanban-move">
  <zn-kanban-column value="todo" caption="To do">
    <zn-kanban-item value="a">Write proposal</zn-kanban-item>
    <zn-kanban-item value="b">Book kickoff</zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column value="doing" caption="Doing"></zn-kanban-column>
  <zn-kanban-column value="done" caption="Done" empty-text="Drop finished work here"></zn-kanban-column>
</zn-kanban>

<script>
  document.querySelector('#kanban-move').addEventListener('zn-move', e => {
    const {item, from, to, index} = e.detail;
    console.log(`${item.value}: ${from.value} → ${to.value} at ${index}`);
  });
</script>
```

### Saving moves

Set `move-uri` to save each move: the board submits a form there with `item`, `from`, `to` and `index`, from each
element's `value`, so the console sends it like any other form and shows the alerts the response carries. If the
response has an error status or an error alert, the card goes back and the board emits `zn-error`.

```html
<zn-kanban move-uri="/tickets/move">
  <zn-kanban-column value="open" caption="Open">
    <zn-kanban-item value="TKT-1">Refund request</zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column value="resolved" caption="Resolved"></zn-kanban-column>
</zn-kanban>
```

### Saving moves

Set `submit-on-move` to submit a form each time a card is dropped somewhere new, so the server can save the move
without any script. The board submits the form it sits in, or the one whose id is in `form`. Naming a form lets cards
hold forms of their own, which a form around the whole board would not.

The form is submitted with these fields:

| Field    | Value                                                                    |
|----------|--------------------------------------------------------------------------|
| `item`   | The `value` of the card that moved.                                      |
| `from`   | The `value` of the column it left.                                       |
| `to`     | The `value` of the column it is now in.                                  |
| `index`  | Its place in that column, counting from 0.                               |
| `before` | The `value` of the card it now sits above, empty at the end of a column. |

```html:preview
<form id="kanban-moves" action="/board/moves" method="post"></form>

<zn-kanban submit-on-move form="kanban-moves">
  <zn-kanban-column value="todo" caption="To do">
    <zn-kanban-item value="a">Write proposal</zn-kanban-item>
    <zn-kanban-item value="b">Book kickoff</zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column value="doing" caption="Doing"></zn-kanban-column>
</zn-kanban>

<pre id="kanban-moves-output">Move a card to see what is submitted</pre>

<script>
  const moves = document.querySelector('#kanban-moves');
  moves.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('#kanban-moves-output').textContent =
      [...new FormData(moves).entries()].map(([key, value]) => `${key} = ${value}`).join('\n');
  });
</script>
```

### Column actions

Anything in a column's `actions` slot sits at the end of its header.

```html:preview
<zn-kanban>
  <zn-kanban-column caption="Backlog">
    <zn-button slot="actions" icon="add" color="transparent" size="x-small" title="Add card"></zn-button>
    <zn-kanban-item>Audit checkout flow</zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column caption="In review"></zn-kanban-column>
</zn-kanban>
```

### Filling the height

In a parent of bounded height, such as a [page](/components/page) with `fill`, the board fills it and each column's
cards scroll on their own.

```html:preview
<div style="height: 260px; display: flex; flex-direction: column">
  <zn-kanban>
    <zn-kanban-column caption="Open">
      <zn-kanban-item>Refund request</zn-kanban-item>
      <zn-kanban-item>Card declined</zn-kanban-item>
      <zn-kanban-item>Address change</zn-kanban-item>
      <zn-kanban-item>Invoice copy</zn-kanban-item>
    </zn-kanban-column>
    <zn-kanban-column caption="Resolved"></zn-kanban-column>
  </zn-kanban>
</div>
```

### Loading more cards

Put a [`zn-infinite-scroll`](/components/infinite-scroll) in a column to page its cards in as the column scrolls. Its
cards drag like any other and count toward the column.

```html:preview
<div style="height: 300px; display: flex; flex-direction: column">
  <zn-kanban>
    <zn-kanban-column caption="Open">
      <zn-infinite-scroll uri="/assets/kanban/open-#page#.html">
        <zn-kanban-item>Refund request</zn-kanban-item>
        <zn-kanban-item>Card declined</zn-kanban-item>
      </zn-infinite-scroll>
    </zn-kanban-column>
    <zn-kanban-column caption="Resolved"></zn-kanban-column>
  </zn-kanban>
</div>
```

### Flush cards

Add `flush` to an item to drop its padding, for content that brings its own, such as a list row.

```html:preview
<zn-kanban>
  <zn-kanban-column caption="Open">
    <zn-kanban-item flush><zn-tile caption="Refund request" description="Shayne Stroman"></zn-tile></zn-kanban-item>
    <zn-kanban-item flush><zn-tile caption="Card declined" description="Kyle Essex"></zn-tile></zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column caption="Resolved"></zn-kanban-column>
</zn-kanban>
```

### Linking cards

Give an item an `href` (and optionally `data-target`) to open it when clicked. Dragging it still moves it, without
following the link.

```html:preview
<zn-kanban>
  <zn-kanban-column caption="Open">
    <zn-kanban-item href="#linking-cards">Refund request</zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column caption="Resolved"></zn-kanban-column>
</zn-kanban>
```

### Column width

Columns share the board's width between `--zn-kanban-column-min-width` (default `26rem`) and
`--zn-kanban-column-max-width` (default `32rem`); once they don't fit, the row scrolls sideways.
`--zn-kanban-column-min-height` keeps short columns tall enough to drop into.

```html:preview
<zn-kanban style="--zn-kanban-column-min-width: 30rem; --zn-kanban-column-min-height: 10rem">
  <zn-kanban-column caption="Wide">
    <zn-kanban-item>A wider card with room for more detail.</zn-kanban-item>
  </zn-kanban-column>
  <zn-kanban-column caption="Columns"></zn-kanban-column>
</zn-kanban>
```

## Columns

| Attribute     | Description                                                       |
|---------------|-------------------------------------------------------------------|
| `value`       | Identifies the column in `zn-move` events.                        |
| `caption`     | The column's title.                                               |
| `meta`        | Secondary text at the end of the header, such as a column total. |
| `description` | A line under the header, such as the rule for entering the column. |
| `empty-text`  | Shown when the column has no cards. Defaults to "Nothing here".   |

## Items

`zn-kanban-item` is a card with a default slot for its content. Its `value` identifies it in `zn-move` events.
