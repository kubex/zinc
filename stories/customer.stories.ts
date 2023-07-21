import {html} from 'lit-html';

export default {
  title: 'Pages/Customer',
};

export const Default = () =>
  html`
    <style>
      body {
        overflow: auto;
      }
    </style>

    <app-container id="dest"></app-container>

    <div id="source" style="display: none">
      <zn-header max-width caption="Welcome Back, Mark!" navigation='[{"title": "Transactions", "path": "#", "default":true},
            {"title": "Payments", "active":true, "path": "#"},
            {"title": "Refunds", "path": "#"}]'>
      </zn-header>

      <zn-page caption="Customer Details">
        <div slot="side">
          <div class="zn-gap-md">
            <zn-prop inline caption="User ID">#234 442 424</zn-prop>
            <zn-prop inline caption="ARR">$149.95</zn-prop>
            <zn-prop inline caption="First Subscribed">3 years ago</zn-prop>
            <zn-prop inline caption="Location">London, UK</zn-prop>
            <zn-prop inline caption="Status">Paid Customer</zn-prop>
          </div>
          <hr/>
          <div class="zn-gap-md">
            <zn-prop inline icon="email">gjbowers@companyname.com</zn-prop>
            <zn-prop inline icon="phone">0791 727 3829</zn-prop>
            <zn-prop inline icon="home">16-18 Barnes Wallis Road,<br/>Fareham, Hampshire,<br/>PO15 5TT
            </zn-prop>
          </div>
        </div>

        <zn-cols>
          <zn-panel stat single slot="c1">
            <zn-prop stack caption="MRR">$59.99</zn-prop>
          </zn-panel>
          <zn-panel stat single slot="c2">
            <zn-prop stack caption="LTV">$4,532.35</zn-prop>
          </zn-panel>
          <zn-panel stat single slot="c3">
            <zn-prop stack caption="Subscriptions">3</zn-prop>
          </zn-panel>
          <zn-panel stat single slot="c4">
            <zn-prop stack caption="Next Bill">Jan 24 2023</zn-prop>
          </zn-panel>
        </zn-cols>
        
        <zn-cols>
          <zn-panel slot="c1" rows="4" caption="Subscriptions">
            <zn-tile caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)">
              <zn-chip slot="primary" success>Paid</zn-chip>
            </zn-tile>
            <zn-tile child caption="Unlimited Devices" description="Renews 2024-01-06 (1 Year)"></zn-tile>
            <zn-tile caption="Domain Name" description="Renews 2024-01-06 (1 Year)">
              <zn-chip slot="primary" warning>Suspended</zn-chip>
            </zn-tile>
            <zn-tile caption="Awesome Stuff" description="Renews 2024-01-06 (1 Year)">
              <zn-chip slot="primary" error>Cancelled</zn-chip>
            </zn-tile>

            <span slot="footer">View All Subscriptions</span>

          </zn-panel>

          <zn-panel slot="c2" rows="4" caption="Billing" navigation='[{"title": "Transactions", "path": "/", "default":true},
            {"title": "Payments", "path": "/communication"}]'>


            <zn-tile caption="INV123-322-123 - $12.99" description="May 17 2022">
              <zn-chip slot="primary" success>Paid</zn-chip>
            </zn-tile>
            <zn-tile caption="INV123-322-123 - $12.99" description="May 17 2022">
              <zn-chip slot="primary" success>Paid</zn-chip>
            </zn-tile>
            <zn-tile caption="INV123-322-123 - $12.99" description="May 17 2022">
              <zn-chip slot="primary" success>Paid</zn-chip>
            </zn-tile>
            <zn-tile caption="INV123-322-123 - $12.99" description="May 17 2022">
              <zn-chip slot="primary" error>Refunded</zn-chip>
            </zn-tile>
            <span slot="footer">View Billing History</span>
          </zn-panel>

        </zn-cols>

        <zn-cols>
          <zn-panel slot="c1" caption="Payment Methods">

            <zn-tile caption="Visa **** 1234" description="Expires on 11/23">
              <zn-chip slot="primary" success>Active</zn-chip>
            </zn-tile>
            <zn-tile caption="PayPal Business" description="billybobbybob@gmail.com">
              <zn-chip slot="primary" success>Active</zn-chip>
            </zn-tile>
            <zn-tile caption="MasterCard **** 5428 " description="Expired 11/19">
              <zn-chip slot="primary" warning>Expired</zn-chip>
            </zn-tile>
            <span slot="footer">View All Payment Methods</span>

          </zn-panel>
          <zn-panel slot="c2" caption="Transactions">
            <zn-tile caption="Capture (PaySafe UK)" description="542svz4-df4q-asdf-4q25-asdfgfgcvb">
              <div slot="primary" class="text-center">
                <strong class="text-caption text-success">$12.99</strong><br/>
                <span class="text-xs leading-md">01/11/22 @ 12:21</span>
              </div>
              <zn-prop colspan="2" caption="Gateway">Paysafe</zn-prop>
              <zn-prop colspan="2" caption="Route">PCI-Bridge</zn-prop>
              <zn-prop caption="Merchant ID">i7 34i7 34i74</zn-prop>

            </zn-tile>
            <zn-tile caption="Authorization (PaySafe UK)" description="B-5EP36296PP286731M">
              <div slot="primary" class="text-center">
                <strong class="text-caption text-success">$12.99</strong><br/>
                <span class="text-xs leading-md">01/11/22 @ 12:20</span>
              </div>
            </zn-tile>
            <zn-tile caption="Authorization (PaySafe UK)" description="54K42815X50437241">
              <div slot="primary" class="text-center">
                <strong class="text-caption text-error">$12.99</strong><br/>
                <span class="text-xs leading-md">01/11/22 @ 12:20</span>
              </div>
            </zn-tile>
            <span slot="footer">View Transaction History</span>
          </zn-panel>
        </zn-cols>
        
        <zn-panel caption="Notes">
          <zn-tile caption="Mark Neale">
            Every interaction and change to a contact is recorded in this timeline. Each event is individually
            interactive, has easily scanned breadcrumbs, and live-links to any related contacts or
            collections.
          </zn-tile>

        </zn-panel>

      </zn-page>
    </div>

    <script>
      setTimeout(() =>
      {
        const dest = document.getElementById('dest');
        const source = document.getElementById('source');
        dest.innerHTML = source.innerHTML;
      }, 100);
    </script>
  `;