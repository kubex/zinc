import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type {PageState} from './page.types';
import type ZnPageBuilder from './page-builder.component';

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

  it('should render a slot grid for container sections and fill slots via addSectionToSlot', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{}}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="6" accepts="article-tile"></template>
        <template type="article-tile" slot="config" label="Article"></template>
        <template type="hero" slot="config" label="Hero"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    expect(el.shadowRoot?.querySelectorAll('.slot--empty')).to.have.length(6);

    expect(el.addSectionToSlot('hero', 'grid', 0), 'not in accepts').to.be.null;
    expect(el.addSectionToSlot('article-grid', 'grid', 0), 'no nested containers').to.be.null;

    const child = el.addSectionToSlot('article-tile', 'grid', 1);
    await el.updateComplete;
    expect(child?.type).to.equal('article-tile');
    expect(el.state.sections[0].children?.[1]?.id).to.equal(child?.id);
    expect(el.shadowRoot?.querySelectorAll('.slot--empty')).to.have.length(5);
    expect(el.shadowRoot?.querySelectorAll('.slots zn-page-section-card')).to.have.length(1);

    expect(el.addSectionToSlot('article-tile', 'grid', 1), 'occupied slot').to.be.null;
  });

  it('should swap children when dropping one filled slot onto another', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{}}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="4"></template>
        <template type="article-tile" slot="config" label="Article"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const a = el.addSectionToSlot('article-tile', 'grid', 0)!;
    const b = el.addSectionToSlot('article-tile', 'grid', 1)!;
    await el.updateComplete;

    // Drag child A onto child B's card (slot 1) — they swap places.
    const cards = el.shadowRoot!.querySelectorAll('.slots zn-page-section-card');
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/x-zn-page-section', a.id);
    cards[1].dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true}));
    await el.updateComplete;

    expect(el.state.sections[0].children?.[0]?.id).to.equal(b.id);
    expect(el.state.sections[0].children?.[1]?.id).to.equal(a.id);
  });

  it('should edit a slotted child through the inspector', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{},"children":[{"id":"c1","type":"article-tile","data":{"title":"Old"}}]}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="2"></template>
        <template type="article-tile" slot="config" label="Article">
          <input name="title">
        </template>
      </zn-page-builder>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector('.slots zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('.inspector__form input[name="title"]');
    expect(input, 'stamped input for child').to.exist;
    expect(input!.value).to.equal('Old');

    input!.value = 'New';
    input!.dispatchEvent(new Event('change', {bubbles: true}));
    await el.updateComplete;

    expect(el.state.sections[0].children?.[0]?.data.title).to.equal('New');
  });

  it('should clear selection when removing a container holding the selected child', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{},"children":[{"id":"c1","type":"article-tile","data":{}}]}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="2"></template>
        <template type="article-tile" slot="config" label="Article"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    let lastSelection: string | null | undefined;
    el.addEventListener('zn-page-selection-change', e =>
      (lastSelection = (e as CustomEvent<{sectionId: string | null}>).detail.sectionId));

    // Select the child, then remove its parent container.
    el.shadowRoot?.querySelector('.slots zn-page-section-card')?.dispatchEvent(new Event('click'));
    await el.updateComplete;
    expect(lastSelection).to.equal('c1');

    el.shadowRoot?.querySelector('.container > zn-page-section-card')
      ?.dispatchEvent(new CustomEvent('page-card-remove'));
    await el.updateComplete;

    expect(lastSelection, 'selection cleared').to.be.null;
    expect(el.shadowRoot?.querySelector('[part="inspector"]'), 'no ghost inspector').to.not.exist;
  });

  it('should move a top-level section into an empty slot but not an occupied one', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{}},{"id":"t1","type":"article-tile","data":{}},{"id":"t2","type":"article-tile","data":{}}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="2"></template>
        <template type="article-tile" slot="config" label="Article"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const dropOnSlot = (sectionId: string, slotSelector: string) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('application/x-zn-page-section', sectionId);
      el.shadowRoot!.querySelector(slotSelector)!
        .dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true}));
    };

    dropOnSlot('t1', '.slot--empty'); // into first empty slot
    await el.updateComplete;
    expect(el.state.sections.map(s => s.id)).to.deep.equal(['grid', 't2']);
    expect(el.state.sections[0].children?.[0]?.id).to.equal('t1');

    dropOnSlot('t2', '.slots zn-page-section-card'); // onto the occupied slot — rejected
    await el.updateComplete;
    expect(el.state.sections.map(s => s.id)).to.deep.equal(['grid', 't2']);
    expect(el.state.sections[0].children?.[0]?.id).to.equal('t1');
  });

  it('should swap children across different containers', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder
        config='{"sections":[{"id":"g1","type":"article-grid","data":{},"children":[{"id":"a1","type":"article-tile","data":{}}]},{"id":"g2","type":"article-grid","data":{},"children":[{"id":"b1","type":"article-tile","data":{}}]}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="2"></template>
        <template type="article-tile" slot="config" label="Article"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    // Drag a1 (in g1) onto b1's card (slot 0 of g2) — they trade containers.
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/x-zn-page-section', 'a1');
    const g2Card = el.shadowRoot!.querySelectorAll('.slots zn-page-section-card')[1];
    g2Card.dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true}));
    await el.updateComplete;

    expect(el.state.sections[0].children?.[0]?.id).to.equal('b1');
    expect(el.state.sections[1].children?.[0]?.id).to.equal('a1');
  });

  it('should undo a slot mutation and duplicate a child into the next empty slot', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{}}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="3"></template>
        <template type="article-tile" slot="config" label="Article"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const child = el.addSectionToSlot('article-tile', 'grid', 0)!;
    el.undo();
    expect(el.state.sections[0].children?.[0] ?? null, 'undo empties the slot').to.be.null;
    el.redo();
    expect(el.state.sections[0].children?.[0]?.id).to.equal(child.id);

    // Duplicate the child: the copy takes the next empty slot with a fresh id.
    await el.updateComplete;
    el.shadowRoot?.querySelector('.slots zn-page-section-card')
      ?.dispatchEvent(new CustomEvent('page-card-duplicate'));
    await el.updateComplete;
    const children = el.state.sections[0].children ?? [];
    expect(children[1]?.type).to.equal('article-tile');
    expect(children[1]?.id).to.not.equal(children[0]?.id);
  });

  it('should select a card with Enter and delete a child with Delete via keyboard', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder config='{"sections":[{"id":"grid","type":"article-grid","data":{},"children":[{"id":"c1","type":"article-tile","data":{}}]}]}'>
        <template type="article-grid" slot="config" label="Article Grid" slots="2"></template>
        <template type="article-tile" slot="config" label="Article"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const childCard = el.shadowRoot!.querySelector('.slots zn-page-section-card')!;
    childCard.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="inspector"]'), 'Enter selects').to.exist;

    childCard.dispatchEvent(new KeyboardEvent('keydown', {key: 'Delete', bubbles: true, cancelable: true}));
    await el.updateComplete;
    expect(el.state.sections[0].children?.[0] ?? null, 'Delete removes the child').to.be.null;
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

  it('should keep the pinned section out of container slots', async () => {
    const el = await fixture<ZnPageBuilder>(html`
      <zn-page-builder required-first="hero"
                       config='{"sections":[{"id":"h","type":"hero","data":{}},{"id":"grid","type":"article-grid","data":{}}]}'>
        <template type="hero" slot="config" label="Hero"></template>
        <template type="article-grid" slot="config" label="Article Grid" slots="2"></template>
      </zn-page-builder>`);
    await el.updateComplete;

    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/x-zn-page-section', 'h');
    el.shadowRoot!.querySelector('.slot--empty')!
      .dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true}));
    await el.updateComplete;

    expect(el.state.sections[0].id, 'still leading the page').to.equal('h');
    expect(el.state.sections[1].children?.[0] ?? null, 'slot left empty').to.be.null;
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
});
