import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, query, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './preview-frame.scss';

/**
 * @summary Embeds a live preview iframe and drives the hp-preview postMessage
 * protocol: answers the frame's ready handshake with a config payload fetched
 * from payload-uri, auto-saves watched forms on change, and refreshes the
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

  /** Endpoint returning the hp-preview:config payload JSON. */
  @property({attribute: 'payload-uri'}) payloadUri = '';

  /** Selector (resolved against the component's root node) for the forms to watch. */
  @property() watch = 'form';

  /** Debounce in ms between a form change and its auto-save. */
  @property({type: Number}) debounce = 400;

  @query('iframe') frame: HTMLIFrameElement;

  @state() private error = '';

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
      const response = await fetch(this.payloadUri, {credentials: 'same-origin'});
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
    return html`
      <div part="base" class="preview">
        <iframe part="iframe" src="${this.src}" title="Payment form preview"></iframe>
        ${this.error ? html`
          <div part="error" class="preview__error">${this.error}</div>` : ''}
      </div>`;
  }
}
