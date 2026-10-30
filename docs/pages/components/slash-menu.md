---
meta:
  title: Slash Menu
  description: A keyboard-driven list of quick insertions, anchored to the caret of the field that opened it.
layout: component
---

{% raw %}

`<zn-slash-menu>` is the panel behind a slash menu. Most of the time you don't use it directly — a component drives it
for you, as [`zn-textarea`](/components/textarea#slash-menu-quick-insertions) does with its
[`zn-slash-item`](/components/slash-item) entries:

```html:preview
<zn-textarea label="Terms and conditions" rows="5" help-text="Type / to insert a replacement string"
             slash-items="Brand name={{BRAND_NAME}}, Legal entity={{LEGAL_ENTITY}}"></zn-textarea>
```

Slot one into a textarea when you want the panel's own settings — `max-items`, `placement`, `empty-text`, its width, or
the `heading` the list is announced by — declared in markup. The textarea then drives your menu instead of building its
own:

```html:preview
<zn-textarea label="Terms and conditions" rows="6" help-text="Type / to insert">
  <zn-slash-menu slot="slash-menu" heading="Replacement strings" max-items="6" style="--slash-menu-width: 360px">
    <zn-slash-item group="Merchant" icon="tag@lu" label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
    <zn-slash-item group="Merchant" icon="building@lu" label="Legal entity" value="{{LEGAL_ENTITY}}"></zn-slash-item>
    <zn-slash-item group="Policy" icon="scale@lu" label="Jurisdiction" value="{{JURISDICTION}}"></zn-slash-item>
  </zn-slash-menu>
</zn-textarea>
```

Reach for the component on its own when you are adding a slash menu to a control the library doesn't cover. It renders
and positions the list; the `SlashMenuController` watches a text field, tracks the query and inserts the result.

## Examples

### Driving It Directly

Set `items`, position the panel with `anchor` (an element or a
[virtual element](https://floating-ui.com/docs/virtual-elements)), and call `show()`. The menu emits
`zn-slash-item-select` when an item is chosen. That event does not cross shadow boundaries, so a component that hosts
the menu in its shadow root re-emits it as its own public event.

```html:preview
<zn-button id="menu-anchor">Open the menu</zn-button>
<zn-slash-menu id="standalone-menu"></zn-slash-menu>
<div id="standalone-log" style="margin-top: 1rem; font-family: monospace; font-size: 0.875rem;"></div>

<script type="module">
  const anchor = document.getElementById('menu-anchor');
  const menu = document.getElementById('standalone-menu');
  const log = document.getElementById('standalone-log');

  await customElements.whenDefined('zn-slash-menu');

  menu.items = [
    {label: 'Brand name', value: '{{BRAND_NAME}}', icon: 'tag@lu', group: 'Merchant'},
    {label: 'Legal entity', value: '{{LEGAL_ENTITY}}', icon: 'building@lu', group: 'Merchant'},
    {label: 'Jurisdiction', value: '{{JURISDICTION}}', icon: 'scale@lu', group: 'Policy'}
  ];
  menu.anchor = anchor;

  anchor.addEventListener('click', () => menu.open ? menu.hide() : menu.show());

  menu.addEventListener('zn-slash-item-select', (event) => {
    log.textContent = `selected ${event.detail.item.label} → ${event.detail.item.value}`;
    menu.hide();
  });
</script>
```

### Keyboard Navigation

The menu doesn't listen for keys itself — whatever owns the field decides which keys belong to the menu, then calls
`moveActive()`, `selectActive()` and `hide()`. Disabled items are skipped, and moving past either end wraps around.

```html:preview
<zn-button id="nav-toggle">Toggle</zn-button>
<zn-button id="nav-up">↑</zn-button>
<zn-button id="nav-down">↓</zn-button>
<zn-button id="nav-select">Enter</zn-button>
<zn-slash-menu id="nav-menu"></zn-slash-menu>
<div id="nav-log" style="margin-top: 1rem; font-family: monospace; font-size: 0.875rem;"></div>

<script type="module">
  const menu = document.getElementById('nav-menu');
  const toggle = document.getElementById('nav-toggle');
  const log = document.getElementById('nav-log');

  await customElements.whenDefined('zn-slash-menu');

  menu.items = [
    {label: 'Brand name', value: '{{BRAND_NAME}}'},
    {label: 'Not available here', value: '{{INVOICE_NUMBER}}', disabled: true},
    {label: 'Jurisdiction', value: '{{JURISDICTION}}'}
  ];
  menu.anchor = toggle;

  toggle.addEventListener('click', () => menu.open ? menu.hide() : menu.show());
  document.getElementById('nav-up').addEventListener('click', () => menu.moveActive(-1));
  document.getElementById('nav-down').addEventListener('click', () => menu.moveActive(1));
  document.getElementById('nav-select').addEventListener('click', () => menu.selectActive());

  menu.addEventListener('zn-slash-item-select', (event) => {
    log.textContent = `selected ${event.detail.item.label}`;
  });
</script>
```

### Grouping Items

An item's `group` puts a heading above it. The heading is drawn whenever the group changes going down the list, so
items sharing a group must be declared together — the menu lists them in the order it is given rather than gathering
them for you. Leave the group off and an item is listed under no heading at all; declared first, those lead the list,
which is how a handful of favourites can sit above named sections.

```html:preview
<zn-textarea label="Privacy policy" rows="7" help-text="Type / to see the sections, or 'company' to search across them">
  <zn-slash-menu slot="slash-menu" style="--slash-menu-width: 340px">
    <zn-slash-item icon="star@lu" label="Merchant block" value="{{MERCHANT_BLOCK}}"></zn-slash-item>
    <zn-slash-item group="Merchant" icon="tag@lu" label="Brand name" keywords="company" value="{{BRAND_NAME}}"></zn-slash-item>
    <zn-slash-item group="Merchant" icon="building@lu" label="Legal entity" keywords="company" value="{{LEGAL_ENTITY}}"></zn-slash-item>
    <zn-slash-item group="Customer" icon="user@lu" label="Customer name" value="{{CUSTOMER_NAME}}"></zn-slash-item>
    <zn-slash-item group="Customer" icon="mail@lu" label="Customer email" value="{{CUSTOMER_EMAIL}}"></zn-slash-item>
    <zn-slash-item group="Policy" icon="scale@lu" label="Jurisdiction" value="{{JURISDICTION}}"></zn-slash-item>
    <zn-slash-item group="Policy" icon="calendar@lu" label="Refund window" value="{{REFUND_DAYS}} days"></zn-slash-item>
  </zn-slash-menu>
</zn-textarea>
```

Group headings are only a structure for browsing: a query ranks every match on merit, and the headings follow whatever
order that leaves. Set `order` on an item to pin its place within a match band, and use `keywords` to make it findable
by terms that aren't in its label.

Driving the menu yourself, the same thing is a `group` on each item:

```html:preview
<zn-button id="grouped-anchor">Open the menu</zn-button>
<zn-slash-menu id="grouped-menu"></zn-slash-menu>
<div id="grouped-log" style="margin-top: 1rem; font-family: monospace; font-size: 0.875rem;"></div>

<script type="module">
  const anchor = document.getElementById('grouped-anchor');
  const menu = document.getElementById('grouped-menu');
  const log = document.getElementById('grouped-log');

  await customElements.whenDefined('zn-slash-menu');

  menu.items = [
    {label: 'Paragraph', value: '', icon: 'type@lu', group: 'Basic blocks'},
    {label: 'Heading 1', value: '# ', icon: 'heading-1@lu', group: 'Basic blocks'},
    {label: 'Heading 2', value: '## ', icon: 'heading-2@lu', group: 'Basic blocks'},
    {label: 'To-do list', value: '- [ ] ', icon: 'square-check@lu', group: 'Lists'},
    {label: 'Bulleted list', value: '- ', icon: 'list@lu', group: 'Lists'},
    {label: 'Callout', value: 'NOTE: ', icon: 'info@lu', group: 'Advanced'},
    {label: 'Quote', value: '> ', icon: 'quote@lu', group: 'Advanced'}
  ];
  menu.hideKeys = true;
  menu.anchor = anchor;

  anchor.addEventListener('click', () => menu.open ? menu.hide() : menu.show());

  menu.addEventListener('zn-slash-item-select', (event) => {
    log.textContent = `selected ${event.detail.item.label} from ${event.detail.item.group}`;
    menu.hide();
  });
</script>
```

### Keyboard Hints

A footer pinned to the bottom of the panel spells out the keys the menu answers to. The list scrolls beneath it, so
the hints stay in view. Use `hide-hints` on menus driven entirely by the mouse, or where the surrounding UI already
explains the shortcuts.

```html:preview
<zn-textarea label="Terms and conditions" rows="4" help-text="Type / to see the hints"
             slash-items="Brand name={{BRAND_NAME}}, Legal entity={{LEGAL_ENTITY}}, Jurisdiction={{JURISDICTION}}">
  <zn-slash-menu slot="slash-menu" heading="Replacement strings"></zn-slash-menu>
</zn-textarea>

<zn-textarea label="Internal note" rows="4" help-text="Type / — no hints"
             slash-items="Brand name={{BRAND_NAME}}, Legal entity={{LEGAL_ENTITY}}, Jurisdiction={{JURISDICTION}}">
  <zn-slash-menu slot="slash-menu" heading="Replacement strings" hide-hints></zn-slash-menu>
</zn-textarea>
```

### Recently Used

Set `recent-key` and the menu remembers what was chosen there, listing the most recent of those items above the rest
under their own heading. The key is where the menu is used — `page-body`, `ticket-reply` — so each place keeps its own
history in `localStorage`, and two fields that should share one can share a key. `max-recent` caps the section
(3 by default), `recent-heading` names it, and `clearRecent()` forgets the lot. The section stands aside as soon as
there is a query, when the ranked matches are the better answer.

It reads as one more group, so it sits naturally above [grouped items](#grouping-items) — the section's own heading, then
the sections the list already had. Insert a few from the first field below to see it fill:

```html:preview
<zn-textarea label="Privacy policy" rows="6" help-text="Type / and insert a few — they come back to the top">
  <zn-slash-menu slot="slash-menu" recent-key="docs-grouped" style="--slash-menu-width: 340px">
    <zn-slash-item group="Merchant" icon="tag@lu" label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
    <zn-slash-item group="Merchant" icon="building@lu" label="Legal entity" value="{{LEGAL_ENTITY}}"></zn-slash-item>
    <zn-slash-item group="Customer" icon="user@lu" label="Customer name" value="{{CUSTOMER_NAME}}"></zn-slash-item>
    <zn-slash-item group="Customer" icon="mail@lu" label="Customer email" value="{{CUSTOMER_EMAIL}}"></zn-slash-item>
    <zn-slash-item group="Policy" icon="scale@lu" label="Jurisdiction" value="{{JURISDICTION}}"></zn-slash-item>
  </zn-slash-menu>
</zn-textarea>

<zn-button id="forget-recent" style="margin-top: 1rem">Forget them</zn-button>

<script type="module">
  import {clearRecentSlashItems} from '/dist/zn.min.js';

  document.getElementById('forget-recent').addEventListener('click', () => {
    clearRecentSlashItems('docs-grouped');
    clearRecentSlashItems('docs-terms');
  });
</script>
```

Where the items below carry no heading of their own, a rule closes the section off instead. This field shares nothing
with the one above — each key is its own history:

```html:preview
<zn-textarea label="Terms and conditions" rows="5" help-text="Type / and insert a few — the rule marks where they end"
             slash-recent-key="docs-terms"
             slash-items="Brand name={{BRAND_NAME}}, Legal entity={{LEGAL_ENTITY}}, Jurisdiction={{JURISDICTION}},
                          Customer name={{CUSTOMER_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-textarea>
```

`zn-input`, `zn-inline-edit`, `zn-translations` and `zn-remarkd-editor` take the same `slash-recent-key`. On a menu you
slot in yourself, or drive with `SlashMenuController`, set `recent-key` on the `zn-slash-menu` directly.

### Truncating Long Lists

`max-items` caps how many items are rendered; the rest are reported in a footer rather than silently dropped. The list
scrolls when its content exceeds `--slash-menu-max-height`.

```html:preview
<zn-textarea label="Terms and conditions" rows="5" help-text="Type / to see 3 of 9, then keep typing to narrow"
             slash-items="Brand name={{BRAND_NAME}}, Legal entity={{LEGAL_ENTITY}}, Jurisdiction={{JURISDICTION}},
                          Customer name={{CUSTOMER_NAME}}, Customer email={{CUSTOMER_EMAIL}},
                          Invoice number={{INVOICE_NUMBER}}, Invoice date={{INVOICE_DATE}},
                          Support email={{SUPPORT_EMAIL}}, Support phone={{SUPPORT_PHONE}}">
  <zn-slash-menu slot="slash-menu" heading="Replacement strings" max-items="3"></zn-slash-menu>
</zn-textarea>
```

### Attaching It To Your Own Field

`SlashMenuController` is the reusable half. Give it the field, the menu, and the items; it handles trigger detection,
filtering, keyboard handling and insertion.

```js
import {SlashMenuController} from '@kubex/zinc';

class MyEditor extends ZincElement {
  private slash = new SlashMenuController(this, {
    menu: () => this.shadowRoot.querySelector('zn-slash-menu'),
    items: () => [{label: 'Brand name', value: '{{BRAND_NAME}}', icon: 'tag@lu'}],
    trigger: () => '/',
    onSelect: (item, query) => !this.emit('my-select', {detail: {item, query}}).defaultPrevented,
    onInsert: (item, value) => this.emit('my-insert', {detail: {item, value}})
  });

  firstUpdated() {
    this.slash.attach(this.shadowRoot.querySelector('textarea'));
  }
}
```

Items can be shared between fields by registering them once as a preset:

```js
import {registerSlashMenuPreset} from '@kubex/zinc';

registerSlashMenuPreset('legal', [
  {label: 'Brand name', value: '{{BRAND_NAME}}', icon: 'tag@lu'},
  {label: 'Jurisdiction', value: '{{JURISDICTION}}', icon: 'scale@lu'}
]);
```

Any component that reads presets — `zn-textarea` via `slash-preset="legal"` — then offers the same list.

{% endraw %}
