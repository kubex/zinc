---
meta:
  title: Contact Detail
  description: CRM contact profile with activity timeline and tabbed sections.
fullWidth: true
---

# Contact Detail

A 360-degree customer view showing contact information, activity timeline, deals, and notes. Demonstrates `zn-tabs`, `zn-vertical-stepper`, and data layouts.

```html:preview
<zn-pane>
  <zn-sp flush>
    <!-- Contact Header -->
    <div style="padding: var(--zn-spacing-lg); border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="display: flex; gap: var(--zn-spacing-md);">
          <zn-icon src="account_circle" style="font-size: 64px; color: var(--zn-color-neutral-400);"></zn-icon>
          <div>
            <h1 style="margin: 0 0 var(--zn-spacing-xs) 0;">Sarah Johnson</h1>
            <div style="color: var(--zn-text-secondary); margin-bottom: var(--zn-spacing-sm);">VP of Operations at Acme Corp</div>
            <div style="display: flex; gap: var(--zn-spacing-sm);">
              <zn-chip size="small" color="success">VIP</zn-chip>
              <zn-chip size="small">Customer</zn-chip>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: var(--zn-spacing-sm);">
          <zn-button icon="email" color="secondary">Email</zn-button>
          <zn-button icon="phone" color="secondary">Call</zn-button>
          <zn-button icon="edit">Edit Contact</zn-button>
        </div>
      </div>

      <!-- Quick Stats -->
      <zn-cols layout="1,1,1,1" style="margin-top: var(--zn-spacing-lg);">
        <zn-stat caption="Lifetime Value" value="$124,500"></zn-stat>
        <zn-stat caption="Open Deals" value="2" trend="up"></zn-stat>
        <zn-stat caption="Won Deals" value="5"></zn-stat>
        <zn-stat caption="Last Contact" value="Today"></zn-stat>
      </zn-cols>
    </div>

    <!-- Main Content with Tabs -->
    <zn-sidebar>
      <!-- Sidebar with Contact Info -->
      <div slot="side" style="padding: var(--zn-spacing-md);">
        <zn-panel caption="Contact Info">
          <zn-sp divide no-gap>
            <zn-item label="Email" description="sarah.johnson@acme.com">
              <zn-icon slot="prefix" src="email"></zn-icon>
              <zn-button slot="actions" size="x-small" color="transparent" icon="content_copy"></zn-button>
            </zn-item>
            <zn-item label="Phone" description="+1 (555) 123-4567">
              <zn-icon slot="prefix" src="phone"></zn-icon>
              <zn-button slot="actions" size="x-small" color="transparent" icon="content_copy"></zn-button>
            </zn-item>
            <zn-item label="Company" description="Acme Corp">
              <zn-icon slot="prefix" src="business"></zn-icon>
            </zn-item>
            <zn-item label="Location" description="San Francisco, CA">
              <zn-icon slot="prefix" src="location_on"></zn-icon>
            </zn-item>
            <zn-item label="Timezone" description="Pacific (PST)">
              <zn-icon slot="prefix" src="schedule"></zn-icon>
            </zn-item>
          </zn-sp>
        </zn-panel>

        <zn-panel caption="Tags">
          <div style="display: flex; flex-wrap: wrap; gap: var(--zn-spacing-xs);">
            <zn-chip size="small">Enterprise</zn-chip>
            <zn-chip size="small">Decision Maker</zn-chip>
            <zn-chip size="small">Q1 Target</zn-chip>
            <zn-button size="x-small" color="transparent" icon="add">Add Tag</zn-button>
          </div>
        </zn-panel>
      </div>

      <!-- Main Content -->
      <zn-container padded style="background: var(--zn-color-neutral-50);">
        <zn-panel tabbed>
          <zn-tabs>
            <zn-navbar slot="top">
              <li tab>Activity</li>
              <li tab="deals">Deals</li>
              <li tab="notes">Notes</li>
              <li tab="files">Files</li>
            </zn-navbar>

            <!-- Activity Tab -->
            <div id="" style="padding: var(--zn-spacing-md);">
              <zn-vertical-stepper>
                <zn-vertical-stepper-item label="Email sent: Proposal follow-up" description="Today at 10:30 AM" complete>
                  <zn-icon slot="icon" src="email"></zn-icon>
                </zn-vertical-stepper-item>
                <zn-vertical-stepper-item label="Call completed (15 min)" description="Yesterday at 3:00 PM" complete>
                  <zn-icon slot="icon" src="phone"></zn-icon>
                </zn-vertical-stepper-item>
                <zn-vertical-stepper-item label="Meeting: Quarterly Review" description="Jan 28, 2026 at 2:00 PM" complete>
                  <zn-icon slot="icon" src="event"></zn-icon>
                </zn-vertical-stepper-item>
                <zn-vertical-stepper-item label="Deal created: Acme Expansion" description="Jan 25, 2026" complete>
                  <zn-icon slot="icon" src="handshake"></zn-icon>
                </zn-vertical-stepper-item>
                <zn-vertical-stepper-item label="Note added" description="Jan 20, 2026" complete>
                  <zn-icon slot="icon" src="note"></zn-icon>
                </zn-vertical-stepper-item>
                <zn-vertical-stepper-item label="Email opened: Product Update" description="Jan 15, 2026" complete>
                  <zn-icon slot="icon" src="mark_email_read"></zn-icon>
                </zn-vertical-stepper-item>
                <zn-vertical-stepper-item label="Contact created" description="Mar 10, 2024" complete>
                  <zn-icon slot="icon" src="person_add"></zn-icon>
                </zn-vertical-stepper-item>
              </zn-vertical-stepper>
            </div>

            <!-- Deals Tab -->
            <div id="deals" style="padding: var(--zn-spacing-md);">
              <zn-sp>
                <zn-panel caption="Open Deals">
                  <zn-sp divide no-gap>
                    <zn-item label="Acme Expansion" description="Qualified · $50,000">
                      <zn-chip slot="actions" size="small" color="warning">40%</zn-chip>
                    </zn-item>
                    <zn-item label="Support Add-on" description="Proposal · $15,000">
                      <zn-chip slot="actions" size="small" color="success">60%</zn-chip>
                    </zn-item>
                  </zn-sp>
                </zn-panel>

                <zn-panel caption="Won Deals">
                  <zn-sp divide no-gap>
                    <zn-item label="Initial License" description="Closed Mar 2024 · $45,000">
                      <zn-chip slot="actions" size="small" color="success">Won</zn-chip>
                    </zn-item>
                    <zn-item label="Training Package" description="Closed Jun 2024 · $8,500">
                      <zn-chip slot="actions" size="small" color="success">Won</zn-chip>
                    </zn-item>
                    <zn-item label="Annual Renewal" description="Closed Jan 2025 · $45,000">
                      <zn-chip slot="actions" size="small" color="success">Won</zn-chip>
                    </zn-item>
                    <zn-item label="Premium Upgrade" description="Closed Sep 2025 · $18,000">
                      <zn-chip slot="actions" size="small" color="success">Won</zn-chip>
                    </zn-item>
                    <zn-item label="Integration Services" description="Closed Nov 2025 · $8,000">
                      <zn-chip slot="actions" size="small" color="success">Won</zn-chip>
                    </zn-item>
                  </zn-sp>
                </zn-panel>
              </zn-sp>
            </div>

            <!-- Notes Tab -->
            <div id="notes" style="padding: var(--zn-spacing-md);">
              <div style="margin-bottom: var(--zn-spacing-md);">
                <zn-editor placeholder="Add a note..." style="height: 100px;"></zn-editor>
                <div style="display: flex; justify-content: flex-end; margin-top: var(--zn-spacing-sm);">
                  <zn-button size="small">Add Note</zn-button>
                </div>
              </div>

              <zn-sp>
                <zn-panel>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-sm);">
                    <strong>Quarterly review follow-up</strong>
                    <span style="font-size: 12px; color: var(--zn-text-secondary);">Jan 28, 2026 by Michael C.</span>
                  </div>
                  <p style="margin: 0;">Sarah expressed interest in expanding to 3 more departments. She mentioned budget approval happens in Q2. Set reminder to follow up in March.</p>
                </zn-panel>

                <zn-panel>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-sm);">
                    <strong>Initial meeting notes</strong>
                    <span style="font-size: 12px; color: var(--zn-text-secondary);">Jan 20, 2026 by Sarah W.</span>
                  </div>
                  <p style="margin: 0;">Key decision maker for operations tools. Reports to COO. Currently using competitor but unhappy with support response times. Budget: $50-75k annually.</p>
                </zn-panel>

                <zn-panel>
                  <div style="display: flex; justify-content: space-between; margin-bottom: var(--zn-spacing-sm);">
                    <strong>Product demo feedback</strong>
                    <span style="font-size: 12px; color: var(--zn-text-secondary);">Dec 15, 2025 by Michael C.</span>
                  </div>
                  <p style="margin: 0;">Very impressed with the reporting features. Asked about custom integrations with their ERP system. Sent technical documentation.</p>
                </zn-panel>
              </zn-sp>
            </div>

            <!-- Files Tab -->
            <div id="files" style="padding: var(--zn-spacing-md);">
              <div style="margin-bottom: var(--zn-spacing-md);">
                <zn-file>Drop files here or click to upload</zn-file>
              </div>

              <zn-panel caption="Attached Files">
                <zn-sp divide no-gap>
                  <zn-item label="Acme_Proposal_2026.pdf" description="PDF · 2.4 MB · Uploaded Jan 25">
                    <zn-icon slot="prefix" src="picture_as_pdf" style="color: var(--zn-color-error);"></zn-icon>
                    <zn-button slot="actions" size="x-small" color="transparent" icon="download"></zn-button>
                  </zn-item>
                  <zn-item label="Meeting_Notes_Q4.docx" description="Word · 156 KB · Uploaded Dec 10">
                    <zn-icon slot="prefix" src="description" style="color: var(--zn-color-info);"></zn-icon>
                    <zn-button slot="actions" size="x-small" color="transparent" icon="download"></zn-button>
                  </zn-item>
                  <zn-item label="Product_Demo_Recording.mp4" description="Video · 48 MB · Uploaded Nov 20">
                    <zn-icon slot="prefix" src="videocam" style="color: var(--zn-color-warning);"></zn-icon>
                    <zn-button slot="actions" size="x-small" color="transparent" icon="download"></zn-button>
                  </zn-item>
                  <zn-item label="Contract_Signed.pdf" description="PDF · 1.2 MB · Uploaded Mar 2024">
                    <zn-icon slot="prefix" src="picture_as_pdf" style="color: var(--zn-color-error);"></zn-icon>
                    <zn-button slot="actions" size="x-small" color="transparent" icon="download"></zn-button>
                  </zn-item>
                </zn-sp>
              </zn-panel>
            </div>
          </zn-tabs>
        </zn-panel>
      </zn-container>
    </zn-sidebar>
  </zn-sp>
</zn-pane>
```

**Components demonstrated:** `zn-tabs`, `zn-navbar`, `zn-vertical-stepper`, `zn-vertical-stepper-item`, `zn-sidebar`, `zn-stat`, `zn-panel`, `zn-item`, `zn-chip`, `zn-editor`, `zn-file`
