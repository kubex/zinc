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

  describe('multiple pickers', () => {
    interface Instance { selectDate: (d: Date) => void; visible: boolean; $datepicker: HTMLElement }

    it('reopens a picker after focus moves to another picker and back', async () => {
      const wrapper = await fixture(html`<div><zn-datepicker></zn-datepicker><zn-datepicker></zn-datepicker></div>`);
      const [a, b] = Array.from(wrapper.querySelectorAll<ZnDatepicker>('zn-datepicker'));
      await a.updateComplete;
      await b.updateComplete;
      const instanceOf = (el: ZnDatepicker) => (el as unknown as { _instance: Instance })._instance;

      let changes = 0;
      a.addEventListener('zn-change', () => changes++);

      a.input.focus();
      instanceOf(a).selectDate(new Date(2026, 0, 15));
      await waitUntil(() => changes === 1 && !instanceOf(a).visible);

      // Blurring a with its calendar closed used to re-select the date and hide the detached calendar
      b.input.focus();
      await new Promise(r => setTimeout(r, 50));
      expect(changes, 'blur should not re-emit zn-change').to.equal(1);

      a.input.focus();
      a.input.click();
      await a.updateComplete;

      expect(instanceOf(a).visible).to.be.true;
      expect(instanceOf(a).$datepicker.closest('.air-datepicker-global-container'), 'calendar should mount in the global container').to.exist;
    });
  });

  describe('typed dates', () => {
    it('clears an impossible date instead of rolling it over', async () => {
      const el = await fixture<ZnDatepicker>(html`<zn-datepicker format="MM/dd/yyyy"></zn-datepicker>`);
      await el.updateComplete;

      el.input.value = '13/45/2026';
      el.input.dispatchEvent(new InputEvent('input', {inputType: 'insertText'}));
      await new Promise(r => setTimeout(r, 50));
      expect(el.input.value, 'calendar should not rewrite the typed text').to.equal('13/45/2026');

      el.input.dispatchEvent(new Event('blur'));
      await el.updateComplete;

      expect(el.value).to.equal('');
    });
  });

  describe('range', () => {
    it('keeps the selected range when the input loses focus', async () => {
      const el = await fixture<ZnDatepicker>(html`<zn-datepicker range></zn-datepicker>`);
      await el.updateComplete;
      const instance = (el as unknown as { _instance: { selectDate: (d: Date[]) => void; selectedDates: Date[]; visible: boolean } })._instance;

      let changes = 0;
      el.addEventListener('zn-change', () => changes++);

      el.input.focus();
      instance.selectDate([new Date(2026, 0, 10), new Date(2026, 0, 15)]);
      await waitUntil(() => changes > 0 && !instance.visible);
      await new Promise(r => setTimeout(r, 50));
      const value: unknown = el.value;
      const changesBeforeBlur = changes;

      el.input.blur();
      await new Promise(r => setTimeout(r, 50));

      expect(el.value).to.equal(value);
      expect(instance.selectedDates).to.have.length(2);
      expect(changes, 'blur should not re-emit zn-change').to.equal(changesBeforeBlur);
    });
  });

  describe('Escape key', () => {
    it('keeps focus on the inner input when the calendar is closed', async () => {
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

      expect(el.shadowRoot!.activeElement, 'inner input should keep focus').to.equal(el.input);
    });
  });
});
