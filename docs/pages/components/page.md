---
meta:
  title: Page
  description: Pages combine a header with tabbed content.
layout: component
---

```html:preview
<zn-page caption="Margot Foster" summary="Customer since March 2021 · London, UK">
  <zn-badge slot="caption-badges" type="success" dot>Active</zn-badge>
  <zn-button slot="actions" color="secondary" icon="mail@lu">Email</zn-button>
  <zn-button slot="actions" color="primary" icon="plus@lu">New Subscription</zn-button>

  <zn-tab caption="Overview">
    <zn-sp>
      <zn-panel caption="Contact">
        <zn-sp divide no-gap>
          <zn-item caption="Email">margot.foster@example.com</zn-item>
          <zn-item caption="Phone">+44 20 7946 0958</zn-item>
          <zn-item caption="Plan">Business, billed annually</zn-item>
        </zn-sp>
      </zn-panel>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="Subscriptions">
    <zn-sp>
      <zn-empty-state caption="No subscriptions" description="Subscriptions for this customer appear here." icon="repeat@lu"></zn-empty-state>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="Notes">
    <zn-sp>
      <zn-empty-state caption="No notes" description="Notes left by your team appear here." icon="sticky-note@lu"></zn-empty-state>
    </zn-sp>
  </zn-tab>
</zn-page>
```

## Examples

### Header

Set `caption` and `summary` for the page title and its description, or use the `caption` and `description` slots for rich content. Put status badges in the `caption-badges` slot and controls in the `actions` slot.

```html:preview
<zn-page caption="INV-2024-0042" summary="Issued 4 March 2024 · Due in 14 days">
  <zn-badge slot="caption-badges" type="warning">Past due</zn-badge>
  <zn-button slot="actions" color="secondary" icon="download@lu">Download</zn-button>
  <zn-button slot="actions" color="primary">Record Payment</zn-button>

  <zn-tab caption="Details">
    <zn-sp>
      <zn-cols>
        <zn-panel>
          <zn-stat caption="Amount due" amount="1250" currency="£"></zn-stat>
        </zn-panel>
        <zn-panel>
          <zn-stat caption="Paid" amount="0" currency="£"></zn-stat>
        </zn-panel>
      </zn-cols>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Breadcrumbs

Links in the `breadcrumb` slot show above the caption, separated by an icon. Breadcrumbs are hidden in `nested` and `modal` pages.

```html:preview
<zn-page caption="Security" summary="Sign-in and access settings for Acme Inc">
  <a href="#" slot="breadcrumb">Settings</a>
  <a href="#" slot="breadcrumb">Acme Inc</a>

  <zn-tab caption="Overview">
    <zn-sp>
      <zn-panel caption="Sign-in">
        <zn-sp divide no-gap>
          <zn-item caption="Two-factor authentication">Required for all members</zn-item>
          <zn-item caption="Session timeout">12 hours</zn-item>
        </zn-sp>
      </zn-panel>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Header Metadata

`previous-path` adds a back button, and `previous-target` sets where it opens. `entity-id` and `full-location` add copy buttons, shown while Alt is held. Hold Alt over this example to see them.

```html:preview
<zn-page
  caption="Margot Foster"
  summary="Customer"
  previous-path="/customers"
  entity-id="cus_8F2kD91xQ"
  full-location="/customers/cus_8F2kD91xQ">
  <zn-tab caption="Overview">
    <zn-sp>
      <zn-panel caption="Contact">
        <zn-item caption="Email">margot.foster@example.com</zn-item>
      </zn-panel>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Tabs

Each `zn-tab` becomes a tab. A tab gets its `id` from its caption, and a tab captioned Overview gets the empty id, which always shows first. Other tabs keep their source order unless `priority` is set: higher numbers come first. Add `selected` to open a tab other than the first.

Tabs stay in the page's light DOM, so styles scoped to where they are written still apply.

```html:preview
<zn-page caption="Acme Inc" summary="Workspace">
  <zn-tab caption="Billing" priority="10">
    <zn-sp>
      <zn-panel caption="Billing">
        <zn-item caption="Payment method">Visa ending 4242</zn-item>
      </zn-panel>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="Members" priority="20" selected>
    <zn-sp>
      <zn-panel caption="Members">
        <zn-sp divide no-gap>
          <zn-item caption="Margot Foster">Owner</zn-item>
          <zn-item caption="Sam Patel">Admin</zn-item>
        </zn-sp>
      </zn-panel>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="Overview">
    <zn-sp>
      <zn-panel caption="Workspace">
        <zn-item caption="Region">Europe (London)</zn-item>
      </zn-panel>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Tab Icons

Set `icon` on a `zn-tab` to show an icon before its caption.

```html:preview
<zn-page caption="Margot Foster" summary="Customer">
  <zn-tab caption="Overview" icon="layout-grid@lu">
    <zn-sp>
      <zn-panel caption="Contact">
        <zn-item caption="Email">margot.foster@example.com</zn-item>
      </zn-panel>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="History" icon="history@lu">
    <zn-sp>
      <zn-empty-state caption="No history yet" icon="history@lu"></zn-empty-state>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Dynamic Tabs

Set `uri` on a `zn-tab` to load its content from that address when the tab is first opened.

```html:preview
<zn-page caption="Reports" summary="Revenue and usage across your workspace">
  <zn-tab caption="Overview">
    <zn-sp>
      <zn-cols>
        <zn-panel>
          <zn-stat caption="Revenue" description="This month" amount="48250" previous="42100" currency="£" show-delta></zn-stat>
        </zn-panel>
        <zn-panel>
          <zn-stat caption="Active customers" amount="1284" previous="1210" show-delta></zn-stat>
        </zn-panel>
      </zn-cols>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="Revenue" uri="/reports/revenue"></zn-tab>
  <zn-tab caption="Usage" uri="/reports/usage"></zn-tab>
</zn-page>
```

### Nested Tabs

Put `zn-tab` elements inside a `zn-tab` to give that tab its own set of tabs. They show as a grey pill track below the main tab bar, so they read as secondary.

```html:preview
<zn-page caption="Margot Foster" summary="Customer">
  <zn-tab caption="Billing">
    <zn-tab caption="Invoices">
      <zn-sp>
        <zn-panel caption="Invoices">
          <zn-sp divide no-gap>
            <zn-item caption="INV-2024-0042">£1,250.00 · Past due</zn-item>
            <zn-item caption="INV-2024-0031">£1,250.00 · Paid</zn-item>
          </zn-sp>
        </zn-panel>
      </zn-sp>
    </zn-tab>

    <zn-tab caption="Payment Methods">
      <zn-sp>
        <zn-panel caption="Payment methods">
          <zn-item caption="Visa ending 4242">Default · Expires 08/27</zn-item>
        </zn-panel>
      </zn-sp>
    </zn-tab>
  </zn-tab>

  <zn-tab caption="Notes">
    <zn-sp>
      <zn-empty-state caption="No notes" icon="sticky-note@lu"></zn-empty-state>
    </zn-sp>
  </zn-tab>
</zn-page>
```

A `zn-page` placed in a tab is a page of its own, with its own header and a normal tab bar.

### Navigation Style

`navigation-style` sets the tab design:

- `tabs` – a tab bar below the header. This is the default.
- `pills` – a pill track with no page header, for a page that only holds a second set of tabs. Nested tabs use it.
- `sidebar` – for tabs shown outside the page, such as in an app sidebar. The page hides its tab bar unless the `bottom` slot has content, and still loads tabs and keeps their history as the outside navigation selects them.

```html:preview
<zn-page caption="Margot Foster" summary="Customer">
  <zn-tab caption="Billing">
    <zn-page nested navigation-style="pills">
      <zn-tab caption="Invoices">
        <zn-sp>
          <zn-panel caption="Invoices">
            <zn-item caption="INV-2024-0042">£1,250.00 · Past due</zn-item>
          </zn-panel>
        </zn-sp>
      </zn-tab>
      <zn-tab caption="Credit Notes">
        <zn-sp>
          <zn-empty-state caption="No credit notes" icon="receipt@lu"></zn-empty-state>
        </zn-sp>
      </zn-tab>
    </zn-page>
  </zn-tab>

  <zn-tab caption="Notes">
    <zn-sp>
      <zn-empty-state caption="No notes" icon="sticky-note@lu"></zn-empty-state>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Linking to a Tab

Give any element in the page a `tab` attribute holding a tab's `id` to open that tab when it is clicked. Links inside a nested `zn-page` or `zn-tabs` open tabs in that nested container.

```html:preview
<zn-page caption="Margot Foster" summary="Customer">
  <zn-tab caption="Overview">
    <zn-sp>
      <zn-panel caption="Billing">
        <zn-item caption="Outstanding balance">£1,250.00</zn-item>
        <zn-button slot="actions" tab="invoices" color="secondary" size="small">View invoices</zn-button>
      </zn-panel>
    </zn-sp>
  </zn-tab>

  <zn-tab caption="Invoices">
    <zn-sp>
      <zn-panel caption="Invoices">
        <zn-item caption="INV-2024-0042">£1,250.00 · Past due</zn-item>
      </zn-panel>
    </zn-sp>
  </zn-tab>
</zn-page>
```

### Footer

Put actions in the `footer` slot to pin them below the content while it scrolls. Give `zn-form-actions` a `form` attribute so it can submit a form it sits outside of. In a modal page the footer takes the dialog footer's styling.

```html:preview
<zn-page caption="New Customer" summary="Add a customer to Acme Inc" modal style="height: 420px;">
  <zn-tab caption="Details">
    <form id="page-footer-form">
      <zn-sp>
        <zn-input label="Full name" name="name" required></zn-input>
        <zn-input label="Email" name="email" type="email" required></zn-input>
      </zn-sp>
    </form>
  </zn-tab>

  <zn-form-actions slot="footer" form="page-footer-form" with-cancel submit-text="Add customer"
                   submit-icon="plus@lu"></zn-form-actions>
</zn-page>
```

### Full Width

The header, tabs and content are capped at the container width (`--zn-container`) and centred. Add `full-width` to let them span the whole page, such as for wide tables. A `flush` page always spans it.

```html:preview
<zn-page caption="Transactions" summary="All payments across your workspace" full-width>
  <zn-tab caption="Overview">
    <zn-sp>
      <zn-cols>
        <zn-panel>
          <zn-stat caption="Volume" description="Last 30 days" amount="182400" currency="£"></zn-stat>
        </zn-panel>
        <zn-panel>
          <zn-stat caption="Payments" description="Last 30 days" amount="3192"></zn-stat>
        </zn-panel>
        <zn-panel>
          <zn-stat caption="Declined" description="Last 30 days" amount="41"></zn-stat>
        </zn-panel>
      </zn-cols>
    </zn-sp>
  </zn-tab>
</zn-page>
```
