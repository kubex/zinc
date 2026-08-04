# zn-theme-editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `zn-theme-editor` — slotted form controls on the left that live-push theme values into an embedded `zn-preview-frame`, with a toolbar that switches the preview's light/dark mode and its desktop/tablet/mobile width.

**Architecture:** `zn-preview-frame` gains two reusable capabilities (a `device` width property and a `setTheme()` method that replays its payload after each frame handshake). `zn-theme-editor` composes a frame internally, harvests values from its default slot by listening on the slot element, and pushes them over the existing `hp-preview` postMessage protocol. The frame stays the only thing that touches `contentWindow`, so origin checking lives in exactly one place.

**Tech Stack:** Lit 3 + TypeScript, SCSS via `esbuild-sass-plugin`, `@open-wc/testing` on Web Test Runner + Playwright, lucide icons via `zn-icon`.

**Spec:** `docs/superpowers/specs/2026-08-03-theme-editor-design.md`

## Global Constraints

- **Never run `git` write commands.** The user's global rules prohibit commit/reset/checkout/stash. Read-only git (`log`, `diff`, `status`) is fine. There are no commit steps in this plan; each task ends with a verification step instead.
- **Never run `npm run build`.** The user runs `npm run watch`, which rebuilds `dist/` incrementally; a full build kills it. Tests import `../../../dist/zn.min.js`, so after editing source, wait for the watch rebuild before running tests.
- **Run tests with `npx web-test-runner --group <name>`.** `npm run test:component` is watch-mode only and hangs non-interactive shells. Group name = test filename stem (`theme-editor`, `preview-frame`). Piped output can appear empty in non-TTY shells — redirect to a file and read it.
- **Lint only touched files:** `npx eslint <paths>`. Repo-wide `npm run lint` has ~485 pre-existing problems and `npm test` ~12 pre-existing failures (zn-navbar, zn-page, zn-select, zn-sp, flow modules) — those are not yours.
- **Component file layout** (per CLAUDE.md): `src/components/<name>/<name>.component.ts`, `<name>.scss`, `<name>.test.ts`, `index.ts`.
- **`useDefineForClassFields: false`** and `experimentalDecorators: true` — standard Lit decorators only.
- **Comments minimal.** Explain only non-obvious decisions. Match surrounding style.
- **`zn-button` overrides `click()`** and dispatches nothing. In tests, dispatch `new MouseEvent('click', {bubbles: true, composed: true, cancelable: true})`.
- Device widths are fixed at **desktop = `100%`, tablet = `768px`, mobile = `390px`**.
- Debounce defaults: **push `150`ms, save `1000`ms**.
- Controls width CSS property: **`--zn-theme-editor-controls-width`, default `280px`**.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/preview-frame/preview-frame.component.ts` | *Modify* — add `device`, `setTheme()`, stage wrapper, empty-`dataUri` guard |
| `src/components/preview-frame/preview-frame.scss` | *Modify* — `.preview__stage` rules |
| `src/components/preview-frame/preview-frame.test.ts` | *Modify* — append three tests |
| `src/events/zn-theme-change.ts` | *Create* — `ZnThemeChangeEvent` type + global map entry |
| `src/events/events.ts` | *Modify* — re-export the new type |
| `src/components/theme-editor/theme-editor.component.ts` | *Create* — the component |
| `src/components/theme-editor/theme-editor.scss` | *Create* — two-column layout, toolbar, error strip |
| `src/components/theme-editor/theme-editor.test.ts` | *Create* — six tests |
| `src/components/theme-editor/index.ts` | *Create* — export + `define()` |
| `src/zinc.ts` | *Modify* — export `ThemeEditor` |
| `docs/pages/components/theme-editor.md` | *Create* — docs page |
| `docs/pages/components/preview-frame-demo.njk` | *Modify* — handle `hp-preview:theme` |

Tasks 1–2 harden the frame and are independently useful. Task 3 lands a working editor (layout + push). Task 4 adds the toolbar. Task 5 adds persistence. Task 6 is docs.

---

### Task 1: `zn-preview-frame` — `device` width

**Files:**
- Modify: `src/components/preview-frame/preview-frame.component.ts` (add property; wrap iframe in `.preview__stage` in `render()`)
- Modify: `src/components/preview-frame/preview-frame.scss`
- Test: `src/components/preview-frame/preview-frame.test.ts` (append)

**Interfaces:**
- Consumes: nothing.
- Produces: `device: 'desktop' | 'tablet' | 'mobile'` reflected property on `ZnPreviewFrame`, default `'desktop'`. Shadow DOM gains a `.preview__stage` div (also `part="stage"`) between `.preview` and the `iframe`.

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe('<zn-preview-frame>')` block in `src/components/preview-frame/preview-frame.test.ts`:

```ts
  it('defaults to a full-width desktop stage', async () => {
    const el = await fixture(FIXTURE);
    const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
    expect(stage.style.width).to.equal('100%');
  });

  it('constrains the stage to the tablet width', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        device="tablet"></zn-preview-frame>`);

    const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
    expect(stage.style.width).to.equal('768px');
    // the iframe still sizes off the stage, so zoom maths is unaffected
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.style.width).to.equal('100%');
  });

  it('constrains the stage to the mobile width', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        device="mobile"></zn-preview-frame>`);

    const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
    expect(stage.style.width).to.equal('390px');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx web-test-runner --group preview-frame > /tmp/pf.log 2>&1; cat /tmp/pf.log`

Expected: the three new tests fail — `.preview__stage` does not exist, so `querySelector` returns `null` and the non-null assertion throws `Cannot read properties of null`. The pre-existing preview-frame tests must all still pass.

- [ ] **Step 3: Add the property and the stage wrapper**

In `src/components/preview-frame/preview-frame.component.ts`, add a module-level constant above the class declaration (after the imports):

```ts
const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
} as const;

export type PreviewFrameDevice = keyof typeof DEVICE_WIDTHS;
```

Add the property next to the existing `zoom` / `minHeight` properties:

```ts
  /**
   * Constrains and centres the preview to a device width: `desktop` (100%),
   * `tablet` (768px) or `mobile` (390px). The iframe element itself is
   * narrowed, so the embedded page's own media queries fire.
   */
  @property({reflect: true}) device: PreviewFrameDevice = 'desktop';
```

In `render()`, wrap the iframe. Replace the existing returned template with:

```ts
    return html`
      <div part="base" class="preview" style="${styleMap(containerStyles)}">
        <div part="stage" class="preview__stage"
             style="${styleMap({width: DEVICE_WIDTHS[this.device] ?? DEVICE_WIDTHS.desktop})}">
          <iframe part="iframe"
                  src="${this.src}"
                  title="Payment form preview"
                  allow="local-network-access"
                  style="${styleMap(iframeStyles)}"></iframe>
        </div>
        ${this.error ? html`
          <div part="error" class="preview__error">${this.error}</div>` : ''}
      </div>`;
```

Leave `iframeStyles` and `containerStyles` exactly as they are — the iframe's percentage width now resolves against the stage instead of `.preview`, which is what keeps the zoom behaviour and its existing assertions intact.

- [ ] **Step 4: Add the stage styles**

In `src/components/preview-frame/preview-frame.scss`, add after the `.preview` rule:

```scss
.preview__stage {
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
}
```

`max-width: 100%` stops a tablet width from overflowing a narrower panel; `margin: 0 auto` centres the constrained widths and is a no-op at 100%.

- [ ] **Step 5: Run the tests to verify they pass**

Wait for the watch rebuild of `dist/zn.min.js` to finish, then:

Run: `npx web-test-runner --group preview-frame > /tmp/pf.log 2>&1; cat /tmp/pf.log`

Expected: all preview-frame tests pass, including the two pre-existing zoom tests (`zooms the content out…` asserting `250%` / `1500px` / container `600px`, and `renders at natural size by default` asserting `100%` / `480px`). If either zoom test broke, the stage is sized or nested wrongly — fix before moving on.

- [ ] **Step 6: Verify lint and types**

Run: `npx eslint src/components/preview-frame/preview-frame.component.ts src/components/preview-frame/preview-frame.test.ts`
Run: `npx tsc --noEmit -p tsconfig.json`

Expected: no errors in the touched files.

---

### Task 2: `zn-preview-frame` — `setTheme()` and the empty-`dataUri` guard

**Files:**
- Modify: `src/components/preview-frame/preview-frame.component.ts`
- Test: `src/components/preview-frame/preview-frame.test.ts` (append)

**Interfaces:**
- Consumes: Task 1's `device`/stage (no direct dependency, same file).
- Produces: `setTheme(theme: Record<string, unknown>): void` on `ZnPreviewFrame`. Posts `{type: 'hp-preview:theme', ...theme}` to the frame at `frameOrigin`, stores the payload, and re-posts it after every `hp-preview:ready` handshake. Also: `_sendConfig()` becomes a no-op when `dataUri` is empty.

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe('<zn-preview-frame>')` block:

```ts
  it('setTheme() posts an hp-preview:theme message', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: {msg: Record<string, unknown>; origin: string}[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>, origin: string) => void}).postMessage =
      (msg: Record<string, unknown>, origin: string) => posted.push({msg, origin});

    (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void})
      .setTheme({mode: 'dark', values: {background: '#101014'}});

    await waitUntil(() => posted.length === 1);
    expect(posted[0].origin).to.equal('https://site.example');
    expect(posted[0].msg['type']).to.equal('hp-preview:theme');
    expect(posted[0].msg['mode']).to.equal('dark');
    expect(posted[0].msg['values']).to.deep.equal({background: '#101014'});
  });

  it('replays the stored theme after a ready handshake', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage =
      (msg: Record<string, unknown>) => posted.push(msg);

    (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void})
      .setTheme({mode: 'light', values: {background: '#ffffff'}});
    await waitUntil(() => posted.length === 1);

    // a frame reload re-announces readiness; the theme must survive it
    ready(el);

    await waitUntil(() => posted.length === 3);
    expect(posted[1]['type']).to.equal('hp-preview:config');
    expect(posted[2]['type']).to.equal('hp-preview:theme');
    expect(posted[2]['values']).to.deep.equal({background: '#ffffff'});
  });

  it('skips the config fetch when data-uri is empty', async () => {
    const el = await fixture(html`
      <zn-preview-frame src="about:blank" frame-origin="https://site.example"></zn-preview-frame>`);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage =
      (msg: Record<string, unknown>) => posted.push(msg);

    (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void}).setTheme({mode: 'light', values: {}});
    ready(el);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(fetchCalls.length).to.equal(0);
    expect(el.shadowRoot!.querySelector('[part="error"]')).to.not.exist;
    // theme still replays even with no config to send
    expect(posted.filter(m => m['type'] === 'hp-preview:theme').length).to.equal(2);
  });
```

Note the ordering assertion in the second test: config is posted before theme, because the embed generally needs its config applied before a theme lands on top of it.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx web-test-runner --group preview-frame > /tmp/pf.log 2>&1; cat /tmp/pf.log`

Expected: all three fail — `setTheme` is not a function. The empty-`data-uri` test additionally shows the bug being fixed: a `fetch('')` call and an error overlay.

- [ ] **Step 3: Add the theme state and `setTheme()`**

In `src/components/preview-frame/preview-frame.component.ts`, add a field next to `_generation`:

```ts
  private _theme: Record<string, unknown> | undefined;
```

Add the public method next to `refresh()`:

```ts
  /**
   * Pushes a theme payload into the preview. The payload is retained and
   * re-posted after every ready handshake, so a frame reload doesn't drop an
   * in-progress theme.
   */
  setTheme(theme: Record<string, unknown>) {
    this._theme = theme;
    this._postTheme();
  }

  private _postTheme() {
    if (!this._theme) return;
    this.frame?.contentWindow?.postMessage(
      {type: 'hp-preview:theme', ...this._theme},
      this.frameOrigin
    );
  }
```

- [ ] **Step 4: Replay the theme after the handshake**

In `_onMessage`, change the `hp-preview:ready` branch from:

```ts
      case 'hp-preview:ready':
        void this._sendConfig();
        break;
```

to:

```ts
      case 'hp-preview:ready':
        // config first: the embed applies the theme on top of a rendered page
        void this._sendConfig().then(() => this._postTheme());
        break;
```

`_sendConfig()` already returns a promise and swallows its own errors into the overlay, so the theme replays either way.

- [ ] **Step 5: Guard the empty `data-uri`**

At the top of `_sendConfig()`, before `const generation = ++this._generation;`, insert:

```ts
    // A theme-editor-only setup has no config endpoint; fetch('') would return
    // the host page's HTML and fail JSON parsing into the error overlay.
    if (!this.dataUri) return;
```

- [ ] **Step 6: Run the tests to verify they pass**

Wait for the watch rebuild, then:

Run: `npx web-test-runner --group preview-frame > /tmp/pf.log 2>&1; cat /tmp/pf.log`

Expected: all preview-frame tests pass, new and pre-existing. In particular `refresh() re-fetches the payload…` must still pass — it sets `data-uri="/payload"`, so the guard does not affect it.

- [ ] **Step 7: Verify lint and types**

Run: `npx eslint src/components/preview-frame/preview-frame.component.ts src/components/preview-frame/preview-frame.test.ts`
Run: `npx tsc --noEmit -p tsconfig.json`

Expected: clean for touched files.

---

### Task 3: `zn-theme-editor` — component, layout, and value push

**Files:**
- Create: `src/events/zn-theme-change.ts`
- Modify: `src/events/events.ts`
- Create: `src/components/theme-editor/theme-editor.component.ts`
- Create: `src/components/theme-editor/theme-editor.scss`
- Create: `src/components/theme-editor/index.ts`
- Modify: `src/zinc.ts`
- Test: `src/components/theme-editor/theme-editor.test.ts`

**Interfaces:**
- Consumes: `ZnPreviewFrame.setTheme(theme)` from Task 2.
- Produces:
  - `ZnThemeEditor` with properties `src`, `frameOrigin` (`frame-origin`), `dataUri` (`data-uri`), `mode` (`'light' | 'dark'`, reflected, default `'light'`), `device` (`'desktop' | 'tablet' | 'mobile'`, reflected, default `'desktop'`), `minHeight` (`min-height`, number, `480`), `debounce` (number, `150`).
  - Getter `values: Record<string, unknown>`.
  - Query `frame: ZnPreviewFrame`.
  - Protected method `_push(): void` (harvest → `frame.setTheme` → emit).
  - Event `zn-theme-change` with detail `{values: Record<string, unknown>; mode: 'light' | 'dark'; device: 'desktop' | 'tablet' | 'mobile'}`.
  - `action` and `saveDebounce` are added in Task 5; do not add them here.

- [ ] **Step 1: Write the failing tests**

Create `src/components/theme-editor/theme-editor.test.ts`:

```ts
import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';

type ThemeCall = Record<string, unknown>;

interface Framelike extends HTMLElement {
  setTheme: (theme: ThemeCall) => void;
}

/**
 * Records what the editor pushes by replacing the internal frame's setTheme.
 * Returns the recorded calls; the first is the initial push from firstUpdated.
 */
async function spyOnFrame(el: Element): Promise<ThemeCall[]> {
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
      expect((el as HTMLElement & {values: Record<string, unknown>}).values)
        .to.deep.equal({radius: '8'});
    } finally {
      proto.setTheme = original;
    }
  });

  it('harvests and pushes updated values when a control changes', async () => {
    const el = await fixture(FIXTURE);
    const calls = await spyOnFrame(el);

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    input.value = '16';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

    await waitUntil(() => calls.length === 1);
    expect(calls[0]['mode']).to.equal('light');
    expect(calls[0]['values']).to.deep.equal({radius: '16'});
  });

  it('emits zn-theme-change with values, mode and device', async () => {
    const el = await fixture(FIXTURE);
    await spyOnFrame(el);

    let detail: {values: Record<string, unknown>; mode: string; device: string} | null = null;
    el.addEventListener('zn-theme-change', (e: Event) => {
      detail = (e as CustomEvent<{values: Record<string, unknown>; mode: string; device: string}>).detail;
    });

    const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
    input.value = '24';
    input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

    await waitUntil(() => detail !== null);
    expect(detail!.values).to.deep.equal({radius: '24'});
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

    expect((el as HTMLElement & {values: Record<string, unknown>}).values)
      .to.deep.equal({radius: '8', rounded: true});
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
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`

Expected: every test fails. `zn-theme-editor` is not a registered element, so `fixture` yields an unupgraded `HTMLElement` with a `null` `shadowRoot`.

If the runner reports "no tests matched group theme-editor", the group is derived from the test filename — confirm the file is at `src/components/theme-editor/theme-editor.test.ts`.

- [ ] **Step 3: Add the event type**

Create `src/events/zn-theme-change.ts`:

```ts
export type ZnThemeChangeEvent = CustomEvent<{
  values: Record<string, unknown>;
  mode: 'light' | 'dark';
  device: 'desktop' | 'tablet' | 'mobile';
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-theme-change': ZnThemeChangeEvent;
  }
}
```

Add to `src/events/events.ts`, alongside the other re-exports:

```ts
export type {ZnThemeChangeEvent} from './zn-theme-change';
```

A dedicated event is required: `src/events/zn-change.ts` types `zn-change`'s detail as `Record<PropertyKey, never>` for the whole library, so it cannot carry a payload. This mirrors `zn-flow-change`.

- [ ] **Step 4: Write the component**

Create `src/components/theme-editor/theme-editor.component.ts`:

```ts
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, query, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnPreviewFrame from '../preview-frame';

import styles from './theme-editor.scss';

export type ThemeEditorMode = 'light' | 'dark';
export type ThemeEditorDevice = 'desktop' | 'tablet' | 'mobile';

// Controls whose state lives on `checked` rather than `value`.
const BOOLEAN_CONTROLS = new Set(['zn-checkbox', 'zn-toggle']);

interface HarvestableControl extends HTMLElement {
  name?: string;
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
  type?: string;
}

/**
 * @summary A theme editor: slotted form controls drive a live preview frame,
 * with a toolbar for the preview's light/dark mode and device width.
 * @documentation https://zinc.style/components/theme-editor
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-preview-frame
 * @dependency zn-icon
 *
 * @event zn-theme-change - Emitted when the values, mode or device change.
 * @event zn-error - Emitted when a save fails.
 *
 * @slot - The theme controls, rendered in the left-hand column.
 * @slot footer - Actions pinned beneath the controls.
 *
 * @csspart base - The component's base wrapper.
 * @csspart controls - The left-hand controls column.
 * @csspart footer - The footer wrapper beneath the controls.
 * @csspart toolbar - The device and mode switcher above the preview.
 * @csspart preview - The preview column.
 * @csspart error - The inline error strip.
 *
 * @cssproperty --zn-theme-editor-controls-width - Width of the controls column.
 */
export default class ZnThemeEditor extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-preview-frame': ZnPreviewFrame,
  };

  /** URL of the preview shell page; forwarded to the frame. */
  @property() src = '';

  /** Expected origin of the iframe; forwarded to the frame. */
  @property({attribute: 'frame-origin'}) frameOrigin = '';

  /** Optional endpoint returning the base hp-preview:config payload. */
  @property({attribute: 'data-uri'}) dataUri = '';

  /** Which mode the preview renders in. Travels in the theme payload. */
  @property({reflect: true}) mode: ThemeEditorMode = 'light';

  /** Preview viewport width. Resizes the frame only; not part of the payload. */
  @property({reflect: true}) device: ThemeEditorDevice = 'desktop';

  /** Visible height of the preview panel, in pixels. */
  @property({type: Number, attribute: 'min-height'}) minHeight = 480;

  /** Debounce in ms between a control change and the push to the preview. */
  @property({type: Number}) debounce = 150;

  @query('zn-preview-frame') frame: ZnPreviewFrame;

  @query('slot:not([name])') private controlsSlot: HTMLSlotElement;

  @state() protected error = '';

  private readonly hasSlotController = new HasSlotController(this, 'footer');

  private _pushTimer?: number;

  /** The current values harvested from the slotted controls. */
  get values(): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    const roots = this.controlsSlot?.assignedElements({flatten: true}) ?? [];

    for (const root of roots) {
      const candidates = [root, ...Array.from(root.querySelectorAll('[name]'))];
      for (const candidate of candidates) {
        const control = candidate as HarvestableControl;
        if (!control.getAttribute?.('name') || control.disabled) continue;
        const tag = control.tagName.toLowerCase();
        values[control.getAttribute('name')!] =
          BOOLEAN_CONTROLS.has(tag) || control.type === 'checkbox'
            ? !!control.checked
            : control.value;
      }
    }

    return values;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._pushTimer) window.clearTimeout(this._pushTimer);
  }

  protected firstUpdated() {
    // Push the authored defaults immediately so the preview never renders
    // un-themed and then snaps to the real values. The frame retains the
    // payload and replays it after its ready handshake.
    this._push();
  }

  /** Harvests the controls, pushes them into the preview, and announces it. */
  protected _push() {
    const values = this.values;
    this.frame?.setTheme({mode: this.mode, values});
    this._announce(values);
  }

  protected _announce(values: Record<string, unknown> = this.values) {
    this.emit('zn-theme-change', {detail: {values, mode: this.mode, device: this.device}});
  }

  protected _fail(message: string) {
    this.error = message;
    this.emit('zn-error', {detail: {message}});
  }

  private readonly _onControlChange = () => {
    if (this._pushTimer) window.clearTimeout(this._pushTimer);
    this._pushTimer = window.setTimeout(() => {
      this._pushTimer = undefined;
      this._push();
    }, this.debounce);
  };

  private readonly _onSlotChange = () => {
    this._push();
  };

  private readonly _onFrameError = (e: CustomEvent<{message?: string}>) => {
    // zn-error already bubbles and composes out to the host; just display it.
    this.error = e.detail.message ?? 'Preview failed to render';
  };

  render() {
    return html`
      <div part="base" class="editor">
        <div part="controls" class="editor__controls">
          <div class="editor__fields">
            <slot @slotchange="${this._onSlotChange}"
                  @zn-change="${this._onControlChange}"
                  @zn-input="${this._onControlChange}"
                  @change="${this._onControlChange}"
                  @input="${this._onControlChange}"></slot>
          </div>
          ${this.hasSlotController.test('footer') ? html`
            <div part="footer" class="editor__footer">
              <slot name="footer"></slot>
            </div>` : nothing}
        </div>

        <div part="preview" class="editor__preview">
          ${this.error ? html`
            <div part="error" class="editor__error">${this.error}</div>` : nothing}
          <zn-preview-frame
            src="${this.src}"
            frame-origin="${this.frameOrigin}"
            data-uri="${this.dataUri}"
            device="${this.device}"
            min-height="${this.minHeight}"
            @zn-error="${this._onFrameError}"></zn-preview-frame>
        </div>
      </div>`;
  }
}
```

Two details that matter:

- The change listeners sit on the **`<slot>` element**, not on the host. Events from assigned light-DOM nodes propagate through the slot in the flattened tree, so this catches exactly the slotted controls and nothing from the editor's own shadow DOM.
- `values` reads the `name` **attribute** via `getAttribute`, not the `.name` property — Zinc controls do not reflect `name`, and the slotted-markup design means authors always write it as an attribute.

- [ ] **Step 5: Write the styles**

Create `src/components/theme-editor/theme-editor.scss`:

```scss
@use "../../wc";

:host {
  display: block;
  --zn-theme-editor-controls-width: 280px;
}

.editor {
  display: flex;
  align-items: flex-start;
  gap: var(--zn-spacing-medium);
}

.editor__controls {
  display: flex;
  flex-direction: column;
  gap: var(--zn-spacing-medium);
  flex: 0 0 var(--zn-theme-editor-controls-width);
  max-width: 100%;
}

.editor__fields {
  display: flex;
  flex-direction: column;
  gap: var(--zn-spacing-small);
}

.editor__footer {
  display: flex;
  gap: var(--zn-spacing-small);
  padding-top: var(--zn-spacing-small);
  border-top: 1px solid rgb(var(--zn-border-color));
}

.editor__preview {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--zn-spacing-small);
}

.editor__error {
  padding: var(--zn-spacing-small);
  border-radius: 4px;
  background: rgba(var(--zn-error), 0.1);
  border: 1px solid rgb(var(--zn-error));
  color: rgb(var(--zn-error));
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .editor {
    flex-direction: column;
  }

  .editor__controls {
    flex-basis: auto;
    width: 100%;
  }

  .editor__preview {
    width: 100%;
  }
}
```

- [ ] **Step 6: Register and export the component**

Create `src/components/theme-editor/index.ts`:

```ts
import ZnThemeEditor from './theme-editor.component';

export * from './theme-editor.component';
export default ZnThemeEditor;

ZnThemeEditor.define('zn-theme-editor');

declare global {
  interface HTMLElementTagNameMap {
    'zn-theme-editor': ZnThemeEditor;
  }
}
```

In `src/zinc.ts`, add an export next to the existing `PreviewFrame` line (currently line 113):

```ts
export { default as ThemeEditor } from './components/theme-editor';
```

- [ ] **Step 7: Run the tests to verify they pass**

Wait for the watch rebuild of `dist/zn.min.js`, then:

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`

Expected: all eight tests in the file pass.

If `renders and is accessible` fails on a colour-contrast rule inside the error strip, that strip is not rendered in the accessible-check fixture (no error is set), so the violation is elsewhere — read the axe output rather than guessing.

- [ ] **Step 8: Verify lint and types**

Run: `npx eslint src/components/theme-editor/ src/events/zn-theme-change.ts src/events/events.ts src/zinc.ts`
Run: `npx tsc --noEmit -p tsconfig.json`

Expected: clean for touched files.

---

### Task 4: `zn-theme-editor` — device and mode toolbar

**Files:**
- Modify: `src/components/theme-editor/theme-editor.component.ts`
- Modify: `src/components/theme-editor/theme-editor.scss`
- Test: `src/components/theme-editor/theme-editor.test.ts` (append)

**Interfaces:**
- Consumes: `_push()`, `_announce()`, `mode`, `device` from Task 3.
- Produces: a `part="toolbar"` element in the shadow DOM containing four native buttons: three device buttons matched by `[data-device="desktop|tablet|mobile"]` and one mode toggle matched by `[data-mode-toggle]`. Each carries `aria-label`; device buttons carry `aria-pressed`.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('<zn-theme-editor>')`:

```ts
  it('device buttons set the frame device without re-pushing the theme', async () => {
    const el = await fixture(FIXTURE);
    const calls = await spyOnFrame(el);

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
    const calls = await spyOnFrame(el);

    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode-toggle]')!.click();

    await waitUntil(() => calls.length === 1);
    expect((el as HTMLElement & {mode: string}).mode).to.equal('dark');
    expect(el.getAttribute('mode')).to.equal('dark');
    expect(calls[0]['mode']).to.equal('dark');
    expect(calls[0]['values']).to.deep.equal({radius: '8'});
  });
```

Native `<button>` elements are used precisely so `.click()` works here — `zn-button` overrides `click()` and dispatches nothing.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`

Expected: the four new tests fail — `[data-device="mobile"]` and `[data-mode-toggle]` do not exist, so the non-null assertions throw. The eight tests from Task 3 must still pass.

- [ ] **Step 3: Add the device metadata and handlers**

In `theme-editor.component.ts`, add below the `BOOLEAN_CONTROLS` constant:

```ts
const DEVICES: {id: ThemeEditorDevice; icon: string; label: string}[] = [
  {id: 'desktop', icon: 'monitor', label: 'Desktop'},
  {id: 'tablet', icon: 'tablet', label: 'Tablet'},
  {id: 'mobile', icon: 'smartphone', label: 'Mobile'},
];
```

Add the handlers next to `_onSlotChange`:

```ts
  private readonly _setDevice = (device: ThemeEditorDevice) => {
    if (this.device === device) return;
    this.device = device;
    // device only resizes the frame — the embed reads its width from the
    // iframe box, so there's nothing new to push
    this._announce();
  };

  private readonly _toggleMode = () => {
    this.mode = this.mode === 'dark' ? 'light' : 'dark';
    this._push();
  };
```

- [ ] **Step 4: Render the toolbar**

In `render()`, insert the toolbar inside `.editor__preview`, between the error strip and `<zn-preview-frame>`:

```ts
          <div part="toolbar" class="editor__toolbar">
            <div class="editor__devices" role="group" aria-label="Preview width">
              ${DEVICES.map(d => html`
                <button type="button"
                        class="editor__device"
                        data-device="${d.id}"
                        aria-label="${d.label}"
                        aria-pressed="${this.device === d.id ? 'true' : 'false'}"
                        @click="${() => this._setDevice(d.id)}">
                  <zn-icon src="${d.icon}" library="lucide" size="16"></zn-icon>
                </button>`)}
            </div>
            <button type="button"
                    class="editor__mode"
                    data-mode-toggle
                    aria-label="${this.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}"
                    @click="${this._toggleMode}">
              <zn-icon src="${this.mode === 'dark' ? 'sun' : 'moon'}" library="lucide" size="16"></zn-icon>
            </button>
          </div>
```

Lucide SVGs render `aria-hidden="true"`, so each button's accessible name comes from its `aria-label`. That is why these are native buttons: `zn-button` does not forward an accessible name to its internal `<button>`, and icon-only Zinc buttons therefore fail the axe check.

- [ ] **Step 5: Style the toolbar**

Add to `theme-editor.scss`, after the `.editor__preview` rule:

```scss
.editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--zn-spacing-small);
}

.editor__devices {
  display: flex;
  border: 1px solid rgb(var(--zn-border-color));
  border-radius: 4px;
  overflow: hidden;
}

.editor__device,
.editor__mode {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgb(var(--zn-text));
  cursor: pointer;
}

.editor__device + .editor__device {
  border-left: 1px solid rgb(var(--zn-border-color));
}

.editor__device:hover,
.editor__mode:hover {
  background: rgba(var(--zn-border-color), 0.5);
}

.editor__device[aria-pressed="true"] {
  background: rgb(var(--zn-primary));
  color: rgb(var(--zn-primary-contrast, 255, 255, 255));
}

.editor__mode {
  border: 1px solid rgb(var(--zn-border-color));
  border-radius: 4px;
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Wait for the watch rebuild, then:

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`

Expected: all twelve tests pass, including `renders and is accessible` — if axe reports a contrast failure on `[aria-pressed="true"]`, adjust the pressed-state colours in the SCSS rather than removing the state.

- [ ] **Step 7: Verify lint and types**

Run: `npx eslint src/components/theme-editor/`
Run: `npx tsc --noEmit -p tsconfig.json`

Expected: clean for touched files.

---

### Task 5: `zn-theme-editor` — optional auto-save

**Files:**
- Modify: `src/components/theme-editor/theme-editor.component.ts`
- Test: `src/components/theme-editor/theme-editor.test.ts` (append)

**Interfaces:**
- Consumes: `values`, `_fail()`, `_onControlChange` from Task 3.
- Produces: `action` (string, default `''`) and `saveDebounce` (`save-debounce`, number, default `1000`) properties. When `action` is set, control changes POST a `FormData` of the values.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('<zn-theme-editor>')`:

```ts
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
      await spyOnFrame(el);

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
      await spyOnFrame(el);

      const input = el.querySelector('zn-input')! as HTMLElement & {value: string};
      input.value = '16';
      input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));

      await waitUntil(() => fetchCalls.length === 1);
      expect(fetchCalls[0].uri).to.equal('/theme/save');
      expect(fetchCalls[0].init?.method).to.equal('POST');
      const body = fetchCalls[0].init!.body as FormData;
      expect(body.get('radius')).to.equal('16');
      expect(body.get('rounded')).to.equal('1');
      // mode and device are view state, never persisted
      expect(body.get('mode')).to.equal(null);
      expect(body.get('device')).to.equal(null);
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
      await spyOnFrame(el);

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
      await spyOnFrame(el);

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
      await spyOnFrame(el);

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
      expect((fetchCalls[1].init!.body as FormData).get('radius')).to.equal('32');
    });
  });
```

That last test is the one that matters: without the single-slot queue, two overlapping POSTs can complete out of order and leave the server holding a stale value.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`

Expected: `does not POST when action is unset` and `does not POST when only the mode or device changes` pass trivially (nothing POSTs yet); the other three fail because no request is ever made — `waitUntil` times out.

- [ ] **Step 3: Add the properties**

In `theme-editor.component.ts`, add after the `debounce` property:

```ts
  /** Optional endpoint the values are POSTed to. Empty = no persistence. */
  @property() action = '';

  /** Debounce in ms between a control change and the save POST. */
  @property({type: Number, attribute: 'save-debounce'}) saveDebounce = 1000;
```

And the save state, next to `_pushTimer`:

```ts
  private _saveTimer?: number;
  private _saving = false;
  private _saveQueued = false;
```

- [ ] **Step 4: Implement the save**

Add these methods after `_push()`:

```ts
  private _queueSave() {
    if (!this.action) return;
    if (this._saveTimer) window.clearTimeout(this._saveTimer);
    this._saveTimer = window.setTimeout(() => {
      this._saveTimer = undefined;
      void this._save();
    }, this.saveDebounce);
  }

  // Saves serialize through a single slot: changes arriving mid-flight collapse
  // into exactly one follow-up save, so overlapping POSTs can't land out of
  // order and persist a stale value.
  private async _save() {
    if (this._saving) {
      this._saveQueued = true;
      return;
    }
    this._saving = true;

    try {
      const body = new FormData();
      for (const [name, value] of Object.entries(this.values)) {
        body.append(name, typeof value === 'boolean' ? (value ? '1' : '') : String(value ?? ''));
      }
      const response = await fetch(this.action, {
        method: 'POST',
        credentials: 'same-origin',
        body,
      });
      if (!response.ok) {
        throw new Error(await response.text() || response.statusText);
      }
      this.error = '';
    } catch (err) {
      this._fail(err instanceof Error ? err.message : String(err));
    } finally {
      this._saving = false;
      if (this._saveQueued) {
        this._saveQueued = false;
        void this._save();
      }
    }
  }
```

- [ ] **Step 5: Trigger the save from control changes only**

In `_onControlChange`, add the save alongside the push:

```ts
  private readonly _onControlChange = () => {
    if (this._pushTimer) window.clearTimeout(this._pushTimer);
    this._pushTimer = window.setTimeout(() => {
      this._pushTimer = undefined;
      this._push();
      this._queueSave();
    }, this.debounce);
  };
```

Do **not** call `_queueSave()` from `_toggleMode`, `_setDevice`, `_onSlotChange`, or `firstUpdated`: `mode` and `device` are view state and are never persisted, and the initial push carries only the values already on the server.

Also clear the save timer on disconnect — update `disconnectedCallback`:

```ts
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._pushTimer) window.clearTimeout(this._pushTimer);
    if (this._saveTimer) window.clearTimeout(this._saveTimer);
  }
```

- [ ] **Step 6: Run the tests to verify they pass**

Wait for the watch rebuild, then:

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`

Expected: all seventeen tests pass.

- [ ] **Step 7: Verify lint and types**

Run: `npx eslint src/components/theme-editor/`
Run: `npx tsc --noEmit -p tsconfig.json`

Expected: clean for touched files.

---

### Task 6: Documentation

**Files:**
- Create: `docs/pages/components/theme-editor.md`
- Modify: `docs/pages/components/preview-frame-demo.njk`
- Modify: `docs/pages/components/preview-frame.md`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: a live docs example. The demo embed additionally handles `hp-preview:theme`.

- [ ] **Step 1: Teach the demo embed the theme message**

In `docs/pages/components/preview-frame-demo.njk`, inside the existing `<script>` block, add a handler before the final `post({type: 'hp-preview:ready'});` line:

```js
  // The theme half of the protocol: applied independently of the config, so
  // the editor can push values before any config exists.
  window.addEventListener('message', e => {
    const data = e.data;
    if (data?.type !== 'hp-preview:theme') return;

    const values = data.values || {};
    document.body.classList.toggle('is-dark', data.mode === 'dark');
    const card = document.getElementById('card');
    card.hidden = false;
    if (values.background) card.style.background = values.background;
    if (values.accent) card.style.setProperty('--accent', values.accent);
    if (values.radius !== undefined && values.radius !== '') {
      card.style.borderRadius = values.radius + 'px';
    }
    document.getElementById('waiting').hidden = true;
    post({type: 'hp-preview:rendered'});
  });
```

And add to the demo's `<style>` block:

```css
  body.is-dark {
    background: #101014;
    color: #f4f4f5;
  }

  body.is-dark .card {
    border-color: #33333a;
  }
```

The existing `hp-preview:config` handler is untouched, so both preview-frame examples keep working.

- [ ] **Step 2: Write the docs page**

Create `docs/pages/components/theme-editor.md` with exactly this content (the
outer fence below is four backticks so the page's own three-backtick examples
nest correctly — write the file starting at `---`):

````markdown
---
meta:
  title: Theme Editor
  description: Theme controls on the left, a live preview frame on the right, with light/dark and device switching.
layout: component
---

Put form controls in the default slot and give each a `name`. Changing one
harvests every named control and pushes the values into the embedded
[preview frame](/components/preview-frame/) as an `hp-preview:theme` message —
no save, no fetch, no page reload.

The toolbar above the preview switches the mode the preview renders in and the
width it renders at: desktop (full width), tablet (768px) or mobile (390px).
Because the iframe itself is resized, the embedded page's own media queries
fire.

```html:preview
<zn-theme-editor
  id="theme-editor-demo"
  src="/components/preview-frame-demo/"
  min-height="420">
  <zn-color-select name="accent" label="Accent"></zn-color-select>
  <zn-input name="radius" label="Corner radius" type="number" value="12"></zn-input>
</zn-theme-editor>

<script>
  document.getElementById('theme-editor-demo').frameOrigin = location.origin;
</script>
```

:::tip
`frame-origin` must match the embed's origin exactly — messages from any other
origin are ignored. The example sets it at runtime because the docs site is
same-origin.
:::

## Reading and Persisting Values

Every change emits `zn-theme-change` with `{values, mode, device}`, so a host
can drive its own save button:

```js
editor.addEventListener('zn-theme-change', event => {
  console.log(event.detail.values);
});
```

Set `action` to persist automatically instead — the values are POSTed as
`FormData` on a longer debounce (`save-debounce`, default `1000`ms). `mode` and
`device` are view state and are never saved.

```html
<zn-theme-editor src="/embed?t=..." frame-origin="https://pay.example" action="/theme/save">
  <zn-color-select name="accent" label="Accent"></zn-color-select>
</zn-theme-editor>
```

Saves are serialized: if changes land while a POST is in flight, exactly one
further save runs afterwards with the latest values.

## Controls

Any Zinc form control works. Controls must carry `name` as an **attribute** —
`zn-checkbox` and `zn-toggle` contribute their `checked` state as a boolean,
everything else contributes `value`. Disabled and unnamed controls are skipped.

The `footer` slot holds actions beneath the controls:

```html
<zn-theme-editor src="/embed?t=..." frame-origin="https://pay.example">
  <zn-color-select name="accent" label="Accent"></zn-color-select>
  <zn-button slot="footer">Save</zn-button>
</zn-theme-editor>
```

Set the controls column width with `--zn-theme-editor-controls-width`
(default `280px`). Below 768px the columns stack.
````

Do not use literal `{{ }}` anywhere in this page — docs markdown is
nunjucks-processed and would need `{% raw %}…{% endraw %}`.

- [ ] **Step 3: Cross-link from the preview-frame page**

In `docs/pages/components/preview-frame.md`, add a paragraph after the existing
sentence describing `zoom` and `min-height`:

```markdown
`device` constrains and centres the preview to `desktop` (full width), `tablet`
(768px) or `mobile` (390px), resizing the iframe itself so the embedded page's
media queries fire. `setTheme(values)` posts an `hp-preview:theme` message and
replays it after each ready handshake, which is how
[`zn-theme-editor`](/components/theme-editor/) drives a live preview.
```

- [ ] **Step 4: Verify the docs render and the example works**

The running `npm run watch` rebuilds `_site/` and reloads BrowserSync. Open
`/components/theme-editor/` and confirm:

- the two-column layout renders with the toolbar above the preview
- changing the accent colour recolours the card immediately
- changing the corner radius changes the card's border radius
- the mode toggle darkens the embed
- the device buttons narrow the iframe and highlight the active button
- `/components/preview-frame/` still works — both its examples

If Eleventy fails the build, read its error before changing anything; an
unescaped `{{ }}` in markdown is the usual cause.

- [ ] **Step 5: Final verification across the whole change**

Run: `npx web-test-runner --group theme-editor > /tmp/te.log 2>&1; cat /tmp/te.log`
Run: `npx web-test-runner --group preview-frame > /tmp/pf.log 2>&1; cat /tmp/pf.log`
Run: `npx eslint src/components/theme-editor/ src/components/preview-frame/ src/events/zn-theme-change.ts src/events/events.ts src/zinc.ts`
Run: `npx tsc --noEmit -p tsconfig.json`

Expected: both groups fully pass; lint and types clean for touched files.

Report results honestly — if a test fails, say so with the output rather than
describing the work as complete.

---

## Self-Review Notes

Spec coverage checked section by section:

| Spec requirement | Task |
|---|---|
| `device` property, stage wrapper, zoom composition | 1 |
| `setTheme()` + ready replay | 2 |
| Empty-`dataUri` guard | 2 |
| Properties, slots, layout, controls width | 3 |
| Value harvesting incl. booleans/disabled/unnamed | 3 |
| Initial push of authored defaults | 3 |
| `zn-theme-change` event type | 3 |
| Theme message shape with `mode` | 3 |
| Toolbar: device segmented control + mode toggle, native buttons | 4 |
| Mode re-pushes, device only resizes | 4 |
| Optional `action` auto-save, FormData, no mode/device | 5 |
| Single-slot save queue | 5 |
| Error strip, `zn-error` on save failure, frame errors captured not re-emitted | 3 (capture) + 5 (save) |
| Tests as enumerated in the spec | 1, 2, 3, 4, 5 |
| Docs page + demo embed extension | 6 |

Names verified consistent across tasks: `setTheme`, `_push`, `_announce`,
`_fail`, `_queueSave`, `_save`, `_onControlChange`, `_setDevice`,
`_toggleMode`, `values`, `DEVICE_WIDTHS`, `DEVICES`, `BOOLEAN_CONTROLS`,
`.preview__stage`, `[data-device]`, `[data-mode-toggle]`,
`zn-theme-change`.
