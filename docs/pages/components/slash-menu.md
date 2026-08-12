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

Slot one into a textarea when you want the panel's own settings — `heading`, `max-items`, `placement`, `empty-text`, or
its width — declared in markup. The textarea then drives your menu instead of building its own:

```html:preview
<zn-textarea label="Terms and conditions" rows="6" help-text="Type / to insert">
  <zn-slash-menu slot="slash-menu" heading="Replacement strings" max-items="6" style="--slash-menu-width: 360px">
    <zn-slash-item icon="tag@lu" label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
    <zn-slash-item icon="building@lu" label="Legal entity" value="{{LEGAL_ENTITY}}"></zn-slash-item>
    <zn-slash-item icon="scale@lu" label="Jurisdiction" value="{{JURISDICTION}}"></zn-slash-item>
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

### Truncating Long Lists

`max-items` caps how many items are rendered; the rest are reported in a footer rather than silently dropped. The panel
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
