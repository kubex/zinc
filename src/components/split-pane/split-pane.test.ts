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

  it('merges immediate nested split pane navigation into the parent navigation', async () => {
    const el = await fixture<ZnSplitPane>(html`
      <zn-split-pane primary-caption="List" secondary-caption="Workspace">
        <div slot="primary">List content</div>
        <div slot="secondary">
          <zn-split-pane primary-caption="Preview" secondary-caption="Details">
            <div slot="primary">Preview content</div>
            <div slot="secondary">Details content</div>
          </zn-split-pane>
        </div>
      </zn-split-pane>
    `);
    const nested = el.querySelector<ZnSplitPane>('zn-split-pane')!;
    const navItems = Array.from(el.shadowRoot!.querySelectorAll('#split-nav li'));

    expect(nested.hasAttribute('merged-navigation')).to.equal(true);
    expect(navItems.map(item => item.textContent?.trim())).to.deep.equal(['List', 'Preview', 'Details']);

    (navItems[2] as HTMLElement).click();
    await el.updateComplete;
    await nested.updateComplete;

    expect(el.getAttribute('focus-pane')).to.equal('1');
    expect(nested.getAttribute('focus-pane')).to.equal('1');
  });

  it('keeps nested split pane navigation visible when the parent does not merge navigation', async () => {
    const el = await fixture<ZnSplitPane>(html`
      <zn-split-pane vertical>
        <div slot="primary">
          <zn-split-pane primary-caption="Preview" secondary-caption="Details">
            <div slot="primary">Preview content</div>
            <div slot="secondary">Details content</div>
          </zn-split-pane>
        </div>
        <div slot="secondary">Bottom content</div>
      </zn-split-pane>
    `);
    const nested = el.querySelector<ZnSplitPane>('zn-split-pane')!;

    expect(nested.hasAttribute('merged-navigation')).to.equal(false);
  });

  it('recursively merges nested split pane navigation', async () => {
    const el = await fixture<ZnSplitPane>(html`
      <zn-split-pane primary-caption="List" secondary-caption="Workspace">
        <div slot="primary">List content</div>
        <div slot="secondary">
          <zn-split-pane primary-caption="Preview" secondary-caption="Details">
            <div slot="primary">Preview content</div>
            <div slot="secondary">
              <zn-split-pane primary-caption="Data" secondary-caption="Settings">
                <div slot="primary">Data content</div>
                <div slot="secondary">Settings content</div>
              </zn-split-pane>
            </div>
          </zn-split-pane>
        </div>
      </zn-split-pane>
    `);
    const nested = el.querySelector<ZnSplitPane>('zn-split-pane')!;
    const deepNested = nested.querySelector<ZnSplitPane>('zn-split-pane')!;
    const navItems = Array.from(el.shadowRoot!.querySelectorAll('#split-nav li'));

    expect(deepNested.hasAttribute('merged-navigation')).to.equal(true);
    expect(navItems.map(item => item.textContent?.trim())).to.deep.equal(['List', 'Preview', 'Data', 'Settings']);

    (navItems[3] as HTMLElement).click();
    await el.updateComplete;
    await nested.updateComplete;
    await deepNested.updateComplete;

    expect(el.getAttribute('focus-pane')).to.equal('1');
    expect(nested.getAttribute('focus-pane')).to.equal('1');
    expect(deepNested.getAttribute('focus-pane')).to.equal('1');
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
