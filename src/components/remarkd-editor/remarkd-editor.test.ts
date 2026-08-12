import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnRemarkdEditor from './remarkd-editor.component';
import type ZnSlashMenu from '../slash-menu';

/** Types into the block being edited, moving the caret to the end as a keystroke would. */
function typeInBlock(el: ZnRemarkdEditor, value: string): HTMLTextAreaElement {
  const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
  input.value = value;
  input.setSelectionRange(value.length, value.length);
  input.dispatchEvent(new Event('input', {bubbles: true}));
  return input;
}

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

  it('should open zn-slash-menu with the block types when "/" starts an empty block', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    typeInBlock(el, '/');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    const menu = el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu')!;
    expect(menu.items.map(item => item.label)).to.contain('Heading 1');
    expect(menu.activeItem?.label).to.equal('Text');
  });

  it('should not open the slash menu part-way through a block', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    typeInBlock(el, 'Hello /');
    await el.updateComplete;
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(el.shadowRoot!.querySelector('zn-slash-menu[open]')).to.not.exist;
  });

  it('should insert the chosen block prefix over the slash command', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = typeInBlock(el, '/note');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    const menu = el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu')!;
    expect(menu.activeItem?.label).to.equal('Note');

    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
    await el.updateComplete;

    expect(input.value).to.equal('NOTE: ');
    expect(el.shadowRoot!.querySelector('zn-slash-menu[open]')).to.not.exist;
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

  it('should swap the slash command for the image picker when Image is chosen', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor attachment-url="/upload" value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = typeInBlock(el, '/image');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__image-picker'),
      'the image picker never opened');

    // The "/image" draft is dropped rather than committed as a block.
    expect(el.value).to.equal('');
    expect(el.shadowRoot!.querySelector('.remarkd-editor__input')).to.not.exist;
  });

  it('should show an inline zn-file picker from the toolbar image button', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor attachment-url="/upload"></zn-remarkd-editor>`);
    const buttons = el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button');
    const imageButton = buttons[buttons.length - 1];
    imageButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.remarkd-editor__body .remarkd-editor__image-picker')).to.exist;
    expect(el.shadowRoot!.querySelector('.remarkd-editor__image-file')).to.exist;
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

  it('should open image controls for an image block and save caption/align/size', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="image::photo.png[Alt,640,480]"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const panel = el.shadowRoot!.querySelector('.remarkd-editor__image-controls')!;
    expect(panel).to.exist;
    expect(el.shadowRoot!.querySelector('.remarkd-editor__input')).to.not.exist;

    const caption = panel.querySelector<HTMLInputElement>('.remarkd-editor__image-field input')!;
    caption.value = 'A caption';
    caption.dispatchEvent(new Event('input', {bubbles: true}));
    await el.updateComplete;

    const buttons = el.shadowRoot!.querySelectorAll('.remarkd-editor__image-buttons zn-button');
    buttons[0].dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    expect(el.value).to.equal('.A caption\nimage::photo.png[Alt,640,480]');
    expect(el.shadowRoot!.querySelector('.remarkd-editor__rendered')!.innerHTML).to.contain('A caption');
  });

  it('should delete a block from its hover delete button', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="# Title

Second"></zn-remarkd-editor>`);
    const deleteButton = el.shadowRoot!.querySelectorAll('.remarkd-editor__delete')[0];
    deleteButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    expect(el.value).to.equal('Second');
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
  });

  it('should only show the raw toggle when allow-raw is set', async () => {
    const plain = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    expect(plain.shadowRoot!.querySelector('.remarkd-editor__raw-toggle')).to.not.exist;

    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor allow-raw value="Hello"></zn-remarkd-editor>`);
    expect(el.shadowRoot!.querySelector('.remarkd-editor__raw-toggle')).to.exist;
  });

  it('should swap the blocks for a full-source textarea and commit edits on toggle back', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor allow-raw value="# Title

Second"></zn-remarkd-editor>`);
    let changes = 0;
    el.addEventListener('zn-change', () => {
      changes++;
    });

    const toggle = el.shadowRoot!.querySelector('.remarkd-editor__raw-toggle')!;
    toggle.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    const raw = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__raw')!;
    expect(raw).to.exist;
    expect(raw.value).to.equal('# Title\n\nSecond');
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(0);

    raw.value = '# Changed\n\nSecond\n\nThird';
    raw.dispatchEvent(new Event('input', {bubbles: true}));
    await el.updateComplete;
    expect(el.value).to.equal('# Changed\n\nSecond\n\nThird');

    el.shadowRoot!.querySelector('.remarkd-editor__raw-toggle')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    const blocks = el.shadowRoot!.querySelectorAll('.remarkd-editor__block');
    expect(blocks.length).to.equal(3);
    expect(blocks[0].innerHTML).to.contain('Changed');
    expect(changes).to.be.greaterThan(0);
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
