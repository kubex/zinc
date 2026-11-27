import '../../../dist/zn.min.js';
import {elementUpdated, expect, fixture, html} from '@open-wc/testing';
import type ZnTray from './tray.component';

describe('<zn-tray>', () => {
  it('lays the controls out inline above the breakpoint', async () => {
    const el = await fixture<ZnTray>(html`
      <zn-tray breakpoint="1"><input></zn-tray>`);

    expect(el.collapsed).to.be.false;
    expect(el.shadowRoot!.querySelector('.tray__trigger')).to.be.null;
    expect(el.shadowRoot!.querySelector('.tray__body slot')).to.be.null;
  });

  it('folds the controls into the sheet at or below the breakpoint', async () => {
    const el = await fixture<ZnTray>(html`
      <zn-tray breakpoint="100000" summary="Last month" count="2"><input></zn-tray>`);

    expect(el.hasAttribute('collapsed')).to.be.true;
    const trigger = el.shadowRoot!.querySelector('.tray__trigger')!;
    expect(trigger.textContent).to.contain('Last month');
    expect(trigger.getAttribute('notification')).to.equal('2');
    expect(el.shadowRoot!.querySelector('.tray__body slot')).to.exist;
  });

  it('opens and closes the sheet', async () => {
    const el = await fixture<ZnTray>(html`
      <zn-tray breakpoint="100000"><input></zn-tray>`);

    el.show();
    await elementUpdated(el);
    expect(el.sheet.open).to.be.true;

    el.hide();
    await elementUpdated(el);
    expect(el.sheet.open).to.be.false;
  });

  it('does not open while inline', async () => {
    const el = await fixture<ZnTray>(html`
      <zn-tray breakpoint="1"><input></zn-tray>`);

    el.show();
    await elementUpdated(el);
    expect(el.open).to.be.false;
    expect(el.sheet.open).to.be.false;
  });
});
