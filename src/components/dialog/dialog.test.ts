import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-dialog>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-dialog></zn-dialog> `);

    expect(el).to.exist;
  });

  it('draws the footer divider and radius from the dialog tokens', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-dialog label="Refund" style="--zn-dialog-footer-divider: 1px solid rgb(1, 2, 3); --zn-dialog-border-radius: 9px">
        <p>Body</p>
        <button slot="footer">OK</button>
      </zn-dialog>`);
    await (el as HTMLElement & {updateComplete: Promise<boolean>}).updateComplete;
    const footer = el.shadowRoot!.querySelector('.dialog__footer')!;
    const dialog = el.shadowRoot!.querySelector('.dialog')!;

    expect(getComputedStyle(footer).borderTopColor).to.equal('rgb(1, 2, 3)');
    expect(getComputedStyle(dialog).borderTopLeftRadius).to.equal('9px');
  });
});
