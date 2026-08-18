import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import {PAGE_SECTION_MIME, PAGE_TYPE_MIME} from './page.types';
import type {PageSectionType, PageState} from './page.types';
import type ZnPageBuilder from './page-builder.component';

/** Reaches the private registry to inspect a parsed template's PageSectionType. */
const registryOf = (el: ZnPageBuilder) =>
  (el as unknown as { registry: { get: (type: string) => PageSectionType | undefined } }).registry;

const containerConfig = (over = {}) => JSON.stringify({
  sections: [{
    id: 'outer', type: 'row', data: {},
    layout: {widths: [1, 2, 1], grow: false},
    cells: [[{id: 'a', type: 'hero', data: {}}], [], []],
    ...over,
  }],
});

const selectFirst = async (el: ZnPageBuilder) => {
  el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
  await el.updateComplete;
};

const dragTo = (el: Element, mime: string, payload: string, kind: 'dragover' | 'drop') => {
  const data = new Map([[mime, payload]]);
  const event = new DragEvent(kind, {bubbles: true, cancelable: true, composed: true});
  Object.defineProperty(event, 'dataTransfer', {
    value: {types: [...data.keys()], getData: (k: string) => data.get(k) ?? '', setData: () => {}},
  });
  el.dispatchEvent(event);
  return event;
};

describe('<zn-page-builder>', () => {
  it('should render the shell', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder></zn-page-builder>`);
    expect(el.shadowRoot?.querySelector('[part="base"]')).to.exist;
    expect(el.shadowRoot?.querySelector('[part="palette"]')).to.exist;
    expect(el.shadowRoot?.querySelector('[part="canvas"]')).to.exist;
  });

  it('should build the palette from slotted config templates', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="hero" slot="config" label="Hero" icon="star" category="Headers"></template>
        <template type="article-list" slot="config" label="Article List" category="Content"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const items = el.shadowRoot?.querySelectorAll('zn-page-palette-item');
    expect(items?.length).to.equal(2);
    expect(items?.[0].getAttribute('label')).to.equal('Hero');
    const categories = [...(el.shadowRoot?.querySelectorAll('zn-collapsible.palette__category') ?? [])]
      .map(c => c.getAttribute('caption'));
    expect(categories).to.deep.equal(['Headers', 'Content']);
  });

  it('should parse container/columns/widths/grow template attributes', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="row" slot="config" label="Row" container widths="1, 2 1" grow></template>
        <template type="cols" slot="config" label="Cols" container columns="4"></template>
        <template type="bare" slot="config" label="Bare" container></template>
        <template type="legacy" slot="config" label="Legacy" slots="6"></template>
      </zn-page-builder>`);
    await el.updateComplete;
    const registry = registryOf(el);

    // widths beats columns and tolerates mixed comma/whitespace separators.
    const row = registry.get('row');
    expect(row?.container).to.be.true;
    expect(row?.defaultWidths).to.deep.equal([1, 2, 1]);
    expect(row?.defaultGrow).to.be.true;

    expect(registry.get('cols')?.defaultWidths).to.deep.equal([1, 1, 1, 1]);
    expect(registry.get('cols')?.defaultGrow).to.be.false;

    // bare `container` seeds DEFAULT_WIDTHS.
    expect(registry.get('bare')?.defaultWidths).to.deep.equal([1, 1, 1]);
    expect(registry.get('bare')?.defaultGrow).to.be.false;

    // legacy `slots` keeps working, untouched by the new fields.
    const legacy = registry.get('legacy');
    expect(legacy?.slots).to.equal(6);
    expect(legacy?.container).to.be.undefined;
    expect(legacy?.defaultWidths).to.be.undefined;
    expect(legacy?.defaultGrow).to.be.undefined;
  });

  it('should filter non-numeric widths tokens before falling back to columns/DEFAULT_WIDTHS', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="typo" slot="config" label="Typo" container widths="1 x 2"></template>
        <template type="rescue" slot="config" label="Rescue" container widths="abc" columns="4"></template>
        <template type="garbage" slot="config" label="Garbage" container widths="abc"></template>
      </zn-page-builder>`);
    await el.updateComplete;
    const registry = registryOf(el);

    // A stray non-numeric token is dropped, not coerced to a column via sanitiseWidths.
    expect(registry.get('typo')?.defaultWidths).to.deep.equal([1, 2]);

    // A wholly non-numeric widths falls through to columns, not to a single column.
    expect(registry.get('rescue')?.defaultWidths).to.deep.equal([1, 1, 1, 1]);

    // A wholly non-numeric widths with no columns falls through to DEFAULT_WIDTHS.
    expect(registry.get('garbage')?.defaultWidths).to.deep.equal([1, 1, 1]);
  });

  it('should tuck the palette away via the canvas-edge chevron', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const toggle = el.shadowRoot?.querySelector<HTMLButtonElement>('.canvas-cell .panel-toggle--left');
    expect(toggle, 'edge chevron').to.exist;

    toggle!.click();
    await el.updateComplete;
    expect(el.paletteCollapsed).to.be.true;
    expect(el.shadowRoot?.querySelector('.builder--palette-collapsed')).to.exist;
    expect(toggle!.classList.contains('panel-toggle--tucked'), 'chevron tucks into the canvas').to.be.true;

    toggle!.click();
    await el.updateComplete;
    expect(el.paletteCollapsed).to.be.false;
    expect(el.shadowRoot?.querySelector('.builder--palette-collapsed')).to.not.exist;
  });

  it('should offer and restore an auto-saved draft', async () => {
    const draft = {savedAt: Date.now(), state: {sections: [{id: 'd1', type: 'hero', data: {title: 'Draft'}}]}};
    localStorage.setItem('zn-page-builder:pb-autosave-test', JSON.stringify(draft));

    try {
      const el = await fixture<ZnPageBuilder>(html`
        <zn-page-builder id="pb-autosave-test" auto-save config='{"sections":[]}'>
          <template type="hero" slot="config" label="Hero"></template>
        </zn-page-builder>`);
      await el.updateComplete;

      // The loaded (empty) page differs from the fresh draft — banner offered.
      expect(el.shadowRoot?.querySelector('.restore-banner'), 'restore banner').to.exist;

      expect(el.restoreAutoSave()).to.be.true;
      await el.updateComplete;
      expect(el.state.sections[0]?.id).to.equal('d1');
      expect(el.shadowRoot?.querySelector('.restore-banner')).to.not.exist;
    } finally {
      localStorage.removeItem('zn-page-builder:pb-autosave-test');
    }
  });

  it('should round-trip state through the config attribute and state property', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{"title":"Hi"}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.state.sections).to.have.length(1);
    expect(el.state.sections[0].id).to.equal('s1');
    expect(el.shadowRoot?.querySelectorAll('zn-page-section-card')).to.have.length(1);
  });

  it('should add a section via addSection and emit zn-page-change', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    let detail: {state: {sections: unknown[]}} | undefined;
    el.addEventListener('zn-page-change', e => (detail = (e as CustomEvent<{state: {sections: unknown[]}}>).detail));
    const section = el.addSection('hero');
    await el.updateComplete;

    expect(section?.type).to.equal('hero');
    expect(detail?.state.sections).to.have.length(1);
    expect(el.shadowRoot?.querySelectorAll('zn-page-section-card')).to.have.length(1);
  });

  it('should render unknown section types as unknown cards without crashing', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"gone","data":{}}]}'></zn-page-builder>`);
    await el.updateComplete;

    const card = el.shadowRoot?.querySelector('zn-page-section-card');
    expect(card).to.exist;
    expect(card?.hasAttribute('unknown')).to.be.true;
    expect(el.state.sections[0].type).to.equal('gone'); // preserved through save
  });

  it('should summarise a card with the chosen option label, not the stored value', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder
        config='{"sections":[{"id":"s1","type":"tile","data":{"icon":"folder","article":"1a2b3c"}}]}'>
        <template type="tile" slot="config" label="Article">
          <zn-icon-picker name="icon"></zn-icon-picker>
          <zn-select name="article">
            <zn-option value="1a2b3c">Getting Started</zn-option>
          </zn-select>
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    const card = el.shadowRoot?.querySelector('zn-page-section-card');
    expect(card?.getAttribute('summary')).to.equal('Getting Started');
  });

  it('should fall back to the first string value when nothing matches an option', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{"title":"Welcome"}}]}'>
        <template type="hero" slot="config" label="Hero">
          <input name="title">
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('zn-page-section-card')?.getAttribute('summary')).to.equal('Welcome');
  });

  it('should round-trip section data through the inspector name binding', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{"title":"Before"}}]}'>
        <template type="hero" slot="config" label="Hero">
          <input name="title">
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('.inspector__form input[name="title"]');
    expect(input, 'stamped input').to.exist;
    expect(input!.value).to.equal('Before'); // prefilled from data

    input!.value = 'After';
    input!.dispatchEvent(new Event('change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].data.title).to.equal('After');
  });

  it('should write back a boolean control value from the inspector', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{"showSearch":false}}]}'>
        <template type="hero" slot="config" label="Hero">
          <input type="checkbox" name="showSearch">
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const checkbox = el.shadowRoot?.querySelector<HTMLInputElement>('.inspector__form input[name="showSearch"]');
    expect(checkbox, 'stamped checkbox').to.exist;
    expect(checkbox!.checked).to.be.false;

    checkbox!.checked = true;
    checkbox!.dispatchEvent(new Event('change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].data.showSearch).to.equal(true);
  });

  it('should coerce a number control value from the inspector', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{}}]}'>
        <template type="hero" slot="config" label="Hero">
          <input type="number" name="limit">
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('.inspector__form input[name="limit"]');
    expect(input, 'stamped input').to.exist;

    input!.value = '5';
    input!.dispatchEvent(new Event('change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].data.limit).to.equal(5);
  });

  it('should round-trip a multi-select array value through the inspector', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"categories","data":{"categories":["billing"]}}]}'>
        <template type="categories" slot="config" label="Categories">
          <zn-select multiple name="categories">
            <zn-option value="billing">Billing</zn-option>
            <zn-option value="setup">Setup</zn-option>
          </zn-select>
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const select = el.shadowRoot?.querySelector('.inspector__form zn-select[name="categories"]') as HTMLElement & { value: string | string[] };
    expect(select, 'stamped select').to.exist;
    expect(select.value).to.deep.equal(['billing']); // array prefilled, not stringified

    select.value = ['billing', 'setup'];
    select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].data.categories).to.deep.equal(['billing', 'setup']);
  });

  // zn-icon-picker keeps `value` as a plain accessor over its reactive `icon`,
  // so it only prefills if the stamped element is upgraded before assignment —
  // otherwise the assignment shadows the setter and the picker renders empty.
  it('should prefill a control whose value is a plain accessor', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{"icon":"receipt"}}]}'>
        <template type="hero" slot="config" label="Hero">
          <zn-icon-picker name="icon" label="Icon" no-color no-library></zn-icon-picker>
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const picker = el.shadowRoot!.querySelector<HTMLElement & { value: string; icon: string }>(
      '.inspector__form zn-icon-picker[name="icon"]')!;
    expect(picker, 'stamped icon picker').to.exist;
    expect(picker.value).to.equal('receipt');
    expect(picker.icon, 'reached the reactive property, not an own shadowing one').to.equal('receipt');

    picker.value = 'payments';
    picker.dispatchEvent(new CustomEvent('zn-change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].data.icon).to.equal('payments');
  });

  it('should rename a section from the inspector', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const rename = el.shadowRoot?.querySelector('.inspector__rename') as HTMLElement & { value: string };
    rename.value = 'My Hero';
    rename.dispatchEvent(new CustomEvent('zn-change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].label).to.equal('My Hero');
  });

  it('should head the inspector with the section name and its type', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[
        {"id":"s1","type":"hero","label":"Top banner","data":{}},
        {"id":"s2","type":"hero","data":{}}]}'>
        <template type="hero" slot="config" label="Hero" icon="star">
          <zn-input name="title" label="Title"></zn-input>
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    const cards = el.shadowRoot?.querySelectorAll('zn-page-section-card');
    cards?.[0].dispatchEvent(new Event('click'));
    await el.updateComplete;

    const head = el.shadowRoot?.querySelector('[part="inspector-header"]');
    expect(head, 'inspector header').to.exist;
    expect(head?.querySelector('.inspector-head__title')?.textContent?.trim()).to.equal('Top banner');
    expect(head?.querySelector('.inspector-head__type')?.textContent?.trim()).to.equal('Hero');
    expect(head?.querySelector('zn-icon')?.getAttribute('src')).to.equal('star');
    expect(el.shadowRoot?.querySelector('[part="inspector-body"] .inspector__rename'), 'rename in body').to.exist;

    // An unnamed section's title already is the type label — don't print it twice.
    cards?.[1].dispatchEvent(new Event('click'));
    await el.updateComplete;
    const unnamed = el.shadowRoot?.querySelector('[part="inspector-header"]');
    expect(unnamed?.querySelector('.inspector-head__title')?.textContent?.trim()).to.equal('Hero');
    expect(unnamed?.querySelector('.inspector-head__type'), 'no duplicate type line').to.not.exist;
  });

  it('should clear the selection from the inspector close button', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="inspector"]')).to.exist;

    el.shadowRoot?.querySelector<HTMLButtonElement>('.inspector-close')?.click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="inspector"]'), 'inspector closes').to.not.exist;
  });

  it('should hint when the selected type has no settings', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"divider","data":{}}]}'>
        <template type="divider" slot="config" label="Divider"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('.inspector-hint')).to.exist;
  });

  it('should lay stamped toggles out as a row, honouring a host-set position', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"s1","type":"hero","data":{}}]}'>
        <template type="hero" slot="config" label="Hero">
          <zn-toggle name="showSearch" label="Show search"></zn-toggle>
          <zn-toggle name="showNav" label="Show nav" label-position="top"></zn-toggle>
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const form = el.shadowRoot?.querySelector('.inspector__form');
    expect(form?.querySelector('zn-toggle[name="showSearch"]')?.getAttribute('label-position')).to.equal('left');
    expect(form?.querySelector('zn-toggle[name="showNav"]')?.getAttribute('label-position')).to.equal('top');
  });

  it('should undo and redo a section add', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.addSection('hero');
    expect(el.state.sections).to.have.length(1);

    el.undo();
    expect(el.state.sections).to.have.length(0);

    el.redo();
    expect(el.state.sections).to.have.length(1);
    expect(el.state.sections[0].type).to.equal('hero');
  });

  it('should treat undo as a no-op with empty history', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder></zn-page-builder>`);
    expect(() => el.undo()).to.not.throw();
    expect(el.state.sections).to.have.length(0);
  });

  it('should be accessible', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await expect(el).to.be.accessible();
  });

  it('should pin a required-first section, inserting one when the page has none', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder required-first="hero">
        <template type="hero" slot="config" label="Hero"></template>
        <template type="rich-text" slot="config" label="Rich Text"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.state.sections.map(s => s.type), 'inserted into an empty page').to.deep.equal(['hero']);
    // The submitted value carries the pinned section, so a save can't miss it.
    expect((JSON.parse(el.value) as PageState).sections).to.have.length(1);

    const card = el.shadowRoot!.querySelector('zn-page-section-card')!;
    expect(card.hasAttribute('locked'), 'card is locked').to.be.true;
    expect(card.getAttribute('draggable'), 'card is not draggable').to.equal('false');
    // No "+" strip above it — the first drop zone follows the pinned card.
    expect(el.shadowRoot!.querySelector('.canvas > *')?.tagName.toLowerCase()).to.equal('zn-page-section-card');
  });

  it('should hoist an existing required-first section to the top of the page', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder required-first="hero"
                       config='{"sections":[{"id":"t","type":"rich-text","data":{}},{"id":"h","type":"hero","data":{"title":"Help"}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
        <template type="rich-text" slot="config" label="Rich Text"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.state.sections.map(s => s.id)).to.deep.equal(['h', 't']);
    expect(el.state.sections[0].data, 'hoisted with its data intact').to.deep.equal({title: 'Help'});
  });

  it('should refuse to remove, reorder or displace the pinned section', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder required-first="hero"
                       config='{"sections":[{"id":"h","type":"hero","data":{}},{"id":"t","type":"rich-text","data":{}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
        <template type="rich-text" slot="config" label="Rich Text"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const pinnedCard = el.shadowRoot!.querySelector('zn-page-section-card')!;
    expect(pinnedCard.shadowRoot!.querySelector('zn-button[title="Remove section"]'), 'no remove action').to.not.exist;

    pinnedCard.dispatchEvent(new CustomEvent('page-card-remove', {bubbles: true, composed: true}));
    pinnedCard.dispatchEvent(new KeyboardEvent('keydown', {key: 'Delete', bubbles: true, cancelable: true}));
    await el.updateComplete;
    expect(el.state.sections.map(s => s.id), 'survives remove and Delete').to.deep.equal(['h', 't']);

    // Dropping another section on the topmost zone lands it below the pinned one.
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/x-zn-page-section', 't');
    el.shadowRoot!.querySelector('.drop')!
      .dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true}));
    await el.updateComplete;
    expect(el.state.sections.map(s => s.id), 'nothing lands above the pinned section').to.deep.equal(['h', 't']);

    expect(el.addSection('rich-text', 0)).to.not.be.null;
    expect(el.state.sections[0].id, 'addSection index 0 is clamped').to.equal('h');
  });

  it('should seed layout and cells for an inserted required-first container', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder required-first="row">
        <template type="row" slot="config" label="Row" container widths="1 2 1"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const row = el.state.sections[0];
    expect(row.type).to.equal('row');
    expect(row.layout, 'the one guaranteed section is seeded like any other container').to.deep.equal({widths: [1, 2, 1], grow: false});
    expect(row.cells).to.have.lengthOf(3);
  });

  it('should leave the page alone without required-first', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"t","type":"rich-text","data":{}}]}'>
        <template type="rich-text" slot="config" label="Rich Text"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.state.sections.map(s => s.type)).to.deep.equal(['rich-text']);
    const card = el.shadowRoot!.querySelector('zn-page-section-card')!;
    expect(card.hasAttribute('locked')).to.be.false;
    expect(card.getAttribute('draggable')).to.equal('true');
  });

  it('should accept a palette drop anywhere on the empty canvas', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const canvas = el.shadowRoot!.querySelector('.canvas')!;
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/x-zn-page-type', 'hero');

    const over = new DragEvent('dragover', {dataTransfer, bubbles: true, cancelable: true});
    canvas.dispatchEvent(over);
    expect(over.defaultPrevented, 'canvas accepts the drag').to.be.true;

    canvas.dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true}));
    await el.updateComplete;
    expect(el.state.sections).to.have.length(1);
    expect(el.state.sections[0].type).to.equal('hero');
  });

  it('round-trips an old-shape config into the new cells shape', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"g1","type":"grid","data":{},"children":[{"id":"a","type":"hero","data":{"title":"Kept"}},null,null]}]}'>
        <template type="grid" slot="config" label="Grid" slots="6"></template>
        <template type="hero" slot="config" label="Hero"><zn-input name="title" label="Title"></zn-input></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const grid = el.state.sections[0];
    expect(grid.children, 'legacy shape not written back').to.be.undefined;
    expect(grid.layout).to.deep.equal({widths: [1, 1, 1], grow: false});
    expect(grid.cells).to.have.lengthOf(6);
    expect(grid.cells?.[0][0].data.title).to.equal('Kept');
  });

  it('seeds layout and cells when a container is added', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder>
        <template type="row" slot="config" label="Row" container widths="1 2 1"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.addSection('row');
    await el.updateComplete;

    const row = el.state.sections[0];
    expect(row.layout).to.deep.equal({widths: [1, 2, 1], grow: false});
    expect(row.cells).to.have.lengthOf(3);
  });

  it('renames and edits a section nested two container levels deep', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{
          id: 'inner', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
          cells: [[{id: 'deep', type: 'hero', data: {}}], []],
        }], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"><input name="title"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_select(id: string): void})._select('deep');
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('.inspector__form input[name="title"]');
    expect(input, 'inspector stamped for the nested section').to.exist;
    input!.value = 'Deep title';
    input!.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    await el.updateComplete;

    const deep = el.state.sections[0].cells![0][0].cells![0][0];
    expect(deep.data.title).to.equal('Deep title');
  });

  it('duplicates a container with fresh ids throughout', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{id: 'a', type: 'hero', data: {}}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('zn-page-section-card')
      ?.dispatchEvent(new CustomEvent('page-card-duplicate', {bubbles: true, composed: true}));
    await el.updateComplete;

    expect(el.state.sections).to.have.lengthOf(2);
    const ids = el.state.sections.flatMap(s => [s.id, ...(s.cells ?? []).flat().map(c => c.id)]);
    expect(new Set(ids).size, 'every id unique').to.equal(ids.length);
  });

  it('removes a section from inside a cell', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{id: 'a', type: 'hero', data: {}}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    let lastSelection: string | null | undefined;
    el.addEventListener('zn-page-selection-change', e =>
      (lastSelection = (e as CustomEvent<{sectionId: string | null}>).detail.sectionId));

    (el as unknown as {_select(id: string): void})._select('a');
    await el.updateComplete;
    expect(lastSelection).to.equal('a');

    (el as unknown as {_removeSection(id: string): void})._removeSection('a');
    await el.updateComplete;

    expect(el.state.sections[0].cells?.[0]).to.deep.equal([]);
    expect(lastSelection, 'selection cleared').to.be.null;
  });

  it('trims a growable container trailing empty row on commit, not only on read', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: true},
        cells: [
          [{id: 'a', type: 'hero', data: {}}], [{id: 'b', type: 'hero', data: {}}],
          [{id: 'c', type: 'hero', data: {}}], [],
        ],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container grow></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_removeSection(id: string): void})._removeSection('c');
    await el.updateComplete;

    // Removing "c" leaves the last row (cells 2 and 3) all-empty — trimmed immediately,
    // not only the next time the container is read out.
    expect(el.state.sections[0].cells, 'trailing empty row trimmed on commit').to.have.lengthOf(2);
    expect(el.state.sections[0].cells?.flat().map(c => c.id)).to.deep.equal(['a', 'b']);
  });

  it('leaves a fixed container trailing empty row untouched after a commit', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [
          [{id: 'a', type: 'hero', data: {}}], [{id: 'b', type: 'hero', data: {}}],
          [{id: 'c', type: 'hero', data: {}}], [],
        ],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_removeSection(id: string): void})._removeSection('c');
    await el.updateComplete;

    // A fixed container's trailing empty row is its chosen layout — it must survive.
    expect(el.state.sections[0].cells, 'trailing empty row survives').to.have.lengthOf(4);
    expect(el.state.sections[0].cells?.[3]).to.deep.equal([]);
  });

  it('clears selection when removing an ancestor of the selected grandchild', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{
          id: 'inner', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
          cells: [[{id: 'deep', type: 'hero', data: {}}], []],
        }], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    let lastSelection: string | null | undefined;
    el.addEventListener('zn-page-selection-change', e =>
      (lastSelection = (e as CustomEvent<{sectionId: string | null}>).detail.sectionId));

    (el as unknown as {_select(id: string): void})._select('deep');
    await el.updateComplete;
    expect(lastSelection).to.equal('deep');

    // Removing the top-level ancestor must clear selection of a grandchild two cell levels down.
    (el as unknown as {_removeSection(id: string): void})._removeSection('outer');
    await el.updateComplete;

    expect(el.state.sections).to.have.lengthOf(0);
    expect(lastSelection, 'selection cleared at depth 2').to.be.null;
  });

  it('duplicates a section living in a cell directly below itself in the same stack', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{id: 'a', type: 'hero', data: {}}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_duplicateSection(id: string): void})._duplicateSection('a');
    await el.updateComplete;

    const stack = el.state.sections[0].cells?.[0] ?? [];
    expect(stack, 'copy lands right after the original in the same stack').to.have.lengthOf(2);
    expect(stack[0].id).to.equal('a');
    expect(stack[1].id, 'fresh id').to.not.equal('a');
    expect(stack[1].type).to.equal('hero');
  });

  it('renders one column per width with the weights as fr units', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const grid = el.shadowRoot?.querySelector<HTMLElement>('.cells');
    expect(grid, 'cell grid').to.exist;
    expect(grid!.style.gridTemplateColumns).to.equal('1fr 2fr 1fr');
    expect(el.shadowRoot?.querySelectorAll('.cell')).to.have.lengthOf(3);
  });

  it('inserts a palette drop into a cell stack', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const cell = el.shadowRoot!.querySelectorAll('.cell')[1]!;
    dragTo(cell, PAGE_TYPE_MIME, 'hero', 'drop');
    await el.updateComplete;

    expect(el.state.sections[0].cells?.[1].map(c => c.type)).to.deep.equal(['hero']);
  });

  it('stacks a second section into the same cell', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const cell = el.shadowRoot!.querySelectorAll('.cell')[0]!;
    dragTo(cell, PAGE_TYPE_MIME, 'hero', 'drop');
    await el.updateComplete;

    expect(el.state.sections[0].cells?.[0]).to.have.lengthOf(2);
  });

  it('accepts a container into a cell at level 1 and refuses one at level 2', async () => {
    const nestedConfig = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{id: 'inner', type: 'row', data: {}, layout: {widths: [1, 1], grow: false}, cells: [[], []]}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${nestedConfig}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const outerCell = el.shadowRoot!.querySelector('.cell')!;
    const accepted = dragTo(outerCell, PAGE_TYPE_MIME, 'row', 'dragover');
    expect(accepted.defaultPrevented, 'level 2 accepted').to.be.true;

    // The inner "row" is itself a container, so its own cells render nested inside
    // the outer cell — a `.cell` inside a `.cell` is deterministically the inner one.
    const innerCell = el.shadowRoot?.querySelectorAll('.cell .cell')[0];
    expect(innerCell, 'nested cell found').to.exist;
    const refused = dragTo(innerCell!, PAGE_TYPE_MIME, 'row', 'dragover');
    expect(refused.defaultPrevented, 'level 3 refused').to.be.false;
  });

  it('does not let accepts override the nesting depth cap', async () => {
    const nestedConfig = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
        cells: [[{id: 'inner', type: 'row', data: {}, layout: {widths: [1, 1], grow: false}, cells: [[], []]}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${nestedConfig}>
        <template type="row" slot="config" label="Row" container accepts="row"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    // The inner "row" is itself a container at level 2; "row" also being in its own
    // `accepts` list must not let a level-3 drop through.
    const innerCell = el.shadowRoot?.querySelectorAll('.cell .cell')[0];
    expect(innerCell, 'nested cell found').to.exist;
    dragTo(innerCell!, PAGE_TYPE_MIME, 'row', 'drop');
    await el.updateComplete;

    const inner = el.state.sections[0].cells![0][0];
    expect(inner.cells?.[0], 'level 3 drop refused despite accepts listing its own type').to.deep.equal([]);
  });

  // Both caps above drive only PAGE_TYPE_MIME, where a freshly created section always
  // has height 1 — a moved section can already carry nested containers of its own,
  // which is exactly what this exercises via PAGE_SECTION_MIME.
  it('refuses moving an already-placed container whose own nesting would push past the cap', async () => {
    const config = JSON.stringify({
      sections: [
        {
          id: 'A', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
          cells: [[{
            id: 'B', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
            cells: [[{id: 'article', type: 'hero', data: {}}], []],
          }], []],
        },
        {id: 'C', type: 'row', data: {}, layout: {widths: [1, 1], grow: false}, cells: [[], []]},
      ],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    // Document order for a top-level container "A" (nesting container "B" in its
    // first cell) followed by sibling top-level container "C": [A0, B0, B1, A1, C0, C1].
    const cCell0 = el.shadowRoot!.querySelectorAll('.cell')[4];
    dragTo(cCell0, PAGE_SECTION_MIME, 'A', 'drop');
    await el.updateComplete;

    expect(el.state.sections.map(s => s.id), 'A stays top-level, C stays untouched').to.deep.equal(['A', 'C']);
    expect(el.state.sections[1].cells).to.deep.equal([[], []]);
  });

  it('still moves an already-placed flat container into another container cell', async () => {
    const config = JSON.stringify({
      sections: [
        {id: 'flat', type: 'row', data: {}, layout: {widths: [1], grow: false}, cells: [[]]},
        {id: 'target', type: 'row', data: {}, layout: {widths: [1, 1], grow: false}, cells: [[], []]},
      ],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
      </zn-page-builder>`);
    await el.updateComplete;

    // Document order: [flat0, target0, target1].
    const targetCell0 = el.shadowRoot!.querySelectorAll('.cell')[1];
    dragTo(targetCell0, PAGE_SECTION_MIME, 'flat', 'drop');
    await el.updateComplete;

    expect(el.state.sections.map(s => s.id), 'flat is no longer top-level').to.deep.equal(['target']);
    expect(el.state.sections[0].cells?.[0].map(c => c.id)).to.deep.equal(['flat']);
  });

  it('refuses a container type into a legacy slots= container with no explicit accepts', async () => {
    const config = JSON.stringify({
      sections: [{id: 'g1', type: 'grid', data: {}, cells: [[], [], []]}],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="grid" slot="config" label="Grid" slots="3"></template>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const cell = el.shadowRoot!.querySelectorAll('.cell')[0]!;
    dragTo(cell, PAGE_TYPE_MIME, 'row', 'drop');
    await el.updateComplete;
    expect(el.state.sections[0].cells?.[0], 'container refused by legacy slots alias').to.deep.equal([]);

    dragTo(cell, PAGE_TYPE_MIME, 'hero', 'drop');
    await el.updateComplete;
    expect(el.state.sections[0].cells?.[0].map(c => c.type), 'non-container still accepted').to.deep.equal(['hero']);
  });

  it('keeps enforcing accepts', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container accepts="tile"></template>
        <template type="hero" slot="config" label="Hero"></template>
        <template type="tile" slot="config" label="Tile"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const cell = el.shadowRoot!.querySelectorAll('.cell')[1]!;
    dragTo(cell, PAGE_TYPE_MIME, 'hero', 'drop');
    await el.updateComplete;
    expect(el.state.sections[0].cells?.[1], 'hero refused').to.deep.equal([]);

    dragTo(cell, PAGE_TYPE_MIME, 'tile', 'drop');
    await el.updateComplete;
    expect(el.state.sections[0].cells?.[1].map(c => c.type)).to.deep.equal(['tile']);
  });

  it('offers a trailing row for a growable container and extends on drop', async () => {
    const growConfig = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {},
        layout: {widths: [1, 1], grow: true},
        cells: [[{id: 'a', type: 'hero', data: {}}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${growConfig}>
        <template type="row" slot="config" label="Row" container grow></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.state.sections[0].cells, 'no trailing empty row persisted').to.have.lengthOf(2);
    const cells = el.shadowRoot?.querySelectorAll('.cell');
    expect(cells!.length, 'a trailing row is rendered').to.equal(4);

    dragTo(cells![2], PAGE_TYPE_MIME, 'hero', 'drop');
    await el.updateComplete;
    expect(el.state.sections[0].cells).to.have.lengthOf(4);
  });

  it('shows layout controls only for containers', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;
    await selectFirst(el);
    expect(el.shadowRoot?.querySelector('.layout-group'), 'container shows layout').to.exist;

    const plain = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"h","type":"hero","data":{}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await plain.updateComplete;
    await selectFirst(plain);
    expect(plain.shadowRoot?.querySelector('.layout-group'), 'non-container has none').to.not.exist;
  });

  it('re-chunks losslessly when the editor narrows the columns', async () => {
    // Trailing empty cells on the pre-edit row are load-bearing for this test: with
    // grow false, the downstream normaliseCells pass does not trim, so only
    // recolumnCells's own trim-then-pad determines the final length. A passthrough
    // that skips recolumnCells would carry all 5 stacks through and land on 6 cells
    // after padding to 2 columns, not 4.
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1, 1, 1, 1], grow: false},
        cells: [
          [{id: 'a', type: 'hero', data: {}}],
          [{id: 'b', type: 'hero', data: {}}],
          [{id: 'c', type: 'hero', data: {}}],
          [],
          [],
        ],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_setColumns(id: string, n: number): void})._setColumns('outer', 2);
    await el.updateComplete;

    const row = el.state.sections[0];
    expect(row.layout?.widths).to.have.lengthOf(2);
    expect(row.cells?.flat().map(c => c.id), 'nothing lost or reordered').to.deep.equal(['a', 'b', 'c']);
    expect(row.cells, 'trailing empties trimmed before re-chunking, not carried through').to.have.lengthOf(4);
  });

  it('sets a per-column width', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_setWidth(id: string, col: number, w: number): void})._setWidth('outer', 1, 3);
    await el.updateComplete;
    expect(el.state.sections[0].layout?.widths).to.deep.equal([1, 3, 1]);
  });

  it('clamps a row reduction at the last occupied row', async () => {
    const config = JSON.stringify({
      sections: [{
        id: 'outer', type: 'row', data: {}, layout: {widths: [2], grow: false},
        cells: [[{id: 'a', type: 'hero', data: {}}], [{id: 'b', type: 'hero', data: {}}], []],
      }],
    });
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${config}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const api = el as unknown as {_setRows(id: string, n: number): void};
    api._setRows('outer', 3);
    await el.updateComplete;
    expect(el.state.sections[0].cells).to.have.lengthOf(3);

    api._setRows('outer', 1);
    await el.updateComplete;
    expect(el.state.sections[0].cells?.flat().map(c => c.id), 'content survives').to.deep.equal(['a', 'b']);
  });

  it('undoes a layout change', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    (el as unknown as {_setColumns(id: string, n: number): void})._setColumns('outer', 2);
    await el.updateComplete;
    expect(el.state.sections[0].layout?.widths).to.have.lengthOf(2);

    el.undo();
    await el.updateComplete;
    expect(el.state.sections[0].layout?.widths).to.deep.equal([1, 2, 1]);
  });

  it('flips grow from the layout group toggle', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config=${containerConfig()}>
        <template type="row" slot="config" label="Row" container></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;
    await selectFirst(el);

    const toggle = el.shadowRoot?.querySelector('.layout-group zn-toggle') as HTMLElement & { checked: boolean };
    expect(toggle, 'grow toggle').to.exist;
    toggle.checked = true;
    // zn-toggle only ever emits zn-input (never zn-change) on interaction — this is the
    // exact event the layout group's listener must be bound to.
    toggle.dispatchEvent(new CustomEvent('zn-input', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].layout?.grow, 'toggle flips grow in state').to.be.true;
  });
});
