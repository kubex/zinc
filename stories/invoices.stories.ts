import {html} from 'lit-html';

export default {
  title: 'Pages/Invoices',
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
      <zn-header max-width caption="Invoices & Credit Notes" navigation='[{"title": "Invoices", "path": "/", "default":true},
            {"title": "Credit Notes", "path": "/communication"}]'>

      </zn-header>

      <zn-page caption="Invoices">

        <form>Filter Form Here</form>

        <zn-panel>
          <zn-tile caption="TXN-SDFG-GRS-4847" description="Credit Note ID" data-target="slide"
                   href="/chargehive/invoices">
            <zn-menu actions='[{"title": "Invoices", "path": "/", "default":true},
            {"title": "Credit Notes", "path": "/communication"},{"title": "Invoices", "path": "/", "default":true},
            {"title": "Credit Notes", "path": "/communication"}]'></zn-menu>
            <zn-chip slot="chip" warning>Refunded</zn-chip>

            <zn-prop colspan="2" caption="Amount">$123.43</zn-prop>
            <zn-prop caption="Reason">Subscription Chan fewgqwged</zn-prop>
            <zn-prop colspan="2" caption="Credit Note ID">12 Jun 2021</zn-prop>

          </zn-tile>
          <zn-tile caption="TXN-SDFG-GRS-48 XN-SDFG-GRS-48 XN-SDFG-GRS-4847" description="Credit Note ID">
            <zn-menu actions='[{"title": "Invoices",  "target":true},
            {"title": "Credit Notes", "path": "/communication"}]'></zn-menu>
            <zn-chip slot="chip" warning>Refunded</zn-chip>

            <zn-prop colspan="2" caption="Amount">$12333.43</zn-prop>
            <zn-prop caption="Reason">Subscription Changed</zn-prop>
            <zn-prop colspan="2" caption="Credit Note ID">12 Jun 2021</zn-prop>

          </zn-tile>
          <zn-tile caption="TXN-SDFG-GRS-4847" description="Credit Note ID">

            <zn-chip slot="chip" warning>Refunded</zn-chip>

            <zn-prop colspan="2" caption="Amount">$13.43</zn-prop>
            <zn-prop caption="Reason">n Changed</zn-prop>
            <zn-prop colspan="2" caption="Credit Note ID">12 Jun 2021</zn-prop>

          </zn-tile>
          <zn-tile caption="TXN-SDFG-GRS-4847" description="Credit Note ID">
            <zn-menu actions='[{"title": "Invoices", "path": "/", "default":true},
            {"title": "Credit Notes", "path": "/communication"}]'></zn-menu>
            <zn-chip slot="chip" warning>Refunded</zn-chip>

            <zn-prop colspan="2" caption="Amount">$1233232.43</zn-prop>
            <zn-prop caption="Reason">Subscription Changed</zn-prop>
            <zn-prop colspan="2" caption="Credit Note ID">12 Jun gs 2021</zn-prop>

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