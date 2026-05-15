import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnInputGroup from './input-group.component';

describe('<zn-input-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-input-group></zn-input-group> `);
    expect(el).to.exist;
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
    expect(button).to.have.attribute('data-zn-input-group__input--last');
    expect(button).to.have.attribute('data-zn-input-group__input');
  });
});
