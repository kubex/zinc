---
meta:
  title: Knowledge Base
  description: Help center with searchable articles and category navigation.
fullWidth: true
---

# Knowledge Base

A help center interface with category navigation, search, and expandable articles. Demonstrates `zn-sidebar`, `zn-collapsible`, `zn-menu`, and content layouts.

```html:preview
<zn-sidebar>
  <!-- Navigation Sidebar -->
  <div slot="side" style="padding: var(--zn-spacing-md);">
    <h3 style="margin-top: 0;">Categories</h3>
    <zn-menu>
      <zn-menu-item>
        <zn-icon slot="prefix" src="shopping_cart"></zn-icon>
        Orders & Shipping
        <zn-chip slot="suffix" size="small">12</zn-chip>
      </zn-menu-item>
      <zn-menu-item>
        <zn-icon slot="prefix" src="payments"></zn-icon>
        Payments & Billing
        <zn-chip slot="suffix" size="small">8</zn-chip>
      </zn-menu-item>
      <zn-menu-item>
        <zn-icon slot="prefix" src="assignment_return"></zn-icon>
        Returns & Refunds
        <zn-chip slot="suffix" size="small">6</zn-chip>
      </zn-menu-item>
      <zn-menu-item>
        <zn-icon slot="prefix" src="account_circle"></zn-icon>
        Account Settings
        <zn-chip slot="suffix" size="small">10</zn-chip>
      </zn-menu-item>
      <zn-menu-item>
        <zn-icon slot="prefix" src="inventory_2"></zn-icon>
        Products & Inventory
        <zn-chip slot="suffix" size="small">15</zn-chip>
      </zn-menu-item>
      <zn-menu-item>
        <zn-icon slot="prefix" src="help"></zn-icon>
        Getting Started
        <zn-chip slot="suffix" size="small">5</zn-chip>
      </zn-menu-item>
    </zn-menu>
  </div>

  <!-- Main Content -->
  <zn-container padded style="background: var(--zn-color-neutral-50);">
    <zn-sp>
      <!-- Search Header -->
      <div style="text-align: center; padding: var(--zn-spacing-xl) 0;">
        <h1 style="margin: 0 0 var(--zn-spacing-md) 0;">How can we help?</h1>
        <zn-input placeholder="Search for articles..." icon="search" style="max-width: 500px; width: 100%;"></zn-input>
      </div>

      <!-- Popular Articles -->
      <zn-panel caption="Popular Articles">
        <zn-sp divide no-gap>
          <zn-item label="How do I track my order?" description="Orders & Shipping · 2 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
          <zn-item label="What is your return policy?" description="Returns & Refunds · 3 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
          <zn-item label="How do I update my payment method?" description="Payments & Billing · 1 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
          <zn-item label="How do I reset my password?" description="Account Settings · 1 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
        </zn-sp>
      </zn-panel>

      <!-- Article Content Example -->
      <zn-panel caption="How do I track my order?">
        <div slot="actions">
          <zn-chip size="small">Orders & Shipping</zn-chip>
        </div>
        <zn-sp>
          <p style="margin: 0;">Tracking your order is easy! Here's how to find your tracking information and monitor your delivery status.</p>

          <zn-collapsible summary="Finding your tracking number" open>
            <div style="padding: var(--zn-spacing-md);">
              <p>Your tracking number can be found in several places:</p>
              <ol>
                <li><strong>Order confirmation email</strong> - We send tracking information as soon as your order ships.</li>
                <li><strong>Your account dashboard</strong> - Go to "My Orders" and click on the order you want to track.</li>
                <li><strong>SMS notification</strong> - If you opted in, we'll text you the tracking link.</li>
              </ol>
            </div>
          </zn-collapsible>

          <zn-collapsible summary="Using the tracking link">
            <div style="padding: var(--zn-spacing-md);">
              <p>Once you have your tracking number:</p>
              <ol>
                <li>Click the tracking link in your email or copy the tracking number.</li>
                <li>You'll be taken to the carrier's website (FedEx, UPS, USPS, etc.).</li>
                <li>View real-time updates on your package location and estimated delivery.</li>
              </ol>
              <zn-alert type="info" style="margin-top: var(--zn-spacing-md);">
                <strong>Tip:</strong> Tracking information may take 24-48 hours to appear after your order ships.
              </zn-alert>
            </div>
          </zn-collapsible>

          <zn-collapsible summary="What if my tracking shows no updates?">
            <div style="padding: var(--zn-spacing-md);">
              <p>If your tracking hasn't updated in a while:</p>
              <ul>
                <li>Wait 24-48 hours for the carrier to scan your package.</li>
                <li>Check for any service alerts in your area.</li>
                <li>Contact our support team if there's no update after 5 business days.</li>
              </ul>
            </div>
          </zn-collapsible>

          <zn-collapsible summary="Delivery issues">
            <div style="padding: var(--zn-spacing-md);">
              <p>If you experience any of these issues, please contact us:</p>
              <ul>
                <li>Package marked as delivered but not received</li>
                <li>Damaged package upon arrival</li>
                <li>Wrong item delivered</li>
                <li>Significant delivery delays</li>
              </ul>
              <zn-button style="margin-top: var(--zn-spacing-md);">Contact Support</zn-button>
            </div>
          </zn-collapsible>
        </zn-sp>

        <!-- Article Footer -->
        <div style="border-top: 1px solid var(--zn-color-neutral-200); padding-top: var(--zn-spacing-md); margin-top: var(--zn-spacing-md);">
          <p style="margin: 0 0 var(--zn-spacing-sm) 0;"><strong>Was this article helpful?</strong></p>
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-button size="small" color="secondary" icon="thumb_up">Yes</zn-button>
            <zn-button size="small" color="secondary" icon="thumb_down">No</zn-button>
          </div>
        </div>
      </zn-panel>

      <!-- Related Articles -->
      <zn-panel caption="Related Articles">
        <zn-sp divide no-gap>
          <zn-item label="Shipping options and delivery times" description="Orders & Shipping · 2 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
          <zn-item label="What happens if my package is lost?" description="Orders & Shipping · 3 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
          <zn-item label="Can I change my shipping address?" description="Orders & Shipping · 1 min read">
            <zn-icon slot="prefix" src="article"></zn-icon>
            <zn-icon slot="suffix" src="chevron_right"></zn-icon>
          </zn-item>
        </zn-sp>
      </zn-panel>
    </zn-sp>
  </zn-container>
</zn-sidebar>
```

**Components demonstrated:** `zn-sidebar`, `zn-menu`, `zn-menu-item`, `zn-collapsible`, `zn-input`, `zn-item`, `zn-chip`, `zn-alert`, `zn-panel`, `zn-button`
