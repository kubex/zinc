import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-radio-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-radio-group></zn-radio-group> `);

    expect(el).to.exist;
  });

  it('propagates contained, square and centered to its radios', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-radio-group contained square centered>
        <zn-radio value="one">One</zn-radio>
        <zn-radio value="two">Two</zn-radio>
      </zn-radio-group>
    `);
    await new Promise(resolve => requestAnimationFrame(resolve));

    el.querySelectorAll('zn-radio').forEach(child => {
      expect(child).to.have.attribute('contained');
      expect(child).to.have.attribute('square');
      expect(child).to.have.attribute('centered');
    });
  });

  it('selects the next radio and emits zn-change on arrow key', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-radio-group value="one">
        <zn-radio value="one">One</zn-radio>
        <zn-radio value="two">Two</zn-radio>
      </zn-radio-group>
    `);
    const radios = el.querySelectorAll<HTMLElement & { checked: boolean }>('zn-radio');
    let changes = 0;
    el.addEventListener('zn-change', () => changes++);

    radios[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true, composed: true}));

    expect(el.value).to.equal('two');
    expect(radios[1].checked).to.be.true;
    expect(changes).to.equal(1);
  });

  it('selects the focused radio on Enter', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-radio-group value="one">
        <zn-radio value="one">One</zn-radio>
        <zn-radio value="two">Two</zn-radio>
        <zn-radio value="three">Three</zn-radio>
      </zn-radio-group>
    `);
    const radios = el.querySelectorAll<HTMLElement & { checked: boolean }>('zn-radio');
    let changes = 0;
    el.addEventListener('zn-change', () => changes++);

    radios[2].dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, composed: true}));

    expect(el.value).to.equal('three');
    expect(radios[2].checked).to.be.true;
    expect(changes).to.equal(1);
  });

  it('fills a scale up to the checked radio and leaves it unanswered until one is picked', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-radio-group scale>
        <zn-radio value="1">1</zn-radio>
        <zn-radio value="2">2</zn-radio>
        <zn-radio value="3">3</zn-radio>
      </zn-radio-group>
    `);
    await new Promise(resolve => requestAnimationFrame(resolve));
    const radios = [...el.querySelectorAll<HTMLElement & { filled: boolean }>('zn-radio')];

    expect(el.value).to.equal('');
    radios.forEach(radio => {
      expect(radio).to.have.attribute('scale');
      expect(radio.filled).to.be.false;
    });

    el.value = '2';
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(radios.map(radio => radio.filled)).to.deep.equal([true, true, false]);
  });

  it('lays a segmented group out as one track, with one pill that moves to the checked segment', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-radio-group segmented value="open" style="width: 300px">
        <zn-radio value="active">Active</zn-radio>
        <zn-radio value="open">Open</zn-radio>
        <zn-radio value="mine">Mine</zn-radio>
      </zn-radio-group>
    `);
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
    await frame();
    await frame();
    const radios = [...el.querySelectorAll<HTMLElement>('zn-radio')];
    const input = el.shadowRoot!.querySelector<HTMLElement>('.form-control-input')!;
    const pill = el.shadowRoot!.querySelector<HTMLElement>('[part="indicator"]')!;
    const offset = (radio: HTMLElement) => radio.getBoundingClientRect().left - input.getBoundingClientRect().left;

    expect(getComputedStyle(input).gridAutoFlow).to.equal('column');
    radios.forEach(radio => expect(radio).to.have.attribute('segmented'));
    expect(getComputedStyle(radios[0].shadowRoot!.querySelector('.radio__control')!).display).to.equal('none');
    expect(parseFloat(pill.style.left)).to.be.closeTo(offset(radios[1]), 1);

    radios[2].shadowRoot!.querySelector<HTMLElement>('[part~="base"]')!.click();
    await frame();
    await frame();
    expect(el.value).to.equal('mine');
    expect(parseFloat(pill.style.left)).to.be.closeTo(offset(radios[2]), 1);
  });

  it('ticks only the checked row of a menu group, in place of the radio dot', async () => {
    const el = await fixture<HTMLElement & { value: string }>(html`
      <zn-radio-group menu value="default">
        <zn-radio value="default">Default</zn-radio>
        <zn-radio value="name">A–Z</zn-radio>
      </zn-radio-group>
    `);
    await new Promise(resolve => requestAnimationFrame(resolve));
    const radios = [...el.querySelectorAll<HTMLElement & { updateComplete: Promise<boolean> }>('zn-radio')];
    const tick = (radio: HTMLElement) => radio.shadowRoot!.querySelector('[part="tick"]');

    expect(getComputedStyle(radios[0].shadowRoot!.querySelector('.radio__control')!).display).to.equal('none');
    expect(tick(radios[0])).to.exist;
    expect(tick(radios[1])).to.not.exist;

    radios[1].shadowRoot!.querySelector<HTMLElement>('[part~="base"]')!.click();
    await Promise.all(radios.map(radio => radio.updateComplete));
    expect(el.value).to.equal('name');
    expect(tick(radios[0])).to.not.exist;
    expect(tick(radios[1])).to.exist;
  });
});
