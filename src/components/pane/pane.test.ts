import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-pane>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-pane></zn-pane> `);

    expect(el).to.exist;
  });

  it('only pulls direct child headers into the pane header area', async () => {
    const el = await fixture(html`
      <zn-pane>
        <zn-panel>
          <zn-tab caption="Overview">
            <zn-header caption="Nested Header"></zn-header>
          </zn-tab>
        </zn-panel>
      </zn-pane>
    `);

    const nestedHeader = el.querySelector('zn-header')!;

    expect(el.classList.contains('with-header')).to.equal(false);
    expect(nestedHeader.getAttribute('slot')).to.not.equal('top');
    expect(nestedHeader.parentElement?.tagName).to.equal('ZN-TAB');
  });

  it('pulls direct child headers into the pane header area', async () => {
    const el = await fixture(html`
      <zn-pane>
        <zn-header caption="Direct Header"></zn-header>
      </zn-pane>
    `);

    const directHeader = el.querySelector('zn-header')!;

    expect(el.classList.contains('with-header')).to.equal(true);
    expect(directHeader.getAttribute('slot')).to.equal('top');
  });
});
