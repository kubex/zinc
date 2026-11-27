import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import type ZnSplitButton from './split-button.component';

describe('<zn-split-button>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-split-button></zn-split-button> `);

    expect(el).to.exist;
  });

  it('anchors the menu to a custom trigger with a box', async () => {
    const el = await fixture<ZnSplitButton>(html`
      <zn-split-button>
        <zn-button-group slot="trigger">
          <zn-button>Accept</zn-button>
          <zn-button icon="chevron-down@lu" label="More options"></zn-button>
        </zn-button-group>
        <zn-menu slot="menu"><zn-menu-item>Accept all</zn-menu-item></zn-menu>
      </zn-split-button>
    `);
    await el.updateComplete;

    const anchor = el.shadowRoot!.querySelector<HTMLElement>('[slot="trigger"]')!;
    expect(anchor.getBoundingClientRect().width).to.be.greaterThan(0);
  });

  for (const custom of [false, true]) {
    it(`opens the menu from the caret only${custom ? ', with a custom trigger' : ''}`, async () => {
      const el = await fixture<ZnSplitButton>(custom ? html`
        <zn-split-button>
          <zn-button-group slot="trigger">
            <zn-button>Accept</zn-button>
            <zn-button icon="chevron-down@lu" label="More options"></zn-button>
          </zn-button-group>
          <zn-menu slot="menu"><zn-menu-item>Accept all</zn-menu-item></zn-menu>
        </zn-split-button>` : html`
        <zn-split-button caption="Send" value="send">
          <zn-menu slot="menu"><zn-menu-item value="later">Send later</zn-menu-item></zn-menu>
        </zn-split-button>`);
      await el.updateComplete;
      const buttons = Array.from((custom ? el : el.shadowRoot!).querySelectorAll<HTMLElement>('zn-button'));
      const press = (target: HTMLElement) => (target.shadowRoot!.querySelector<HTMLElement>('[part~="base"]') ?? target).click();

      press(buttons[0]);
      await aTimeout(50);
      expect(el.dropdown.open, 'the main button keeps the menu shut').to.be.false;

      press(buttons[1]);
      await aTimeout(50);
      expect(el.dropdown.open, 'the caret opens it').to.be.true;
    });
  }
});
