import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnConfirm from '../confirm/confirm.component';
import type ZnDropdown from '../dropdown/dropdown.component';
import type ZnMenuItem from './menu-item.component';

describe('<zn-menu-item>', () => {
  it('should show its shortcut as a key cap only when set', async () => {
    const el = await fixture<ZnMenuItem>(html`<zn-menu-item>Send email</zn-menu-item>`);
    expect(el.shadowRoot!.querySelector('[part="shortcut"]')).to.be.null;

    el.shortcut = 'E';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="shortcut"]')!.textContent).to.equal('E');
  });

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

  it('closes its dropdown once the confirm dialog closes', async () => {
    const dropdown = await fixture<ZnDropdown>(html`
      <zn-dropdown>
        <zn-button slot="trigger">Open</zn-button>
        <zn-menu>
          <zn-confirm trigger="delete-item" content="Delete?"></zn-confirm>
          <zn-menu-item id="delete-item" confirm>Delete</zn-menu-item>
        </zn-menu>
      </zn-dropdown>`);
    await dropdown.show();
    const confirm = dropdown.querySelector<ZnConfirm>('zn-confirm')!;

    dropdown.querySelector('zn-menu-item')!.click();
    await dropdown.updateComplete;
    expect(dropdown.open).to.be.true;

    confirm.hide();
    await waitUntil(() => !dropdown.open);
  });

  it('opens a submenu beside its item when it overflows the parent menu', async () => {
    const dropdown = await fixture<ZnDropdown>(html`
      <zn-dropdown>
        <zn-button slot="trigger">Support</zn-button>
        <zn-menu>
          <zn-menu-item>Interactions</zn-menu-item>
          <zn-menu-item>Nova</zn-menu-item>
          <zn-menu-item>
            Quality Assurance
            <zn-menu slot="submenu">
              <zn-menu-item>Fails</zn-menu-item>
              <zn-menu-item>Questions</zn-menu-item>
              <zn-menu-item>Assessments</zn-menu-item>
              <zn-menu-item>Calibration</zn-menu-item>
            </zn-menu>
          </zn-menu-item>
          <zn-menu-item>Tickets</zn-menu-item>
        </zn-menu>
      </zn-dropdown>`);
    await dropdown.show();

    const item = dropdown.querySelector<ZnMenuItem>('zn-menu-item:nth-child(3)')!;
    item.dispatchEvent(new MouseEvent('mouseover', {bubbles: true, composed: true}));
    const popup = item.shadowRoot!.querySelector('zn-popup')!;
    await waitUntil(() => popup.hasAttribute('data-current-placement'));

    expect(popup.getAttribute('data-current-placement')).to.equal('right-start');
  });

  it('opens a submenu beside its item inside a scrolling panel that is not a popup', async () => {
    const panel = await fixture<HTMLElement>(html`
      <div style="overflow: auto; width: 240px; margin-left: 300px;">
        <zn-menu>
          <zn-menu-item>Interactions</zn-menu-item>
          <zn-menu-item>Nova</zn-menu-item>
          <zn-menu-item>
            Quality Assurance
            <zn-menu slot="submenu">
              <zn-menu-item>Fails</zn-menu-item>
              <zn-menu-item>Questions</zn-menu-item>
              <zn-menu-item>Assessments</zn-menu-item>
              <zn-menu-item>Calibration</zn-menu-item>
            </zn-menu>
          </zn-menu-item>
          <zn-menu-item>Tickets</zn-menu-item>
        </zn-menu>
      </div>`);

    const item = panel.querySelector<ZnMenuItem>('zn-menu-item:nth-child(3)')!;
    item.dispatchEvent(new MouseEvent('mouseover', {bubbles: true, composed: true}));
    const popup = item.shadowRoot!.querySelector('zn-popup')!;
    await waitUntil(() => popup.hasAttribute('data-current-placement'));

    expect(popup.getAttribute('data-current-placement')).to.equal('right-start');
  });
});
