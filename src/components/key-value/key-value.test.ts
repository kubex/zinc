import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnKeyValue from './key-value.component';

const rows = (el: ZnKeyValue) => el.shadowRoot!.querySelectorAll<HTMLElement>('.key-value__row');
// zn-button.click() skips the click event that the row buttons listen for, so press them as a user would
const press = (button: Element) => button.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));

describe('<zn-key-value>', () => {
  it('should show a row per pair in its value', async () => {
    const el = await fixture<ZnKeyValue>(html`<zn-key-value value='{"1":"{{recipient.firstName}}","2":"x"}'></zn-key-value>`);

    expect(rows(el).length).to.equal(2);
  });

  it('should submit the pairs as a JSON object, leaving out unnamed rows', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><zn-key-value name="pairs" value='{"1":"a"}'></zn-key-value></form>`);
    const el = form.querySelector<ZnKeyValue>('zn-key-value')!;

    press(el.shadowRoot!.querySelector('.key-value__add')!);
    await el.updateComplete;

    expect(new FormData(form).get('pairs')).to.equal('{"1":"a"}');
  });

  it('keeps one empty row to type into, with nothing to remove', async () => {
    const el = await fixture<ZnKeyValue>(html`<zn-key-value></zn-key-value>`);

    expect(rows(el).length).to.equal(1);
    expect(rows(el)[0].querySelector('.key-value__remove--hidden')).to.exist;
  });

  it('clears the last row instead of removing it', async () => {
    const el = await fixture<ZnKeyValue>(html`<zn-key-value value='{"a":"1"}'></zn-key-value>`);

    press(rows(el)[0].querySelector('.key-value__remove')!);
    await el.updateComplete;

    expect(rows(el).length).to.equal(1);
    expect(el.value).to.equal('{}');
  });

  it('submits a list as a JSON array of names', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><zn-key-value name="entries" list value='["10.0.0.1","10.0.0.0/24"]'></zn-key-value></form>`);
    const el = form.querySelector<ZnKeyValue>('zn-key-value')!;

    expect(rows(el).length).to.equal(2);
    expect(rows(el)[0].querySelector('.key-value__value')).to.not.exist;
    expect(new FormData(form).get('entries')).to.equal('["10.0.0.1","10.0.0.0/24"]');
  });

  it('renders value options as a select, defaulting new rows to the first option', async () => {
    const options = JSON.stringify({default: 'System default', auto: 'Auto approve'});
    const el = await fixture<ZnKeyValue>(html`
      <zn-key-value value-options="${options}" value='{"a.com":"auto"}'></zn-key-value>`);

    expect(rows(el)[0].querySelector('zn-select.key-value__value')).to.exist;

    press(el.shadowRoot!.querySelector('.key-value__add')!);
    await el.updateComplete;
    const key = rows(el)[1].querySelector<HTMLElement & {value: string}>('.key-value__key')!;
    key.value = 'b.com';
    key.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
    await el.updateComplete;

    expect(JSON.parse(el.value)).to.deep.equal({'a.com': 'auto', 'b.com': 'default'});
  });

  it('restores its rows on form reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><zn-key-value name="pairs" value='{"a":"1"}'></zn-key-value></form>`);
    const el = form.querySelector<ZnKeyValue>('zn-key-value')!;

    press(rows(el)[0].querySelector('.key-value__remove')!);
    await el.updateComplete;
    expect(el.value).to.equal('{}');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('{"a":"1"}');
    expect(rows(el).length).to.equal(1);
  });
});
