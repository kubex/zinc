import { property, query } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './dialog.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/dialog
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnDialog extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: String, reflect: true }) trigger: string;

  @query('dialog', true)
  private _dialog: HTMLDialogElement;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._closeClickHandler.bind(this));
    this.shadowRoot?.addEventListener('click', this._closeClickHandler.bind(this));

    // Make sure the closer has a pointer cursor
    const closer = this.querySelector('[dialog-closer]') as HTMLElement;
    if (closer) {
      closer.style.cursor = 'pointer';
    }

    if (this.trigger) {
      const trigger = this.parentElement?.querySelector('#' + this.trigger);
      if (trigger) {
        trigger.addEventListener('click', this._openDialog.bind(this));
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const trigger = document.querySelector('#' + this.trigger);
    if (trigger) {
      trigger.removeEventListener('click', this._openDialog.bind(this));
    }
  }

  protected _openDialog(e: any) {
    e.stopPropagation();
    this.open();
  }

  protected _closeDialog(e: any = null) {
    e?.stopPropagation();
    this._dialog.close();
    this.emit('zn-close', { detail: { element: this } });
  }

  open() {
    this.emit('zn-open', { detail: { element: this } });
    this._dialog.showModal();
  }

  close() {
    this._dialog.classList.remove('closing');
    this._closeDialog();
  }

  successCloseDialog() {
    this._dialog.classList.add('closing');
    setTimeout(() => {
      this.close();
    }, 1000);
  }

  private _closeClickHandler(e: Event) {
    if (e.target instanceof HTMLElement && e.target.hasAttribute('dialog-closer')) {
      this._closeDialog(e);
    }
  }

  render() {
    return html`
      <dialog class="dialog">
        <div id="content">
          <slot></slot>
        </div>
        <div class="done">
          <zn-icon src="check:success" size="150"></zn-icon>
        </div>
      </dialog>
    `;
  }
}
