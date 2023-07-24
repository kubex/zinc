
import {html} from 'lit-html';

export default {
  title: 'Pages/Modules',
};

export const Default = () =>
  html`
    <style>
      body {
        overflow: auto;
      }
    </style>

    <app-container id="dest">
    </app-container>

    <div id="source" style="display: none">

      <zn-header max-width
                 caption="Mark Frederik Hanslanderbutterzlut"
                 navigation='[{"title": "Overview", "path": "#", "default":true}, {"title": "Section Title", "path": "#"}, {"title": "Section Title", "path": "#"}, {"title": "Section Title", "path": "#"}]'
                 breadcrumb='[{"title": "Home", "path": "#"}, {"title": "Customers", "path": "#"}, {"title": "Marko Frederik Hanslanderbutterzlut", "path": "#"}]'/>
      </zn-header>

      <zn-page caption="Overview">
        <div slot="side">

          <zn-panel caption="Customer Details">
            <zn-prop caption="First Name">Marko</zn-prop>
            <zn-prop caption="Last Name">Hanslanderbutterzlut</zn-prop>
            <zn-prop caption="Email">first.last@companyname.com</zn-prop>
            <zn-prop caption="Phone">+44 (0) 1962 21 31 00</zn-prop>
            <zn-prop caption="Billing Address">16 - 18 Barnes Wallis Road, Fareham, Hampshire, PO15 5TT, England
            </zn-prop>
          </zn-panel>

          <zn-panel caption="Additional Details">
            <zn-prop caption="Created">2019-06-03</zn-prop>
            <zn-prop caption="User ID">123 - 543 - 756</zn-prop>
            <zn-prop caption="Status">Active Customer</zn-prop>
            <zn-prop caption="Webshield Status">Installed</zn-prop>
            <zn-prop caption="Default Browser">Chrome v35</zn-prop>
            <zn-prop caption="Current Primary Pet">Dog - Poodle</zn-prop>
            <zn-prop caption="Insurance Provider">Aviva</zn-prop>
          </zn-panel>

          <zn-panel caption="Quick Actions">
            <zn-prop caption="Created">2019-06-03</zn-prop>
            <zn-prop caption="User ID">123 - 543 - 756</zn-prop>
            <zn-prop caption="Status">Active Customer</zn-prop>
            <zn-prop caption="Webshield Status">Installed</zn-prop>
            <zn-prop caption="Default Browser">Chrome v35</zn-prop>
            <zn-prop caption="Current Primary Pet">Dog - Poodle</zn-prop>
            <zn-prop caption="Insurance Provider">Aviva</zn-prop>
          </zn-panel>

        </div>

        <zn-panel caption="Subscriptions"
                  navigation='[{"title": "Overview", "path": "#", "default":true},{"title": "Successful", "path": "#"},{"title": "Declined", "path": "#"},{"title": "Captures", "path": "#"}]'>
          <zn-tile caption="Antivirus Webshield Pro - 12 Months" description="Renews - May 24th 2023">
            <zn-chip slot="status" success>active</zn-chip>
          </zn-tile>
          <zn-tile caption="Antivirus Webshield Pro - 12 Months" description="Renews - May 24th 2023">
            <zn-chip slot="status" success>active</zn-chip>
          </zn-tile>
        </zn-panel>

        <zn-panel caption="Billing"
                  navigation='[{"title": "Overview", "path": "#", "default":true},{"title": "Successful", "path": "#"},{"title": "Declined", "path": "#"},{"title": "Captures", "path": "#"}]'>
          <zn-tile caption="May 17th 2023 — $12.99" description="Invoice 123 - 543 - 756">
            <zn-chip slot="status" success>paid</zn-chip>
          </zn-tile>
          <zn-tile caption="May 17th 2023 — $12.99" description="Invoice 123 - 543 - 756">
            <zn-chip slot="status" success>paid</zn-chip>
          </zn-tile>
          <zn-tile caption="May 17th 2023 — $12.99" description="Invoice 123 - 543 - 756">
            <zn-chip slot="status" success>paid</zn-chip>
          </zn-tile>
          <span slot="footer">View  All &rarr;</span>
        </zn-panel>

        <zn-panel caption="Payment Methods"
                  navigation='[{"title": "Overview", "path": "#", "default":true},{"title": "Successful", "path": "#"},{"title": "Declined", "path": "#"},{"title": "Captures", "path": "#"}]'>
          <zn-tile caption="Visa •••• 2341 (Primary Method)" description="Expires - 31st May 2023">
            <zn-icon slot="primary" src="check" size="48" library="mio" style="--icon-size:32px;"></zn-icon>
            <zn-chip slot="status" success>active</zn-chip>
          </zn-tile>
          <zn-tile caption="Mastercard •••• 2341" description="Expires - 31st May 2023">
            <zn-chip slot="status" success>active</zn-chip>
          </zn-tile>
          <zn-tile caption="Visa •••• 2341" description="Expired - 31st January 2023">
            <zn-chip slot="status" error>expired</zn-chip>
          </zn-tile>
          <span slot="footer">View  All &rarr;</span>
        </zn-panel>

        <zn-panel caption="Latest Transactions"
                  navigation='[{"title": "Overview", "path": "#", "default":true},{"title": "Successful", "path": "#"},{"title": "Declined", "path": "#"},{"title": "Captures", "path": "#"}]'>
          <zn-tile caption="Capture (Paysafe UK)" description="876sfd-976sdf574-khbsdfc6r5">
            <zn-icon slot="primary" src="check" size="48" library="mio" style="--icon-size:32px;"></zn-icon>
            <zn-chip slot="status" success>active</zn-chip>
          </zn-tile>
          <zn-tile caption="Mastercard •••• 2341" description="Expires - 31st May 2023">
            <zn-chip slot="status" success>active</zn-chip>
          </zn-tile>
          <zn-tile caption="Visa •••• 2341" description="Expired - 31st January 2023">
            <zn-chip slot="status" error>expired</zn-chip>
          </zn-tile>
          <span slot="footer">View  All &rarr;</span>
        </zn-panel>

        <zn-panel caption="Latest Notes">
          <button slot="actions">Add a Note</button>

          <zn-note>
            <span slot="caption">by Mark Neale (CSA)</span>
            <span slot="date">May 24th 2023 @ 14:21</span>

            <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration
              in some form, by injected humour, or randomised words which don't look even slightly believable. If you
              are going to use a passage of Lorem Ipsum.</p>

            <p>Or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem
              Ipsum or randomised words which don't look even slightly believable.</p>
          </zn-note>

          <zn-note>
            <span slot="caption">by Mark Neale (CSA)</span>
            <span slot="date">May 24th 2023 @ 14:21</span>

            <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration
              in some form, by injected humour, or randomised words which don't look even slightly believable. If you
              are going to use a passage of Lorem Ipsum.</p>

            <p>Or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem
              Ipsum or randomised words which don't look even slightly believable.</p>
          </zn-note>

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