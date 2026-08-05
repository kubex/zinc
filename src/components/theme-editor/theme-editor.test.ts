import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import {setViewport} from '@web/test-runner-commands';

type ThemeCall = Record<string, unknown>;

interface Framelike extends HTMLElement {
  setTheme: (theme: ThemeCall) => void;
}

/**
 * Records what the editor pushes by replacing the internal frame's setTheme.
 * Returns the recorded calls; the first is the initial push from firstUpdated.
 */
function spyOnFrame(el: Element): ThemeCall[] {
  const frame = el.shadowRoot!.querySelector('zn-preview-frame') as Framelike;
  const calls: ThemeCall[] = [];
  frame.setTheme = (theme: ThemeCall) => calls.push(theme);
  return calls;
}

describe('<zn-theme-editor>', () => {
  const FIXTURE = html`
    <zn-theme-editor src="about:blank" frame-origin="https://site.example" debounce="10">
      <zn-input name="radius" label="Radius" value="8"></zn-input>
    </zn-theme-editor>`;

  it('renders and is accessible', async () => {
    const el = await fixture(FIXTURE);
    await expect(el).to.be.accessible();
  });

  it('renders a preview frame and forwards its configuration', async () => {
    const el = await fixture(html`
      <zn-theme-editor
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/theme/config"
        min-height="600"></zn-theme-editor>`);

    const frame = el.shadowRoot!.querySelector('zn-preview-frame')!;
    expect(frame).to.exist;
    expect((frame as HTMLElement & {src: string}).src).to.equal('about:blank');
    expect((frame as HTMLElement & {frameOrigin: string}).frameOrigin).to.equal('https://site.example');
    expect((frame as HTMLElement & {dataUri: string}).dataUri).to.equal('/theme/config');
    expect((frame as HTMLElement & {minHeight: number}).minHeight).to.equal(600);
    expect((frame as HTMLElement & {fill: boolean}).fill).to.be.true;
  });

  it('leaves no dead space beneath the preview when the controls column is taller than min-height', async () => {
    const el = await fixture(html`
      <zn-theme-editor
        src="about:blank" frame-origin="https://site.example" min-height="200"
        style="display: block; width: 700px;">
        ${Array.from({length: 15}, (_, i) => html`
          <zn-input name="field${i}" label="Field ${i}" value="x"></zn-input>`)}
      </zn-theme-editor>`);
    await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50)); // let layout settle

    const controls = el.shadowRoot!.querySelector('[part="controls"]')!;
    const previewColumn = el.shadowRoot!.querySelector('[part="preview"]')!;
    const frame = el.shadowRoot!.querySelector('zn-preview-frame')!;
    const preview = frame.shadowRoot!.querySelector('.preview')!;

    const controlsHeight = controls.getBoundingClientRect().height;
    const previewColumnHeight = previewColumn.getBoundingClientRect().height;
    const previewHeight = preview.getBoundingClientRect().height;

    expect(controlsHeight).to.be.greaterThan(200); // taller than the min-height floor
    // The sidebar is now full height and independent of the preview column's
    // own height, so fill's target is the preview column, not the sidebar.
    expect(previewHeight).to.be.closeTo(previewColumnHeight, 2);
  });

  it('pushes the authored control defaults on first render', async () => {
    // firstUpdated fires inside fixture(), before a per-instance spy could be
    // installed — so patch the prototype for the duration of this test
    const proto = customElements.get('zn-preview-frame')!.prototype as unknown as Framelike;
    const original = proto.setTheme;
    const calls: ThemeCall[] = [];
    proto.setTheme = (theme: ThemeCall) => calls.push(theme);

    try {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      expect(calls.length).to.equal(1);
      expect(calls[0]['mode']).to.equal('light');
      expect(calls[0]['values']).to.deep.equal({radius: '8'});
      expect((el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values)
        .to.deep.equal({light: {radius: '8'}, dark: {radius: '8'}});
    } finally {
      proto.setTheme = original;
    }
  });

  it('harvests and pushes updated values when a control changes', async () => {
    const el = await fixture(FIXTURE);
    const calls = spyOnFrame(el);

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    input.value = '16';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

    await waitUntil(() => calls.length === 1);
    expect(calls[0]['mode']).to.equal('light');
    expect(calls[0]['values']).to.deep.equal({radius: '16'});
  });

  it('emits zn-theme-change with values, mode and device', async () => {
    const el = await fixture(FIXTURE);
    spyOnFrame(el);

    interface Detail {values: {light: Record<string, unknown>; dark: Record<string, unknown>}; mode: string; device: string}
    let detail: Detail | null = null;
    el.addEventListener('zn-theme-change', (e: Event) => {
      detail = (e as CustomEvent<Detail>).detail;
    });

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    input.value = '24';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

    await waitUntil(() => detail !== null);
    // only light changed - the untouched dark set (seeded from the original '8') stays isolated
    expect(detail!.values).to.deep.equal({light: {radius: '24'}, dark: {radius: '8'}});
    expect(detail!.mode).to.equal('light');
    expect(detail!.device).to.equal('desktop');
  });

  it('reads booleans from checkboxes and skips disabled and unnamed controls', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example">
        <zn-input name="radius" label="Radius" value="8"></zn-input>
        <zn-checkbox name="rounded" checked></zn-checkbox>
        <zn-input name="ignored" label="Ignored" value="x" disabled></zn-input>
        <zn-input label="No name" value="y"></zn-input>
      </zn-theme-editor>`);

    expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
      .to.deep.equal({radius: '8', rounded: true});
  });

  it('pushes exactly once for an empty slot, then pushes again when a control is added', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example"></zn-theme-editor>`);
    const calls = spyOnFrame(el);

    const input = document.createElement('zn-input');
    input.setAttribute('name', 'radius');
    input.setAttribute('value', '8');
    el.append(input);

    await waitUntil(() => calls.length === 1);
    expect(calls[0]['values']).to.deep.equal({radius: '8'});
  });

  it('renders the footer slot only when it is used', async () => {
    const bare = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example"></zn-theme-editor>`);
    expect(bare.shadowRoot!.querySelector('[part="footer"]')).to.not.exist;

    const withFooter = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example">
        <zn-button slot="footer">Save</zn-button>
      </zn-theme-editor>`);
    expect(withFooter.shadowRoot!.querySelector('[part="footer"]')).to.exist;
  });

  it('device buttons set the frame device without re-pushing the theme', async () => {
    const el = await fixture(FIXTURE);
    const calls = spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-device="mobile"]')!.click();
    await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

    expect((el as HTMLElement & {device: string}).device).to.equal('mobile');
    expect(el.getAttribute('device')).to.equal('mobile');
    const frame = el.shadowRoot!.querySelector('zn-preview-frame')!;
    expect((frame as HTMLElement & {device: string}).device).to.equal('mobile');
    // resizing the frame is not a theme change
    expect(calls.length).to.equal(0);
  });

  it('announces a device change on zn-theme-change', async () => {
    const el = await fixture(FIXTURE);
    let detail: {device: string} | null = null;
    el.addEventListener('zn-theme-change', (e: Event) => {
      detail = (e as CustomEvent<{device: string}>).detail;
    });

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-device="tablet"]')!.click();

    await waitUntil(() => detail !== null);
    expect(detail!.device).to.equal('tablet');
  });

  it('marks the active device button as pressed', async () => {
    const el = await fixture(FIXTURE);
    const desktop = el.shadowRoot!.querySelector<HTMLButtonElement>('[data-device="desktop"]')!;
    const mobile = el.shadowRoot!.querySelector<HTMLButtonElement>('[data-device="mobile"]')!;
    expect(desktop.getAttribute('aria-pressed')).to.equal('true');
    expect(mobile.getAttribute('aria-pressed')).to.equal('false');

    mobile.click();
    await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

    expect(desktop.getAttribute('aria-pressed')).to.equal('false');
    expect(mobile.getAttribute('aria-pressed')).to.equal('true');
  });

  it('toggling mode reflects the attribute and re-pushes with the new mode', async () => {
    const el = await fixture(FIXTURE);
    const calls = spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();

    await waitUntil(() => calls.length === 1);
    expect((el as HTMLElement & {mode: string}).mode).to.equal('dark');
    expect(el.getAttribute('mode')).to.equal('dark');
    expect(calls[0]['mode']).to.equal('dark');
    expect(calls[0]['values']).to.deep.equal({radius: '8'});
  });

  it('dark-value seeds the dark set and write-back updates the control on toggle', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example">
        <zn-input name="background" label="Background" value="#ffffff" dark-value="#000000"></zn-input>
      </zn-theme-editor>`);
    const calls = spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();
    await waitUntil(() => calls.length === 1);

    expect(calls[0]['values']).to.deep.equal({background: '#000000'});
    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    expect(input.value).to.equal('#000000');
  });

  it('displays dark values on first render when authored with mode="dark"', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example" mode="dark">
        <zn-input name="background" label="Background" value="#ffffff" dark-value="#000000"></zn-input>
      </zn-theme-editor>`);

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    expect(input.value).to.equal('#000000');
    expect((el as HTMLElement & {activeValues: Record<string, unknown>}).activeValues)
      .to.deep.equal({background: '#000000'});
  });

  it('falls back to the light value in dark mode when dark-value is absent', async () => {
    const el = await fixture(FIXTURE);
    const calls = spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();
    await waitUntil(() => calls.length === 1);

    expect(calls[0]['values']).to.deep.equal({radius: '8'});
    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    expect(input.value).to.equal('8');
  });

  it('keeps light and dark edits isolated', async () => {
    const el = await fixture(FIXTURE);
    const calls = spyOnFrame(el);
    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click(); // -> dark, radius '8'
    await waitUntil(() => calls.length === 1);

    input.value = '99';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
    await waitUntil(() => calls.length === 2);
    expect(calls[1]['values']).to.deep.equal({radius: '99'});

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click(); // -> light, untouched
    await waitUntil(() => calls.length === 3);
    expect(calls[2]['values']).to.deep.equal({radius: '8'});
    expect(input.value).to.equal('8');
  });

  it('seeds a boolean control dark state from dark-value="1"', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example">
        <zn-checkbox name="rounded" dark-value="1"></zn-checkbox>
      </zn-theme-editor>`);
    const calls = spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();
    await waitUntil(() => calls.length === 1);

    expect(calls[0]['values']).to.deep.equal({rounded: true});
    const checkbox = el.querySelector('zn-checkbox')! as HTMLElement & {checked: boolean};
    expect(checkbox.checked).to.be.true;
  });

  it('falls back to the checked light state in dark mode when a boolean control has no dark-value', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example">
        <zn-checkbox name="rounded" checked></zn-checkbox>
      </zn-theme-editor>`);
    const calls = spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();
    await waitUntil(() => calls.length === 1);

    expect(calls[0]['values']).to.deep.equal({rounded: true});
    const checkbox = el.querySelector('zn-checkbox')! as HTMLElement & {checked: boolean};
    expect(checkbox.checked).to.be.true;
  });

  it('reads a native input[type=checkbox] as boolean', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example">
        <input type="checkbox" name="rounded" checked>
      </zn-theme-editor>`);

    expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
      .to.deep.equal({rounded: true});
  });

  it('flushes a pending edit into the mode it was made in when toggled before the debounce fires', async () => {
    const el = await fixture(html`
      <zn-theme-editor src="about:blank" frame-origin="https://site.example" debounce="50">
        <zn-input name="radius" label="Radius" value="8"></zn-input>
      </zn-theme-editor>`);
    const calls = spyOnFrame(el);

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    input.value = '99';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
    // toggle before the 50ms push debounce fires - no await in between
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();

    await waitUntil(() => calls.length >= 1);
    // give the (now-cancelled) original debounce timer a chance to prove it's gone
    await new Promise(resolve => setTimeout(resolve, 80));

    expect(calls.length).to.equal(1);
    expect(calls[0]['mode']).to.equal('dark');
    // dark was never touched - the edit belongs to light, the mode it was made in
    expect(calls[0]['values']).to.deep.equal({radius: '8'});

    const values = (el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values;
    expect(values.light).to.deep.equal({radius: '99'});
    expect(values.dark).to.deep.equal({radius: '8'});
  });

  describe('grouped controls (zn-collapsible sections)', () => {
    it('pushes exactly once at mount for a control wrapped in a zn-collapsible section', async () => {
      // Prototype-spy technique (see the bare-control test above) - it's the
      // only one that observes the mount push, since firstUpdated fires
      // inside fixture(), before a per-instance spy could be installed.
      const proto = customElements.get('zn-preview-frame')!.prototype as unknown as Framelike;
      const original = proto.setTheme;
      const calls: ThemeCall[] = [];
      proto.setTheme = (theme: ThemeCall) => calls.push(theme);

      try {
        await fixture(html`
          <zn-theme-editor src="about:blank" frame-origin="https://site.example">
            <zn-collapsible caption="Section" default="open">
              <zn-input name="radius" label="Radius" value="8"></zn-input>
            </zn-collapsible>
          </zn-theme-editor>`);

        expect(calls.length).to.equal(1);
      } finally {
        proto.setTheme = original;
      }
    });

    it('harvests a control wrapped in a zn-collapsible section', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example">
          <zn-collapsible caption="Section" default="open">
            <zn-input name="radius" label="Radius" value="8"></zn-input>
          </zn-collapsible>
        </zn-theme-editor>`);

      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({radius: '8'});
    });

    it('harvests controls across two sections into one value set', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example">
          <zn-collapsible caption="A" default="open">
            <zn-input name="radius" label="Radius" value="8"></zn-input>
          </zn-collapsible>
          <zn-collapsible caption="B" default="open">
            <zn-checkbox name="rounded" checked></zn-checkbox>
          </zn-collapsible>
        </zn-theme-editor>`);

      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({radius: '8', rounded: true});
    });

    it('seeds and pushes a control added inside an existing section after mount', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example">
          <zn-collapsible caption="Section" default="open">
            <zn-input name="radius" label="Radius" value="8"></zn-input>
          </zn-collapsible>
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);

      const section = el.querySelector('zn-collapsible')!;
      const input = document.createElement('zn-input');
      input.setAttribute('name', 'spacing');
      input.setAttribute('value', '4');
      section.append(input);

      await waitUntil(() => calls.length === 1);
      expect(calls[0]['values']).to.deep.equal({radius: '8', spacing: '4'});

      const values = (el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values;
      expect(values.light).to.deep.equal({radius: '8', spacing: '4'});
      expect(values.dark).to.deep.equal({radius: '8', spacing: '4'});
    });

    it('removing a section pushes, retaining the removed control\'s value rather than purging it', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example">
          <zn-collapsible caption="A" default="open">
            <zn-input name="radius" label="Radius" value="8"></zn-input>
          </zn-collapsible>
          <zn-collapsible caption="B" default="open">
            <zn-input name="spacing" label="Spacing" value="4"></zn-input>
          </zn-collapsible>
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);

      el.querySelectorAll('zn-collapsible')[1].remove();

      await waitUntil(() => calls.length === 1);
      expect((calls[0]['values'] as Record<string, unknown>)['radius']).to.equal('8');
      // Intentional: the store is the theme, not a mirror of visible controls.
      expect((calls[0]['values'] as Record<string, unknown>)['spacing']).to.equal('4');
    });

    it('removing a single control from within a still-present section pushes the rest', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example">
          <zn-collapsible caption="Section" default="open">
            <zn-input name="radius" label="Radius" value="8"></zn-input>
            <zn-input name="spacing" label="Spacing" value="4"></zn-input>
          </zn-collapsible>
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);

      el.querySelector('zn-input[name="spacing"]')!.remove();

      await waitUntil(() => calls.length === 1);
      expect((calls[0]['values'] as Record<string, unknown>)['radius']).to.equal('8');
      expect((calls[0]['values'] as Record<string, unknown>)['spacing']).to.equal('4');
    });

    it('retains an edit made during the push debounce when a control is added elsewhere', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" debounce="50">
          <zn-collapsible caption="Section" default="open">
            <zn-input name="radius" label="Radius" value="8"></zn-input>
          </zn-collapsible>
        </zn-theme-editor>`);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '16';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      const section = el.querySelector('zn-collapsible')!;
      const added = document.createElement('zn-input');
      added.setAttribute('name', 'spacing');
      added.setAttribute('value', '4');
      section.append(added); // no await - lands before the 50ms push debounce fires

      await new Promise(resolve => setTimeout(resolve, 80));

      const values = (el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values;
      expect(values.light['radius']).to.equal('16');
      expect(input.value).to.equal('16');
    });

    it('the light-DOM observer\'s config never includes attributes', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example"></zn-theme-editor>`);

      const config = (el as unknown as {_controlsObserverConfig: MutationObserverInit})._controlsObserverConfig;
      expect(config.childList).to.be.true;
      expect(config.subtree).to.be.true;
      expect(config.attributes).to.not.be.true;
    });
  });

  it('clears a frame-sourced error on a subsequent control change', async () => {
    const el = await fixture(FIXTURE);
    spyOnFrame(el);

    const frame = el.shadowRoot!.querySelector('zn-preview-frame')!;
    frame.dispatchEvent(new CustomEvent('zn-error', {
      bubbles: true, composed: true, detail: {message: 'preview blew up'}
    }));
    await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    input.value = '16';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

    await waitUntil(() => !el.shadowRoot!.querySelector('[part="error"]'));
  });

  describe('sections', () => {
    it('with no sections configured, renders a single default slot with no section chrome', async () => {
      const el = await fixture(FIXTURE);

      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(0);
      expect(el.shadowRoot!.querySelectorAll('slot:not([name])').length).to.equal(1);
      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({radius: '8'});
    });

    it('does not crash render when sections is malformed JSON', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" sections="not-json">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(0);
      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({radius: '8'});
    });

    it('does not crash render when sections is valid JSON but not an array', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" sections='{"a":1}'>
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(0);
      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({radius: '8'});
    });

    it('harvests controls assigned to two sections into one value set', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors'}, {name: 'layout', caption: 'Layout'}]}">
          <zn-color-select slot="colors" name="accent" value="#6936f5"></zn-color-select>
          <zn-input slot="layout" name="radius" type="number" value="4"></zn-input>
        </zn-theme-editor>`);

      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({accent: '#6936f5', radius: '4'});
      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(2);
    });

    it('seeds a section control into both modes and writes it back on toggle', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors', open: true}]}">
          <zn-input slot="colors" name="accent" value="#ffffff" dark-value="#000000"></zn-input>
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);

      expect((el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values)
        .to.deep.equal({light: {accent: '#ffffff'}, dark: {accent: '#000000'}});

      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();
      await waitUntil(() => calls.length === 1);

      expect(calls[0]['values']).to.deep.equal({accent: '#000000'});
      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      expect(input.value).to.equal('#000000');
    });

    it('harvests an ungrouped control alongside section controls', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors', open: true}]}">
          <zn-input slot="colors" name="accent" value="#6936f5"></zn-input>
          <zn-input name="spacing" type="number" value="8"></zn-input>
        </zn-theme-editor>`);

      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({accent: '#6936f5', spacing: '8'});
    });

    it('renders no chrome for a sections entry with no assigned controls', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors'}, {name: 'empty', caption: 'Empty'}]}">
          <zn-input slot="colors" name="accent" value="#6936f5"></zn-input>
        </zn-theme-editor>`);

      const captions = Array.from(el.shadowRoot!.querySelectorAll('.editor__section'))
        .map(section => section.getAttribute('caption'));
      expect(captions).to.deep.equal(['Colors']);
    });

    it('controls-collapsed reflects and its toggle flips it without changing values or pushing', async () => {
      const el = await fixture(FIXTURE);
      const calls = spyOnFrame(el);

      expect(el.hasAttribute('controls-collapsed')).to.be.false;

      el.shadowRoot!.querySelector<HTMLButtonElement>('.panel-toggle')!.click();
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      expect((el as HTMLElement & {controlsCollapsed: boolean}).controlsCollapsed).to.be.true;
      expect(el.hasAttribute('controls-collapsed')).to.be.true;
      expect(calls.length).to.equal(0);
      expect((el as HTMLElement & {values: {light: Record<string, unknown>}}).values.light)
        .to.deep.equal({radius: '8'});

      el.shadowRoot!.querySelector<HTMLButtonElement>('.panel-toggle')!.click();
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;
      expect((el as HTMLElement & {controlsCollapsed: boolean}).controlsCollapsed).to.be.false;
    });

    it('pushes exactly once on mount for a control assigned to a configured section', async () => {
      // Prototype-spy technique - firstUpdated fires inside fixture(), before a
      // per-instance spy could be installed.
      const proto = customElements.get('zn-preview-frame')!.prototype as unknown as Framelike;
      const original = proto.setTheme;
      const calls: ThemeCall[] = [];
      proto.setTheme = (theme: ThemeCall) => calls.push(theme);

      try {
        await fixture(html`
          <zn-theme-editor
            src="about:blank" frame-origin="https://site.example"
            .sections="${[{name: 'colors', caption: 'Colors', open: true}]}">
            <zn-input slot="colors" name="accent" value="#6936f5"></zn-input>
          </zn-theme-editor>`);

        expect(calls.length).to.equal(1);
      } finally {
        proto.setTheme = original;
      }
    });

    it('seeds and pushes a control added into a section that started with no assigned controls', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors', open: true}]}">
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);
      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(0);

      const input = document.createElement('zn-input');
      input.setAttribute('slot', 'colors');
      input.setAttribute('name', 'accent');
      input.setAttribute('value', '#6936f5');
      el.append(input);

      await waitUntil(() => calls.length === 1);
      expect(calls[0]['values']).to.deep.equal({accent: '#6936f5'});
      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(1);

      const values = (el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values;
      expect(values.light).to.deep.equal({accent: '#6936f5'});
      expect(values.dark).to.deep.equal({accent: '#6936f5'});
    });

    it('renders the toolbar outside the preview column', async () => {
      const el = await fixture(FIXTURE);

      const toolbar = el.shadowRoot!.querySelector('[part="toolbar"]')!;
      const preview = el.shadowRoot!.querySelector('[part="preview"]')!;
      expect(toolbar).to.exist;
      expect(preview.contains(toolbar)).to.be.false;
    });
  });

  describe('column layout', () => {
    it('the controls column spans the full height of the component, not just a shared row', async () => {
      const el = await fixture(FIXTURE);
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      const controls = el.shadowRoot!.querySelector('[part="controls"]')!;
      const controlsHeight = controls.getBoundingClientRect().height;
      const hostHeight = el.getBoundingClientRect().height;

      expect(controlsHeight).to.be.closeTo(hostHeight, 2);
    });

    it("the toolbar starts at the controls column's right edge, not the component's left edge", async () => {
      const el = await fixture(FIXTURE);
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      const controls = el.shadowRoot!.querySelector('[part="controls"]')!;
      const toolbar = el.shadowRoot!.querySelector('[part="toolbar"]')!;
      const hostLeft = el.getBoundingClientRect().left;
      const controlsRight = controls.getBoundingClientRect().right;
      const toolbarLeft = toolbar.getBoundingClientRect().left;

      expect(toolbarLeft).to.be.closeTo(controlsRight, 2);
      expect(toolbarLeft).to.be.greaterThan(hostLeft + 1);
    });

    it('renders both captions when set', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          controls-caption="Theme Builder" preview-caption="Live Preview">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      const controlsHeader = el.shadowRoot!.querySelector('[part="controls-header"]')!;
      const toolbar = el.shadowRoot!.querySelector('[part="toolbar"]')!;
      expect(controlsHeader.textContent).to.contain('Theme Builder');
      expect(toolbar.textContent).to.contain('Live Preview');
    });

    it('still renders the controls header row when controls-caption is empty', async () => {
      const el = await fixture(FIXTURE);

      const controlsHeader = el.shadowRoot!.querySelector('[part="controls-header"]');
      expect(controlsHeader).to.exist;
      expect(controlsHeader!.textContent?.trim()).to.equal('');
    });
  });

  describe('tabbed sections (section-layout="tabs")', () => {
    const TABBED_FIXTURE = html`
      <zn-theme-editor
        src="about:blank" frame-origin="https://site.example"
        section-layout="tabs" debounce="10"
        .sections="${[{name: 'colors', caption: 'Colors'}, {name: 'layout', caption: 'Layout'}]}">
        <zn-color-select slot="colors" name="accent" label="Accent" value="#6936f5"></zn-color-select>
        <zn-input slot="layout" name="radius" type="number" value="4"></zn-input>
      </zn-theme-editor>`;

    it('renders and is accessible', async () => {
      const el = await fixture(TABBED_FIXTURE);
      await expect(el).to.be.accessible();
    });

    it('renders a tab per visible section with the first active', async () => {
      const el = await fixture(TABBED_FIXTURE);
      const tabs = Array.from(el.shadowRoot!.querySelectorAll('li[tab]'));
      const panels = Array.from(el.shadowRoot!.querySelectorAll('.editor__tab-panel'));
      expect(tabs.length).to.equal(2);
      // zn-tabs applies its initial selection after its own 10ms settle timer.
      await waitUntil(() => panels[0].hasAttribute('selected'));
      expect(panels[1].hasAttribute('selected')).to.be.false;
    });

    it('keeps a control in a non-active tab pane present, harvested and POSTed', async () => {
      const fetchCalls: {uri: string; init?: RequestInit}[] = [];
      const realFetch = window.fetch;
      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        return Promise.resolve(new Response('', {status: 200}));
      };

      try {
        const el = await fixture(html`
          <zn-theme-editor
            src="about:blank" frame-origin="https://site.example"
            action="/theme/save" section-layout="tabs" debounce="10" save-debounce="10"
            .sections="${[{name: 'colors', caption: 'Colors'}, {name: 'layout', caption: 'Layout'}]}">
            <zn-color-select slot="colors" name="accent" value="#6936f5"></zn-color-select>
            <zn-input slot="layout" name="radius" type="number" value="4"></zn-input>
          </zn-theme-editor>`);

        // "colors" is the active tab by default; "layout" stays present but unselected.
        const layoutPanel = Array.from(el.shadowRoot!.querySelectorAll('.editor__tab-panel'))[1];
        expect((layoutPanel as HTMLElement).hasAttribute('selected')).to.be.false;
        // the slot inside the unselected pane must still exist for harvesting to find
        expect(layoutPanel!.querySelector('slot[name="layout"]')).to.exist;

        const values = (el as HTMLElement & {values: {light: Record<string, unknown>}}).values;
        expect(values.light).to.deep.equal({accent: '#6936f5', radius: '4'});

        const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
        input.value = '8';
        input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

        await waitUntil(() => fetchCalls.length === 1);
        const body = fetchCalls[0].init!.body as FormData;
        expect(body.get('light[accent]')).to.equal('#6936f5');
        expect(body.get('light[radius]')).to.equal('8');
      } finally {
        window.fetch = realFetch;
      }
    });

    it('clicking a tab switches the selected panel without pushing or harvesting a new value', async () => {
      const el = await fixture(TABBED_FIXTURE);
      await waitUntil(() => el.shadowRoot!.querySelector('.editor__tab-panel[selected]'));
      const calls = spyOnFrame(el);
      const tabs = el.shadowRoot!.querySelectorAll<HTMLElement>('li[tab]');
      const panels = el.shadowRoot!.querySelectorAll('.editor__tab-panel');

      tabs[1].click();
      // clickTab() re-selects via its own 10ms settle timer too.
      await waitUntil(() => (panels[1] as HTMLElement).hasAttribute('selected'));

      expect((panels[0] as HTMLElement).hasAttribute('selected')).to.be.false;
      expect(calls.length).to.equal(0);
    });

    it('with section-layout unset, renders collapsibles exactly as before', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors'}]}">
          <zn-color-select slot="colors" name="accent" value="#6936f5"></zn-color-select>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(1);
      expect(el.shadowRoot!.querySelector('zn-tabs')).to.not.exist;
    });
  });

  describe('author-slotted collapsibles nested inside tabbed sections', () => {
    const NESTED_FIXTURE = () => fixture(html`
      <zn-theme-editor
        src="about:blank" frame-origin="https://site.example"
        section-layout="tabs" debounce="10"
        .sections="${[{name: 'colors', caption: 'Colors'}, {name: 'layout', caption: 'Layout'}]}">
        <zn-collapsible slot="colors" caption="Group A">
          <zn-input name="a" label="A" value="1"></zn-input>
        </zn-collapsible>
        <zn-collapsible slot="colors" caption="Group B">
          <zn-input name="b" label="B" value="2"></zn-input>
        </zn-collapsible>
        <zn-input slot="colors" name="c" label="C" value="3"></zn-input>
        <zn-input slot="layout" name="d" label="D" value="4"></zn-input>
      </zn-theme-editor>`);

    it('harvests controls nested inside slotted collapsibles, in both modes', async () => {
      const el = await NESTED_FIXTURE();
      const values = (el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values;
      expect(values.light).to.deep.equal({a: '1', b: '2', c: '3', d: '4'});
      expect(values.dark).to.deep.equal({a: '1', b: '2', c: '3', d: '4'});
    });

    it('nested harvesting keeps the inactive-pane guarantee intact', async () => {
      const el = await NESTED_FIXTURE();
      const layoutPanel = Array.from(el.shadowRoot!.querySelectorAll('.editor__tab-panel'))[1];
      expect((layoutPanel as HTMLElement).hasAttribute('selected')).to.be.false;
      expect(layoutPanel!.querySelector('slot[name="layout"]')).to.exist;
    });

  });

  describe('nested groups (sections + groups)', () => {
    const NESTED_GROUPS_FIXTURE = () => fixture(html`
      <zn-theme-editor
        src="about:blank" frame-origin="https://site.example" debounce="10"
        .sections="${[
          {name: 'colors', caption: 'Colors', groups: [
            {name: 'brand', caption: 'Brand'},
            {name: 'semantic', caption: 'Semantic', open: true},
          ]},
          {name: 'shapes', caption: 'Shapes', groups: [
            {name: 'radius', caption: 'Radius'},
          ]},
        ]}">
        <zn-input slot="brand" name="brand" value="1"></zn-input>
        <zn-input slot="semantic" name="semantic" value="2"></zn-input>
        <zn-input slot="radius" name="radius" value="4"></zn-input>
      </zn-theme-editor>`);

    it('renders and is accessible', async () => {
      const el = await NESTED_GROUPS_FIXTURE();
      await expect(el).to.be.accessible();
    });

    it('renders zn-tabs with one collapsible per populated group', async () => {
      const el = await NESTED_GROUPS_FIXTURE();
      expect(el.shadowRoot!.querySelector('zn-tabs')).to.exist;
      expect(el.shadowRoot!.querySelectorAll('li[tab]').length).to.equal(2);
      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(3);
    });

    it("a control inside a non-active tab's group is still harvested, seeded into both modes, and POSTed", async () => {
      const fetchCalls: {uri: string; init?: RequestInit}[] = [];
      const realFetch = window.fetch;
      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        return Promise.resolve(new Response('', {status: 200}));
      };

      try {
        const el = await fixture(html`
          <zn-theme-editor
            src="about:blank" frame-origin="https://site.example"
            action="/theme/save" debounce="10" save-debounce="10"
            .sections="${[
              {name: 'colors', caption: 'Colors', groups: [{name: 'brand', caption: 'Brand'}]},
              {name: 'shapes', caption: 'Shapes', groups: [{name: 'radius', caption: 'Radius'}]},
            ]}">
            <zn-input slot="brand" name="brand" value="1"></zn-input>
            <zn-input slot="radius" name="radius" value="4"></zn-input>
          </zn-theme-editor>`);

        // "colors" (and its "brand" group) is the first, active tab; "shapes"
        // and its "radius" group's control are not.
        const values = (el as HTMLElement & {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}).values;
        expect(values.light).to.deep.equal({brand: '1', radius: '4'});
        expect(values.dark).to.deep.equal({brand: '1', radius: '4'});

        const input = el.querySelector('zn-input[name="brand"]')! as HTMLElement & {value: string};
        input.value = '9';
        input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

        await waitUntil(() => fetchCalls.length === 1);
        const body = fetchCalls[0].init!.body as FormData;
        expect(body.get('light[brand]')).to.equal('9');
        expect(body.get('light[radius]')).to.equal('4');
        expect(body.get('dark[radius]')).to.equal('4');
      } finally {
        window.fetch = realFetch;
      }
    });

    it('a group with no assigned controls renders no collapsible', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors', groups: [
            {name: 'brand', caption: 'Brand'},
            {name: 'empty', caption: 'Empty'},
          ]}]}">
          <zn-input slot="brand" name="brand" value="1"></zn-input>
        </zn-theme-editor>`);

      const captions = Array.from(el.shadowRoot!.querySelectorAll('.editor__section'))
        .map(section => section.getAttribute('caption'));
      expect(captions).to.deep.equal(['Brand']);
    });

    it('a section with no populated groups renders no tab', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[
            {name: 'colors', caption: 'Colors', groups: [{name: 'brand', caption: 'Brand'}]},
            {name: 'empty-section', caption: 'Empty section', groups: [{name: 'empty-group', caption: 'Empty group'}]},
          ]}">
          <zn-input slot="brand" name="brand" value="1"></zn-input>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelectorAll('li[tab]').length).to.equal(1);
    });

    it('flat sections with no groups still honour section-layout="tabs"', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example" section-layout="tabs"
          .sections="${[{name: 'colors', caption: 'Colors'}, {name: 'layout', caption: 'Layout'}]}">
          <zn-input slot="colors" name="accent" value="1"></zn-input>
          <zn-input slot="layout" name="radius" value="4"></zn-input>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelector('zn-tabs')).to.exist;
      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(0);
    });

    it('does not crash render when groups is malformed', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sections="${[{name: 'colors', caption: 'Colors', groups: 'not-an-array'}]}">
          <zn-input slot="colors" name="accent" value="1"></zn-input>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelectorAll('.editor__section').length).to.equal(1);
      expect(el.shadowRoot!.querySelector('zn-tabs')).to.not.exist;
    });
  });

  describe('preview sources', () => {
    it('with sources unset, renders no dropdown and leaves src alone', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="/embed/a" frame-origin="https://site.example"></zn-theme-editor>`);

      expect(el.shadowRoot!.querySelector('zn-select.editor__sources')).to.not.exist;
      const frame = el.shadowRoot!.querySelector('zn-preview-frame')! as HTMLElement & {src: string};
      expect(frame.src).to.equal('/embed/a');
    });

    it('renders a dropdown, the first source winning over an explicit src, and switches the frame src on change', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="/embed/explicit" frame-origin="https://site.example"
          .sources="${[{label: 'Storefront', src: '/embed/a'}, {label: 'Checkout', src: '/embed/b'}]}">
        </zn-theme-editor>`);

      const select = el.shadowRoot!.querySelector('zn-select.editor__sources')! as HTMLElement & {value: string};
      expect(select).to.exist;
      const frame = el.shadowRoot!.querySelector('zn-preview-frame')! as HTMLElement & {src: string};
      expect(frame.src).to.equal('/embed/a'); // first source wins over the explicit src

      select.value = '1';
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      expect(frame.src).to.equal('/embed/b');
    });

    it('keeps the same frame instance across a source switch, so its retained theme survives the reload', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          .sources="${[{label: 'A', src: 'about:blank'}, {label: 'B', src: 'about:blank?b'}]}">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      const frameBefore = el.shadowRoot!.querySelector('zn-preview-frame')!;
      const select = el.shadowRoot!.querySelector('zn-select.editor__sources')! as HTMLElement & {value: string};

      select.value = '1';
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      const frameAfter = el.shadowRoot!.querySelector('zn-preview-frame')! as HTMLElement & {src: string};
      // Same instance, not recreated - setTheme()'s retained payload (tested in
      // preview-frame's own suite) replays on this instance's next ready handshake.
      expect(frameAfter).to.equal(frameBefore);
      expect(frameAfter.src).to.equal('about:blank?b');
    });
  });

  describe('standalone panel mode', () => {
    it('reflects the standalone attribute and forwards a panel backdrop to the frame', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" standalone></zn-theme-editor>`);

      expect(el.hasAttribute('standalone')).to.be.true;
      const frame = el.shadowRoot!.querySelector('zn-preview-frame')!;
      expect(frame.getAttribute('backdrop')).to.equal('panel');
    });

    it('forwards a dots backdrop to the frame when standalone is unset', async () => {
      const el = await fixture(FIXTURE);
      const frame = el.shadowRoot!.querySelector('zn-preview-frame')!;
      expect(frame.getAttribute('backdrop')).to.equal('dots');
    });
  });

  describe('narrow viewport recovery', () => {
    // A real resize needs a moment to reflow before @media queries are reliably
    // reflected in getComputedStyle - a plain rAF tick isn't always enough.
    const settle = () => new Promise(resolve => setTimeout(resolve, 100));

    afterEach(async () => {
      await setViewport({width: 800, height: 600}); // restore the runner's default
      await settle();
    });

    it('auto-collapses once when mounted on a narrow viewport', async () => {
      await setViewport({width: 400, height: 800});
      await settle();
      const el = await fixture(FIXTURE);
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;
      await settle();

      expect((el as HTMLElement & {controlsCollapsed: boolean}).controlsCollapsed).to.be.true;
    });

    it('keeps the panel-toggle usable when controls-collapsed is set post-connect while narrow', async () => {
      await setViewport({width: 400, height: 800});
      await settle();
      const el = await fixture(FIXTURE);
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;
      await settle();

      // Mimics a host applying a persisted preference (or a reactive binding
      // re-asserting it) after the auto-collapse has already run.
      (el as HTMLElement & {controlsCollapsed: boolean}).controlsCollapsed = true;
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      // Checked against the parsed stylesheet rather than computed style - some
      // engines can leave computed style stale on a shadow root reusing a
      // long-lived, already-adopted stylesheet across many prior fixtures.
      const sheets = Array.from(el.shadowRoot!.adoptedStyleSheets ?? []);
      const hidesUnconditionally = sheets.some(sheet => Array.from(sheet.cssRules).some(rule =>
        rule instanceof CSSMediaRule && rule.media.mediaText.includes('768') &&
        Array.from(rule.cssRules).some(inner =>
          inner instanceof CSSStyleRule && inner.selectorText === '.panel-toggle' && inner.style.display === 'none')));
      expect(hidesUnconditionally).to.be.false;

      el.shadowRoot!.querySelector<HTMLButtonElement>('.panel-toggle')!.click();
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      expect((el as HTMLElement & {controlsCollapsed: boolean}).controlsCollapsed).to.be.false;
    });
  });

  describe('auto-save', () => {
    let fetchCalls: {uri: string; init?: RequestInit}[];
    const realFetch = window.fetch;

    beforeEach(() => {
      fetchCalls = [];
      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        return Promise.resolve(new Response('', {status: 200}));
      };
    });

    afterEach(() => {
      window.fetch = realFetch;
    });

    it('does not POST when action is unset', async () => {
      const el = await fixture(FIXTURE);
      spyOnFrame(el);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '16';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetchCalls.length).to.equal(0);
    });

    it('POSTs the values to action on change', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="10"
          save-debounce="10">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
          <zn-checkbox name="rounded" checked></zn-checkbox>
        </zn-theme-editor>`);
      spyOnFrame(el);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '16';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      await waitUntil(() => fetchCalls.length === 1);
      expect(fetchCalls[0].uri).to.equal('/theme/save');
      expect(fetchCalls[0].init?.method).to.equal('POST');
      const body = fetchCalls[0].init!.body as FormData;
      expect(body.get('light[radius]')).to.equal('16');
      // dark was seeded from the original '8' and is untouched by the light-only edit
      expect(body.get('dark[radius]')).to.equal('8');
      expect(body.get('light[rounded]')).to.equal('1');
      expect(body.get('dark[rounded]')).to.equal('1');
      // mode and device are view state, never persisted
      expect(body.get('mode')).to.equal(null);
      expect(body.get('device')).to.equal(null);
    });

    it('POSTs both light and dark sets as bracketed keys', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="10"
          save-debounce="10">
          <zn-input name="background" label="Background" value="#ffffff" dark-value="#000000"></zn-input>
        </zn-theme-editor>`);
      spyOnFrame(el);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '#eeeeee';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      await waitUntil(() => fetchCalls.length === 1);
      const body = fetchCalls[0].init!.body as FormData;
      expect(body.get('light[background]')).to.equal('#eeeeee');
      expect(body.get('dark[background]')).to.equal('#000000');
    });

    it('toggling mode issues no POST', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="5"
          save-debounce="5">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);
      spyOnFrame(el);

      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetchCalls.length).to.equal(0);
    });

    it('suppresses the async color-normalization emit from write-back, issuing no POST', async () => {
      // dark-value is authored as rgb() against a hex value/colorFormat: writing
      // it back into the control makes zn-input's own @watch('value') handler
      // normalize it and emit zn-change from inside a later Lit update() - the
      // scenario the write-back suppression guard exists for.
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="5"
          save-debounce="5">
          <zn-input name="background" type="color" label="Background" value="#ffffff" dark-value="rgb(0, 0, 0)"></zn-input>
        </zn-theme-editor>`);
      spyOnFrame(el);

      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetchCalls.length).to.equal(0);
    });

    it('toggling mode with a grouped checkbox causes exactly one push and no POST', async () => {
      // Does not by itself prove the attributes-vs-childList choice below -
      // see the config-pinning test for that. This only proves the toggle
      // itself stays clean when the control is nested in a section.
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="5"
          save-debounce="5">
          <zn-collapsible caption="Section" default="open">
            <zn-checkbox name="rounded" checked dark-value="false"></zn-checkbox>
          </zn-collapsible>
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);

      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();

      await waitUntil(() => calls.length === 1);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(calls.length).to.equal(1);
      expect(fetchCalls.length).to.equal(0);
    });

    it('does not POST when only the mode or device changes', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          save-debounce="10">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);
      spyOnFrame(el);

      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();
      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-device="mobile"]')!.click();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetchCalls.length).to.equal(0);
    });

    it('surfaces a failed save and emits zn-error', async () => {
      window.fetch = () => Promise.resolve(new Response('theme rejected', {status: 500}));

      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="10"
          save-debounce="10">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);
      spyOnFrame(el);

      let znError: CustomEvent<{message?: string}> | null = null;
      el.addEventListener('zn-error', (e: Event) => { znError = e as CustomEvent<{message?: string}>; });

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '16';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));
      expect(el.shadowRoot!.querySelector('[part="error"]')!.textContent).to.contain('theme rejected');
      expect(znError).to.exist;
      expect(znError!.detail.message).to.contain('theme rejected');
    });

    it('runs exactly one follow-up save for changes made mid-flight', async () => {
      let release: (() => void) | undefined;
      const gate = new Promise<void>(resolve => { release = resolve; });
      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        return gate.then(() => new Response('', {status: 200}));
      };

      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank"
          frame-origin="https://site.example"
          action="/theme/save"
          debounce="5"
          save-debounce="5">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);
      spyOnFrame(el);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      const change = (value: string) => {
        input.value = value;
        input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
      };

      change('16');
      await waitUntil(() => fetchCalls.length === 1);   // in flight, gated

      change('24');
      change('32');
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetchCalls.length).to.equal(1);            // queued, not stacked

      release!();
      await waitUntil(() => fetchCalls.length === 2);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetchCalls.length).to.equal(2);            // one follow-up, latest values
      expect((fetchCalls[1].init!.body as FormData).get('light[radius]')).to.equal('32');
    });
  });

  describe('submit button', () => {
    let fetchCalls: {uri: string; init?: RequestInit}[];
    const realFetch = window.fetch;

    // zn-button overrides click() to call its handler directly without dispatching -
    // a real click event is needed for the theme-editor's own @click listener to fire.
    function clickButton(el: Element) {
      const button = el.shadowRoot!.querySelector('zn-button')!;
      button.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    }

    beforeEach(() => {
      fetchCalls = [];
      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        return Promise.resolve(new Response('', {status: 200}));
      };
    });

    afterEach(() => {
      window.fetch = realFetch;
    });

    it('renders no button without submit-label', async () => {
      const el = await fixture(FIXTURE);
      expect(el.shadowRoot!.querySelector('zn-button')).to.not.exist;
    });

    it('renders the button in the toolbar, not the footer, and leaves the footer slot working', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
          <span slot="footer">extra</span>
        </zn-theme-editor>`);

      const button = el.shadowRoot!.querySelector('zn-button')!;
      expect(button).to.exist;
      expect(button.textContent?.trim()).to.equal('Save theme');
      expect(el.shadowRoot!.querySelector('[part="toolbar"] zn-button')).to.equal(button);
      expect(el.shadowRoot!.querySelector('[part="footer"] zn-button')).to.not.exist;
      expect(el.shadowRoot!.querySelector('[part="footer"] slot[name="footer"]')).to.exist;
    });

    it('renders no footer at all when only submit-label is set', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      expect(el.shadowRoot!.querySelector('zn-button')).to.exist;
      expect(el.shadowRoot!.querySelector('[part="footer"]')).to.not.exist;
    });

    it('clicking submits and POSTs exactly once', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      clickButton(el);

      await waitUntil(() => fetchCalls.length === 1);
      expect(fetchCalls[0].uri).to.equal('/theme/save');
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetchCalls.length).to.equal(1);
    });

    it('manual suppresses debounced auto-save but not preview pushes', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" manual debounce="10" save-debounce="10">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);
      const calls = spyOnFrame(el);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '16';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      await waitUntil(() => calls.length === 1);
      expect(calls[0]['values']).to.deep.equal({radius: '16'});

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetchCalls.length).to.equal(0);
    });

    it('submit flushes a pending edit so the POST carries the just-typed value', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" manual debounce="1000" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '99';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
      // click before the (long) push debounce fires - no await in between
      clickButton(el);

      await waitUntil(() => fetchCalls.length === 1);
      const body = fetchCalls[0].init!.body as FormData;
      expect(body.get('light[radius]')).to.equal('99');
    });

    it('emits zn-theme-submit with both value sets', async () => {
      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" submit-label="Save theme">
          <zn-input name="background" label="Background" value="#ffffff" dark-value="#000000"></zn-input>
        </zn-theme-editor>`);

      interface Detail {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}
      let detail: Detail | null = null;
      el.addEventListener('zn-theme-submit', (e: Event) => {
        detail = (e as CustomEvent<Detail>).detail;
      });

      clickButton(el);

      await waitUntil(() => detail !== null);
      expect(detail!.values).to.deep.equal({light: {background: '#ffffff'}, dark: {background: '#000000'}});
    });

    it('emits zn-theme-submit without POSTing when action is unset', async () => {
      const el = await fixture(html`
        <zn-theme-editor src="about:blank" frame-origin="https://site.example" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      let fired = false;
      el.addEventListener('zn-theme-submit', () => { fired = true; });

      clickButton(el);

      await waitUntil(() => fired);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetchCalls.length).to.equal(0);
    });

    it('shows a loading state while the POST is in flight and does not stack a second submit', async () => {
      let release: (() => void) | undefined;
      const gate = new Promise<void>(resolve => { release = resolve; });
      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        return gate.then(() => new Response('', {status: 200}));
      };

      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      clickButton(el);
      await waitUntil(() => fetchCalls.length === 1);
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;

      const button = el.shadowRoot!.querySelector('zn-button')! as HTMLElement & {loading: boolean};
      expect(button.loading).to.be.true;

      clickButton(el); // second click while in flight - must not stack
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(fetchCalls.length).to.equal(1);

      release!();
      await waitUntil(() => !button.loading);
    });

    it('fires zn-theme-submit only once the save carrying the flushed value has genuinely settled', async () => {
      let releaseFirst: (() => void) | undefined;
      const gateFirst = new Promise<void>(resolve => { releaseFirst = resolve; });
      let secondBody: FormData | undefined;

      window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({uri: String(uri), init});
        if (fetchCalls.length === 1) return gateFirst.then(() => new Response('', {status: 200}));
        secondBody = init!.body as FormData;
        return Promise.resolve(new Response('', {status: 200}));
      };

      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" debounce="5" save-debounce="5" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '50';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
      await waitUntil(() => fetchCalls.length === 1); // first auto-save now in flight, gated

      input.value = '99';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      let fired = false;
      interface Detail {values: {light: Record<string, unknown>; dark: Record<string, unknown>}}
      let detail: Detail | null = null;
      el.addEventListener('zn-theme-submit', (e: Event) => {
        fired = true;
        detail = (e as CustomEvent<Detail>).detail;
      });

      clickButton(el); // flushes '99' and bypasses the save debounce, but a save is already in flight
      await (el as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;
      const button = el.shadowRoot!.querySelector('zn-button')! as HTMLElement & {loading: boolean};
      expect(button.loading).to.be.true;

      await new Promise(resolve => setTimeout(resolve, 20));
      expect(fired).to.equal(false); // the flushed value hasn't been POSTed yet
      expect(fetchCalls.length).to.equal(1);

      releaseFirst!();
      await waitUntil(() => fetchCalls.length === 2); // follow-up carrying '99'
      expect(secondBody?.get('light[radius]')).to.equal('99');

      await waitUntil(() => fired);
      // dark was seeded from the original '8' at mount and is untouched by the light-only edits
      expect(detail!.values).to.deep.equal({light: {radius: '99'}, dark: {radius: '8'}});
      expect(button.loading).to.be.false;
    });

    it('emits no zn-theme-submit when the settling save fails', async () => {
      window.fetch = () => Promise.resolve(new Response('rejected', {status: 500}));

      const el = await fixture(html`
        <zn-theme-editor
          src="about:blank" frame-origin="https://site.example"
          action="/theme/save" submit-label="Save theme">
          <zn-input name="radius" label="Radius" value="8"></zn-input>
        </zn-theme-editor>`);

      let fired = false;
      el.addEventListener('zn-theme-submit', () => { fired = true; });

      clickButton(el);
      await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(fired).to.equal(false);
    });
  });
});
