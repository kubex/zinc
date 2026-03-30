---
meta:
  title: Settings
  description: Account settings page with tabs, forms, and toggles demonstrating Zinc form components.
fullWidth: true
---

# Settings

A typical settings page with multiple sections organized by tabs. Demonstrates `zn-tabs`, `zn-input`, `zn-toggle`, `zn-select`, and form layout patterns.

```html:preview
<zn-pane>
  <zn-panel caption="Account Settings" description="Manage your account preferences" tabbed>
    <zn-tabs>
      <zn-navbar slot="top">
        <li tab>Profile</li>
        <li tab="security">Security</li>
        <li tab="notifications">Notifications</li>
        <li tab="billing">Billing</li>
        <li tab="team">Team</li>
      </zn-navbar>

      <!-- Profile Tab -->
      <zn-sp id="" style="padding: var(--zn-spacing-lg);">
        <zn-cols layout="200px,1">
          <div>
            <zn-file accept="image/*" style="width: 150px; height: 150px;">
              Upload Avatar
            </zn-file>
          </div>
          <zn-sp>
            <zn-cols layout="1,1">
              <zn-input label="First Name" value="Sarah"></zn-input>
              <zn-input label="Last Name" value="Wilson"></zn-input>
            </zn-cols>
            <zn-input label="Email" type="email" value="sarah.wilson@company.com"></zn-input>
            <zn-input label="Phone" type="tel" value="+1 (555) 123-4567"></zn-input>
            <zn-textarea label="Bio" placeholder="Tell us about yourself..." rows="3"></zn-textarea>
            <zn-select label="Timezone">
              <zn-option value="utc">UTC</zn-option>
              <zn-option value="est" selected>Eastern Time (EST)</zn-option>
              <zn-option value="pst">Pacific Time (PST)</zn-option>
              <zn-option value="gmt">GMT</zn-option>
            </zn-select>
            <div style="display: flex; gap: var(--zn-spacing-sm); justify-content: flex-end;">
              <zn-button color="secondary">Cancel</zn-button>
              <zn-button>Save Changes</zn-button>
            </div>
          </zn-sp>
        </zn-cols>
      </zn-sp>

      <!-- Security Tab -->
      <zn-sp id="security" style="padding: var(--zn-spacing-lg);">
        <zn-panel caption="Change Password">
          <zn-sp>
            <zn-input label="Current Password" type="password"></zn-input>
            <zn-cols layout="1,1">
              <zn-input label="New Password" type="password"></zn-input>
              <zn-input label="Confirm Password" type="password"></zn-input>
            </zn-cols>
            <zn-button>Update Password</zn-button>
          </zn-sp>
        </zn-panel>
        <zn-panel caption="Two-Factor Authentication">
          <zn-sp divide no-gap>
            <zn-item label="Enable 2FA" description="Add an extra layer of security to your account">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="Authenticator App" description="Use Google Authenticator or similar">
              <zn-chip slot="actions" size="small" color="success">Configured</zn-chip>
            </zn-item>
            <zn-item label="SMS Backup" description="Receive codes via text message">
              <zn-button slot="actions" size="small" color="secondary">Setup</zn-button>
            </zn-item>
          </zn-sp>
        </zn-panel>
      </zn-sp>

      <!-- Notifications Tab -->
      <zn-sp id="notifications" style="padding: var(--zn-spacing-lg);">
        <zn-panel caption="Email Notifications">
          <zn-sp divide no-gap>
            <zn-item label="Order updates" description="Receive emails when order status changes">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="New customers" description="Get notified when someone creates an account">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="Product reviews" description="Receive emails for new product reviews">
              <zn-toggle slot="actions"></zn-toggle>
            </zn-item>
            <zn-item label="Weekly digest" description="Summary of activity sent every Monday">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
          </zn-sp>
        </zn-panel>
        <zn-panel caption="Push Notifications">
          <zn-sp divide no-gap>
            <zn-item label="Desktop notifications" description="Show browser notifications">
              <zn-toggle slot="actions" checked></zn-toggle>
            </zn-item>
            <zn-item label="Sound alerts" description="Play sound for important events">
              <zn-toggle slot="actions"></zn-toggle>
            </zn-item>
          </zn-sp>
        </zn-panel>
      </zn-sp>

      <!-- Billing Tab -->
      <zn-sp id="billing" style="padding: var(--zn-spacing-lg);">
        <zn-cols layout="1,1">
          <zn-panel caption="Current Plan">
            <zn-sp>
              <zn-stat caption="Plan" value="Professional"></zn-stat>
              <zn-stat caption="Price" value="$49/month"></zn-stat>
              <zn-stat caption="Next billing" value="Feb 15, 2026"></zn-stat>
              <zn-button color="secondary">Change Plan</zn-button>
            </zn-sp>
          </zn-panel>
          <zn-panel caption="Payment Method">
            <zn-sp divide no-gap>
              <zn-item label="Visa ending in 4242" description="Expires 12/2027">
                <zn-icon slot="prefix" src="credit_card"></zn-icon>
                <zn-button slot="actions" size="small" color="secondary">Edit</zn-button>
              </zn-item>
            </zn-sp>
            <div style="margin-top: var(--zn-spacing-md);">
              <zn-button color="secondary" size="small">Add Payment Method</zn-button>
            </div>
          </zn-panel>
        </zn-cols>
        <zn-panel caption="Billing History" flush>
          <zn-data-table>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jan 15, 2026</td>
                  <td>Professional Plan</td>
                  <td>$49.00</td>
                  <td><zn-chip size="small" color="success">Paid</zn-chip></td>
                  <td><zn-button size="x-small" color="transparent">Download</zn-button></td>
                </tr>
                <tr>
                  <td>Dec 15, 2025</td>
                  <td>Professional Plan</td>
                  <td>$49.00</td>
                  <td><zn-chip size="small" color="success">Paid</zn-chip></td>
                  <td><zn-button size="x-small" color="transparent">Download</zn-button></td>
                </tr>
                <tr>
                  <td>Nov 15, 2025</td>
                  <td>Professional Plan</td>
                  <td>$49.00</td>
                  <td><zn-chip size="small" color="success">Paid</zn-chip></td>
                  <td><zn-button size="x-small" color="transparent">Download</zn-button></td>
                </tr>
              </tbody>
            </table>
          </zn-data-table>
        </zn-panel>
      </zn-sp>

      <!-- Team Tab -->
      <zn-sp id="team" style="padding: var(--zn-spacing-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zn-spacing-md);">
          <h3 style="margin: 0;">Team Members</h3>
          <zn-button size="small" icon="person_add">Invite Member</zn-button>
        </div>
        <zn-data-table>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                    <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                    <div>
                      <div>Sarah Wilson</div>
                      <div style="font-size: 12px; color: var(--zn-text-secondary);">sarah@company.com</div>
                    </div>
                  </div>
                </td>
                <td><zn-chip size="small">Owner</zn-chip></td>
                <td><zn-chip size="small" color="success">Active</zn-chip></td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                    <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                    <div>
                      <div>Michael Chen</div>
                      <div style="font-size: 12px; color: var(--zn-text-secondary);">michael@company.com</div>
                    </div>
                  </div>
                </td>
                <td><zn-chip size="small">Admin</zn-chip></td>
                <td><zn-chip size="small" color="success">Active</zn-chip></td>
                <td><zn-button size="x-small" color="transparent" icon="more_vert"></zn-button></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--zn-spacing-sm);">
                    <zn-icon src="account_circle" style="font-size: 32px;"></zn-icon>
                    <div>
                      <div>Emma Thompson</div>
                      <div style="font-size: 12px; color: var(--zn-text-secondary);">emma@company.com</div>
                    </div>
                  </div>
                </td>
                <td><zn-chip size="small">Member</zn-chip></td>
                <td><zn-chip size="small" color="warning">Pending</zn-chip></td>
                <td><zn-button size="x-small" color="transparent" icon="more_vert"></zn-button></td>
              </tr>
            </tbody>
          </table>
        </zn-data-table>
      </zn-sp>
    </zn-tabs>
  </zn-panel>
</zn-pane>
```

**Components demonstrated:** `zn-tabs`, `zn-navbar`, `zn-input`, `zn-textarea`, `zn-select`, `zn-option`, `zn-toggle`, `zn-file`, `zn-data-table`, `zn-panel`, `zn-item`, `zn-stat`, `zn-chip`, `zn-button`
