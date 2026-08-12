import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnSlashMenu from '../slash-menu/slash-menu.component';
import type ZnTextarea from './textarea.component';

/** Types `text` into the field the way a user would, leaving the caret at the end. */
function type(el: ZnTextarea, text: string) {
  const field = el.input;
  field.value = text;
  field.setSelectionRange(text.length, text.length);
  field.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
}

function press(el: ZnTextarea, key: string) {
  const event = new KeyboardEvent('keydown', {key, bubbles: true, composed: true, cancelable: true});
  el.input.dispatchEvent(event);
  return event;
}

/**
 * A real key press, keyup included — the menu has to survive the caret checks that run on it.
 * Item resolution is async, so this settles anything the keyup kicked off before returning.
 */
async function pressAndRelease(el: ZnTextarea, key: string) {
  press(el, key);
  el.input.dispatchEvent(new KeyboardEvent('keyup', {key, bubbles: true, composed: true}));

  await aTimeout(0);
  await el.updateComplete;
  await slashMenuOf(el)?.updateComplete;
}

function slashMenuOf(el: ZnTextarea) {
  return el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu');
}

function menuItemLabels(menu: ZnSlashMenu) {
  return [...menu.shadowRoot!.querySelectorAll('.slash-menu__label')].map(item => item.textContent?.trim());
}

async function openSlashMenu(el: ZnTextarea, text = '/') {
  el.focus();
  type(el, text);
  await waitUntil(() => slashMenuOf(el)?.open, 'the slash menu never opened');

  return slashMenuOf(el)!;
}

describe('<zn-textarea>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-textarea></zn-textarea> `);

    expect(el).to.exist;
  });

  describe('Escape key', () => {
    it('blurs the inner textarea and stops propagation when focused', async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <zn-textarea></zn-textarea>
        </div>
      `);
      const el = wrapper.querySelector<ZnTextarea>('zn-textarea')!;
      await el.updateComplete;

      let wrapperEscapes = 0;
      wrapper.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') wrapperEscapes++;
      });

      el.focus();
      await el.updateComplete;
      expect(el.shadowRoot!.activeElement).to.equal(el.input);

      el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.shadowRoot!.activeElement, 'inner textarea should be blurred').to.not.equal(el.input);
      expect(wrapperEscapes, 'wrapper should not see Escape on press 1').to.equal(0);
    });
  });

  describe('slash menu', () => {
    it('stays closed when no items are configured', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea></zn-textarea>`);
      await el.updateComplete;

      el.focus();
      type(el, '/');
      await el.updateComplete;
      await el.updateComplete;

      expect(slashMenuOf(el)?.open ?? false, 'nothing to insert, so nothing to show').to.be.false;
    });

    it('opens on the trigger with items from the slash-items attribute', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-textarea>`);
      const menu = await openSlashMenu(el);

      expect(menuItemLabels(menu)).to.deep.equal(['Brand name', 'Support email']);
    });

    it('collects items from slotted zn-slash-item elements', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea>
          <zn-slash-item slot="slash-items" label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
          <zn-slash-item slot="slash-items" label="Governing law">This agreement is governed by {{JURISDICTION}}.
          </zn-slash-item>
        </zn-textarea>`);
      const menu = await openSlashMenu(el);

      expect(menuItemLabels(menu)).to.deep.equal(['Brand name', 'Governing law']);
      expect(menu.items[1].value, 'text content is used when no value attribute is set')
        .to.equal('This agreement is governed by {{JURISDICTION}}.');
    });

    it('picks up zn-slash-item children with no slot attribute', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea>
          <zn-slash-item label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
          <zn-slash-item label="Support email" value="{{SUPPORT_EMAIL}}"></zn-slash-item>
        </zn-textarea>`);
      await el.updateComplete;
      expect(el.value, 'the items must not be read as initial content').to.equal('');

      const menu = await openSlashMenu(el);
      expect(menuItemLabels(menu)).to.deep.equal(['Brand name', 'Support email']);
    });

    it('uses a slotted zn-slash-menu and the items inside it', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea>
          <zn-slash-menu slot="slash-menu" heading="Replacements" max-items="1">
            <zn-slash-item label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
            <zn-slash-item label="Support email" value="{{SUPPORT_EMAIL}}"></zn-slash-item>
          </zn-slash-menu>
        </zn-textarea>`);
      const slotted = el.querySelector<ZnSlashMenu>('zn-slash-menu')!;

      el.focus();
      type(el, '/');
      await waitUntil(() => slotted.open, 'the slotted menu never opened');
      await slotted.updateComplete;

      expect(el.shadowRoot!.querySelector('zn-slash-menu'), 'no second menu is created').to.be.null;
      expect(slotted.items.map(item => item.label)).to.deep.equal(['Brand name', 'Support email']);
      expect(slotted.shadowRoot!.querySelector('[part="heading"]')?.textContent?.trim())
        .to.contain('Replacements');
      expect(menuItemLabels(slotted), 'the author\'s max-items is respected').to.deep.equal(['Brand name']);

      press(el, 'Enter');
      await el.updateComplete;
      expect(el.value).to.equal('{{BRAND_NAME}}');
    });

    it('filters as the query is typed', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-textarea>`);
      const menu = await openSlashMenu(el, 'Legal text /sup');

      expect(menuItemLabels(menu)).to.deep.equal(['Support email']);
    });

    it('closes when the query matches nothing', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      const menu = await openSlashMenu(el);

      type(el, '/zzz');
      await waitUntil(() => !menu.open, 'the menu stayed open with no matches');
    });

    it('ignores a trigger in the middle of a word', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      await el.updateComplete;

      el.focus();
      type(el, 'http://example.com/br');
      await el.updateComplete;
      await el.updateComplete;

      expect(slashMenuOf(el)?.open ?? false).to.be.false;
    });

    it('inserts the active item on Enter, replacing the trigger and query', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-textarea>`);
      const menu = await openSlashMenu(el, 'Provided by /bra');

      const inserted: string[] = [];
      el.addEventListener('zn-slash-insert', (event: Event) => {
        inserted.push((event as CustomEvent<{value: string}>).detail.value);
      });

      const event = press(el, 'Enter');
      await el.updateComplete;

      expect(event.defaultPrevented, 'Enter is claimed by the menu').to.be.true;
      expect(el.value).to.equal('Provided by {{BRAND_NAME}}');
      expect(el.input.selectionStart, 'the caret lands after the insertion').to.equal(el.value.length);
      expect(inserted).to.deep.equal(['{{BRAND_NAME}}']);
      expect(menu.open).to.be.false;
    });

    it('moves the active item with the arrow keys', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-textarea>`);
      const menu = await openSlashMenu(el);

      press(el, 'ArrowDown');
      await menu.updateComplete;
      expect(menu.activeItem?.label).to.equal('Support email');

      press(el, 'Enter');
      await el.updateComplete;
      expect(el.value).to.equal('{{SUPPORT_EMAIL}}');
    });

    it('keeps its place in the list once the arrow key is released', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea
          slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}, Jurisdiction={{JURISDICTION}}"></zn-textarea>`);
      const menu = await openSlashMenu(el);

      await pressAndRelease(el, 'ArrowDown');
      expect(menu.activeItem?.label, 'keyup must not rebuild the list').to.equal('Support email');

      await pressAndRelease(el, 'ArrowDown');
      expect(menu.activeItem?.label).to.equal('Jurisdiction');

      await pressAndRelease(el, 'ArrowUp');
      expect(menu.activeItem?.label).to.equal('Support email');

      press(el, 'Enter');
      await el.updateComplete;
      expect(el.value).to.equal('{{SUPPORT_EMAIL}}');
    });

    it('lets zn-slash-select cancel the insertion', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      await openSlashMenu(el);

      const selected: string[] = [];
      el.addEventListener('zn-slash-select', (event: Event) => {
        selected.push((event as CustomEvent<{item: {label: string}}>).detail.item.label);
        event.preventDefault();
      });

      press(el, 'Enter');
      await el.updateComplete;

      expect(selected).to.deep.equal(['Brand name']);
      expect(el.value, 'the value is not inserted, but the command text still goes').to.equal('');
    });

    it('closes on Escape without blurring the field', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      const menu = await openSlashMenu(el);

      press(el, 'Escape');
      await el.updateComplete;

      expect(menu.open).to.be.false;
      expect(el.shadowRoot!.activeElement, 'Escape closed the menu, not the field').to.equal(el.input);
    });

    it('does not reopen at a dismissed trigger while the query grows', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      const menu = await openSlashMenu(el);

      press(el, 'Escape');
      await el.updateComplete;

      type(el, '/br');
      await el.updateComplete;
      await el.updateComplete;
      expect(menu.open).to.be.false;
    });

    it('supports a custom trigger', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-trigger="{{" slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      const menu = await openSlashMenu(el, '{{bra');

      expect(menu.items.map(item => item.label)).to.deep.equal(['Brand name']);

      press(el, 'Enter');
      await el.updateComplete;
      expect(el.value).to.equal('{{BRAND_NAME}}');
    });

    it('appends items from slashItemsProvider', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      el.slashItemsProvider = () => [{label: 'Merchant name', value: '{{MERCHANT_NAME}}'}];
      await el.updateComplete;

      const menu = await openSlashMenu(el);
      expect(menuItemLabels(menu)).to.deep.equal(['Brand name', 'Merchant name']);
    });

    it('removes the command text for items that only carry an action', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea></zn-textarea>`);
      el.slashItems = [{label: 'Timestamp', action: 'timestamp'}];
      await el.updateComplete;

      await openSlashMenu(el, 'Logged at /time');
      press(el, 'Enter');
      await el.updateComplete;

      expect(el.value).to.equal('Logged at ');
    });

    it('renders the panel at the caret', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}" style="margin-top: 100px"></zn-textarea>`);
      const menu = await openSlashMenu(el);
      await menu.updateComplete;

      const panel = menu.shadowRoot!.querySelector('[part="panel"]')!.getBoundingClientRect();
      const field = el.input.getBoundingClientRect();

      expect(panel.width, 'the panel is laid out').to.be.greaterThan(0);
      expect(panel.height, 'the panel is laid out').to.be.greaterThan(0);
      expect(panel.top, 'the panel sits below the first line of the field').to.be.greaterThan(field.top);
    });

    it('is opened programmatically by showSlashMenu()', async () => {
      const el = await fixture<ZnTextarea>(html`
        <zn-textarea slash-items="Brand name={{BRAND_NAME}}"></zn-textarea>`);
      await el.updateComplete;

      await el.showSlashMenu();
      await waitUntil(() => slashMenuOf(el)?.open, 'showSlashMenu() did not open the menu');

      expect(el.value).to.equal('/');
    });
  });
});
