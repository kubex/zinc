import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-button-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-button-group></zn-button-group> `);

    expect(el).to.exist;
  });

  it('marks slotted buttons with panel-bg and clears it when removed', async () => {
    const el = await fixture<HTMLElement & {panelBackground: boolean; updateComplete: Promise<boolean>}>(html`
      <zn-button-group panel-bg>
        <zn-button>One</zn-button>
        <zn-button>Two</zn-button>
      </zn-button-group>
    `);
    await el.updateComplete;
    const buttons = [...el.querySelectorAll('zn-button')];

    expect(buttons.every(b => b.hasAttribute('data-zn-button-group__button--panel-bg'))).to.be.true;

    el.panelBackground = false;
    await el.updateComplete;

    expect(buttons.some(b => b.hasAttribute('data-zn-button-group__button--panel-bg'))).to.be.false;
  });
});
