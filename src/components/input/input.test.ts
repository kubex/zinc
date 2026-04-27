import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
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
});
