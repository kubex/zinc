import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnRemarkdEditor from './remarkd-editor.component';

describe('<zn-remarkd-editor>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-remarkd-editor></zn-remarkd-editor>`);
    expect(el).to.exist;
  });

  it('should split the value into rendered remarkd blocks', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="# Title

NOTE: a note"></zn-remarkd-editor>`);
    const blocks = el.shadowRoot!.querySelectorAll('.remarkd-editor__block');
    expect(blocks.length).to.equal(2);
    expect(blocks[1].innerHTML).to.contain('hint-note');
  });

  it('should keep fenced content as a single block', async () => {
    const fenced = '```\n\ncode\n\n```';
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${fenced}></zn-remarkd-editor>`);
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
  });

  it('should swap a block to source editing on click and commit on blur', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="# Title"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    expect(input).to.exist;
    expect(input.value).to.equal('# Title');

    input.value = '# Changed';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('blur'));
    await el.updateComplete;

    expect(el.value).to.equal('# Changed');
    expect(el.shadowRoot!.querySelector('.remarkd-editor__rendered')!.innerHTML).to.contain('Changed');
  });

  it('should remove a block committed as empty', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="# Title

Second"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelectorAll<HTMLElement>('.remarkd-editor__rendered')[1].click();
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.value = '';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('blur'));
    await el.updateComplete;

    expect(el.value).to.equal('# Title');
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
  });

  it('should render an always-visible toolbar', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor></zn-remarkd-editor>`);
    expect(el.shadowRoot!.querySelector('.remarkd-editor__toolbar')).to.exist;
  });

  it('should open the slash menu when "/" starts an empty block', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.value = '/';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.remarkd-editor__slash-menu')).to.exist;
  });

  it('should start a new block on shift+enter', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="First"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', shiftKey: true, bubbles: true}));
    await el.updateComplete;

    // First block committed and rendered; a fresh draft textarea sits below it.
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
    const draft = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    expect(draft).to.exist;
    expect(draft.value).to.equal('');
  });

  it('should open the image dialog from the toolbar', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor></zn-remarkd-editor>`);
    const buttons = el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button');
    const imageButton = buttons[buttons.length - 1];
    imageButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('.remarkd-editor__image-dialog')!;
    expect(dialog).to.exist;
    // No attachment-url configured — the dialog falls back to a URL input.
    expect(el.shadowRoot!.querySelector('.remarkd-editor__image-url')).to.exist;
  });

  it('should toggle a checkbox in the source instead of opening the editor', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="- [ ] First
- [x] Second"></zn-remarkd-editor>`);
    const boxes = el.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    boxes[0].dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    expect(el.value).to.equal('- [x] First\n- [x] Second');
    expect(el.shadowRoot!.querySelector('.remarkd-editor__input')).to.not.exist;
  });

  it('should emit zn-change when a block edit changes the value', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    let fired = false;
    el.addEventListener('zn-change', () => {
      fired = true;
    });

    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.value = 'Hello world';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('blur'));
    await el.updateComplete;

    expect(fired).to.be.true;
  });
});
