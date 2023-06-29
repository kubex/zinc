import {html} from 'lit-html';

export default {
  title: 'columns',
};

export const Primary = () =>
  html`
      <style>
          body {
              overflow: auto;
          }
      </style>

      <app-container id="dest">
      </app-container>

      <div id="source" style="display: none">

          <zn-page>
              <zn-panel>
                  <br/><br/>
                  <br/><br/>
                  <div class="text-center">Bar chart of customer growth / revenue</div>

                  <br/><br/>
                  <br/><br/>
              </zn-panel>

              <zn-cols>
                  <zn-panel slot="c1" stat single>
                      <zn-prop stack caption="Total Customers">25,134,775</zn-prop>
                  </zn-panel>
                  <zn-panel slot="c2" stat single>
                      <zn-prop stack caption="New Customers">24,145</zn-prop>
                  </zn-panel>
                  <zn-panel slot="c3" stat single>
                      <zn-prop stack caption="Churned">4,171</zn-prop>
                  </zn-panel>
                  <zn-panel slot="c4" stat single>
                      <zn-prop stack caption="Revenue">$5,337,571</zn-prop>
                  </zn-panel>
              </zn-cols>


              <zn-cols layout="111" min="360">
                  <zn-panel slot="c1" single caption="Processor Share">
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">BRAINTREE</span>
                      </zn-tile>
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">STRIPE</span>
                      </zn-tile>
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">PAYPAL</span>
                      </zn-tile>
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">WORLDPAY</span>
                      </zn-tile>
                  </zn-panel>
                  <zn-panel slot="c2" single caption="Network Share">

                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">VISA</span>
                      </zn-tile>
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">MASTER CARD</span>
                      </zn-tile>
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">AMEX</span>
                      </zn-tile>
                      <zn-tile caption="258,101" description="30%" right>
                          <span slot="primary">DISCOVER</span>
                      </zn-tile>
                  </zn-panel>

                  <zn-panel slot="c3" caption="Transactions Overview">

                      <zn-tile right caption="$434,234.32" description="9% of Revenue">
                          <div slot="primary">
                              <strong class="text-caption text-secondary-500">Transaction Cost</strong><br/>
                              <span class="text-xs leading-md">As % of Revenue</span>
                          </div>

                          <zn-prop colspan="2" caption="Amount">$12333.43</zn-prop>
                          <zn-prop caption="Reason">Subscription Changed</zn-prop>
                          <zn-prop colspan="2" caption="Credit Note ID">12 Jun 2021</zn-prop>
                      </zn-tile>

                      <zn-tile right caption="4.2%" description="Stripe">
                          <div slot="primary">
                              <strong class="text-caption text-secondary-500">Highest Fee</strong><br/>
                              <span class="text-xs leading-md">by Gateway</span>
                          </div>

                          <zn-prop colspan="2" caption="Amount">$12333.43</zn-prop>
                          <zn-prop caption="Reason">Subscription Changed</zn-prop>
                          <zn-prop colspan="2" caption="Credit Note ID">12 Jun 2021</zn-prop>
                      </zn-tile>

                      <zn-tile right caption="$434,234.32" description="9% of Revenue">
                          <div slot="primary">
                              <strong class="text-caption text-secondary-500">Transaction Cost</strong><br/>
                              <span class="text-xs leading-md">As % of Revenue</span>
                          </div>

                      </zn-tile>
                      <zn-tile right caption="4.2%" description="Stripe">
                          <div slot="primary">
                              <strong class="text-caption text-secondary-500">Highest Fee</strong><br/>
                              <span class="text-xs leading-md">by Gateway</span>
                          </div>
                      </zn-tile>

                  </zn-panel>


              </zn-cols>
          </zn-page>

      </div>

      <script>
          setTimeout(() => {
              const dest = document.getElementById('dest');
              const source = document.getElementById('source');
              dest.innerHTML = source.innerHTML;
          }, 100);
      </script>
  `;