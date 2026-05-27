import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnInputGroup from './input-group.component';

describe('<zn-input-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-input-group></zn-input-group> `);
    expect(el).to.exist;
  });

  it('should apply data attributes to slotted inputs', async () => {
    const el = await fixture<ZnInputGroup>(html`
      <zn-input-group>
        <zn-input></zn-input>
        <zn-input></zn-input>
        <zn-input></zn-input>
      </zn-input-group>
    `);

    await el.updateComplete;
    await new Promise(r => setTimeout(r, 100));

    const inputs = el.querySelectorAll('zn-input');
    expect(inputs[0]).to.have.attribute('data-zn-input-group__input');
    expect(inputs[0]).to.have.attribute('data-zn-input-group__input--first');

    expect(inputs[1]).to.have.attribute('data-zn-input-group__input');
    expect(inputs[1]).to.have.attribute('data-zn-input-group__input--inner');

    expect(inputs[2]).to.have.attribute('data-zn-input-group__input');
    expect(inputs[2]).to.have.attribute('data-zn-input-group__input--last');
  });

  it('should handle mixed inputs and selects', async () => {
    const el = await fixture<ZnInputGroup>(html`
      <zn-input-group>
        <zn-input></zn-input>
        <zn-select></zn-select>
      </zn-input-group>
    `);

    await new Promise(r => setTimeout(r, 100));

    const controls = el.querySelectorAll('zn-input, zn-select');
    expect(controls[0]).to.have.attribute('data-zn-input-group__input--first');
    expect(controls[1]).to.have.attribute('data-zn-input-group__input--last');
  });

  it('should handle button at the end', async () => {
    const el = await fixture<ZnInputGroup>(html`
      <zn-input-group>
        <zn-input></zn-input>
        <zn-button>Submit</zn-button>
      </zn-input-group>
    `);

    await new Promise(r => setTimeout(r, 100));

    const input = el.querySelector('zn-input');
    const button = el.querySelector('zn-button');

    expect(input).to.have.attribute('data-zn-input-group__input--first');
    expect(button).to.have.attribute('data-zn-input-group__input');
    expect(button).to.not.have.attribute('data-zn-input-group__input--last');
  });

  it('should render a label when the label attribute is set', async () => {
    const el = await fixture<ZnInputGroup>(html`
      <zn-input-group label="Test Label"></zn-input-group>
    `);
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('.form-control__label');
    expect(label).to.exist;
    expect(label).to.contain.text('Test Label');
  });

  it('should render a label from the label slot', async () => {
    const el = await fixture<ZnInputGroup>(html`
      <zn-input-group>
        <span slot="label">Slot Label</span>
      </zn-input-group>
    `);
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('.form-control__label');
    expect(label).to.exist;
    const slot = label?.querySelector('slot');
    expect(slot).to.exist;
  });
});
