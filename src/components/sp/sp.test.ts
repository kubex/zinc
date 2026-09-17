import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-sp>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-sp></zn-sp> `);

    expect(el).to.exist;
  });

  it('should lay out through a form that wraps the whole panel', async () => {
    const parent = await fixture(html`
      <div style="display: flex; flex-direction: column; height: 400px; width: 600px;">
        <zn-sp grow flush>
          <form>
            <div id="panel" style="height: 100%;">Content</div>
          </form>
        </zn-sp>
      </div>
    `);

    const form = parent.querySelector('form')!;
    expect(getComputedStyle(form).display).to.equal('contents');
    expect(parent.querySelector<HTMLElement>('#panel')!.getBoundingClientRect().height).to.equal(400);
  });

  it('should leave a form that shares the panel with siblings alone', async () => {
    const parent = await fixture(html`
      <div style="display: flex; flex-direction: column; height: 400px;">
        <zn-sp grow>
          <h2>Heading</h2>
          <form>
            <div>Content</div>
          </form>
        </zn-sp>
      </div>
    `);

    expect(getComputedStyle(parent.querySelector('form')!).display).to.equal('block');
  });

  it('should fill its parent container height', async () => {
    const parent = await fixture(html`
      <div style="height: 300px;">
        <zn-sp>
          <div>Content</div>
        </zn-sp>
      </div>
    `);
    const el = parent.querySelector('zn-sp')!;
    const base = el.shadowRoot!.querySelector('[part="base"]')!;

    expect(el.getBoundingClientRect().height).to.equal(300);
    expect(base.getBoundingClientRect().height).to.equal(300);
  });
});
