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
});
