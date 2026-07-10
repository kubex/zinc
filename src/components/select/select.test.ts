import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnOption from '../option/option.component';
import type ZnSelect from './select.component';

// The popup's ResizeObserver can emit a benign "loop completed with undelivered notifications"
// warning when the dropdown opens during layout-measuring tests. It's not a real error — ignore it
// so the test runner doesn't treat it as an uncaught exception (capture phase runs before the runner's).
window.addEventListener('error', (e: ErrorEvent) => {
  if (typeof e.message === 'string' && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

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

  describe('Escape key', () => {
    it('blurs the display input when dropdown is closed and Escape is pressed', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select></zn-select>`);
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      el.focus();
      await el.updateComplete;
      expect(el.shadowRoot!.activeElement).to.equal(displayInput);
      expect(el.open).to.be.false;

      displayInput.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.shadowRoot!.activeElement, 'display input should be blurred').to.not.equal(displayInput);
    });

  });

  describe('multiple + search layout', () => {
    const openWithTags = async (width: number) => {
      const el = await fixture<ZnSelect>(html`
        <zn-select search multiple max-options-visible="0" style="width: ${width}px;">
          <zn-option value="a" selected>Urgent</zn-option>
          <zn-option value="b" selected>Backend</zn-option>
          <zn-option value="c" selected>Frontend</zn-option>
          <zn-option value="d" selected>stetset</zn-option>
          <zn-option value="e" selected>another</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;
      return el.shadowRoot!.querySelector<HTMLElement>('.select__combobox')!;
    };

    it('grows to show all tags instead of clipping them when they wrap', async () => {
      const cb = await openWithTags(360);
      // scrollHeight > clientHeight would mean wrapped rows are clipped by the box.
      expect(cb.scrollHeight).to.equal(cb.clientHeight);
    });

    it('does not clip tags at very narrow widths', async () => {
      const cb = await openWithTags(180);
      expect(cb.scrollHeight).to.equal(cb.clientHeight);
    });

    it('shows a pointer cursor on a tag remove icon (even in search mode)', async () => {
      // In search/free-text mode the combobox uses cursor:text, which the chips would otherwise inherit.
      const el = await fixture<ZnSelect>(html`
        <zn-select multiple search>
          <zn-option value="a" selected>Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      const removeIcon = el.shadowRoot!.querySelector<HTMLElement>('.select__tags zn-icon[slot="action"]');
      expect(removeIcon, 'remove icon should exist').to.exist;
      // Only the remove X is clickable, so only it gets a pointer cursor...
      expect(getComputedStyle(removeIcon!).cursor).to.equal('pointer');
      // ...the chip body is not clickable, so it should not show a pointer.
      const chip = el.shadowRoot!.querySelector<HTMLElement>('.select__tags zn-chip')!;
      expect(getComputedStyle(chip).cursor).to.equal('default');
    });

    it('removes a value when the tag remove icon is clicked before any other interaction', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select multiple value="a b c">
          <zn-option value="a">Option 1</zn-option>
          <zn-option value="b">Option 2</zn-option>
          <zn-option value="c">Option 3</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      expect(el.value).to.deep.equal(['a', 'b', 'c']);

      let changed = false;
      el.addEventListener('zn-change', () => {
        changed = true;
      });

      const removeIcon = el.shadowRoot!.querySelector<HTMLElement>('.select__tags zn-icon[slot="action"]')!;
      removeIcon.click();
      await el.updateComplete;
      // handleValueChange runs as a @watch on the next update cycle; give it a beat
      await el.updateComplete;

      expect(el.value).to.deep.equal(['b', 'c']);
      expect(el.shadowRoot!.querySelectorAll('.select__tags zn-chip').length).to.equal(2);
      expect(changed).to.be.true;
    });
  });

  describe('free-text', () => {
    const type = (el: ZnSelect, text: string) => {
      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.value = text;
      displayInput.dispatchEvent(new Event('input'));
    };

    const pressEnter = (el: ZnSelect) => {
      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
    };

    it('commits typed text not in the list as the value on Enter', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      expect(el.value).to.equal('kiwi');
    });

    it('adds typed values as tags in multiple mode, keeping the dropdown open', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text multiple></zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      type(el, 'mango');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      expect(el.value).to.deep.equal(['kiwi', 'mango']);
      expect(el.open).to.be.true;
    });

    it('selects the existing option instead of creating a duplicate on exact match', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'Apple'); // case-insensitive match of the existing label
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      expect(el.value).to.equal('apple');
      expect(el.querySelectorAll('zn-option').length).to.equal(1);
      expect(el.querySelector('[data-free-text]')).to.be.null;
    });

    it('shows an Add row for non-matching text and commits it on click', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;

      const addRow = el.shadowRoot!.querySelector<HTMLElement>('.select__add-option');
      expect(addRow, 'Add row should be visible for non-matching text').to.exist;

      addRow!.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, composed: true, cancelable: true}));
      addRow!.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, composed: true}));
      await el.updateComplete;

      expect(el.value).to.equal('kiwi');
    });

    it('commits the Add row on click without also selecting an option', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text multiple>
          <zn-option value="apple">Apple</zn-option>
          <zn-option value="banana">Banana</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      // "ap" filters to Apple (still visible) and offers Add "ap" at the top of the listbox
      type(el, 'ap');
      await el.updateComplete;

      const addRow = el.shadowRoot!.querySelector<HTMLElement>('.select__add-option')!;
      addRow.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, composed: true, cancelable: true}));
      await el.updateComplete;

      // The mouseup hits whatever now sits under the cursor. If committing on mousedown removed the Add
      // row (the bug), the first option shifts up into that spot and would be wrongly selected on mouseup.
      const underCursor = el.shadowRoot!.querySelector<HTMLElement>('.select__add-option')
        ?? el.querySelector<HTMLElement>('zn-option');
      underCursor!.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, composed: true}));
      await el.updateComplete;

      // Only the typed value is committed — the first option ("apple") must not be selected too
      expect(el.value).to.deep.equal(['ap']);
    });

    it('keeps the Add row text in sync as the user keeps typing', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'te');
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.select__add-option')!.textContent!.trim())
        .to.equal('Add "te"');

      // Continue typing without crossing the match/no-match boundary
      type(el, 'testssdfs');
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.select__add-option')!.textContent!.trim())
        .to.equal('Add "testssdfs"');
    });

    it('does not show the Add row when the text exactly matches an option', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'Apple');
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('.select__add-option')).to.be.null;
    });

    it('commits pending typed text when the dropdown closes', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select free-text></zn-select>`);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;

      await el.hide();
      await el.updateComplete;

      expect(el.value).to.equal('kiwi');
    });

    it('removes the backing option from the DOM when a custom tag is removed', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select free-text multiple></zn-select>`);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      expect(el.querySelectorAll('[data-free-text]').length).to.equal(1);

      const chip = el.shadowRoot!.querySelector('.select__tags zn-chip')!;
      chip.dispatchEvent(new CustomEvent('zn-remove', {bubbles: true, composed: true}));
      await el.updateComplete;

      expect(el.querySelectorAll('[data-free-text]').length).to.equal(0);
      expect(el.value).to.deep.equal([]);
    });

    it('materialises an unmatched initial value as a custom option', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text value="custom-thing">
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;

      expect(el.value).to.equal('custom-thing');
      const created = el.querySelector('[data-free-text]');
      expect(created, 'a backing option should be created').to.exist;
      expect(created!.getAttribute('value')).to.equal('custom-thing');
      expect(el.displayLabel).to.equal('custom-thing');
    });

    it('does not add a duplicate when the same custom value is committed twice', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select free-text multiple></zn-select>`);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      expect(el.value).to.deep.equal(['kiwi']);
      expect(el.querySelectorAll('[data-free-text]').length).to.equal(1);
    });

    it('enables an editable, filtering input on its own (without search)', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
          <zn-option value="banana">Banana</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      expect(displayInput.readOnly).to.be.false;

      type(el, 'app');
      await el.updateComplete;

      const visible = [...el.querySelectorAll<ZnOption>('zn-option')].filter(o => !o.hidden);
      expect(visible.map(o => o.value)).to.deep.equal(['apple']);
    });

    it('submits committed free-text values as form data', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <zn-select name="fruits" free-text multiple></zn-select>
        </form>
      `);
      const el = form.querySelector<ZnSelect>('zn-select')!;
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      type(el, 'mango');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      const formData = new FormData(form);
      expect(formData.getAll('fruits')).to.deep.equal(['kiwi', 'mango']);
    });

    it('cancels uncommitted free-text on Escape instead of committing it', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select free-text></zn-select>`);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;

      const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      displayInput.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.value).to.equal('');
    });

    it('removes a previous custom entry when a different option is selected (single)', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;
      expect(el.value).to.equal('kiwi');
      expect(el.querySelectorAll('[data-free-text]').length).to.equal(1);

      // Reopen and pick a real option
      await el.show();
      await el.updateComplete;
      const apple = el.querySelector<ZnOption>('zn-option[value="apple"]')!;
      apple.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, composed: true}));
      await el.updateComplete;

      expect(el.value).to.equal('apple');
      expect(el.querySelectorAll('[data-free-text]').length).to.equal(0);
    });

    it('shows a committed custom option as a selected row in the listbox', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;

      // Reopen the dropdown
      await el.show();
      await el.updateComplete;

      const custom = el.querySelector<ZnOption>('[data-free-text]')!;
      expect(custom, 'custom option should exist').to.exist;
      expect(custom.hidden, 'custom option should be visible so it can be deselected').to.be.false;
      expect(custom.selected, 'custom option should be selected').to.be.true;
    });

    it('removes a committed custom option when it is deselected from the dropdown', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select free-text multiple></zn-select>`);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;
      expect(el.value).to.deep.equal(['kiwi']);

      // Click the custom option's row in the listbox to deselect it
      const custom = el.querySelector<ZnOption>('[data-free-text]')!;
      custom.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, composed: true}));
      await el.updateComplete;

      expect(el.value).to.deep.equal([]);
      expect(el.querySelectorAll('[data-free-text]').length).to.equal(0);
    });

    it('can re-add a free-text value after it was removed', async () => {
      const el = await fixture<ZnSelect>(html`<zn-select free-text multiple></zn-select>`);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      // Add "foo"
      type(el, 'foo');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;
      expect(el.value).to.deep.equal(['foo']);

      // Remove it via the tag's remove button
      const chip = el.shadowRoot!.querySelector('.select__tags zn-chip')!;
      chip.dispatchEvent(new CustomEvent('zn-remove', {bubbles: true, composed: true}));
      await el.updateComplete;
      expect(el.value).to.deep.equal([]);
      expect(el.querySelectorAll('[data-free-text]').length).to.equal(0);

      // Add the same value again
      type(el, 'foo');
      await el.updateComplete;
      pressEnter(el);
      await el.updateComplete;
      expect(el.value).to.deep.equal(['foo']);
      expect(el.querySelectorAll('[data-free-text]').length).to.equal(1);
    });

    it('does not put the "N selected" summary in the input placeholder in multiple mode', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text multiple>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      // Select an option — in multiple+search the dropdown stays open
      const apple = el.querySelector<ZnOption>('zn-option[value="apple"]')!;
      apple.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, composed: true}));
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      // The tags convey the selection; the input placeholder must not also show "1 option selected"
      expect(input.placeholder).to.equal('');
    });

    it('lets keyboard navigation reach the Add row over a closer-matching option', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text>
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'app'); // matches Apple AND offers Add "app"
      await el.updateComplete;

      // ArrowDown highlights the Add row (it sits at the top of the list)
      const input = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      // Enter commits the typed value, not the matching option
      pressEnter(el);
      await el.updateComplete;

      expect(el.value).to.equal('app');
    });

    it('renders the Add row text at the small option font size', async () => {
      const el = await fixture<ZnSelect>(html`
        <zn-select free-text style="--zn-font-size-small: 11px; --zn-font-size-medium: 99px;">
          <zn-option value="apple">Apple</zn-option>
        </zn-select>
      `);
      await el.updateComplete;
      await el.show();
      await el.updateComplete;

      type(el, 'kiwi');
      await el.updateComplete;

      const addRow = el.shadowRoot!.querySelector<HTMLElement>('.select__add-option')!;
      expect(getComputedStyle(addRow).fontSize).to.equal('11px');
    });
  });
});
