import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
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
});
