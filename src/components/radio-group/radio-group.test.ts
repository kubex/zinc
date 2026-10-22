import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-radio-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-radio-group></zn-radio-group> `);

    expect(el).to.exist;
  });

  it('propagates contained and square to its radios', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-radio-group contained square>
        <zn-radio value="one">One</zn-radio>
        <zn-radio value="two">Two</zn-radio>
      </zn-radio-group>
    `);
    await new Promise(resolve => requestAnimationFrame(resolve));

    el.querySelectorAll('zn-radio').forEach(child => {
      expect(child).to.have.attribute('contained');
      expect(child).to.have.attribute('square');
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
});
