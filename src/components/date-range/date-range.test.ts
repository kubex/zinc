import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import {setViewport} from '@web/test-runner-commands';
import type ZnButton from '../button';
import type ZnDateRange from './date-range.component';
import type ZnInput from '../input';

const click = (el: Element) =>
  el.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

const pop = (el: ZnDateRange) => el.shadowRoot!.querySelector('.date-range__pop');
const day = (el: ZnDateRange, iso: string) => el.shadowRoot!.querySelector<HTMLElement>(`[data-date="${iso}"]`)!;
const preset = (el: ZnDateRange, label: string) =>
  [...el.shadowRoot!.querySelectorAll<HTMLElement>('.date-range__preset')].find(b => b.textContent!.trim() === label)!;
const commit = async (el: ZnDateRange, end: 'from' | 'to', value: string) => {
  const input = el.shadowRoot!.querySelector<ZnInput>(`.date-range__${end}`)!;
  input.value = value;
  input.dispatchEvent(new CustomEvent('zn-blur', {bubbles: true, composed: true}));
  await el.updateComplete;
};
const inputValue = (el: ZnDateRange, end: 'from' | 'to') =>
  el.shadowRoot!.querySelector<ZnInput>(`.date-range__${end}`)!.value as string;
const apply = (el: ZnDateRange) => el.shadowRoot!.querySelector<ZnButton>('.date-range__apply')!;

async function openRange(template = html`<zn-date-range from="2026-10-10" to="2026-10-12" max="2026-10-20"></zn-date-range>`) {
  const el = await fixture<ZnDateRange>(template);
  click(el.shadowRoot!.querySelector('.date-range__trigger')!);
  await el.updateComplete;
  return el;
}

describe('<zn-date-range>', () => {
  it('opens a dialog with two month grids and eight quick ranges', async () => {
    const el = await openRange();

    expect(pop(el)).to.exist;
    expect(pop(el)!.getAttribute('role')).to.equal('dialog');
    expect(el.shadowRoot!.querySelectorAll('[role="grid"]')).to.have.length(2);
    expect(el.shadowRoot!.querySelectorAll('.date-range__preset')).to.have.length(8);
  });

  it('greys out days after max and ignores clicks on them', async () => {
    const el = await openRange();

    expect(day(el, '2026-10-25').getAttribute('aria-disabled')).to.equal('true');
    expect(day(el, '2026-10-20').getAttribute('aria-disabled')).to.equal('false');

    click(day(el, '2026-10-25'));
    await el.updateComplete;

    expect(day(el, '2026-10-10').classList.contains('is-start')).to.be.true;
    expect(day(el, '2026-10-12').classList.contains('is-end')).to.be.true;
    expect(day(el, '2026-10-25').classList.contains('is-start')).to.be.false;
  });

  it('enables Apply only once both days are picked', async () => {
    const el = await openRange();

    click(day(el, '2026-10-14'));
    await el.updateComplete;
    expect(apply(el).disabled).to.be.true;

    click(day(el, '2026-10-18'));
    await el.updateComplete;
    expect(apply(el).disabled).to.be.false;
    expect(day(el, '2026-10-16').classList.contains('is-in')).to.be.true;
  });

  it('applies the picked range and fires zn-change once', async () => {
    const el = await openRange();
    const details: unknown[] = [];
    el.addEventListener('zn-change', (e: Event) => details.push((e as CustomEvent).detail));

    click(day(el, '2026-10-14'));
    await el.updateComplete;
    click(day(el, '2026-10-18'));
    await el.updateComplete;
    click(apply(el));
    await el.updateComplete;

    expect(el.from).to.equal('2026-10-14');
    expect(el.to).to.equal('2026-10-18');
    expect(el.getAttribute('from')).to.equal('2026-10-14');
    expect(details).to.deep.equal([{from: '2026-10-14', to: '2026-10-18'}]);
    expect(pop(el)).to.not.exist;
  });

  it('closes on Escape without changing the range or firing zn-change', async () => {
    const el = await openRange();
    let fired = 0;
    el.addEventListener('zn-change', () => fired++);

    click(day(el, '2026-10-14'));
    click(day(el, '2026-10-18'));
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, composed: true}));
    await el.updateComplete;

    expect(pop(el)).to.not.exist;
    expect(el.from).to.equal('2026-10-10');
    expect(el.to).to.equal('2026-10-12');
    expect(fired).to.equal(0);
  });

  it('stays open for clicks on its own arrows and inputs, and closes on an outside click', async () => {
    const el = await openRange();

    click(el.shadowRoot!.querySelector('.date-range__nav--next')!);
    await el.updateComplete;
    expect(pop(el)).to.exist;

    click(el.shadowRoot!.querySelector('.date-range__from')!);
    await el.updateComplete;
    expect(pop(el)).to.exist;

    click(document.body);
    await el.updateComplete;
    expect(pop(el)).to.not.exist;
  });

  it('submits name[from] and name[to] with its form', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><zn-date-range name="period" from="2026-10-01" to="2026-10-20"></zn-date-range></form>`);
    await (form.querySelector('zn-date-range')!).updateComplete;

    const data = new FormData(form);
    expect(data.get('period[from]')).to.equal('2026-10-01');
    expect(data.get('period[to]')).to.equal('2026-10-20');
  });
  it('applies a quick range straight away and closes', async () => {
    const el = await openRange(html`<zn-date-range from="2026-10-10" to="2026-10-12"
      presets='[{"label":"Early Oct","from":"2026-10-01","to":"2026-10-05"}]'></zn-date-range>`);
    const details: unknown[] = [];
    el.addEventListener('zn-change', (e: Event) => details.push((e as CustomEvent).detail));

    click(preset(el, 'Early Oct'));
    await el.updateComplete;

    expect(el.from).to.equal('2026-10-01');
    expect(el.to).to.equal('2026-10-05');
    expect(details).to.deep.equal([{from: '2026-10-01', to: '2026-10-05'}]);
    expect(pop(el)).to.not.exist;
  });

  it('clamps a quick range to max and disables one wholly past it', async () => {
    const el = await openRange(html`<zn-date-range from="2026-10-10" to="2026-10-12" max="2026-10-20"
      presets='[{"label":"Wide","from":"2026-10-15","to":"2026-10-30"},{"label":"Later","from":"2026-11-01","to":"2026-11-05"}]'></zn-date-range>`);
    let fired = 0;
    el.addEventListener('zn-change', () => fired++);

    expect(preset(el, 'Later').getAttribute('aria-disabled')).to.equal('true');
    click(preset(el, 'Later'));
    await el.updateComplete;
    expect(fired).to.equal(0);
    expect(pop(el)).to.exist;

    click(preset(el, 'Wide'));
    await el.updateComplete;
    expect(el.from).to.equal('2026-10-15');
    expect(el.to).to.equal('2026-10-20');
  });

  it('takes typed dates on commit, restarting when To is before From and ignoring partial years', async () => {
    const el = await openRange();

    await commit(el, 'to', '0202-10-05');
    expect(inputValue(el, 'from')).to.equal('2026-10-10');
    expect(apply(el).disabled).to.be.false;

    await commit(el, 'to', '2026-10-05');
    expect(inputValue(el, 'from')).to.equal('2026-10-05');
    expect(inputValue(el, 'to')).to.equal('');
    expect(apply(el).disabled).to.be.true;

    await commit(el, 'to', '2026-10-08');
    expect(apply(el).disabled).to.be.false;
    expect(day(el, '2026-10-08').classList.contains('is-end')).to.be.true;

    await commit(el, 'from', '2026-08-03');
    expect(el.shadowRoot!.querySelector('.date-range__head')!.textContent).to.equal('August 2026');
    expect(day(el, '2026-08-03').classList.contains('is-start')).to.be.true;
  });

  it('keeps Escape from reaching an enclosing element, and moves focus in and back out', async () => {
    const wrap = await fixture<HTMLDivElement>(html`
      <div><zn-date-range from="2026-10-10" to="2026-10-12"></zn-date-range></div>`);
    const el = wrap.querySelector('zn-date-range')!;
    let escapes = 0;
    wrap.addEventListener('keydown', () => escapes++);

    click(el.shadowRoot!.querySelector('.date-range__trigger')!);
    await el.updateComplete;
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).to.equal(day(el, '2026-10-10'));

    day(el, '2026-10-10').dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, composed: true}));
    await el.updateComplete;

    expect(pop(el)).to.not.exist;
    expect(escapes).to.equal(0);
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector('.date-range__trigger'));
  });

  it('shows one month on a narrow screen', async () => {
    await setViewport({width: 375, height: 800});
    try {
      const el = await openRange();
      const months = el.shadowRoot!.querySelectorAll('.date-range__month');
      expect([window.innerWidth, matchMedia('(max-width: 560px)').matches]).to.deep.equal([375, true]);
      expect(getComputedStyle(months[1]).display).to.equal('none');
      expect(pop(el)!.getBoundingClientRect().right).to.be.at.most(375);
      const popRect = pop(el)!.getBoundingClientRect();
      el.shadowRoot!.querySelectorAll('.date-range__preset').forEach(p => {
        expect(p.getBoundingClientRect().right).to.be.at.most(popRect.right);
      });
    } finally {
      await setViewport({width: 800, height: 600});
    }
  });

  it('opens above the trigger when there is no room below', async () => {
    await setViewport({width: 1000, height: 1000});
    try {
      const el = await fixture<ZnDateRange>(html`
        <zn-date-range style="display: block; margin-top: 900px" from="2026-10-10" to="2026-10-12"></zn-date-range>`);
      click(el.shadowRoot!.querySelector('.date-range__trigger')!);
      await el.updateComplete;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await el.updateComplete;

      const rect = pop(el)!.getBoundingClientRect();
      const trigger = el.shadowRoot!.querySelector('.date-range__trigger')!.getBoundingClientRect();
      expect(rect.bottom).to.be.at.most(trigger.top);
      expect(rect.top).to.be.at.least(8);
    } finally {
      await setViewport({width: 800, height: 600});
    }
  });

  it('shows a note under the calendar only when given one', async () => {
    const plain = await openRange();
    expect(plain.shadowRoot!.querySelector('.date-range__note')).to.not.exist;

    const noted = await openRange(html`<zn-date-range from="2026-10-10" to="2026-10-12" note="Compared day by day."></zn-date-range>`);
    expect(noted.shadowRoot!.querySelector('.date-range__note')!.textContent).to.equal('Compared day by day.');
  });
});
