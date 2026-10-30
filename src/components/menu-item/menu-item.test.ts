import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnDropdown from '../dropdown/dropdown.component';

describe('<zn-menu-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-menu-item></zn-menu-item> `);

    expect(el).to.exist;
  });

  describe('keep-open', () => {
    async function dropdownWithItems() {
      const el = await fixture<ZnDropdown>(html`
        <zn-dropdown>
          <zn-button slot="trigger">Open</zn-button>
          <zn-menu>
            <zn-menu-item value="keeper" keep-open>Keeper</zn-menu-item>
            <zn-menu-item value="closer">Closer</zn-menu-item>
          </zn-menu>
        </zn-dropdown>`);
      await el.updateComplete;
      await el.show();
      return el;
    }

    const clickOn = (el: Element | null) =>
      el?.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

    it('leaves the dropdown open when the item is selected', async () => {
      const dropdown = await dropdownWithItems();

      clickOn(dropdown.querySelector('zn-menu-item[value="keeper"]'));
      await dropdown.updateComplete;

      expect(dropdown.open).to.be.true;
    });

    it('does not affect the items beside it', async () => {
      const dropdown = await dropdownWithItems();

      clickOn(dropdown.querySelector('zn-menu-item[value="closer"]'));

      await waitUntil(() => !dropdown.open);
      expect(dropdown.open).to.be.false;
    });
  });
});
