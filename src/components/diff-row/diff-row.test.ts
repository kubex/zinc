import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-diff-row>', () => {
  it('shows the item in both columns when unchanged', async () => {
    const el = await fixture(html`<zn-diff-row caption="Passing score"></zn-diff-row>`);

    const cells = el.shadowRoot!.querySelectorAll('[role="cell"]');
    expect(cells).to.have.length(2);
    expect(el.shadowRoot!.querySelector('.row__cell--absent')).to.not.exist;
    expect(el.shadowRoot!.querySelector('zn-chip')).to.not.exist;
  });

  it('labels a changed row in the newer column', async () => {
    const el = await fixture(html`<zn-diff-row caption="Passing score" change="changed"></zn-diff-row>`);

    const chip = el.shadowRoot!.querySelector('[part="after"] zn-chip');
    expect(chip?.textContent).to.equal('Changed');
    expect(chip?.getAttribute('type')).to.equal('info');
  });

  it('shows a placeholder on the side an added or removed item is missing from', async () => {
    const added = await fixture(html`<zn-diff-row caption="Tone" change="added"></zn-diff-row>`);
    const removed = await fixture(html`<zn-diff-row caption="Survey" change="removed" after-placeholder="Removed"></zn-diff-row>`);

    expect(added.shadowRoot!.querySelector('[part="before"]')!.classList.contains('row__cell--absent')).to.be.true;
    expect(added.shadowRoot!.querySelector('[part="before"]')!.textContent).to.contain('Not in this version');
    expect(removed.shadowRoot!.querySelector('[part="after"]')!.textContent).to.contain('Removed');
  });

  it('renders a heading across both columns', async () => {
    const el = await fixture(html`<zn-diff-row caption="Opening" heading></zn-diff-row>`);

    expect(el.shadowRoot!.querySelector('[role="rowheader"]')!.textContent).to.equal('Opening');
    expect(el.shadowRoot!.querySelectorAll('[role="cell"]')).to.have.length(0);
  });
});
