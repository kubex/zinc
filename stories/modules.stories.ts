
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
                 navigation='[{"title": "Overview", "path": "/", "default":true}, {"title": "Section Title", "path": "#"}, {"title": "Section Title", "path": "#"}, {"title": "Section Title", "path": "#"}]'
                 breadcrumb='[{"title": "Transactions", "path": "/"}, {"title": "Payments", "path": "/communication"}, {"title": "Refunds", "path": "/communication"}]'/>
      </zn-header>

      <zn-page caption="Overview">
        <div slot="side">
          <zn-panel caption="Customer Details">
            <zn-prop inline caption="User ID">#234 442 424</zn-prop>
            <zn-prop inline caption="ARR">$149.95</zn-prop>
            <zn-prop inline caption="First Subscribed">3 years ago</zn-prop>
            <zn-prop inline caption="Location">London, UK</zn-prop>
            <zn-prop inline caption="Status">Paid Customer</zn-prop>
            <hr/>
            <zn-prop inline icon="email">gjbowers@companyname.com</zn-prop>
            <zn-prop inline icon="phone">0791 727 3829</zn-prop>
            <zn-prop inline icon="home">16-18 Barnes Wallis Road,<br/>Fareham, Hampshire,<br/>PO15 5TT
            </zn-prop>
          </zn-panel>
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

        <zn-panel rows="4" caption="Subscriptions"
                  navigation='[{"title": "Transactions", "path": "/", "default":true},{"title": "Payments", "path": "/communication"}]'>

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
          
          <span slot="footer">View  All &rarr;</span>
          
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