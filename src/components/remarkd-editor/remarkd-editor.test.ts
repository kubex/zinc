import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html, waitUntil} from '@open-wc/testing';
import {EDITOR_ACTIONS} from './actions';
import {FEATURE_KEYS} from './feature-keys';
import {parse as remarkdParse} from 'remarkd-js';
import type ZnButton from '../button';
import type ZnDropdown from '../dropdown';
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
  it('should insert source that renders to real output for every action', async () => {
    // Rendered by the editor's own chrome rather than the parser, or needing surrounding
    // content to produce output — measured, not assumed:
    //   attributes-title → `.Intro` alone is empty; a title decorates the block below it
    //   reference-list   → `{{reflist}}` is empty until something references it
    //   asciidoc-section → `== ` alone is empty; the section needs a body the author types
    //   hardbreaks       → `[%hardbreaks]` alone is an attribute line; it needs the paragraph
    //                       below it (real fixture: attribute line directly followed by body,
    //                       no blank line) that the helper's `\n\n` placeholder trick can't reach
    const rendersEmpty = ['attributes-title', 'reference-list', 'asciidoc-section', 'hardbreaks'];
    // Logic actions all render through the editor's own chrome (a variable chip or a
    // conditional wrapper) rather than the parser — listed explicitly, not by group, so a
    // future logic action with no chrome of its own falls through and fails this guard.
    const rendersViaChrome = ['document-attributes', 'conditionals', 'ifndef', 'ifeval',
      'iftrue', 'iffalse', 'ifempty', 'ifnempty'];
    const failures: string[] = [];
    const el = await fixture<ZnRemarkdEditor>(html`<zn-remarkd-editor></zn-remarkd-editor>`);

    for (const action of EDITOR_ACTIONS) {
      if (action.opens || action.inline) continue;

      // The prefix must survive the editor's own block splitter intact — a delimiter pair
      // with a blank line inside (e.g. Quote's `____`) that splitBlocks does not recognise
      // fractures into several separately draggable/deletable blocks the instant it lands.
      if (action.prefix?.includes('\n')) {
        el.value = action.prefix;
        await el.updateComplete;
        const blocks = el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length;
        if (blocks !== 1) failures.push(`${action.key}: split into ${blocks} blocks`);
      }

      if (rendersViaChrome.includes(action.key) || rendersEmpty.includes(action.key)) continue;
      const source = (action.prefix ?? '').replace(/\n\n/g, '\nplaceholder\n') || 'text';
      const rendered = remarkdParse(source);
      if (rendered.includes('section--empty')) failures.push(`${action.key}: ${JSON.stringify(source)}`);
    }

    expect(failures, `actions rendering nothing: ${failures.join(', ')}`).to.be.empty;
  });

  it('should fall back to the raw source when the parser throws', async () => {
    // The parser's only throw source is `readFileSync`, reached only when
    // `process.getBuiltinModule` resolves to a real `node:fs` — this harness's `process` shim
    // does not provide one, so force it to prove `safeParse`'s catch branch actually fires.
    const proc = window as unknown as {process?: {getBuiltinModule?: (name: string) => unknown}};
    const original = proc.process;
    proc.process = {
      getBuiltinModule: () => ({
        existsSync: () => true,
        readFileSync: () => {
          throw Object.assign(new Error('EISDIR: illegal operation on a directory, read'), {code: 'EISDIR'});
        },
      }),
    };

    try {
      const el = await fixture<ZnRemarkdEditor>(html`
        <zn-remarkd-editor value="t::partial::"></zn-remarkd-editor>`);
      await el.updateComplete;

      const rendered = el.shadowRoot!.querySelector('.remarkd-editor__rendered')!;
      expect(rendered.querySelector('.remarkd-editor__unparsed')).to.exist;
      expect(rendered.textContent).to.contain('t::partial::');
      expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
    } finally {
      proc.process = original;
    }
  });

  it('should not throw for any action, however incomplete', async () => {
    // In this harness `process.getBuiltinModule` is absent, so remarkd-js's own fallback
    // ("File not found") fires for `t::partial::` instead of throwing — either way the
    // block must render without crashing the editor.
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="t::partial::"></zn-remarkd-editor>`);
    await el.updateComplete;

    const rendered = el.shadowRoot!.querySelector('.remarkd-editor__rendered')!;
    expect(rendered.textContent).to.contain('File not found');
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
  });

  it('should have an action for every insertable remarkd feature', () => {
    // Fixtures that describe parser behaviour or combine other features, so they are not actions.
    const notActions = ['url-formatting-chars', 'inline-advanced', 'object-fallbacks',
      'conditionals-advanced', 'smart-quotes', 'typographic-symbols', 'emoji-aliases', 'autolink'];
    // Real actions, deliberately not offered: they render fine in this editor's TS parser but
    // not in the Go renderer the user's app ships in production, tested by the user directly.
    // `id-block` is additionally broken in remarkd itself (its own fixture enshrines the leak).
    const unsupportedByProductionRenderer = ['id-block', 'table', 'pros-cons', 'accordion'];
    // Dropped by request: `image-alignment` duplicates the image block's own alignment control,
    // and comments/highlight are not wanted in the authoring surface.
    const withdrawn = ['image-alignment', 'comments', 'highlight'];
    const covered = new Set(EDITOR_ACTIONS.map(a => a.key));
    const excluded = [...notActions, ...unsupportedByProductionRenderer, ...withdrawn];
    const missing = FEATURE_KEYS.filter(f => !excluded.includes(f) && !covered.has(f));
    expect(missing, `features with no action: ${missing.join(', ')}`).to.be.empty;
  });

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

  it('should keep a conditional range as a single block', async () => {
    const source = 'ifdef::flag[]\n\nInside the conditional\n\nendif::[]';
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${source}></zn-remarkd-editor>`);

    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
    expect(el.value).to.equal(source);
  });

  it('should keep nested conditionals in the same block', async () => {
    const source = 'ifdef::outer[]\nifdef::inner[]\nDeep\nendif::[]\nendif::[]\n\nAfter';
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${source}></zn-remarkd-editor>`);

    const blocks = el.shadowRoot!.querySelectorAll('.remarkd-editor__block');
    expect(blocks.length).to.equal(2);
    expect(el.value).to.equal(source);
  });

  it('should leave an inline conditional as an ordinary block', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="iftrue::truth[Shown inline]

After"></zn-remarkd-editor>`);
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(2);
  });

  it('should label a conditional and still render its content', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="ifdef::flag[]
Inner content
endif::[]"></zn-remarkd-editor>`);
    await el.updateComplete;

    const wrapper = el.shadowRoot!.querySelector('.remarkd-editor__conditional')!;
    expect(wrapper, 'no conditional wrapper').to.exist;
    expect(wrapper.textContent).to.contain('flag');
    // The content must survive: evaluating would hide it, since `flag` is undefined.
    expect(wrapper.textContent).to.contain('Inner content');
  });

  it('should label a negative conditional differently', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="ifndef::flag[]
Fallback
endif::[]"></zn-remarkd-editor>`);
    await el.updateComplete;
    const label = el.shadowRoot!.querySelector('.remarkd-editor__conditional-label')!;
    expect(label.textContent).to.contain('not defined');
  });

  it('should render a nested conditional as two nested labelled wrappers, without losing content', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="ifdef::outer[]
ifdef::inner[]
Deep
endif::[]
endif::[]"></zn-remarkd-editor>`);
    await el.updateComplete;

    const wrappers = el.shadowRoot!.querySelectorAll('.remarkd-editor__conditional');
    expect(wrappers.length, 'expected an outer and an inner wrapper').to.equal(2);
    expect(wrappers[0].textContent).to.contain('outer');
    expect(wrappers[1].textContent).to.contain('inner');
    // parse() evaluates a directive handed to it verbatim, which is exactly how 'Deep' used
    // to get silently dropped: the unstripped `ifdef::inner[]` line parsed to an empty section.
    expect(wrappers[1].textContent).to.contain('Deep');
  });

  it('should render content before and after a nested conditional in the same wrapper', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="ifdef::outer[]
Before

ifdef::inner[]
Nested
endif::[]

After
endif::[]"></zn-remarkd-editor>`);
    await el.updateComplete;

    const wrappers = el.shadowRoot!.querySelectorAll('.remarkd-editor__conditional');
    expect(wrappers.length).to.equal(2);
    // Exercises the plain-content-run splitting on both sides of the nested range, not just
    // a single run either before or after it.
    expect(wrappers[0].textContent).to.contain('Before');
    expect(wrappers[0].textContent).to.contain('Nested');
    expect(wrappers[0].textContent).to.contain('After');
  });

  it('should not lose content from a conditional nested inside an unclosed range', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="ifdef::outer[]
Before
ifdef::inner[]
Deep"></zn-remarkd-editor>`);
    await el.updateComplete;

    const wrappers = el.shadowRoot!.querySelectorAll('.remarkd-editor__conditional');
    expect(wrappers.length, 'expected an outer and an inner wrapper').to.equal(2);
    expect(wrappers[0].textContent).to.contain('Before');
    // Neither ifdef has a closing endif::[] anywhere in the source; the nested one must
    // still show its content rather than being evaluated (and blanked) as an unmatched directive.
    expect(wrappers[1].textContent).to.contain('Deep');
  });

  it('should mark and render each single-line conditional form, never evaluating it', async () => {
    // Measured against the real parser: iftrue/iffalse/ifnempty match no rule of its own and
    // render an empty section, and ifempty is genuinely evaluated — none of that may reach
    // the reader; the bracket text must render, visibly, inside a labelled wrapper instead.
    const cases: [string, string][] = [
      ['iftrue::flag[Shown]', 'is true'],
      ['iffalse::flag[Shown]', 'is false'],
      ['ifempty::flag[Shown]', 'is empty'],
      ['ifnempty::flag[Shown]', 'is not empty'],
    ];

    for (const [source, expectedLabel] of cases) {
      const el = await fixture<ZnRemarkdEditor>(html`
        <zn-remarkd-editor value=${source}></zn-remarkd-editor>`);
      await el.updateComplete;

      const wrapper = el.shadowRoot!.querySelector('.remarkd-editor__conditional');
      expect(wrapper, `${source}: no conditional wrapper`).to.exist;
      expect(wrapper!.textContent, source).to.contain('flag');
      expect(wrapper!.textContent, source).to.contain(expectedLabel);
      expect(wrapper!.textContent, source).to.contain('Shown');
      expect(el.value, source).to.equal(source);
    }
  });

  it('should keep a table with blank rows as a single block', async () => {
    const table = '.Data\n[striped=true]\n|===\n|Name |Value\n\n|Alpha |1\n\n|Beta |2\n|===';
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=${table}></zn-remarkd-editor>`);

    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__block').length).to.equal(1);
    expect(el.value).to.equal(table);

    // The rows must land in the body; a split table renders them as more headers.
    const rendered = el.shadowRoot!.querySelector('.remarkd-editor__rendered')!;
    expect(rendered.querySelectorAll('tbody tr').length).to.equal(2);
    expect(rendered.querySelectorAll('thead th').length).to.equal(2);
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

  it('should group the toolbar buttons', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor include-url="/includes"></zn-remarkd-editor>`);
    const groups = el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar .toolbar__group');

    expect(groups.length).to.be.greaterThan(5);
    expect([...groups].map(g => g.getAttribute('data-group'))).to.include('admonitions');
    // Every non-picker action reachable from the toolbar.
    const buttons = el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar .toolbar__group zn-button');
    expect(buttons.length).to.equal(EDITOR_ACTIONS.length);
  });

  it('should move toolbar groups into an overflow menu when narrow', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor style="width: 240px"></zn-remarkd-editor>`);
    await el.updateComplete;
    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__toolbar-more'),
      'the overflow trigger never appeared');

    const collapsed = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.toolbar__group')]
      .filter(group => getComputedStyle(group).display === 'none');
    expect(collapsed.length, 'nothing collapsed at 240px').to.be.greaterThan(0);

    // No action is lost: the collapsed groups' actions are all in the menu.
    const menuItems = el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar-more zn-menu-item');
    expect(menuItems.length).to.be.greaterThan(0);

    // The trigger itself must stay on-screen — a group that doesn't fit must not force its
    // way into the bar and push the trigger past the host's own `overflow: hidden` edge.
    const toolbar = el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__toolbar')!;
    const trigger = el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__toolbar-more')!;
    expect(trigger.getBoundingClientRect().right, 'the overflow trigger is clipped off-screen')
      .to.be.at.most(toolbar.getBoundingClientRect().right + 1);

    // Every action is reachable somewhere: either as a visible bar button or a menu item.
    const reachableButtons = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.toolbar__group')]
      .filter(group => getComputedStyle(group).display !== 'none')
      .flatMap(group => [...group.querySelectorAll('zn-button')]);
    const expectedCount = EDITOR_ACTIONS.filter(action => action.opens !== 'include').length;
    expect(reachableButtons.length + menuItems.length, 'an action fell through the cracks')
      .to.equal(expectedCount);
  });

  it('should scroll the overflow menu instead of running off the viewport', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor style="width: 240px"></zn-remarkd-editor>`);
    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__toolbar-more'),
      'the overflow trigger never appeared');

    const dropdown = el.shadowRoot!.querySelector<ZnDropdown>('.remarkd-editor__toolbar-more')!;
    await dropdown.show();
    // The popup's auto-size pass lands an animation frame after 'zn-after-show' fires — same
    // wait used for the same reason in expanding-action's drop-panel overflow tests.
    await new Promise(resolve => requestAnimationFrame(resolve));

    // At 240px, every action lands in the menu — enough zn-menu-items to overflow the
    // max-height. The scroll container is zn-menu's own inner `.menu` div (set via the
    // --zn-menu-max-height custom property), not the zn-menu host itself: a constraint on
    // the host leaves the host with room to spare, so a wheel over an item finds `.menu`
    // has nothing to scroll and never chains out to the host.
    const menu = dropdown.querySelector('zn-menu')!;
    const inner = menu.shadowRoot!.querySelector<HTMLElement>('.menu')!;
    expect(inner.scrollHeight, 'the menu needs room to scroll').to.be.greaterThan(inner.clientHeight);
    expect(getComputedStyle(inner).overflow).to.equal('auto');
  });

  it('should apply an inline action reached through the overflow menu, keeping the block open', async () => {
    // At 800px, 'text' (the first group) fits but 'inline' (~638px right after it) does
    // not, so every inline action — including Strong — lives only in the overflow menu.
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="hello world" style="width: 800px"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(0, 5);

    await waitUntil(() => el.shadowRoot!.querySelector('.remarkd-editor__toolbar-more'),
      'the overflow trigger never appeared');
    const dropdown = el.shadowRoot!.querySelector<ZnDropdown>('.remarkd-editor__toolbar-more')!;
    await dropdown.show();
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Opening the trigger moves focus off the textarea in real use — zn-dropdown's
    // handleTriggerClick calls focusOnTrigger() right after show(). A synthetic click on the
    // trigger wouldn't actually move focus in a test DOM, so the blur is reproduced directly.
    input.dispatchEvent(new Event('blur'));

    const strong = [...dropdown.querySelectorAll('zn-menu-item')]
      .find(item => item.textContent?.includes('Strong'));
    expect(strong, 'Strong should be reachable through the overflow menu').to.exist;
    strong!.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    // If the blur had committed the edit, editingIndex would be null: the menu item would
    // read as disabled and applyInline would find no textarea to act on.
    const result = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    expect(result.value, 'the block must stay open through the overflow-menu interaction')
      .to.equal('**hello** world');
  });

  it('should show every toolbar group when wide', async () => {
    // The full toolbar (all ~70 actions) measures ~3100px, so 2000px would still collapse
    // some groups; this width comfortably fits everything with room to spare.
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor style="width: 4000px"></zn-remarkd-editor>`);
    await el.updateComplete;
    await aTimeout(50);

    const collapsed = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.toolbar__group')]
      .filter(group => getComputedStyle(group).display === 'none');
    expect(collapsed.length).to.equal(0);
    expect(el.shadowRoot!.querySelector('.remarkd-editor__toolbar-more')).to.not.exist;
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

  it('should wrap the selection with an inline action', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="hello world"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(0, 5);
    const strong = [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Strong')!;
    strong.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    const result = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    expect(result.value).to.equal('**hello** world');
    // The wrapped text stays selected, so a second click (or typing) acts on it, not the marks.
    expect([result.selectionStart, result.selectionEnd]).to.eql([2, 7]);
  });

  it('should insert a placeholder when nothing is selected', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(5, 5);

    [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Strong')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    const result = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    expect(result.value).to.equal('hello**text**');
    // Placeholder selected so typing replaces it.
    expect([result.selectionStart, result.selectionEnd]).to.eql([7, 11]);
  });

  it('should unwrap a selection already carrying the mark', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="**hello** world"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(2, 7); // hello, inside the marks
    [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Strong')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!.value)
      .to.equal('hello world');
  });

  it('should not corrupt a shorter mark nested inside a longer sibling of the same character', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="~~hello~~ world"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(2, 7); // hello, inside the strike marks

    [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Subscript')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    // Ambiguous remarkd, but the strike marks must survive intact rather than being stripped.
    expect(el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!.value)
      .to.equal('~~~hello~~~ world');
  });

  it('should disable inline actions when no block is being edited', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="hello"></zn-remarkd-editor>`);
    const strong = [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Strong')!;
    expect(strong.hasAttribute('disabled')).to.be.true;
  });

  it('should toggle off an asymmetric mark instead of double-wrapping it', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="([Label](https://))"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(2, 7); // Label, inside the link markup

    [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Link')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    // A `)` trailing the mark must not be mistaken for a repeated-delimiter run; the mark
    // toggles off cleanly rather than double-wrapping.
    expect(el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!.value)
      .to.equal('(Label)');
  });

  it('should unwrap a link whose target is a real URL, not just the placeholder tail', async () => {
    // A literal-text unwrap check only recognises "](https://)" — the placeholder itself. A
    // real document never contains that; it contains a real URL, which must unwrap too.
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="[Label](https://example.com)"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.setSelectionRange(1, 6); // Label, inside the real link markup

    [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Link')!
      .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!.value)
      .to.equal('Label');
  });

  it('should honour a block action\'s caretOffset from the toolbar, matching the slash menu', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor></zn-remarkd-editor>`);
    // Two actions share the "Code" tooltip (inline-code in the inline group, code-fence in
    // the blocks group) — disambiguate by the group the button actually lives in.
    const codeButton = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Code'
        && b.closest('.toolbar__group')?.getAttribute('data-group') === 'blocks')!;
    codeButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    expect(input.value).to.equal('```\n\n```');
    // caretOffset: 4 — right on the blank interior line, same as inserting "/code" would.
    expect([input.selectionStart, input.selectionEnd]).to.eql([4, 4]);
  });

  it('should prevent the toolbar mousedown default so a real click keeps focus and selection in the textarea', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="hello world"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const strong = [...el.shadowRoot!.querySelectorAll('.remarkd-editor__toolbar zn-button')]
      .find(b => b.getAttribute('tooltip') === 'Strong')!;
    const mousedown = new MouseEvent('mousedown', {bubbles: true, composed: true, cancelable: true});
    strong.dispatchEvent(mousedown);

    // If this were not prevented, the mousedown would shift focus off the textarea, blurring
    // and committing the edit before the click even fires — disabling the button underneath it.
    expect(mousedown.defaultPrevented).to.be.true;
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

  it('should list every action in the slash menu under its group', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello" include-url="/includes"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    typeInBlock(el, '/');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    const menu = el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu')!;
    expect(menu.items.length).to.equal(EDITOR_ACTIONS.length);
    expect(menu.items.some(item => item.group === 'Admonitions')).to.be.true;
  });

  it('should omit the Include action from the slash menu without an include-url', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;
    typeInBlock(el, '/');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    const menu = el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu')!;
    expect(menu.items.length).to.equal(EDITOR_ACTIONS.length - 1);
    expect(menu.items.every(item => item.action !== 'include')).to.be.true;
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

  it('should insert the full inline construct from the slash menu, not just the opener', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="Hello"></zn-remarkd-editor>`);
    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = typeInBlock(el, '/strong');
    await waitUntil(() => el.shadowRoot!.querySelector('zn-slash-menu[open]'), 'the slash menu never opened');

    const menu = el.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu')!;
    expect(menu.activeItem?.label).to.equal('Strong');

    input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
    await el.updateComplete;

    // Full construct, not a bare unclosed opener — caret lands at the placeholder's start.
    expect(input.value).to.equal('**text**');
    expect([input.selectionStart, input.selectionEnd]).to.eql([2, 2]);
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
    const imageButton = el.shadowRoot!.querySelector('.remarkd-editor__toolbar zn-button[tooltip="Image"]')!;
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

    const includeButton = el.shadowRoot!
      .querySelector<HTMLElement>('.remarkd-editor__toolbar zn-button[tooltip="Include"]')!;
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
    const includeButton = el.shadowRoot!
      .querySelector<HTMLElement>('.remarkd-editor__toolbar zn-button[tooltip="Include"]')!;
    includeButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
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
      const includeButton = el.shadowRoot!
        .querySelector<HTMLElement>('.remarkd-editor__toolbar zn-button[tooltip="Include"]')!;
      includeButton.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

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

  it('should render an attribute definition as a variable chip', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=":product: Remarkd"></zn-remarkd-editor>`);
    const chip = el.shadowRoot!.querySelector('.remarkd-editor__variable')!;
    expect(chip, 'no variable chip').to.exist;
    expect(chip.textContent).to.contain('product');
    expect(chip.textContent).to.contain('Remarkd');
  });

  it('should render a title-only block as a chip', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=".Intro"></zn-remarkd-editor>`);
    const chip = el.shadowRoot!.querySelector('.remarkd-editor__variable')!;
    expect(chip, 'no title chip').to.exist;
    expect(chip.textContent).to.contain('Intro');
  });

  it('should render a bracketed attribute line as a chip', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="[%hardbreaks]"></zn-remarkd-editor>`);
    const chip = el.shadowRoot!.querySelector('.remarkd-editor__variable')!;
    expect(chip, 'no bracket chip').to.exist;
    expect(chip.textContent).to.contain('[%hardbreaks]');
  });

  it('should render a title immediately followed by content normally, not as a chip', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=".Data
|===
|A |B

|1 |2
|==="></zn-remarkd-editor>`);
    await el.updateComplete;
    const rendered = el.shadowRoot!.querySelector('.remarkd-editor__rendered')!;
    expect(rendered.querySelector('.remarkd-editor__variable'), 'should not chip mixed content').to.not.exist;
    expect(rendered.textContent).to.contain('Data');
  });

  // remarkd drops a lone-period paragraph entirely (verified against the parser directly:
  // parse('.NET is a popular framework.') returns section--empty) — treating it as a title
  // chip surfaces content the parser would otherwise silently discard, not the reverse.
  it('should chip a period-led sentence remarkd would otherwise render empty', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=".NET is a popular framework."></zn-remarkd-editor>`);
    const chip = el.shadowRoot!.querySelector('.remarkd-editor__variable')!;
    expect(chip, 'no title chip').to.exist;
    expect(chip.textContent).to.contain('NET is a popular framework.');
  });

  // Same reasoning for a bracket-only line that happens to look like a citation marker:
  // parse('[1]') also returns section--empty, so this is content the chip rescues.
  it('should chip a bracketed line remarkd would otherwise render empty', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="[1]"></zn-remarkd-editor>`);
    const chip = el.shadowRoot!.querySelector('.remarkd-editor__variable')!;
    expect(chip, 'no bracket chip').to.exist;
    expect(chip.textContent).to.contain('[1]');
  });

  // markVariables must never touch the meta-chip branch's Lit-owned ChildPart: it assumes its
  // next sibling stays a Text node, so wrapping a {name} inside it and then re-rendering with a
  // different value would leave a stale token or silently freeze the display. Scoping
  // markVariables to the parser-rendered branch only (remarkd-editor__rendered--parsed) is what
  // this test guards.
  it('should refresh a metadata chip cleanly when its value changes, leaving no stale token', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value=":tip: See {syntax} for details"></zn-remarkd-editor>`);
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLElement>('.remarkd-editor__rendered')!.click();
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')!;
    input.value = ':tip: See {other} for details';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('blur'));
    await el.updateComplete;

    const chip = el.shadowRoot!.querySelector('.remarkd-editor__variable')!;
    expect(chip, 'no variable chip after edit').to.exist;
    expect(chip.textContent).to.contain('other');
    expect(chip.textContent).to.not.contain('syntax');
    // Never evaluated: still the raw {other} reference, not resolved to a value.
    expect(chip.textContent).to.contain('{other}');
  });

  it('should mark a variable reference in rendered text', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="This is {product} here"></zn-remarkd-editor>`);
    await el.updateComplete;
    const tokens = el.shadowRoot!.querySelectorAll('.remarkd-editor__var');
    expect(tokens.length).to.equal(1);
    expect(tokens[0].textContent).to.equal('{product}');
    // Not evaluated: the source is untouched.
    expect(el.value).to.equal('This is {product} here');
  });

  it('should leave braces in code alone', async () => {
    const el = await fixture<ZnRemarkdEditor>(html`
      <zn-remarkd-editor value="\`\`\`
const x = {product};
\`\`\`"></zn-remarkd-editor>`);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.remarkd-editor__var').length).to.equal(0);
  });
});
