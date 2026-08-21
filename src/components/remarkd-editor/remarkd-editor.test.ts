import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnButton from '../button';
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

  /** Every icon-only button needs a name of its own — it has no text for a screen reader to read. */
  async function expectNamedIconButtons(el: ZnRemarkdEditor, root: ParentNode = el.shadowRoot!) {
    const iconOnly = [...root.querySelectorAll<ZnButton>('zn-button')].filter(b => !b.textContent!.trim());
    expect(iconOnly.length).to.be.greaterThan(0);

    for (const button of iconOnly) {
      await button.updateComplete;
      const name = button.shadowRoot!.querySelector('button')!.getAttribute('aria-label');
      expect(name, `the ${button.getAttribute('icon')} button has no accessible name`)
        .to.be.a('string').and.not.empty;
    }
  }

  it('should give every toolbar icon button an accessible name', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor allow-raw include-url="/includes"></zn-remarkd-editor>`);
    const toolbar = el.shadowRoot!.querySelector('.remarkd-editor__toolbar')!;
    expect(toolbar.querySelectorAll('zn-button').length).to.be.greaterThan(1);
    await expectNamedIconButtons(el, toolbar);
    // color-contrast is a pre-existing failure on the placeholder's shared
    // --zn-color-neutral-400 token, unrelated to the buttons under test.
    await expect(el).to.be.accessible({ignoredRules: ['color-contrast']});
  });

  it('should give every block action icon button an accessible name', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="# Title"></zn-remarkd-editor>`);
    await expectNamedIconButtons(el, el.shadowRoot!.querySelector('.remarkd-editor__block')!);
  });

  it('should give every image control icon button an accessible name', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="image::photo.png[Alt,640,480]"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    await expectNamedIconButtons(el, el.shadowRoot!.querySelector('.remarkd-editor__image-controls')!);
  });

  /** A document tall enough to overflow the editor's max height. */
  const longValue = Array.from({length: 60}, (_, i) => `Paragraph ${i}`).join('\n\n');

  it('should not grow taller than the viewport', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${longValue}></zn-remarkd-editor>`);
    expect(el.getBoundingClientRect().height).to.be.at.most(window.innerHeight + 1);
  });

  /** Adds a block below the middle block via its gutter button. */
  async function addBlockMidDocument(el: ZnRemarkdEditor) {
    const blocks = el.shadowRoot!.querySelectorAll('.remarkd-editor__block');
    blocks[Math.floor(blocks.length / 2)].querySelector('.remarkd-editor__actions zn-button')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__input'), 'no block opened');
  }

  it('should centre a newly added block in its own body', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${longValue}></zn-remarkd-editor>`);
    const body = el.shadowRoot!.querySelector('.remarkd-editor__body')!;
    await addBlockMidDocument(el);

    const bodyBox = body.getBoundingClientRect();
    const inputBox = el.shadowRoot!.querySelector('.remarkd-editor__input')!.getBoundingClientRect();
    expect(body.scrollTop, 'the body never scrolled').to.be.greaterThan(0);
    expect(Math.abs((inputBox.top - bodyBox.top) - (bodyBox.bottom - inputBox.bottom)),
      'the new block is not centred').to.be.lessThan(60);
  });

  it('should not scroll an enclosing panel when a block is added', async () => {
    // An `overflow: hidden` panel has no scrollbar but is still scrollable in code, so
    // scrollIntoView() or a plain focus() would shift it with no way to scroll back.
    const panel = await fixture<HTMLDivElement>(html`
      <div style="height: 200px; overflow: hidden">
        <zn-remarkd-editor value=${longValue}></zn-remarkd-editor>
        <div style="height: 900px"></div>
      </div>`);
    const el = panel.querySelector<ZnRemarkdEditor>('zn-remarkd-editor')!;
    await el.updateComplete;
    const body = el.shadowRoot!.querySelector('.remarkd-editor__body')!;
    await addBlockMidDocument(el);

    expect(body.scrollTop, 'the editor body should still scroll').to.be.greaterThan(0);
    expect(panel.scrollTop, 'the enclosing panel was scrolled').to.equal(0);
  });

  it('should not scroll an enclosing scroller when an image block is added', async () => {
    const panel = await fixture<HTMLDivElement>(html`
      <div style="height: 200px; overflow: auto">
        <zn-remarkd-editor value=${longValue}></zn-remarkd-editor>
        <div style="height: 900px"></div>
      </div>`);
    const el = panel.querySelector<ZnRemarkdEditor>('zn-remarkd-editor')!;
    await el.updateComplete;
    const body = el.shadowRoot!.querySelector('.remarkd-editor__body')!;
    expect(panel.scrollHeight - panel.clientHeight, 'the panel needs room to scroll')
      .to.be.greaterThan(0);

    // A 1x1 gif: an image block whose height only lands once it loads.
    const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    el.value = `${longValue}\n\nimage::${src}[pixel]`;
    await el.updateComplete;
    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__block img'), 'no image block');

    expect(panel.scrollTop, 'the enclosing scroller was scrolled').to.equal(0);
    expect(body.scrollTop, 'the body should be scrollable').to.be.at.least(0);
  });

  it('should keep scrolling while a drag is held at the edge', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${longValue}></zn-remarkd-editor>`);
    const body = el.shadowRoot!.querySelector('.remarkd-editor__body')!;
    const handle = el.shadowRoot!.querySelectorAll('.remarkd-editor__block')[1]
      .querySelector('.remarkd-editor__drag-handle')!;
    const from = handle.getBoundingClientRect();
    const drag = (type: string, clientY: number, target: EventTarget, buttons = 1) =>
      target.dispatchEvent(new PointerEvent(type, {
        bubbles: true, composed: true, cancelable: true,
        clientX: Math.round(from.left + 5), clientY, button: 0, buttons,
      }));

    drag('pointerdown', Math.round(from.top + 5), handle);
    drag('pointermove', Math.round(from.top + 20), document);
    expect(el.shadowRoot!.querySelector('.remarkd-editor__ghost'), 'the drag never started').to.exist;

    // Park the pointer in the bottom edge zone — the frame loop scrolls without further moves.
    drag('pointermove', Math.round(body.getBoundingClientRect().bottom - 20), document);
    await waitUntil(() => body.scrollTop > 0, 'a drag held at the edge never scrolled');

    drag('pointercancel', 0, document, 0);
    const settled = body.scrollTop;
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(body.scrollTop, 'scrolling continued after the drag ended').to.equal(settled);
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
  it('should keep an include directive in a block of its own', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Intro
include::inc-1[Payment Terms]
Outro"></zn-remarkd-editor>`);

    const blocks = el.shadowRoot!.querySelectorAll('.remarkd-editor__block');
    expect(blocks.length).to.equal(3);
    expect(blocks[1].querySelector('.remarkd-editor__include-title')!.textContent).to.contain('Payment Terms');
    expect(blocks[0].querySelector('.remarkd-editor__include')).to.not.exist;
  });

  it('should leave an include directive inside a fence alone', async () => {
    const fenced = '```\ninclude::inc-1[Payment Terms]\n```';
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${fenced}></zn-remarkd-editor>`);

    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
    expect(el.shadowRoot!.querySelector('.remarkd-editor__include')).to.not.exist;
  });

  it('should label an include chip from the marker when no list is configured', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="include::inc-1[Payment Terms]"></zn-remarkd-editor>`);

    const chip = el.shadowRoot!.querySelector('.remarkd-editor__include')!;
    expect(chip.querySelector('.remarkd-editor__include-title')!.textContent).to.contain('Payment Terms');
    expect(chip.classList.contains('remarkd-editor__include--missing')).to.be.false;
  });

  // Ordering an embed within the content is the whole point of the chip: the
  // block chrome's drag handle has to move it like any other block.
  it('should reorder an include block by dragging its handle', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Intro

include::inc-1[Payment Terms]"></zn-remarkd-editor>`);

    const first = el.shadowRoot!.querySelectorAll('.remarkd-editor__block')[0].getBoundingClientRect();
    const handle = el.shadowRoot!.querySelectorAll<HTMLElement>('.remarkd-editor__drag-handle')[1];
    const target = first.top + 1;

    handle.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, button: 0, buttons: 1, clientX: 0, clientY: 0}));
    document.dispatchEvent(new PointerEvent('pointermove', {bubbles: true, buttons: 1, clientX: 0, clientY: target}));
    document.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, buttons: 0, clientX: 0, clientY: target}));
    await el.updateComplete;

    expect(el.value).to.equal('include::inc-1[Payment Terms]\n\nIntro');
  });
  /** Serves one include list to the editor, and restores fetch when the test ends. */
  function stubIncludeList(items: unknown[]): void {
    const original = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({items}),
      {headers: {'Content-Type': 'application/json'}}));
    afterEach(() => {
      window.fetch = original;
    });
  }

  it('should label an include chip from the fetched list', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Refund Policy', scope: 'Global',
      languages: 'English', url: '/kb/kb1/includes/inc-1'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options"
                         value="include::inc-1[Stale Title]"></zn-remarkd-editor>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-link'),
      'the include list never resolved');
    const chip = el.shadowRoot!.querySelector('.remarkd-editor__include')!;
    expect(chip.querySelector('.remarkd-editor__include-title')!.textContent).to.contain('Refund Policy');
    expect(chip.querySelector('.remarkd-editor__include-scope')!.textContent).to.contain('Global');
    expect(chip.querySelector<HTMLAnchorElement>('.remarkd-editor__include-link')!.getAttribute('href'))
      .to.equal('/kb/kb1/includes/inc-1');
    expect(chip.classList.contains('remarkd-editor__include--missing')).to.be.false;
  });

  it('should flag an include the list does not know', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Refund Policy'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options"
                         value="include::inc-9[Archived]"></zn-remarkd-editor>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include--missing'),
      'the missing state never rendered');
    expect(el.shadowRoot!.querySelector('.remarkd-editor__include-meta')!.textContent).to.contain('inc-9');
  });

  // remarkd's file include shares the syntax, so an unknown path is not broken.
  it('should not flag a file include the list does not know', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Refund Policy'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options"
                         value="include::partials/legal.adoc[Legal]"></zn-remarkd-editor>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include'),
      'the chip never rendered');
    expect(el.shadowRoot!.querySelector('.remarkd-editor__include--missing')).to.not.exist;
  });

  it('should not request the include list for a document with no embeds', async () => {
    const original = window.fetch;
    let requests = 0;
    window.fetch = () => {
      requests++;
      return Promise.resolve(new Response('{"items":[]}'));
    };
    try {
      const el = await fixture<ZnRemarkdEditor>(html`
        <zn-remarkd-editor include-url="/options" value="# Title"></zn-remarkd-editor>`);
      await el.updateComplete;
      expect(requests).to.equal(0);
    } finally {
      window.fetch = original;
    }
  });
  it('should insert an include marker from the toolbar picker', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Refund Policy', scope: 'Global', languages: 'English'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options" value="# Title"></zn-remarkd-editor>`);

    const buttons = el.shadowRoot!.querySelectorAll<HTMLElement>('.remarkd-editor__toolbar zn-button');
    const includeButton = buttons[buttons.length - 1];
    includeButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-option'),
      'the include picker never listed anything');
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__include-option')!.click();
    await el.updateComplete;

    expect(el.value).to.equal('# Title\n\ninclude::inc-1[Refund Policy]');
  });

  it('should swap the slash command for the include picker when Include is chosen', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Refund Policy', languages: 'English'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options" value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = typeInBlock(el, '/include');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-picker'),
      'the include picker never opened');

    // The "/include" draft is dropped rather than committed as a block.
    expect(el.value).to.equal('');
  });

  it('should filter the include picker', async () => {
    stubIncludeList([
      {id: 'inc-1', title: 'Refund Policy', keywords: ['money'], languages: 'English'},
      {id: 'inc-2', title: 'Shipping', languages: 'English'},
    ]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options" value="# Title"></zn-remarkd-editor>`);
    const buttons = el.shadowRoot!.querySelectorAll<HTMLElement>('.remarkd-editor__toolbar zn-button');
    buttons[buttons.length - 1].dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await waitUntil(() => el.shadowRoot!.querySelectorAll('.remarkd-editor__include-option').length === 2,
      'the include picker never listed both');

    const filter = el.shadowRoot!.querySelector<HTMLInputElement>('.remarkd-editor__include-filter')!;
    filter.value = 'money';
    filter.dispatchEvent(new Event('input', {bubbles: true}));
    await el.updateComplete;

    const options = el.shadowRoot!.querySelectorAll('.remarkd-editor__include-option');
    expect(options.length).to.equal(1);
    expect(options[0].textContent).to.contain('Refund Policy');
  });

  it('should offer no include entry points without an include-url', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="# Title"></zn-remarkd-editor>`);
    const tooltips = Array.from(el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button'))
      .map(button => button.getAttribute('tooltip'));
    expect(tooltips).to.not.contain('Include');
  });
  // A list that never arrived is not evidence an embed is broken: flagging every
  // chip "not found" on a failed request sends people hunting for the wrong bug.
  it('should not flag includes when the list request fails', async () => {
    const original = window.fetch;
    window.fetch = () => Promise.resolve(new Response('nope', {status: 404}));
    try {
      const el = await fixture<ZnRemarkdEditor>(html`
        <zn-remarkd-editor include-url="/options"
                           value="include::inc-1[Payment Terms]"></zn-remarkd-editor>`);
      await el.updateComplete;
      await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include'),
        'the chip never rendered');

      const chip = el.shadowRoot!.querySelector('.remarkd-editor__include')!;
      expect(chip.classList.contains('remarkd-editor__include--missing')).to.be.false;
      expect(chip.querySelector('.remarkd-editor__include-title')!.textContent).to.contain('Payment Terms');
    } finally {
      window.fetch = original;
    }
  });

  it('should say so in the picker when the list request fails', async () => {
    const original = window.fetch;
    window.fetch = () => Promise.resolve(new Response('nope', {status: 500}));
    try {
      const el = await fixture<ZnRemarkdEditor>(html`
        <zn-remarkd-editor include-url="/options" value="# Title"></zn-remarkd-editor>`);
      const buttons = el.shadowRoot!.querySelectorAll<HTMLElement>('.remarkd-editor__toolbar zn-button');
      buttons[buttons.length - 1].dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

      await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-picker-empty')?.textContent
        ?.includes('Could not load'), 'the picker never reported the failure');
    } finally {
      window.fetch = original;
    }
  });
  // An app fragment's URLs are relative to its app base, and the console puts the
  // app's gaid on the host element. A link built client-side from JSON is inside
  // the shadow root, where a click retargets to the host, so the pagelet handler
  // never sees it — the href has to carry the base itself.
  it('should resolve an include link against the app base from gaid', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Payment Terms', scope: 'Global',
      languages: 'English', url: '/global/includes/inc-1'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/ch/kb/kb/kb1/documents/doc1/includes/options"
                         gaid="ch/kb"
                         value="include::inc-1[Payment Terms]"></zn-remarkd-editor>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-link'),
      'the include list never resolved');
    expect(el.shadowRoot!.querySelector<HTMLAnchorElement>('.remarkd-editor__include-link')!
      .getAttribute('href')).to.equal('/ch/kb/global/includes/inc-1');
  });

  it('should leave an include link alone when it already carries the app base', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Payment Terms', languages: 'English',
      url: '/ch/kb/global/includes/inc-1'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options" gaid="ch/kb"
                         value="include::inc-1[Payment Terms]"></zn-remarkd-editor>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-link'),
      'the include list never resolved');
    expect(el.shadowRoot!.querySelector<HTMLAnchorElement>('.remarkd-editor__include-link')!
      .getAttribute('href')).to.equal('/ch/kb/global/includes/inc-1');
  });

  it('should leave an include link alone without a gaid', async () => {
    stubIncludeList([{id: 'inc-1', title: 'Payment Terms', languages: 'English',
      url: '/global/includes/inc-1'}]);
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/options"
                         value="include::inc-1[Payment Terms]"></zn-remarkd-editor>`);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__include-link'),
      'the include list never resolved');
    expect(el.shadowRoot!.querySelector<HTMLAnchorElement>('.remarkd-editor__include-link')!
      .getAttribute('href')).to.equal('/global/includes/inc-1');
  });
});
