---
meta:
  title: Ticket Detail
  description: Support ticket detail with conversation thread and customer info sidebar.
fullWidth: true
---

# Ticket Detail

A ticket detail view with split-pane layout showing conversation thread and customer information. Demonstrates `zn-split-pane`, `zn-editor`, and conversation UI patterns.

```html:preview
<zn-pane style="height: 600px;">
  <zn-split-pane style="height: 100%;">
    <!-- Main Conversation Area -->
    <div slot="start" style="display: flex; flex-direction: column; height: 100%;">
      <!-- Ticket Header -->
      <div style="padding: var(--zn-spacing-md); border-bottom: 1px solid var(--zn-color-neutral-200);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm); margin-bottom: var(--zn-spacing-xs);">
              <zn-button icon="arrow_back" color="transparent" size="small"></zn-button>
              <h2 style="margin: 0;">Cannot complete checkout process</h2>
            </div>
            <div style="display: flex; gap: var(--zn-spacing-sm); align-items: center;">
              <zn-chip size="small">#847</zn-chip>
              <zn-chip size="small" color="error">Urgent</zn-chip>
              <zn-status-indicator color="warning">Pending</zn-status-indicator>
            </div>
          </div>
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-button size="small" color="secondary">Merge</zn-button>
            <zn-button size="small" color="secondary">Close</zn-button>
          </div>
        </div>
      </div>

      <!-- Conversation Thread -->
      <div style="flex: 1; overflow-y: auto; padding: var(--zn-spacing-md);">
        <zn-sp>
          <!-- Customer Message -->
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-icon src="account_circle" style="font-size: 36px; color: var(--zn-color-neutral-400);"></zn-icon>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-xs);">
                <strong>John Smith</strong>
                <span style="font-size: 12px; color: var(--zn-text-secondary);">Feb 1, 2026 at 2:34 PM</span>
              </div>
              <div style="background: var(--zn-color-neutral-100); padding: var(--zn-spacing-md); border-radius: var(--zn-border-radius-medium);">
                <p style="margin: 0;">Hi, I'm trying to complete my order but the checkout page keeps showing an error. I've tried multiple browsers and cleared my cache but nothing works.</p>
                <p style="margin: var(--zn-spacing-sm) 0 0 0;">Can you please help? I need this order delivered by next week.</p>
              </div>
            </div>
          </div>

          <!-- Agent Response -->
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-icon src="support_agent" style="font-size: 36px; color: var(--zn-color-primary);"></zn-icon>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-xs);">
                <strong>Sarah Wilson</strong>
                <span style="font-size: 12px; color: var(--zn-text-secondary);">Feb 1, 2026 at 2:45 PM</span>
              </div>
              <div style="background: var(--zn-color-primary-50); padding: var(--zn-spacing-md); border-radius: var(--zn-border-radius-medium);">
                <p style="margin: 0;">Hi John,</p>
                <p style="margin: var(--zn-spacing-sm) 0 0 0;">Thank you for reaching out. I'm sorry to hear you're experiencing issues with checkout. Could you please provide the following information so I can investigate?</p>
                <ul style="margin: var(--zn-spacing-sm) 0 0 0; padding-left: var(--zn-spacing-lg);">
                  <li>What error message are you seeing?</li>
                  <li>What items are in your cart?</li>
                  <li>What payment method are you using?</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Customer Reply -->
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-icon src="account_circle" style="font-size: 36px; color: var(--zn-color-neutral-400);"></zn-icon>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-xs);">
                <strong>John Smith</strong>
                <span style="font-size: 12px; color: var(--zn-text-secondary);">Feb 1, 2026 at 3:02 PM</span>
              </div>
              <div style="background: var(--zn-color-neutral-100); padding: var(--zn-spacing-md); border-radius: var(--zn-border-radius-medium);">
                <p style="margin: 0;">The error says "Payment processing failed. Please try again."</p>
                <p style="margin: var(--zn-spacing-sm) 0 0 0;">I have 2 items: Wireless Headphones and a USB-C Hub. I'm trying to pay with Visa.</p>
              </div>
            </div>
          </div>

          <!-- Internal Note -->
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-icon src="lock" style="font-size: 36px; color: var(--zn-color-warning);"></zn-icon>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-xs);">
                <strong>Sarah Wilson</strong>
                <zn-chip size="small" color="warning">Internal Note</zn-chip>
              </div>
              <div style="background: var(--zn-color-warning-50); padding: var(--zn-spacing-md); border-radius: var(--zn-border-radius-medium); border: 1px dashed var(--zn-color-warning);">
                <p style="margin: 0;">Checked payment gateway logs - there's a fraud flag on this card. Need to escalate to payments team to verify.</p>
              </div>
            </div>
          </div>
        </zn-sp>
      </div>

      <!-- Reply Editor -->
      <div style="padding: var(--zn-spacing-md); border-top: 1px solid var(--zn-color-neutral-200);">
        <zn-editor placeholder="Type your reply..." style="height: 120px;"></zn-editor>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--zn-spacing-sm);">
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-button size="small" color="transparent" icon="attach_file"></zn-button>
            <zn-button size="small" color="transparent" icon="insert_emoticon"></zn-button>
          </div>
          <div style="display: flex; gap: var(--zn-spacing-sm);">
            <zn-select size="small" style="width: 150px;">
              <zn-option value="reply" selected>Reply</zn-option>
              <zn-option value="note">Internal Note</zn-option>
            </zn-select>
            <zn-button size="small">Send Reply</zn-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div slot="end" style="overflow-y: auto; background: var(--zn-color-neutral-50);">
      <zn-sp style="padding: var(--zn-spacing-md);">
        <!-- Customer Info -->
        <zn-panel caption="Customer">
          <zn-sp divide no-gap>
            <zn-item label="John Smith" description="john.smith@email.com">
              <zn-icon slot="prefix" src="account_circle" style="font-size: 32px;"></zn-icon>
            </zn-item>
            <zn-item label="Phone" description="+1 (555) 234-5678"></zn-item>
            <zn-item label="Location" description="New York, NY"></zn-item>
            <zn-item label="Customer Since" description="March 2024"></zn-item>
          </zn-sp>
        </zn-panel>

        <!-- Ticket Properties -->
        <zn-panel caption="Properties">
          <zn-sp>
            <zn-select label="Status" value="pending" size="small">
              <zn-option value="open">Open</zn-option>
              <zn-option value="pending">Pending</zn-option>
              <zn-option value="resolved">Resolved</zn-option>
              <zn-option value="closed">Closed</zn-option>
            </zn-select>
            <zn-select label="Priority" value="urgent" size="small">
              <zn-option value="low">Low</zn-option>
              <zn-option value="normal">Normal</zn-option>
              <zn-option value="high">High</zn-option>
              <zn-option value="urgent">Urgent</zn-option>
            </zn-select>
            <zn-select label="Assignee" value="sarah" size="small">
              <zn-option value="sarah">Sarah Wilson</zn-option>
              <zn-option value="michael">Michael Chen</zn-option>
              <zn-option value="unassigned">Unassigned</zn-option>
            </zn-select>
            <zn-select label="Category" value="checkout" size="small">
              <zn-option value="checkout">Checkout Issues</zn-option>
              <zn-option value="shipping">Shipping</zn-option>
              <zn-option value="returns">Returns</zn-option>
              <zn-option value="billing">Billing</zn-option>
            </zn-select>
          </zn-sp>
        </zn-panel>

        <!-- Related Tickets -->
        <zn-panel caption="Related Tickets">
          <zn-sp divide no-gap>
            <zn-item label="#832 - Payment declined" description="Resolved · Jan 15">
              <zn-icon slot="prefix" src="confirmation_number" style="font-size: 20px;"></zn-icon>
            </zn-item>
            <zn-item label="#801 - Checkout error" description="Closed · Dec 28">
              <zn-icon slot="prefix" src="confirmation_number" style="font-size: 20px;"></zn-icon>
            </zn-item>
          </zn-sp>
        </zn-panel>
      </zn-sp>
    </div>
  </zn-split-pane>
</zn-pane>
```

**Components demonstrated:** `zn-split-pane`, `zn-editor`, `zn-panel`, `zn-item`, `zn-select`, `zn-chip`, `zn-status-indicator`, `zn-button`
