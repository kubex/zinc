import {html} from 'lit-html';

export default {
  title: 'zn-alert',
};

export const Primary = () =>
  html`
      <zn-alert caption="Payment Successful" success closer continue-button="View Transaction" data-uri="/transactions">
          Lorem Ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
      </zn-alert>
  `;