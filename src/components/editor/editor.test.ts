import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnEditor from './editor.component';

describe('<zn-editor>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-editor></zn-editor> `);

    expect(el).to.exist;
  });

  describe('attachments', () => {
    type Uploading = ZnEditor & {uploader: unknown; attachFile: (file: File) => void; stackAttachments: number};
    const pending = () => new Promise<never>(() => undefined);
    const editorWith = async (attrs: {condensed?: boolean; stack?: number; height?: number}, upload: () => Promise<never> = pending) => {
      const el = await fixture<Uploading>(html`
        <zn-editor attachments
                   ?condensed-attachments=${attrs.condensed}
                   stack-attachments=${attrs.stack ?? 4}
                   style="height: ${attrs.height ?? 600}px"></zn-editor>`);
      el.uploader = upload;
      return el;
    };
    const attach = async (el: Uploading, count: number) => {
      for (let i = 0; i < count; i++) el.attachFile(new File(['x'], `file-${i}.pdf`));
      await aTimeout(0);
    };
    const tiles = (el: Uploading) => Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.attachment'));
    const stacked = (el: Uploading) => el.shadowRoot!.querySelector('.attachments')!.classList.contains('attachments--stacked');
    const badge = (el: Uploading) => el.shadowRoot!.querySelector<HTMLButtonElement>('.attachments__badge');

    it('draws condensed tiles on one line in every state, with the status in the tooltip', async () => {
      const full = await editorWith({});
      await attach(full, 1);
      const condensed = await editorWith({condensed: true});
      await attach(condensed, 1);
      expect(tiles(condensed)[0].offsetHeight).to.be.lessThan(tiles(full)[0].offsetHeight);

      const failing = await editorWith({condensed: true}, () => Promise.reject(new Error('down')));
      await attach(failing, 1);
      await aTimeout(0);
      const failed = tiles(failing)[0];
      expect(failed.dataset.state).to.equal('failed');
      expect(failed.offsetHeight, 'still one line').to.equal(tiles(condensed)[0].offsetHeight);
      expect(failed.title).to.equal('file-0.pdf · Upload failed');
      expect(failed.querySelector('.attachment__retry')!.getAttribute('aria-label')).to.equal('Retry upload of file-0.pdf');
    });

    it('piles four files up, newest in front, and fans them out from the front one\'s badge', async () => {
      const el = await editorWith({});
      await attach(el, 3);
      expect(stacked(el), 'three files stay as tiles').to.be.false;

      await attach(el, 1);
      expect(stacked(el)).to.be.true;
      const front = tiles(el)[3];
      expect(badge(el)!.closest('.attachment'), 'the badge is on the newest').to.equal(front);
      expect(badge(el)!.dataset.count).to.equal('3');
      expect(badge(el)!.getAttribute('aria-label')).to.equal('Show 3 more attachments');
      expect(tiles(el).slice(0, 3).every(tile => tile.inert), 'those behind are out of reach').to.be.true;

      badge(el)!.click();
      expect(el.shadowRoot!.querySelector('.attachments--open')).to.exist;
      expect(badge(el)!.getAttribute('aria-expanded')).to.equal('true');
      expect(tiles(el).some(tile => tile.inert)).to.be.false;

      document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, composed: true}));
      expect(el.shadowRoot!.querySelector('.attachments--open'), 'a press elsewhere stacks them again').to.equal(null);

      front.querySelector<HTMLButtonElement>('.attachment__remove')!.click();
      expect(stacked(el), 'back to tiles at three').to.be.false;
      expect(badge(el)).to.equal(null);
      expect(tiles(el).some(tile => tile.inert)).to.be.false;
    });

    it('attaches a file dropped on the text, and puts a pasted image in the text as well as attaching it', async () => {
      const el = await fixture<Uploading>(html`<zn-editor attachments images style="height: 400px"></zn-editor>`);
      el.uploader = pending;
      const root = el.commands.root;
      el.commands.setSelection(0);

      const drop = new DataTransfer();
      drop.items.add(new File(['notes'], 'notes.txt', {type: 'text/plain'}));
      const dropped = new DragEvent('drop', {dataTransfer: drop, bubbles: true, cancelable: true});
      root.dispatchEvent(dropped);
      expect(dropped.defaultPrevented, 'the browser doesn\'t open the file').to.be.true;
      await aTimeout(0);
      expect(tiles(el).map(tile => tile.querySelector('.attachment__name')!.textContent)).to.deep.equal(['notes.txt']);

      const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));
      const paste = new DataTransfer();
      paste.items.add(new File([png], 'screenshot.png', {type: 'image/png'}));
      root.dispatchEvent(new ClipboardEvent('paste', {clipboardData: paste, bubbles: true, cancelable: true}));
      await waitUntil(() => root.querySelector('img'), 'the pasted image should be in the text');
      expect(root.querySelector('img')!.getAttribute('src')).to.match(/^data:image\/png;base64,/);
      expect(tiles(el).map(tile => tile.querySelector('.attachment__name')!.textContent)).to.deep.equal(['notes.txt', 'screenshot.png']);
    });

    it('keeps taking files after an app empties #attachment-container, as K4 does on send', async () => {
      const el = await editorWith({});
      await attach(el, 2);
      el.shadowRoot!.querySelector('#attachment-container')!.replaceChildren();
      expect(tiles(el)).to.have.length(0);

      await attach(el, 1);
      expect(tiles(el)).to.have.length(1);
      expect(el.shadowRoot!.querySelector('.attachments')!.contains(tiles(el)[0]), 'shown in the editor').to.be.true;
      expect(tiles(el)[0].isConnected).to.be.true;
    });

    it('scrolls a fanned stack taller than the text area, with a button for the files out of view', async () => {
      const el = await editorWith({height: 240});
      await attach(el, 8);
      badge(el)!.click();
      const more = (where: string) => el.shadowRoot!.querySelector<HTMLButtonElement>(`.attachments__more--${where}`)!;
      const away = () => tiles(el).filter(tile => tile.classList.contains('attachment--away'));
      expect(away().length, 'some are out of view').to.be.greaterThan(0);
      expect(away().every(tile => tile.inert)).to.be.true;
      expect(more('above').hidden).to.be.false;
      expect(more('below').hidden, 'nothing has scrolled below yet').to.be.true;

      const hiddenAbove = Number(more('above').textContent!.match(/\d+/)![0]);
      expect(hiddenAbove).to.equal(away().length);
      more('above').click();
      expect(more('below').hidden, 'the newest have scrolled below').to.be.false;
      expect(tiles(el)[7].classList.contains('attachment--away'), 'the whole column scrolls, newest included').to.be.true;
      more('below').click();
      expect(more('below').hidden, 'back to the newest').to.be.true;

      // A wheel in the gap between two files still scrolls the stack
      const [lower, upper] = tiles(el).filter(tile => !tile.classList.contains('attachment--away')).slice(-2).reverse();
      const gapY = (lower.getBoundingClientRect().top + upper.getBoundingClientRect().bottom) / 2;
      const x = lower.getBoundingClientRect().left + 20;
      const target = el.shadowRoot!.elementFromPoint(x, gapY)!;
      expect(el.shadowRoot!.querySelector('.attachments')!.contains(target), 'the gap belongs to the stack').to.be.true;
      target.dispatchEvent(new WheelEvent('wheel', {deltaY: -120, bubbles: true, composed: true, cancelable: true}));
      expect(more('below').hidden, 'scrolled from the gap').to.be.false;
    });

    it('stacks from the number the app sets, and never at 0', async () => {
      const early = await editorWith({stack: 2});
      await attach(early, 2);
      expect(stacked(early)).to.be.true;

      const never = await editorWith({stack: 0});
      await attach(never, 6);
      expect(stacked(never)).to.be.false;
      never.stackAttachments = 5;
      await never.updateComplete;
      expect(stacked(never), 'a new limit applies at once').to.be.true;
    });

    it('marks the badge when any file behind the front one failed, after fanning out too', async () => {
      const el = await editorWith({}, () => Promise.reject(new Error('down')));
      await attach(el, 4);
      await aTimeout(0);
      expect(badge(el)!.classList.contains('attachments__badge--alert')).to.be.true;
      expect(badge(el)!.getAttribute('aria-label')).to.equal('Show 3 more attachments, 3 failed');
      badge(el)!.click();
      badge(el)!.click();
      expect(badge(el)!.getAttribute('aria-label')).to.equal('Show 3 more attachments, 3 failed');
    });

    it('lets Escape through to the page once an editor with a fanned-out stack is removed', async () => {
      const el = await editorWith({});
      await attach(el, 4);
      badge(el)!.click();
      el.remove();
      const escape = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true});
      let reached = false;
      const listener = () => (reached = true);
      document.addEventListener('keydown', listener);
      document.body.dispatchEvent(escape);
      document.removeEventListener('keydown', listener);
      expect(reached).to.be.true;
    });
  });

  describe('content caching', () => {
    const KEY = 'zned:test-draft';

    afterEach(() => {
      sessionStorage.removeItem(KEY);
      localStorage.removeItem(KEY);
    });

    it('should restore cached content into an empty editor', async () => {
      sessionStorage.setItem(KEY, '0,<p>Hello draft</p>');
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft"></zn-editor>`);

      expect(el.value).to.contain('Hello draft');
    });

    it('should not overwrite an initial value with cached content', async () => {
      sessionStorage.setItem(KEY, '0,<p>Hello draft</p>');
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft" .value=${'<p>Existing</p>'}></zn-editor>`);

      expect(el.value).to.contain('Existing');
      expect(el.value).to.not.contain('Hello draft');
    });

    it('should read from localStorage when local-storage is set', async () => {
      localStorage.setItem(KEY, '0,<p>Local draft</p>');
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft" local-storage></zn-editor>`);

      expect(el.value).to.contain('Local draft');
    });

    it('should cache content when the editor changes', async () => {
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft" .value=${'<p>Typed reply</p>'}></zn-editor>`);

      document.dispatchEvent(new Event('zn-editor-update'));
      await el.updateComplete;

      expect(sessionStorage.getItem(KEY)).to.contain('Typed reply');
    });

    it('should clear cached content on form submit', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form @submit=${(e: Event) => e.preventDefault()}>
          <zn-editor store-key="test-draft" .value=${'<p>Typed reply</p>'}></zn-editor>
        </form>`);
      const el = form.querySelector<ZnEditor>('zn-editor')!;

      document.dispatchEvent(new Event('zn-editor-update'));
      await el.updateComplete;
      expect(sessionStorage.getItem(KEY)).to.contain('Typed reply');

      form.requestSubmit();
      expect(sessionStorage.getItem(KEY)).to.equal(null);
    });
  });

  describe('chat', () => {
    const chatForm = async (value = '<p>Hi there</p>') => {
      let posted: FormDataEntryValue | null = null;
      const form = await fixture<HTMLFormElement>(html`
        <form @submit=${(e: SubmitEvent) => {
          e.preventDefault();
          posted = new FormData(e.target as HTMLFormElement).get('body');
        }}>
          <zn-editor name="body" .value=${value}></zn-editor>
        </form>`);
      const el = form.querySelector<ZnEditor>('zn-editor')!;
      await el.updateComplete;
      el.commands.setSelection(8);
      return {el, posted: () => posted};
    };
    const pressEnter = (el: ZnEditor, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', {key: 'Enter', shiftKey, bubbles: true, composed: true, cancelable: true});
      el.commands.root.dispatchEvent(event);
      return event;
    };

    it('sends the message on Enter, then clears the editor', async () => {
      const {el, posted} = await chatForm();
      let sent: string | undefined;
      el.addEventListener('zn-submit', e => (sent = (e as CustomEvent<{value: string}>).detail.value));

      expect(pressEnter(el).defaultPrevented).to.be.true;

      expect(sent).to.equal('<p>Hi there</p>');
      expect(posted()).to.equal('<p>Hi there</p>');
      expect(el.value).to.equal('');
    });

    it('starts the next message as a plain paragraph, whatever the sent one started with', async () => {
      const {el} = await chatForm('<h1 class="ql-align-center">Hi there</h1>');
      pressEnter(el);
      expect(el.commands.root.innerHTML).to.equal('<p><br></p>');

      el.commands.insertText(0, 'Next');
      expect(el.value).to.equal('<p>Next</p>');
    });

    it('keeps Shift+Enter for a new line', async () => {
      const {el, posted} = await chatForm();

      expect(pressEnter(el, true).defaultPrevented).to.be.false;
      expect(posted()).to.equal(null);
      expect(el.value).to.equal('<p>Hi there</p>');
    });
  });

  describe('link prompt', () => {
    type Field = HTMLElement & {value: string};
    const LINK = '<a href="https://x.test" target="_blank" rel="noopener noreferrer">';

    const clickLink = async (el: ZnEditor) => {
      el.commands.setSelection(8);
      el.commands.root.querySelector('a')!.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
      await el.updateComplete;
      const prompt = el.shadowRoot!.querySelector<HTMLElement>('.editor__prompt')!;
      return {
        prompt,
        text: prompt.querySelector<Field>('.editor__prompt-text')!,
        url: prompt.querySelector<Field>('.editor__prompt-url')!,
      };
    };
    const save = (field: Field) => field.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, composed: true, cancelable: true}));

    it('opens on a clicked link with its text and URL', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor links .value=${`<p>See ${LINK}the docs</a></p>`}></zn-editor>`);
      const {prompt, text, url} = await clickLink(el);

      expect(prompt.hidden).to.be.false;
      expect(text.value).to.equal('the docs');
      expect(url.value).to.equal('https://x.test');
    });

    it('changes the text and URL of a clicked link', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor links .value=${`<p>See ${LINK}the docs</a></p>`}></zn-editor>`);
      const {text, url} = await clickLink(el);
      text.value = 'our guide';
      url.value = 'https://y.test';
      save(url);

      expect(el.value).to.equal('<p>See <a href="https://y.test" target="_blank" rel="noopener noreferrer">our guide</a></p>');
    });

    it('keeps formatting inside a link when only its URL changes', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor links .value=${`<p>See ${LINK}<strong>the docs</strong></a></p>`}></zn-editor>`);
      const {url} = await clickLink(el);
      url.value = 'https://y.test';
      save(url);

      expect(el.commands.getFormat(4, 8)).to.deep.equal({bold: true, link: 'https://y.test'});
    });

    it('saves a link with nothing selected when Save is clicked', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor links .value=${'<p>Visit</p>'}></zn-editor>`);
      el.commands.setSelection(5);
      el.commands.dispatchEvent(new CustomEvent('link-request'));
      await el.updateComplete;
      const prompt = el.shadowRoot!.querySelector<HTMLElement>('.editor__prompt')!;
      const input = prompt.querySelector<HTMLElement & {value: string}>('.editor__prompt-url')!;
      input.value = 'https://x.test';

      const saveButton = prompt.querySelector('.editor__prompt-actions zn-button:last-child')!;
      const press = new MouseEvent('mousedown', {bubbles: true, composed: true, cancelable: true});
      saveButton.dispatchEvent(press);
      // Safari leaves a clicked button unfocused, so a press the prompt doesn't hold blurs the field
      if (!press.defaultPrevented) input.blur();
      saveButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));

      expect(el.value).to.equal('<p>Visit<a href="https://x.test" target="_blank" rel="noopener noreferrer">https://x.test</a></p>');
      await el.updateComplete;
      expect(prompt.hidden).to.be.true;
    });
  });

  describe('merge fields', () => {
    it('should show tokens as labelled chips and keep the raw token in the value', async () => {
      const el = await fixture<ZnEditor>(html`
        <zn-editor merge-fields .value=${'<p>Hi {{ recipient.firstName }}</p>'}>
          <zn-editor-quick-action slot="context-items" icon="braces@lu" label="First name"
                                  content="{{recipient.firstName}}"></zn-editor-quick-action>
        </zn-editor>`);

      const chip = el.shadowRoot!.querySelector<HTMLElement>('[data-token]')!;
      expect(chip.textContent).to.contain('First name');

      el.commands.insertText(0, 'Oh ');
      expect(el.value).to.equal('<p>Oh Hi {{recipient.firstName}}</p>');
    });
  });

  describe('document mode', () => {
    it('should render designed HTML in place and keep it as written', async () => {
      const markup = '<table width="600"><tbody><tr><td style="color:red">Hi</td></tr></tbody></table>';
      const el = await fixture<ZnEditor>(html`<zn-editor document-mode .value=${markup}></zn-editor>`);

      const frame = el.shadowRoot!.querySelector<HTMLIFrameElement>('.editor__document')!;
      await new Promise(resolve => frame.addEventListener('load', resolve, {once: true}));
      expect(frame.contentDocument!.querySelector('td')!.getAttribute('style')).to.equal('color:red');
      expect(el.value).to.equal(markup);
    });
  });

  it('leaves focus where it was while it loads', async () => {
    const page = await fixture<HTMLElement>(html`<div><button>Row</button></div>`);
    const row = page.querySelector('button')!;
    row.focus();

    page.appendChild(document.createElement('zn-editor'));
    await aTimeout(300);
    expect(document.activeElement).to.equal(row);
  });

  it('takes focus as it loads when it has autofocus', async () => {
    const page = await fixture<HTMLElement>(html`<div><button>Row</button></div>`);
    page.querySelector('button')!.focus();

    const editor = document.createElement('zn-editor');
    editor.setAttribute('autofocus', '');
    page.appendChild(editor);
    await aTimeout(300);
    expect(document.activeElement).to.equal(editor);
  });
});
