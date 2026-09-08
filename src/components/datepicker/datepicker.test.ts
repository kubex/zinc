import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnDatepicker from './datepicker.component';

describe('<zn-datepicker>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-datepicker></zn-datepicker> `);

    expect(el).to.exist;
  });

  describe('inline', () => {
    it('renders the calendar in place and hides the text input', async () => {
      const el = await fixture<ZnDatepicker>(html`<zn-datepicker inline></zn-datepicker>`);
      await el.updateComplete;

      const calendar = el.shadowRoot!.querySelector('.air-datepicker');

      expect(calendar, 'calendar should live in the datepicker shadow root').to.exist;
      expect(calendar!.classList.contains('-inline-')).to.be.true;
      expect(getComputedStyle(el.input).display).to.equal('none');
    });

    it('emits zn-change when a day is picked', async () => {
      const el = await fixture<ZnDatepicker>(html`<zn-datepicker inline></zn-datepicker>`);
      await el.updateComplete;

      let emitted = 0;
      el.addEventListener('zn-change', () => emitted++);

      const day = el.shadowRoot!.querySelector<HTMLElement>('.air-datepicker-cell.-day-:not(.-other-month-)')!;
      day.click();
      await waitUntil(() => emitted > 0);

      expect(el.value).to.not.equal('');
    });
  });

  describe('Escape key', () => {
    it('blurs the inner input when focused and the calendar is closed', async () => {
      const el = await fixture<ZnDatepicker>(html`<zn-datepicker></zn-datepicker>`);
      await el.updateComplete;

      // Focus shows AirDatepicker's calendar (showEvent: 'focus'). Per spec, Escape
      // while calendar is open is handled by AirDatepicker; our handler engages once
      // the calendar is closed. Hide it explicitly to simulate the calendar-closed
      // state, then press Escape.
      el.focus();
      await el.updateComplete;
      const dp = (el as unknown as { _instance?: { hide: () => void; visible: boolean } })._instance;
      dp?.hide();
      await el.updateComplete;
      el.input.focus();
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
    });
  });
});
