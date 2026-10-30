import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import {clearFormStoreValues} from '../../utilities/form';
import type ZnInput from './input.component';
import type ZnSlashMenu from '../slash-menu/slash-menu.component';

describe('<zn-input>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-input></zn-input> `);

    expect(el).to.exist;
  });

  describe('form data', () => {
    it('trims surrounding whitespace, except for passwords', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <zn-input name="search" value="  foo bar  "></zn-input>
          <zn-input name="pass" type="password" value=" secret "></zn-input>
        </form>
      `);
      const [search, pass] = form.querySelectorAll<ZnInput>('zn-input');
      await search.updateComplete;

      const data = new FormData(form);
      expect(data.get('search')).to.equal('foo bar');
      expect(data.get('pass')).to.equal(' secret ');

      await search.updateComplete;
      expect(search.value).to.equal('foo bar');
      expect(search.input.value).to.equal('foo bar');
      expect(pass.value).to.equal(' secret ');
    });
  });

  describe('Escape key', () => {
    it('keeps focus and swallows only the first Escape', async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <zn-input></zn-input>
        </div>
      `);
      const el = wrapper.querySelector('zn-input') as ZnInput;
      await el.updateComplete;

      let wrapperEscapes = 0;
      wrapper.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') wrapperEscapes++;
      });

      el.focus();
      await el.updateComplete;
      expect(el.shadowRoot!.activeElement).to.equal(el.input);

      const pressEscape = () => el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true
      }));

      pressEscape();
      await el.updateComplete;
      expect(el.shadowRoot!.activeElement, 'inner input should keep focus').to.equal(el.input);
      expect(wrapperEscapes, 'wrapper should not see Escape on press 1').to.equal(0);

      pressEscape();
      expect(wrapperEscapes, 'wrapper should see Escape on press 2').to.equal(1);
    });
  });

  describe('trigger-submit', () => {
    const pressEnter = (el: ZnInput) => {
      el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
    };

    it('submits an enter-navigation form on enter when trigger-submit is set', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form data-enter-navigation>
          <zn-input name="a" trigger-submit></zn-input>
          <zn-input name="b"></zn-input>
        </form>
      `);
      const el = form.querySelector('zn-input')!;
      await el.updateComplete;

      let submitted = false;
      form.addEventListener('submit', e => {
        e.preventDefault();
        submitted = true;
      });

      el.focus();
      pressEnter(el);

      expect(submitted).to.be.true;
    });

    it('does not submit an enter-navigation form on enter without trigger-submit', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form data-enter-navigation>
          <zn-input name="a"></zn-input>
          <zn-input name="b"></zn-input>
        </form>
      `);
      const el = form.querySelector('zn-input')!;
      await el.updateComplete;

      let submitted = false;
      form.addEventListener('submit', e => {
        e.preventDefault();
        submitted = true;
      });

      el.focus();
      pressEnter(el);

      expect(submitted).to.be.false;
    });
  });

  describe('persisted state', () => {
    const formStoreKey = 'input-test-form-state';
    const elementStoreKey = 'input-test-element-state';

    beforeEach(() => {
      clearFormStoreValues(formStoreKey);
      clearFormStoreValues(elementStoreKey);
    });

    afterEach(() => {
      clearFormStoreValues(formStoreKey);
      clearFormStoreValues(elementStoreKey);
    });

    it('restores values from a form store-key after refresh', async () => {
      const firstForm = await fixture<HTMLFormElement>(html`
        <form store-key=${formStoreKey}>
          <zn-input name="first_name"></zn-input>
        </form>
      `);
      const firstInput = firstForm.querySelector('zn-input') as ZnInput;
      await firstInput.updateComplete;

      firstInput.value = 'Ada';
      firstInput.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      const secondForm = await fixture<HTMLFormElement>(html`
        <form store-key=${formStoreKey}>
          <zn-input name="first_name"></zn-input>
        </form>
      `);
      const secondInput = secondForm.querySelector('zn-input') as ZnInput;
      await secondInput.updateComplete;

      expect(secondInput.value).to.equal('Ada');
    });

    it('restores values from an element store-key without a form store-key', async () => {
      const firstInput = await fixture<ZnInput>(html`<zn-input store-key=${elementStoreKey}></zn-input>`);
      await firstInput.updateComplete;

      firstInput.value = 'Lovelace';
      firstInput.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      const secondInput = await fixture<ZnInput>(html`<zn-input store-key=${elementStoreKey}></zn-input>`);
      await secondInput.updateComplete;

      expect(secondInput.value).to.equal('Lovelace');
    });

    it('clears values for a form store-key', async () => {
      const firstForm = await fixture<HTMLFormElement>(html`
        <form store-key=${formStoreKey}>
          <zn-input name="first_name"></zn-input>
        </form>
      `);
      const firstInput = firstForm.querySelector('zn-input') as ZnInput;
      await firstInput.updateComplete;

      firstInput.value = 'Grace';
      firstInput.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      clearFormStoreValues(firstForm);

      const secondForm = await fixture<HTMLFormElement>(html`
        <form store-key=${formStoreKey}>
          <zn-input name="first_name"></zn-input>
        </form>
      `);
      const secondInput = secondForm.querySelector('zn-input') as ZnInput;
      await secondInput.updateComplete;

      expect(secondInput.value).to.equal('');
    });
  });

  describe('type="range"', () => {
    const contextNote = (el: ZnInput) =>
      el.shadowRoot!.querySelector('.form-control__label-context-note')!.textContent!.trim();

    it('adopts the native midpoint when no value is set', async () => {
      const el = await fixture<ZnInput>(html`<zn-input type="range" min="0" max="10"></zn-input>`);
      await el.updateComplete;

      expect(el.value).to.equal('5');
    });

    it('displays the value with its suffix in the context note', async () => {
      const el = await fixture<ZnInput>(
        html`<zn-input type="range" label="Radius" min="0" max="2" step="0.5" value="0.5" value-suffix="rem"></zn-input>`
      );
      await el.updateComplete;

      expect(contextNote(el)).to.equal('0.5rem');
    });

    it('updates the context note as the value changes', async () => {
      const el = await fixture<ZnInput>(
        html`<zn-input type="range" label="Radius" min="0" max="10" value="4" value-suffix="px"></zn-input>`
      );
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.input__control') as HTMLInputElement;
      input.value = '7';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      expect(el.value).to.equal('7');
      expect(contextNote(el)).to.equal('7px');
    });

    it('prefers an explicit context-note over the value', async () => {
      const el = await fixture<ZnInput>(
        html`<zn-input type="range" label="Radius" context-note="Custom" value="4"></zn-input>`
      );
      await el.updateComplete;

      expect(contextNote(el)).to.equal('Custom');
    });
  });

  describe('type="color"', () => {
    const typeInto = async (el: ZnInput, text: string) => {
      const control = el.shadowRoot!.querySelector<HTMLInputElement>('.input__control')!;
      control.focus();
      control.value = text;
      control.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
      control.dispatchEvent(new Event('change'));
      control.blur();
      await el.updateComplete;
      await el.updateComplete;
    };

    it('writes the starting value in color-format', async () => {
      const el = await fixture<ZnInput>(html`<zn-input type="color" color-format="rgb" value="#7557F5"></zn-input>`);
      await el.updateComplete;

      expect(el.value).to.equal('rgb(117, 87, 245)');
    });

    it('switches to the format that was typed and keeps a tidy value as written', async () => {
      const el = await fixture<ZnInput>(html`<zn-input type="color" value="#085EFD"></zn-input>`);

      await typeInto(el, 'oklch(70% 0.15 250)');

      expect(el.colorFormat).to.equal('oklch');
      expect(el.value).to.equal('oklch(70% 0.15 250)');
    });

    it('writes a name out in the current format', async () => {
      const el = await fixture<ZnInput>(html`<zn-input type="color" value="#085EFD"></zn-input>`);

      await typeInto(el, 'rebeccapurple');

      expect(el.value).to.equal('#663399');
    });

    it('marks text that is not a colour as invalid', async () => {
      const el = await fixture<ZnInput>(html`<zn-input type="color" value="#085EFD"></zn-input>`);

      await typeInto(el, 'not a colour');

      const control = el.shadowRoot!.querySelector('.input__control')!;
      expect(control.getAttribute('aria-invalid')).to.equal('true');
      expect(el.shadowRoot!.querySelector('[part="base"]')!.classList.contains('input--color-invalid')).to.be.true;
    });

    it('opens the colour panel from the swatch and closes it on Escape', async () => {
      const el = await fixture<ZnInput>(html`<zn-input type="color" value="#085EFD"></zn-input>`);
      const swatch = el.shadowRoot!.querySelector<HTMLButtonElement>('.input__color-swatch')!;

      swatch.click();
      await el.updateComplete;
      expect(swatch.getAttribute('aria-expanded')).to.equal('true');
      expect(el.shadowRoot!.querySelector('zn-color-picker')).to.exist;

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      await el.updateComplete;
      expect(swatch.getAttribute('aria-expanded')).to.equal('false');
      expect(el.shadowRoot!.querySelector('zn-color-picker')).to.not.exist;
    });
  });

  describe('slash menu', () => {
    function slashMenuOf(el: ZnInput) {
      return el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu');
    }

    /** Types `text` into the field the way a user would, leaving the caret at the end. */
    function type(el: ZnInput, text: string) {
      el.input.value = text;
      el.input.setSelectionRange(text.length, text.length);
      el.input.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
    }

    async function openSlashMenu(el: ZnInput, text = '/') {
      await el.updateComplete;
      el.focus();
      type(el, text);
      await waitUntil(() => slashMenuOf(el)?.open, 'the slash menu never opened');

      return slashMenuOf(el)!;
    }

    it('stays closed when no items are configured', async () => {
      const el = await fixture<ZnInput>(html`<zn-input></zn-input>`);
      await el.updateComplete;

      el.focus();
      type(el, '/');
      await el.updateComplete;
      await el.updateComplete;

      expect(slashMenuOf(el)?.open ?? false, 'nothing to insert, so nothing to show').to.be.false;
    });

    it('opens on the trigger with items from the slash-items attribute', async () => {
      const el = await fixture<ZnInput>(html`
        <zn-input slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-input>`);
      const menu = await openSlashMenu(el);

      expect(menu.items.map(item => item.label)).to.deep.equal(['Brand name', 'Support email']);
    });

    it('collects items from slotted zn-slash-item elements', async () => {
      const el = await fixture<ZnInput>(html`
        <zn-input>
          <zn-slash-item label="Brand name" value="{{BRAND_NAME}}"></zn-slash-item>
        </zn-input>`);
      const menu = await openSlashMenu(el);

      expect(menu.items.map(item => item.label)).to.deep.equal(['Brand name']);
    });

    it('inserts the active item on Enter, replacing the trigger and query', async () => {
      const el = await fixture<ZnInput>(html`
        <zn-input slash-items="Brand name={{BRAND_NAME}}"></zn-input>`);
      await openSlashMenu(el, 'Welcome to /bra');

      el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.value).to.equal('Welcome to {{BRAND_NAME}}');
    });

    it('does not submit the form when Enter chooses an item', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <zn-input slash-items="Brand name={{BRAND_NAME}}"></zn-input>
        </form>`);
      const el = form.querySelector<ZnInput>('zn-input')!;

      let submits = 0;
      form.addEventListener('submit', event => {
        event.preventDefault();
        submits++;
      });

      await openSlashMenu(el);
      el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.value, 'the token should have replaced the trigger').to.equal('{{BRAND_NAME}}');
      expect(submits, 'Enter belongs to the open menu, not the form').to.equal(0);
    });

    it('closes on Escape without blurring the field', async () => {
      const el = await fixture<ZnInput>(html`
        <zn-input slash-items="Brand name={{BRAND_NAME}}"></zn-input>`);
      const menu = await openSlashMenu(el);

      el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(menu.open, 'Escape should close the menu').to.be.false;
      expect(el.shadowRoot!.activeElement, 'the field should keep focus').to.equal(el.input);
    });
  });

  it('paints the invalid border once the user has submitted', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form @submit=${(e: Event) => e.preventDefault()}>
        <zn-input required style="--zn-input-border-color-invalid: rgb(1, 2, 3)"></zn-input>
      </form>`);
    const el = form.querySelector<ZnInput>('zn-input')!;
    const base = el.shadowRoot!.querySelector('.input')!;
    expect(getComputedStyle(base).borderColor).to.not.equal('rgb(1, 2, 3)');

    form.requestSubmit();
    await el.updateComplete;

    expect(el.hasAttribute('data-user-invalid')).to.be.true;
    expect(getComputedStyle(base).borderColor).to.equal('rgb(1, 2, 3)');
  });
});
