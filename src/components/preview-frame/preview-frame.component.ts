import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, query, state} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {styleMap} from 'lit/directives/style-map.js';
import ZincElement from '../../internal/zinc-element';

import styles from './preview-frame.scss';

/**
 * @summary Embeds a live preview iframe and drives the hp-preview postMessage
 * protocol: answers the frame's ready handshake with a config payload fetched
 * from data-uri, auto-saves watched forms on change, and refreshes the
 * preview after each save.
 * @documentation https://zinc.style/components/preview-frame
 * @status experimental
 * @since 1.0
 *
 * @event zn-error - Emitted when the preview reports a render error or a save fails.
 *
 * @csspart base - The component's base wrapper.
 * @csspart iframe - The preview iframe.
 * @csspart error - The error overlay.
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

  /** Debounce in ms between a form change and its auto-save. */
  @property({type: Number}) debounce = 400;

  /**
   * The virtual viewport width (in CSS pixels) the previewed page is laid
   * out at. The iframe always renders at view-width × view-height and is
   * scaled (up or down) with a CSS transform to fill the container's width,
   * so the visible preview always keeps the view-width : view-height aspect
   * ratio (16:9 by default).
   */
  @property({type: Number, attribute: 'view-width'}) viewWidth = 1280;

  /**
   * The virtual viewport height (in CSS pixels) of the previewed page area.
   * The visible panel height is view-height multiplied by the current scale.
   * Heights are derived from this constant rather than measured, because a
   * measured container height would feed back into the scaled iframe's
   * layout box and grow unbounded.
   */
  @property({type: Number, attribute: 'view-height'}) viewHeight = 720;

  @query('iframe') frame: HTMLIFrameElement;

  @query('.preview') private previewContainer: HTMLDivElement;

  @state() private error = '';

  @state() private _scale = 1;

  private _generation = 0;

  private readonly _watchedForms = new Set<HTMLFormElement>();
  private readonly _debounceTimers = new Map<HTMLFormElement, number>();

  // Forms are siblings in light DOM and get replaced when other content
  // re-renders; re-resolve them whenever the surrounding DOM changes.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _formObserver = new MutationController(this, {
    target: null,
    config: {subtree: true, childList: true},
    callback: () => this._attachForms(),
  });

  // The container is measured (rather than the host) so the scale reacts to
  // layout-driven resizes of the panel around the component.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _resizeObserver = new ResizeController(this, {
    target: null,
    callback: () => this._onResize(),
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

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.previewContainer) {
      this._resizeObserver.observe(this.previewContainer);
    }
  }

  private _onResize() {
    const container = this.previewContainer;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this._scale = rect.width > 0 ? rect.width / this.viewWidth : 1;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('message', this._onMessage);
    this._watchedForms.forEach(form => this._detachForm(form));
    this._watchedForms.clear();
  }

  private readonly _onMessage = (e: MessageEvent) => {
    // Fail closed: with frame-origin unset, every message is rejected.
    if (e.origin !== this.frameOrigin) return;
    if (!this.frame || e.source !== this.frame.contentWindow) return;

    const data = e.data as {type?: string; message?: string} | undefined;
    switch (data?.type) {
      case 'hp-preview:ready':
        void this._sendConfig();
        break;
      case 'hp-preview:rendered':
        this.error = '';
        break;
      case 'hp-preview:error':
        this._fail(String(data.message ?? 'Preview failed to render'));
        break;
    }
  };

  /** Re-fetches the payload and pushes a fresh config to the preview. */
  refresh() {
    return this._sendConfig();
  }

  private async _sendConfig() {
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
  }

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
        body: new FormData(form),
      });
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
    const iframeStyles = {
      width: `${this.viewWidth}px`,
      height: `${this.viewHeight}px`,
      transform: `scale(${this._scale})`,
      transformOrigin: '0 0',
    };
    // The visible box is the scaled virtual viewport, never a measurement,
    // so it always keeps the view-width : view-height aspect ratio.
    const containerStyles = {height: `${this.viewHeight * this._scale}px`};

    return html`
      <div part="base" class="preview" style="${styleMap(containerStyles)}">
        <iframe part="iframe"
                src="${this.src}"
                title="Payment form preview"
                allow="local-network-access"
                style="${styleMap(iframeStyles)}"></iframe>
        ${this.error ? html`
          <div part="error" class="preview__error">${this.error}</div>` : ''}
      </div>`;
  }
}
