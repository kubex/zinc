import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-split-pane>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-split-pane></zn-split-pane> `);

    expect(el).to.exist;
  });

  it('should hide the secondary pane and disable the resizer', async () => {
    const el = await fixture(html`
      <zn-split-pane hide="secondary">
        <div slot="primary">Primary content</div>
        <div slot="secondary">Secondary content</div>
      </zn-split-pane>
    `);
    const primaryPane = el.shadowRoot?.querySelector('#primary-pane') as HTMLElement;
    const secondaryPane = el.shadowRoot?.querySelector('#secondary-pane') as HTMLElement;
    const resizer = el.shadowRoot?.querySelector('#resizer') as HTMLElement;

    expect(getComputedStyle(secondaryPane).maxWidth).to.equal('0px');
    expect(getComputedStyle(secondaryPane).visibility).to.equal('hidden');
    expect(getComputedStyle(secondaryPane).pointerEvents).to.equal('none');
    expect(getComputedStyle(resizer).display).to.equal('none');
    expect(getComputedStyle(primaryPane).maxWidth).to.equal('100%');
  });

  it('should hide the primary pane and disable the resizer', async () => {
    const el = await fixture(html`
      <zn-split-pane hide="primary">
        <div slot="primary">Primary content</div>
        <div slot="secondary">Secondary content</div>
      </zn-split-pane>
    `);
    const primaryPane = el.shadowRoot?.querySelector('#primary-pane') as HTMLElement;
    const secondaryPane = el.shadowRoot?.querySelector('#secondary-pane') as HTMLElement;
    const resizer = el.shadowRoot?.querySelector('#resizer') as HTMLElement;

    expect(getComputedStyle(primaryPane).maxWidth).to.equal('0px');
    expect(getComputedStyle(primaryPane).visibility).to.equal('hidden');
    expect(getComputedStyle(primaryPane).pointerEvents).to.equal('none');
    expect(getComputedStyle(resizer).display).to.equal('none');
    expect(getComputedStyle(secondaryPane).maxWidth).to.equal('100%');
  });

  it('should render split pane chrome when pane slots are provided', async () => {
    const el = await fixture(html`
      <zn-split-pane>
        <div slot="primary">Primary content</div>
        <div slot="secondary">Secondary content</div>
      </zn-split-pane>
    `);

    expect(el.shadowRoot?.querySelector('slot[name="primary"]')).to.exist;
    expect(el.shadowRoot?.querySelector('slot[name="secondary"]')).to.exist;
    expect(el.shadowRoot?.querySelector('#resizer')).to.exist;
  });
});
