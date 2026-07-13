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
});
