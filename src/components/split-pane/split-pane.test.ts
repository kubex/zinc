import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnSplitPane from './split-pane.component';

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

  it('should keep the secondary pane above the configured percentage minimum', async () => {
    const el = await fixture<ZnSplitPane>(html`
      <zn-split-pane min-secondary-size="25" style="display: flex; width: 400px; height: 200px;">
        <div slot="primary">Primary content</div>
        <div slot="secondary">Secondary content</div>
      </zn-split-pane>
    `);
    const resizer = el.shadowRoot!.querySelector('#resizer')!;

    resizer.dispatchEvent(new MouseEvent('mousedown', {clientX: 0, bubbles: true}));
    window.dispatchEvent(new MouseEvent('mousemove', {clientX: 380, bubbles: true}));
    await el.updateComplete;
    window.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));

    expect((el.shadowRoot?.querySelector('style')?.textContent ?? '')).to.contain('--min-secondary-panel-size: 25%');
    expect((el.shadowRoot?.querySelector('style')?.textContent ?? '')).to.contain('--initial-size: 75%');
  });

  it('should keep the secondary pane above the configured pixel minimum', async () => {
    const el = await fixture<ZnSplitPane>(html`
      <zn-split-pane pixels min-secondary-size="125" style="display: flex; width: 400px; height: 200px;">
        <div slot="primary">Primary content</div>
        <div slot="secondary">Secondary content</div>
      </zn-split-pane>
    `);
    const resizer = el.shadowRoot!.querySelector('#resizer')!;

    resizer.dispatchEvent(new MouseEvent('mousedown', {clientX: 0, bubbles: true}));
    window.dispatchEvent(new MouseEvent('mousemove', {clientX: 350, bubbles: true}));
    await el.updateComplete;
    window.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));

    expect((el.shadowRoot?.querySelector('style')?.textContent ?? '')).to.contain('--min-secondary-panel-size: 125px');
    expect((el.shadowRoot?.querySelector('style')?.textContent ?? '')).to.contain('--initial-size: 275px');
  });
});
