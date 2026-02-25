import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnOption from '../option/option.component';
import type ZnSelect from './select.component';

describe('<zn-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-select></zn-select> `);

    expect(el).to.exist;
  });

  describe('search functionality', () => {
    let el: ZnSelect;

    beforeEach(async () => {
      el = await fixture<ZnSelect>(html`
        <zn-select search>
          <zn-option value="apple">Apple</zn-option>
          <zn-option value="banana">Banana</zn-option>
          <zn-option value="cherry">Cherry</zn-option>
          <zn-option value="date">Date</zn-option>
          <zn-option value="elderberry">Elderberry</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
    });

    it('should have the search attribute set', () => {
      expect(el.search).to.be.true;
      expect(el.hasAttribute('search')).to.be.true;
    });

    it('should have a readonly display input when closed', () => {
      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      expect(displayInput.readOnly).to.be.true;
    });

    it('should make the display input editable when opened', async () => {
      await el.show();
      await el.updateComplete;
      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      expect(displayInput.readOnly).to.be.false;
    });

    it('should filter options based on typed text', async () => {
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.value = 'app';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      const options = el.querySelectorAll<ZnOption>('zn-option');
      const visibleOptions = [...options].filter(o => !o.hidden);
      const hiddenOptions = [...options].filter(o => o.hidden);

      expect(visibleOptions.length).to.equal(1);
      expect(visibleOptions[0].value).to.equal('apple');
      expect(hiddenOptions.length).to.equal(4);
    });

    it('should show all options when search is cleared', async () => {
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;

      // Type to filter
      displayInput.value = 'app';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      // Clear the search
      displayInput.value = '';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      const options = el.querySelectorAll<ZnOption>('zn-option');
      const visibleOptions = [...options].filter(o => !o.hidden);
      expect(visibleOptions.length).to.equal(5);
    });

    it('should match against option values as well as labels', async () => {
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.value = 'elder';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      const options = el.querySelectorAll<ZnOption>('zn-option');
      const visibleOptions = [...options].filter(o => !o.hidden);

      expect(visibleOptions.length).to.equal(1);
      expect(visibleOptions[0].value).to.equal('elderberry');
    });

    it('should not show search text after dropdown closes', async () => {
      // Open and type a search query
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.value = 'ban';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      // Close the dropdown
      await el.hide();
      await el.updateComplete;

      // Display input should not show the search text (no value selected, so should be empty)
      expect(displayInput.value).to.not.equal('ban');
    });

    it('should restore all options visibility after closing', async () => {
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.value = 'app';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      // Close the dropdown
      await el.hide();
      await el.updateComplete;

      // All options should be visible again
      const options = el.querySelectorAll<ZnOption>('zn-option');
      const hiddenOptions = [...options].filter(o => o.hidden);
      expect(hiddenOptions.length).to.equal(0);
    });

    it('should be case-insensitive when filtering', async () => {
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.value = 'APPLE';
      displayInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      const options = el.querySelectorAll<ZnOption>('zn-option');
      const visibleOptions = [...options].filter(o => !o.hidden);

      expect(visibleOptions.length).to.equal(1);
      expect(visibleOptions[0].value).to.equal('apple');
    });
  });
});
