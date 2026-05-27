import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import {clearFormStoreValues} from '../../utilities/form';
import type ZnInput from './input.component';

describe('<zn-input>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-input></zn-input> `);

    expect(el).to.exist;
  });

  describe('Escape key', () => {
    it('blurs the inner input and stops propagation when focused', async () => {
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

      el.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.shadowRoot!.activeElement, 'inner input should be blurred').to.not.equal(el.input);
      expect(wrapperEscapes, 'wrapper should not see Escape on press 1').to.equal(0);
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
});
