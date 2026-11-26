import '../../../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html, waitUntil} from '@open-wc/testing';
import {sendKeys} from '@web/test-runner-commands';
import type ZnEditor from '../../editor.component';

type Toolbar = HTMLElement & {updateComplete: Promise<boolean>};

const toolbarOf = (el: ZnEditor) => el.shadowRoot!.querySelector<Toolbar>('#toolbar')!;
const control = (el: ZnEditor, selector: string) => toolbarOf(el).shadowRoot!.querySelector<HTMLElement>(selector);
const press = (target: HTMLElement) => target.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
const settle = async (el: ZnEditor) => {
  await aTimeout(0);
  await el.updateComplete;
  await Promise.all(Array.from(el.shadowRoot!.querySelectorAll<Toolbar>('zn-toolbar')).map(t => t.updateComplete));
};

describe('<zn-editor> toolbar', () => {
  it('offers the tools its feature attributes turn on', async () => {
    const plain = await fixture<ZnEditor>(html`<zn-editor></zn-editor>`);
    await settle(plain);
    expect(control(plain, 'zn-button[data-format="bold"]')).to.exist;
    expect(control(plain, 'zn-button[data-format="link"]')).to.equal(null);

    const linked = await fixture<ZnEditor>(html`<zn-editor links dates></zn-editor>`);
    await settle(linked);
    expect(control(linked, 'zn-button[data-format="link"]')).to.exist;
    expect(control(linked, 'zn-button[data-format="date"]')).to.exist;
  });

  it('shows the smaller set when compact', async () => {
    const el = await fixture<ZnEditor>(html`<zn-editor compact links dates></zn-editor>`);
    await settle(el);
    expect(control(el, 'zn-button[data-format="bold"]')).to.exist;
    expect(control(el, 'zn-button[data-format="unlink"]')).to.exist;
    expect(control(el, 'zn-button[data-format="date"]')).to.exist;
    expect(control(el, 'zn-button[data-format="strike"]')).to.equal(null);
    expect(control(el, '.toolbar__menu--block')).to.equal(null);
  });

  it('treats compact as the field layout, both ways, with a layout named beside it winning', async () => {
    const legacy = await fixture<ZnEditor>(html`<zn-editor compact></zn-editor>`);
    expect(legacy.layout).to.equal('field');

    const field = await fixture<ZnEditor>(html`<zn-editor layout="field" links></zn-editor>`);
    await settle(field);
    expect(field.compact).to.be.true;
    expect(control(field, 'zn-button[data-format="unlink"]'), 'the small toolbar').to.exist;

    field.layout = 'toolbar';
    await field.updateComplete;
    expect(field.compact).to.be.false;
    field.compact = true;
    await field.updateComplete;
    expect(field.layout).to.equal('field');

    const composer = await fixture<ZnEditor>(html`<zn-editor layout="composer" compact></zn-editor>`);
    expect(composer.layout).to.equal('composer');
    expect(composer.compact).to.be.false;
  });

  it('applies a tool when it is clicked', async () => {
    const el = await fixture<ZnEditor>(html`<zn-editor .value=${'<p>Hello world</p>'}></zn-editor>`);
    await settle(el);
    el.commands.setSelection(6, 5);
    press(control(el, 'zn-button[data-format="bold"]')!);
    expect(el.value).to.equal('<p>Hello <strong>world</strong></p>');
  });

  it('shows the formats at the caret', async () => {
    const el = await fixture<ZnEditor>(html`<zn-editor .value=${'<h1>Title</h1><p>a <strong>bold</strong> word</p>'}></zn-editor>`);
    await settle(el);

    el.commands.setSelection(10);
    await waitUntil(() => control(el, 'zn-button[data-format="bold"]')!.hasAttribute('data-active'));
    expect(control(el, '.toolbar__menu--block > zn-button')!.textContent!.trim()).to.equal('Paragraph');

    el.commands.setSelection(2);
    await waitUntil(() => !control(el, 'zn-button[data-format="bold"]')!.hasAttribute('data-active'));
    await settle(el);
    expect(control(el, '.toolbar__menu--block > zn-button')!.textContent!.trim()).to.equal('Heading 1');
  });

  it('moves the tools that do not fit into a menu that still applies them', async () => {
    const el = await fixture<ZnEditor>(html`
      <div style="width: 340px"><zn-editor links .value=${'<p>abc</p>'}></zn-editor></div>`);
    const editor = el.querySelector<ZnEditor>('zn-editor')!;
    await waitUntil(() => control(editor, '.toolbar__overflow'), 'a "more" menu should appear', {timeout: 3000});

    editor.commands.setSelection(0, 3);
    press(control(editor, '.toolbar__overflow zn-menu-item[data-format="list"][data-format-type="bullet"]')!);
    expect(editor.value).to.equal('<ul><li>abc</li></ul>');
  });

  it('draws slotted tools like its own and applies them', async () => {
    const el = await fixture<ZnEditor>(html`
      <zn-editor .value=${'<p>abc</p>'}>
        <zn-editor-tool slot="tools" icon="highlighter@lu" label="Highlight" handler="color" uri="orange"
                        key="highlight"></zn-editor-tool>
      </zn-editor>`);
    await settle(el);
    el.commands.setSelection(0, 3);
    press(control(el, 'zn-button[data-format="color"][data-format-type="orange"]')!);
    expect(el.value).to.equal('<p><span style="color: orange;">abc</span></p>');
  });

  it('colours the selection with the swatch\'s own colour and keeps the selection', async () => {
    const el = await fixture<ZnEditor>(html`<zn-editor .value=${'<p>Hello world</p>'}></zn-editor>`);
    await settle(el);
    el.commands.setSelection(6, 5);
    const swatch = control(el, '.color-swatch[aria-label="Blue"]')!;
    const down = new MouseEvent('mousedown', {bubbles: true, composed: true, cancelable: true});
    swatch.dispatchEvent(down);
    expect(down.defaultPrevented, 'pressing a swatch leaves focus in the text').to.be.true;

    press(swatch);
    expect(el.value).to.equal('<p>Hello <span style="color: rgb(59, 130, 246);">world</span></p>');
    expect(el.commands.getSelection()).to.deep.equal({index: 6, length: 5});
    await settle(el);
    expect(control(el, '.color-swatch[aria-pressed="true"]')!.getAttribute('aria-label')).to.equal('Blue');
  });

  it('offers exactly the system\'s light-mode palette, as colour select shows it', async () => {
    const theme = Object.assign(document.createElement('link'), {rel: 'stylesheet', href: '/dist/zn.min.css'});
    await new Promise(resolve => {
      theme.onload = resolve;
      document.head.append(theme);
    });
    const mode = document.documentElement.getAttribute('m');
    document.documentElement.setAttribute('m', 'light');
    try {
      const el = await fixture<ZnEditor>(html`<zn-editor></zn-editor>`);
      await settle(el);
      const probe = document.body.appendChild(document.createElement('span'));
      // The tokens zn-color-select draws each colour from
      const tokens = {Red: 'red-500', Blue: 'blue-500', Orange: 'orange-500', Yellow: 'yellow-400', Indigo: 'indigo-500',
        Violet: 'violet-500', Green: 'green-500', Pink: 'pink-500', Gray: 'gray-500'};
      Object.entries(tokens).forEach(([name, token]) => {
        probe.style.color = `var(--zn-color-${token})`;
        const swatch = control(el, `.color-swatch[aria-label="${name}"]`)!;
        expect(getComputedStyle(swatch).backgroundColor, name).to.equal(getComputedStyle(probe).color);
      });
      probe.remove();
    } finally {
      theme.remove();
      if (mode === null) document.documentElement.removeAttribute('m');
      else document.documentElement.setAttribute('m', mode);
    }
  });

  it('opens the date picker beside its button, compact included', async () => {
    for (const compact of [false, true]) {
      const el = await fixture<ZnEditor>(html`<zn-editor dates ?compact=${compact}></zn-editor>`);
      await settle(el);
      press(control(el, 'zn-button[data-format="date"]')!);
      const picker = el.shadowRoot!.querySelector<HTMLElement & {active: boolean}>('.editor__picker')!;
      expect(picker.active, compact ? 'compact' : 'full').to.be.true;
      expect(picker.querySelector('.air-datepicker')).to.exist;
    }
  });
  it('lets Escape through to the page once an editor with an open picker is removed', async () => {
    const el = await fixture<ZnEditor>(html`<zn-editor dates></zn-editor>`);
    await settle(el);
    press(control(el, 'zn-button[data-format="date"]')!);
    el.remove();

    const escape = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true});
    document.body.dispatchEvent(escape);
    expect(escape.defaultPrevented).to.be.false;
  });

  describe('composer layout', () => {
    const inShadow = (el: ZnEditor, selector: string) => el.shadowRoot!.querySelector<HTMLElement>(selector);
    const toolbarIn = (el: ZnEditor, selector: string) => inShadow(el, selector) as Toolbar;

    it('puts the tools and actions along the bottom of the card, with no toolbar above', async () => {
      const el = await fixture<ZnEditor>(html`
        <zn-editor layout="composer" emojis links>
          <zn-button slot="actions" aria-label="Send"></zn-button>
        </zn-editor>`);
      await settle(el);
      expect(inShadow(el, '.editor__bar')).to.equal(null);
      const bar = toolbarIn(el, '.editor__composer-bar zn-toolbar[variant="bar"]');
      await bar.updateComplete;
      expect(bar.shadowRoot!.querySelector('zn-button[data-format="emoji"]')).to.exist;
      expect(bar.shadowRoot!.querySelector('.toolbar__menu--insert zn-menu-item[data-format="link"]')).to.exist;
      const actions = inShadow(el, '.editor__composer-bar slot[name="actions"]') as HTMLSlotElement;
      expect(actions.assignedElements()).to.have.length(1);
    });

    it('shows a formatting row from the Formatting toggle, and its tools apply', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor layout="composer" emojis .value=${'<p>abc</p>'}></zn-editor>`);
      await settle(el);
      expect(inShadow(el, '.editor__format')).to.equal(null);

      press(inShadow(el, '.editor__format-toggle')!);
      await el.updateComplete;
      expect(inShadow(el, '.editor__format-toggle')!.getAttribute('aria-expanded')).to.equal('true');
      const row = toolbarIn(el, '.editor__format zn-toolbar');
      await row.updateComplete;
      expect(row.shadowRoot!.querySelector('zn-button[data-format="emoji"]'), 'no pickers twice').to.equal(null);

      el.commands.setSelection(0, 3);
      press(row.shadowRoot!.querySelector<HTMLElement>('zn-button[data-format="bold"]')!);
      expect(el.value).to.equal('<p><strong>abc</strong></p>');
    });

    it('switches layout at runtime with working tools', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor .value=${'<p>abc</p>'}></zn-editor>`);
      await settle(el);
      el.layout = 'composer';
      await el.updateComplete;
      press(inShadow(el, '.editor__format-toggle')!);
      await el.updateComplete;
      const row = toolbarIn(el, '.editor__format zn-toolbar');
      await row.updateComplete;

      el.commands.setSelection(0, 3);
      press(row.shadowRoot!.querySelector<HTMLElement>('zn-button[data-format="italic"]')!);
      expect(el.value).to.equal('<p><em>abc</em></p>');
    });
  });
  describe('quiet layout', () => {
    type Popup = HTMLElement & {active: boolean};
    const bubbleOf = (el: ZnEditor) => el.shadowRoot!.querySelector<Popup>('.editor__bubble')!;
    const bubbleTools = (el: ZnEditor) => bubbleOf(el).querySelector<Toolbar>('zn-toolbar')!;

    it('has no toolbar above the text, and a footer with the inserts and actions', async () => {
      const el = await fixture<ZnEditor>(html`
        <zn-editor layout="quiet" emojis>
          <zn-button slot="actions">Send</zn-button>
        </zn-editor>`);
      await settle(el);
      expect(el.shadowRoot!.querySelector('.editor__bar')).to.equal(null);
      const footer = el.shadowRoot!.querySelector('.editor__footer')!;
      expect(footer.querySelector('zn-toolbar[variant="bar"]')).to.exist;
      const actions = footer.querySelector<HTMLSlotElement>('slot[name="actions"]')!;
      expect(actions.assignedElements()).to.have.length(1);
    });

    it('shows the formatting bar over a selection, applies from it, and hides it when the selection goes', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor layout="quiet" .value=${'<p>Hello world</p>'}></zn-editor>`);
      await settle(el);
      el.commands.setSelection(2);
      await aTimeout(50);
      expect(bubbleOf(el).active).to.be.false;

      el.commands.setSelection(6, 5);
      await waitUntil(() => bubbleOf(el).active, 'the bar should show over a selection');
      await bubbleTools(el).updateComplete;
      press(bubbleTools(el).shadowRoot!.querySelector<HTMLElement>('zn-button[data-format="bold"]')!);
      expect(el.value).to.equal('<p>Hello <strong>world</strong></p>');
      expect(bubbleOf(el).active, 'still showing after a format').to.be.true;

      el.commands.setSelection(2);
      await waitUntil(() => !bubbleOf(el).active, 'the bar should hide when the selection collapses');
    });

    it('takes the keyboard with Alt+F10 and gives it back on Escape', async () => {
      const el = await fixture<ZnEditor>(html`<zn-editor layout="quiet" .value=${'<p>Hello world</p>'}></zn-editor>`);
      await settle(el);
      el.commands.setSelection(6, 5);
      await waitUntil(() => bubbleOf(el).active);
      await waitUntil(() => bubbleTools(el).shadowRoot!.querySelector('zn-button')?.shadowRoot?.querySelector('[part~="base"]'));
      // The popup stays hidden until it has been positioned, and hidden controls can't take focus
      await waitUntil(() => {
        const popup = bubbleOf(el).shadowRoot!.querySelector<HTMLElement>('[part~="popup"]')!;
        return popup.matches(':popover-open') && getComputedStyle(popup).visibility !== 'hidden';
      });

      // The keys go wherever focus is, so make sure it is in the text with the words selected
      el.commands.setSelection(6, 5);
      await sendKeys({press: 'Alt+F10'});
      await waitUntil(() => bubbleTools(el).shadowRoot!.activeElement, 'focus should move into the bar', {timeout: 1000});
      expect(bubbleTools(el).shadowRoot!.activeElement?.getAttribute('aria-label')).to.equal('Text style');

      // A focused button shows its tooltip, and the first Escape closes that, as it closes the innermost thing first
      await sendKeys({press: 'Escape'});
      if (!el.commands.hasFocus()) await sendKeys({press: 'Escape'});
      expect(el.commands.hasFocus()).to.be.true;
      expect(el.commands.getSelection()).to.deep.equal({index: 6, length: 5});
    });

    it('offers Refine in the selection bar, and only there', async () => {
      const quiet = await fixture<ZnEditor>(html`<zn-editor layout="quiet" ai ai-path="/ai" .value=${'<p>Hello world</p>'}></zn-editor>`);
      await settle(quiet);
      expect(bubbleTools(quiet).shadowRoot!.querySelector('zn-button[data-format="ai-refine"]')).to.exist;

      const standard = await fixture<ZnEditor>(html`<zn-editor ai ai-path="/ai"></zn-editor>`);
      await settle(standard);
      expect(control(standard, 'zn-button[data-format="ai-refine"]')).to.equal(null);
    });

    it('offers Refine over a selection again after switching away from quiet', async () => {
      const text = '<p>A sentence long enough for Refine to offer itself over it.</p>';
      const el = await fixture<ZnEditor>(html`<zn-editor layout="quiet" ai ai-path="/ai" .value=${text}></zn-editor>`);
      await settle(el);
      // The tooltip lives on the page body, outside the editor
      const tooltipOpen = () => Array.from(document.querySelectorAll<HTMLElement & {open: boolean}>('zn-ai-tooltip')).some(t => t.open);
      el.commands.setSelection(0, 30);
      await aTimeout(50);
      expect(tooltipOpen(), 'no tooltip while the selection bar offers Refine').to.be.false;

      el.layout = 'toolbar';
      await el.updateComplete;
      el.commands.setSelection(2, 30);
      await waitUntil(tooltipOpen, 'the Refine tooltip should show over the selection');
    });
  });
});
