import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnKeyValue from './key-value.component';

describe('<zn-key-value>', () => {
  it('should show a row per pair in its value', async () => {
    const el = await fixture<ZnKeyValue>(html`<zn-key-value value='{"1":"{{recipient.firstName}}","2":"x"}'></zn-key-value>`);

    expect(el.shadowRoot!.querySelectorAll('.key-value__row').length).to.equal(2);
  });

  it('should submit the pairs as a JSON object, leaving out unnamed rows', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><zn-key-value name="pairs" value='{"1":"a"}'></zn-key-value></form>`);
    const el = form.querySelector<ZnKeyValue>('zn-key-value')!;

    el.shadowRoot!.querySelector<HTMLElement>('.key-value__add')!.click();
    await el.updateComplete;

    expect(new FormData(form).get('pairs')).to.equal('{"1":"a"}');
  });
});
