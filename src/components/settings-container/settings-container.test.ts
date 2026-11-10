import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-settings-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-settings-container></zn-settings-container> `);

    expect(el).to.exist;
  });

  describe('pull tab', () => {
    it('should render a pull tab instead of the dropdown', async () => {
      const el = await fixture<HTMLElement>(html` <zn-settings-container pull-tab></zn-settings-container> `);

      expect(el.shadowRoot!.querySelector('.pull-tab')).to.exist;
      expect(el.shadowRoot!.querySelector('zn-dropdown')).to.not.exist;
    });

    it('should open and close when the tab is clicked', async () => {
      const el = await fixture<HTMLElement>(html` <zn-settings-container pull-tab></zn-settings-container> `);
      const tab = el.shadowRoot!.querySelector<HTMLButtonElement>('.pull-tab__tab')!;

      tab.click();
      await (el as any).updateComplete;
      expect(el.hasAttribute('open')).to.be.true;

      tab.click();
      await (el as any).updateComplete;
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('should close when clicking outside', async () => {
      const el = await fixture<HTMLElement>(html` <zn-settings-container pull-tab></zn-settings-container> `);
      const tab = el.shadowRoot!.querySelector<HTMLButtonElement>('.pull-tab__tab')!;

      tab.click();
      await (el as any).updateComplete;
      expect(el.hasAttribute('open')).to.be.true;

      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
      await (el as any).updateComplete;
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('isolated navbar', () => {
    it('hides the items for the selected tab and shows them all again', async () => {
      const el = await fixture<HTMLElement>(html`
        <zn-settings-container no-settings no-scroll>
          <zn-navbar isolated
                     navigation='[{"tab":"","title":"All"},{"tab":"read","title":"Unread"}]'></zn-navbar>
          <div slot="filter" attribute="read" default="true">Read</div>
          <p id="fresh">Unread</p>
          <p id="seen" read>Read</p>
        </zn-settings-container>`);
      const navbar = el.querySelector<HTMLElement & {updateComplete: Promise<unknown>}>('zn-navbar')!;
      await navbar.updateComplete;
      const tabs = navbar.shadowRoot!.querySelectorAll<HTMLElement>('li[data-tab]');

      expect(el.shadowRoot!.querySelector('zn-dropdown')).to.not.exist;

      tabs[1].click();
      await navbar.updateComplete;
      expect(el.querySelector('#seen')!.hasAttribute('hidden')).to.be.true;
      expect(el.querySelector('#fresh')!.hasAttribute('hidden')).to.be.false;
      expect(navbar.shadowRoot!.querySelectorAll('li[data-tab]')[1].classList.contains('active')).to.be.true;

      tabs[0].click();
      await navbar.updateComplete;
      expect(el.querySelector('#seen')!.hasAttribute('hidden')).to.be.false;
    });
  });
});
