---
meta:
  title: Slash Item
  description: Slash items declare the quick insertions offered by a slash menu.
layout: component
---

{% raw %}

`<zn-slash-item>` renders nothing on its own. It describes one entry for the component it sits in — today that is
[`zn-textarea`](/components/textarea#slash-menu-quick-insertions), which picks up items placed anywhere inside it,
including inside a slotted [`zn-slash-menu`](/components/slash-menu).

```html:preview
<zn-textarea label="Terms and conditions" rows="5" help-text="Type / to insert">
  <zn-slash-item
    icon="tag@lu"
    label="Brand name"
    description="The merchant's trading name"
    value="{{BRAND_NAME}}"></zn-slash-item>
  <zn-slash-item
    icon="mail@lu"
    label="Support email"
    value="{{SUPPORT_EMAIL}}"></zn-slash-item>
</zn-textarea>
```

## Examples

### Inserting Long Or Multi-Line Text

Leave `value` off and the element's text content is inserted instead, which keeps whole clauses readable in markup.

```html:preview
<zn-textarea label="Policy" rows="6" help-text="Type / to insert">
  <zn-slash-item icon="scale@lu" label="Governing law">This agreement is governed by the laws of {{JURISDICTION}}, and the parties submit to the exclusive jurisdiction of its courts.</zn-slash-item>
  <zn-slash-item icon="undo-2@lu" label="Refund window">Refunds are available within {{REFUND_DAYS}} days of purchase.</zn-slash-item>
</zn-textarea>
```

### Searching, Grouping And Ordering

`keywords` adds terms an item can be found by, `group` collects items under a heading, and `order` overrides the
position an item takes in the list.

```html:preview
<zn-textarea label="Grouped insertions" rows="5" help-text="Type / then try 'company'">
  <zn-slash-item
    group="Merchant"
    icon="tag@lu"
    label="Brand name"
    keywords="company, trading"
    value="{{BRAND_NAME}}"></zn-slash-item>
  <zn-slash-item
    group="Merchant"
    icon="building@lu"
    label="Legal entity"
    keywords="company, registered"
    value="{{LEGAL_ENTITY}}"></zn-slash-item>
  <zn-slash-item
    group="Customer"
    icon="user@lu"
    label="Customer name"
    value="{{CUSTOMER_NAME}}"></zn-slash-item>
</zn-textarea>
```

### Placing The Caret Inside An Insertion

`caret-offset` sets where the caret lands after insertion, as an offset into the inserted text. Here it lands between
the tags, ready for the conditional's body.

```html:preview
<zn-textarea label="Conditional block" rows="5" help-text="Type / to insert">
  <zn-slash-item
    icon="git-branch@lu"
    label="If trial customer"
    caret-offset="12"
    value="{{IF_TRIAL}}{{END_IF}}"></zn-slash-item>
</zn-textarea>
```

### Disabled Items

A disabled item is listed but cannot be chosen — useful for showing a replacement string that is not available in the
current context.

```html:preview
<zn-textarea label="Available insertions" rows="5" help-text="Type / to insert">
  <zn-slash-item label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
  <zn-slash-item
    label="Invoice number"
    description="Only available on invoice templates"
    value="{{INVOICE_NUMBER}}"
    disabled></zn-slash-item>
</zn-textarea>
```

### Handling An Item Yourself

An item with an `action` and no `value` inserts nothing. Listen for `zn-slash-select`, call `preventDefault()`, and do
whatever the action means in your application. The typed trigger and query are removed either way — they are a command,
not content.

```html:preview
<zn-textarea id="action-textarea" label="Notes" rows="5" help-text="Type / to insert">
  <zn-slash-item label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
  <zn-slash-item icon="clock@lu" label="Timestamp" action="timestamp"></zn-slash-item>
</zn-textarea>

<script type="module">
  const textarea = document.getElementById('action-textarea');

  await customElements.whenDefined('zn-textarea');

  textarea.addEventListener('zn-slash-select', (event) => {
    if (event.detail.item.action !== 'timestamp') return;

    event.preventDefault();
    textarea.setRangeText(new Date().toISOString());
    textarea.focus();
  });
</script>
```

{% endraw %}
