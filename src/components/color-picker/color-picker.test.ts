import '../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type ZnColorPicker from './color-picker.component';

const field = (el: ZnColorPicker, key: string) => el.shadowRoot!.querySelector<HTMLInputElement>(`[data-k="${key}"]`)!;

const type = (input: HTMLInputElement, value: string) => {
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
};

describe('<zn-color-picker>', () => {
  it('shows the colour in every format', async () => {
    const el = await fixture<ZnColorPicker>(html`<zn-color-picker value="rgb(8, 94, 253)"></zn-color-picker>`);

    expect(el.value).to.equal('#085EFD');
    expect(field(el, 'hex').value).to.equal('#085EFD');
    expect([field(el, 'r').value, field(el, 'g').value, field(el, 'b').value]).to.deep.equal(['8', '94', '253']);
    expect([field(el, 'h').value, field(el, 's').value, field(el, 'l').value]).to.deep.equal(['219', '98', '51']);
    expect([field(el, 'ol').value, field(el, 'oc').value, field(el, 'oh').value]).to.deep.equal(['54.8', '0.247', '262']);
  });

  it('updates the other rows when one is edited and switches to its format', async () => {
    const el = await fixture<ZnColorPicker>(html`<zn-color-picker value="#085EFD"></zn-color-picker>`);

    const changed = oneEvent(el, 'zn-input');
    type(field(el, 'g'), '200');
    await changed;
    await el.updateComplete;

    expect(el.value).to.equal('#08C8FD');
    expect(el.format).to.equal('rgb');
    expect(field(el, 'hex').value).to.equal('#08C8FD');
    expect(field(el, 'g').value).to.equal('200');
  });

  it('marks an out-of-range value red without changing the colour', async () => {
    const el = await fixture<ZnColorPicker>(html`<zn-color-picker value="#085EFD"></zn-color-picker>`);

    type(field(el, 'r'), '300');
    await el.updateComplete;

    expect(field(el, 'r').getAttribute('aria-invalid')).to.equal('true');
    expect(el.value).to.equal('#085EFD');
  });

  it('moves brightness with the arrow keys', async () => {
    const el = await fixture<ZnColorPicker>(html`<zn-color-picker value="#FFFFFF"></zn-color-picker>`);
    const area = el.shadowRoot!.querySelector<HTMLElement>('.color-picker__area')!;

    area.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));
    await el.updateComplete;

    expect(el.value).to.equal('#FCFCFC');
  });
});
