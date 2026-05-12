import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import type ZnNavbar from './navbar.component';

describe('<zn-navbar>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-navbar></zn-navbar> `);

    expect(el).to.exist;
  });

  describe('hide-one', () => {
    it('hides when only one item is present', async () => {
      const el = await fixture<ZnNavbar>(html`
        <zn-navbar hide-one>
          <li>Only</li>
        </zn-navbar>
      `);
      await aTimeout(0);

      expect(getComputedStyle(el).display).to.equal('none');
    });

    it('reveals when a second item is added dynamically', async () => {
      const el = await fixture<ZnNavbar>(html`
        <zn-navbar hide-one>
          <li>First</li>
        </zn-navbar>
      `);
      await aTimeout(0);
      expect(getComputedStyle(el).display).to.equal('none');

      const li = document.createElement('li');
      li.setAttribute('tab-uri', '/two');
      li.textContent = 'Second';
      el.addItem(li, false);
      await aTimeout(0);

      expect(getComputedStyle(el).display).to.not.equal('none');
    });

    it('hides again when items drop back to one', async () => {
      const el = await fixture<ZnNavbar>(html`
        <zn-navbar hide-one>
          <li>First</li>
        </zn-navbar>
      `);
      const second = document.createElement('li');
      second.setAttribute('tab-uri', '/two');
      second.textContent = 'Second';
      el.addItem(second, false);
      await aTimeout(0);
      expect(getComputedStyle(el).display).to.not.equal('none');

      second.remove();
      await aTimeout(0);

      expect(getComputedStyle(el).display).to.equal('none');
    });
  });
});
