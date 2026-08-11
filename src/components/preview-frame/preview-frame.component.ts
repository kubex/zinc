import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, query, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import ZincElement from '../../internal/zinc-element';

import styles from './preview-frame.scss';

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
} as const;

export type PreviewFrameDevice = keyof typeof DEVICE_WIDTHS;

/**
 * @summary Embeds a live preview iframe and drives the hp-preview postMessage
 * protocol: answers the frame's ready handshake with a config payload fetched
 * from data-uri, auto-saves watched forms on change, refreshes the preview
 * after each save (its own, or a shell-driven save of a `refresh-on` form),
 * accepts a theme payload via setTheme() that is retained and replayed
 * after every ready handshake, and grows the frame to a content height the
 * embed reports so the panel scrolls an overflowing page.
 *
 * @documentation https://zinc.style/components/preview-frame
 * @status experimental
 * @since 1.0
 *
 * @event zn-error - Emitted when the preview reports a render error or a save fails.
 *
 * @csspart base - The component's base wrapper.
 * @csspart stage - The device-width wrapper around the iframe.
 * @csspart iframe - The preview iframe.
 * @csspart error - The error overlay.
 *
 * @cssproperty --zn-preview-frame-dot-spacing - Spacing of the backdrop dot grid (`backdrop="dots"`). Defaults to 20px.
 * @cssproperty --zn-preview-frame-dot-opacity - Opacity of the backdrop dots (`backdrop="dots"`). Defaults to 0.08.
 */
export default class ZnPreviewFrame extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** URL of the preview shell page (tokened embed URL). */
  @property() src = '';

  /** Expected origin of the iframe; all postMessage traffic is checked against it. */
  @property({attribute: 'frame-origin'}) frameOrigin = '';

  /** Endpoint returning the hp-preview:config payload JSON. The console proxy rewrites this attribute to an app-prefixed path for proper fetch resolution. */
  @property({attribute: 'data-uri'}) dataUri = '';

  /**
   * Selector (resolved against the component's root node) for the forms to watch.
   * Defaults to only forms explicitly opted in via a `data-auto-save` attribute —
   * unmarked forms keep normal submit behavior and are never intercepted,
   * auto-saved, or used to trigger a preview refresh. Override to widen the scope.
   */
  @property() watch = 'form[data-auto-save]';

  /**
   * Selector for forms whose saves are left to the shell but should still
   * refresh the preview. These are never intercepted: the shell submits them
   * (so its own response handling — alerts, refreshes — runs as normal) and the
   * preview re-fetches its config once the shell reports the save complete.
   * Set empty to disable.
   */
  @property({attribute: 'refresh-on'}) refreshOn = 'form';

  /** Debounce in ms between a form change and its auto-save. */
  @property({type: Number}) debounce = 400;

  /**
   * Zooms the previewed page out (0–1]. The frame always fills the panel;
   * zoom shrinks the content browser-style, so 0.4 shows the page at 40%
   * size with correspondingly more of it visible. 1 = natural size.
   * Ignored when `fill` is set.
   */
  @property({type: Number}) zoom = 1;

  /**
   * The visible height (in CSS pixels) of the preview panel. Fixed rather
   * than measured, because a measured height would feed back into the
   * scaled iframe's layout box and grow unbounded. With `fill` set, this
   * becomes a `min-height` floor instead of the height.
   */
  @property({type: Number, attribute: 'min-height'}) minHeight = 480;

  /**
   * Fills the panel's own column height instead of using a fixed
   * `min-height` pixel height — for hosts (like zn-theme-editor) whose
   * layout already stretches the column to match a taller sibling.
   * `zoom` is ignored when set: its oversize maths depends on a known
   * pixel height, which `fill` deliberately doesn't have.
   */
  @property({type: Boolean}) fill = false;

  /**
   * Constrains and centres the preview to a device width: `desktop` (100%),
   * `tablet` (768px) or `mobile` (390px). The iframe element itself is
   * narrowed, so the embedded page's own media queries fire.
   */
  @property({reflect: true}) device: PreviewFrameDevice = 'desktop';

  /** Backdrop behind the stage: `dots` (default) is the canvas dot grid; `panel` is a plain `rgb(var(--zn-panel))` fill. */
  @property({reflect: true}) backdrop: 'dots' | 'panel' = 'dots';

  /**
   * Lets pointer input through to the embedded page. The preview is inert by
   * default: clicks never reach the frame, so the previewed page can't be
   * navigated or submitted from inside the preview. Cross-origin content can't
   * be reached from here to cancel its own handlers, so this blocks pointer
   * input entirely — hover goes with it. Scrolling doesn't: an overflowing
   * page is scrolled by the panel rather than by the frame (see _contentHeight).
   */
  @property({type: Boolean, reflect: true}) interactive = false;

  @query('iframe') frame: HTMLIFrameElement;

  @state() private error = '';

  /**
   * Height of the embedded page's content, when it's known: reported by the
   * embed (`height` on hp-preview:rendered, or an hp-preview:height message) or
   * measured directly for a same-origin embed. The frame is laid out at this
   * height rather than the panel's, so the page never scrolls inside the frame
   * — the panel scrolls instead, which is what makes an overflowing preview
   * reachable while pointer input to the frame is blocked. 0 = unknown, and the
   * frame falls back to filling the panel.
   */
  @state() private _contentHeight = 0;

  private _generation = 0;
  private _theme: Record<string, unknown> | undefined;
  private _contentObserver: ResizeObserver | undefined;

  private readonly _watchedForms = new Set<HTMLFormElement>();
  private readonly _refreshForms = new Set<HTMLFormElement>();
  private readonly _debounceTimers = new Map<HTMLFormElement, number>();

  // Forms are siblings in light DOM and get replaced when other content
  // re-renders; re-resolve them whenever the surrounding DOM changes.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _formObserver = new MutationController(this, {
    target: null,
    config: {subtree: true, childList: true},
    callback: () => this._attachForms(),
  });

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('message', this._onMessage);
    this._attachForms();
    const root = this.getRootNode();
    if (root instanceof Document) {
      this._formObserver.observe(root.body);
    } else if (root instanceof ShadowRoot) {
      // MutationController's type only accepts Element, but MutationObserver.observe()
      // accepts any Node at runtime, including a ShadowRoot.
      this._formObserver.observe(root as unknown as Element);
    }
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('src')) this._resetContentHeight();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('message', this._onMessage);
    this._contentObserver?.disconnect();
    this._contentObserver = undefined;
    this._watchedForms.forEach(form => this._detachForm(form));
    this._watchedForms.clear();
    this._refreshForms.forEach(form => form.removeEventListener('complete', this._onShellSave));
    this._refreshForms.clear();
  }

  private readonly _onMessage = (e: MessageEvent) => {
    // Fail closed: with frame-origin unset, every message is rejected.
    if (e.origin !== this.frameOrigin) return;
    if (!this.frame || e.source !== this.frame.contentWindow) return;

    const data = e.data as { type?: string; message?: string; height?: unknown } | undefined;
    switch (data?.type) {
      case 'hp-preview:ready':
        // config first: the embed applies the theme on top of a rendered page
        void this._sendConfig().then(() => this._postTheme());
        break;
      case 'hp-preview:rendered':
        this.error = '';
        this._applyContentHeight(data.height);
        break;
      case 'hp-preview:height':
        this._applyContentHeight(data.height);
        break;
      case 'hp-preview:error':
        this._fail(String(data.message ?? 'Preview failed to render'));
        break;
    }
  };

  private _applyContentHeight(height: unknown) {
    const value = Math.round(Number(height));
    if (!Number.isFinite(value) || value <= 0) return;
    this._contentHeight = value;
  }

  private _resetContentHeight() {
    this._contentHeight = 0;
    this._contentObserver?.disconnect();
    this._contentObserver = undefined;
  }

  // Same-origin embeds don't need to implement the height half of the protocol —
  // their document can be measured from here.
  private readonly _onFrameLoad = () => {
    this._contentObserver?.disconnect();
    this._contentObserver = undefined;

    let root: HTMLElement | null | undefined;
    try {
      root = this.frame?.contentDocument?.documentElement;
    } catch {
      return; // cross-origin: the embed has to report its own height
    }
    if (!root) return;

    const measure = () => {
      const measured = root.getBoundingClientRect().height;
      if (measured > (this.frame?.clientHeight ?? 0)) this._applyContentHeight(measured);
    };
    measure();
    this._contentObserver = new ResizeObserver(measure);
    this._contentObserver.observe(root);
  };

  /** Re-fetches the payload and pushes a fresh config to the preview. */
  refresh() {
    return this._sendConfig();
  }

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
    if (!this._theme || !this.frameOrigin) return;
    this.frame?.contentWindow?.postMessage(
      {type: 'hp-preview:theme', ...this._theme},
      this.frameOrigin
    );
  }

  private async _sendConfig() {
    // A theme-editor-only setup has no config endpoint; fetch('') would return
    // the host page's HTML and fail JSON parsing into the error overlay.
    if (!this.dataUri || !this.frameOrigin) return;

    const generation = ++this._generation;
    try {
      const response = await fetch(this.dataUri, {
        credentials: 'same-origin',
        // The console proxy pagelet-wraps app responses; 'download' streams
        // the endpoint's raw JSON through verbatim.
        headers: {'x-kx-fetch-style': 'download'},
      });
      if (!response.ok) {
        throw new Error(await response.text() || response.statusText);
      }
      const payload = await response.json() as Record<string, unknown>;
      if (generation !== this._generation) return; // a newer refresh is in flight
      this.frame?.contentWindow?.postMessage(
        {type: 'hp-preview:config', ...payload},
        this.frameOrigin
      );
    } catch (err) {
      if (generation === this._generation) {
        this._fail(err instanceof Error ? err.message : String(err));
      }
    }
  }

  private _attachForms() {
    const root = this.getRootNode() as Document | ShadowRoot;
    const matched = new Set<HTMLFormElement>();
    root.querySelectorAll(this.watch).forEach(node => {
      if (node instanceof HTMLFormElement) matched.add(node);
    });

    this._watchedForms.forEach(form => {
      if (!matched.has(form)) {
        this._detachForm(form);
        this._watchedForms.delete(form);
      }
    });

    matched.forEach(form => {
      if (this._watchedForms.has(form)) return;
      this._watchedForms.add(form);
      form.addEventListener('submit', this._onSubmit, {capture: true});
      form.addEventListener('zn-change', this._onChange);
      form.addEventListener('zn-input', this._onChange);
      form.addEventListener('change', this._onChange);
    });

    // Shell-saved forms: the shell fires 'complete' on the form it submitted.
    const refreshMatched = new Set<HTMLFormElement>();
    if (this.refreshOn) {
      root.querySelectorAll(this.refreshOn).forEach(node => {
        if (node instanceof HTMLFormElement && !matched.has(node)) refreshMatched.add(node);
      });
    }

    this._refreshForms.forEach(form => {
      if (!refreshMatched.has(form)) {
        form.removeEventListener('complete', this._onShellSave);
        this._refreshForms.delete(form);
      }
    });

    refreshMatched.forEach(form => {
      if (this._refreshForms.has(form)) return;
      this._refreshForms.add(form);
      form.addEventListener('complete', this._onShellSave);
    });
  }

  private readonly _onShellSave = () => {
    void this._sendConfig();
  };

  private _detachForm(form: HTMLFormElement) {
    form.removeEventListener('submit', this._onSubmit, {capture: true});
    form.removeEventListener('zn-change', this._onChange);
    form.removeEventListener('zn-input', this._onChange);
    form.removeEventListener('change', this._onChange);
    const timer = this._debounceTimers.get(form);
    if (timer) window.clearTimeout(timer);
    this._debounceTimers.delete(form);
  }

  private readonly _onChange = (e: Event) => {
    const form = e.currentTarget as HTMLFormElement;
    const existing = this._debounceTimers.get(form);
    if (existing) window.clearTimeout(existing);
    this._debounceTimers.set(form, window.setTimeout(() => {
      this._debounceTimers.delete(form);
      if (!form.isConnected) return;
      form.requestSubmit();
    }, this.debounce));
  };

  private readonly _onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    void this._save(e.currentTarget as HTMLFormElement);
  };

  private async _save(form: HTMLFormElement) {
    try {
      const response = await fetch(form.getAttribute('action') || '', {
        method: 'POST',
        credentials: 'same-origin',
        // 'download' streams the app's own status and headers through verbatim;
        // without it the console proxy pagelet-wraps the response and a failed
        // save is indistinguishable from a successful one.
        headers: {'x-kx-fetch-style': 'download'},
        body: new FormData(form),
      });
      // Apps report a failed save as 204 plus an alert header, which is `ok`.
      const alert = response.headers.get('x-kubex-alert-danger');
      if (alert) throw new Error(alert);
      if (!response.ok) {
        throw new Error(await response.text() || response.statusText);
      }
      await this._sendConfig();
    } catch (err) {
      this._fail(err instanceof Error ? err.message : String(err));
    }
  }

  private _fail(message: string) {
    this.error = message;
    this.emit('zn-error', {detail: {message}});
  }

  render() {
    const zoom = this.zoom > 0 && this.zoom <= 1 ? this.zoom : 1;
    // Browser-style zoom-out: the iframe lays out oversized (1/zoom) and is
    // transformed back down, so the frame fills the panel while the content
    // renders smaller and more of the page is visible. Percentage width means
    // nothing is measured — no layout feedback loop.
    const content = this.error ? 0 : this._contentHeight;
    const iframeStyles = this.fill
      ? {width: '100%', height: content ? `max(${content}px, 100%)` : '100%'}
      : {
        width: `${100 / zoom}%`,
        height: `${Math.max(content, this.minHeight / zoom)}px`,
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
      };
    const containerStyles = this.fill
      ? {height: '100%', minHeight: `${this.minHeight}px`}
      : {height: `${this.minHeight}px`};
    const stageStyles: Record<string, string> = {
      width: DEVICE_WIDTHS[this.device] ?? DEVICE_WIDTHS.desktop,
    };
    if (content) {
      stageStyles.height = this.fill ? `max(${content}px, 100%)` : `${Math.max(content * zoom, this.minHeight)}px`;
    }

    return html`
      <div part="base" class="preview" style="${styleMap(containerStyles)}">
        <div part="stage" class="preview__stage" style="${styleMap(stageStyles)}">
          <iframe part="iframe"
                  src="${this.src}"
                  title="Payment form preview"
                  allow="local-network-access"
                  @load="${this._onFrameLoad}"
                  style="${styleMap(iframeStyles)}"></iframe>
        </div>
        ${this.error ? html`
          <div part="error" class="preview__error">${this.error}</div>` : ''}
      </div>`;
  }
}
