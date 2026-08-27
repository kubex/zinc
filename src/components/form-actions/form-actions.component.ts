import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {idSelector} from "../../utilities/query";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";

import styles from './form-actions.scss';

/**
 * @summary Standard action row for the bottom of a form. Renders a submit button by default; opt in to more
 * with `with-cancel` and `with-reset`.
 * @documentation https://zinc.style/components/form-actions
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 *
 * @event zn-cancel - Emitted when the cancel button is clicked.
 *
 * @slot - Extra actions, placed before the buttons.
 *
 * @csspart cancel-button - The cancel button.
 * @csspart reset-button - The reset button.
 * @csspart submit-button - The submit button.
 */
export default class ZnFormActions extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton
  };

  /** The submit button's text. */
  @property({attribute: 'submit-text'}) submitText = 'Save';

  /** The submit button's icon. */
  @property({attribute: 'submit-icon'}) submitIcon = 'check@lu';

  /** Adds a cancel button. Closes the containing dialog or slideout, if any, and emits `zn-cancel`. */
  @property({attribute: 'with-cancel', type: Boolean}) withCancel = false;

  /** The cancel button's text. */
  @property({attribute: 'cancel-text'}) cancelText = 'Cancel';

  /** The cancel button's icon. */
  @property({attribute: 'cancel-icon'}) cancelIcon = 'x@lu';

  /** Adds a reset button that resets the form. */
  @property({attribute: 'with-reset', type: Boolean}) withReset = false;

  /** The reset button's text. */
  @property({attribute: 'reset-text'}) resetText = 'Reset';

  /** The reset button's icon. */
  @property({attribute: 'reset-icon'}) resetIcon = 'rotate-ccw@lu';

  /** The id of the form to act on. If omitted, the closest containing form is used. */
  @property() form: string;

  // The buttons live in this component's shadow root, so zn-button's own
  // submit/reset handling can't find the form — resolve it from the host.
  private getForm(): HTMLFormElement | null {
    if (this.form) {
      const root = this.getRootNode() as Document | ShadowRoot;
      return root.querySelector<HTMLFormElement>(idSelector(this.form));
    }
    return this.closest('form');
  }

  private handleCancel = () => {
    this.emit('zn-cancel');
  };

  private handleReset = () => {
    this.getForm()?.reset();
  };

  private handleSubmit = () => {
    this.getForm()?.requestSubmit();
  };

  render() {
    return html`
      <slot></slot>
      ${this.withCancel ? html`
        <zn-button part="cancel-button" panel-bg modal-closer icon="${this.cancelIcon}" @click="${this.handleCancel}">
          ${this.cancelText}
        </zn-button>` : ''}
      ${this.withReset ? html`
        <zn-button part="reset-button" panel-bg icon="${this.resetIcon}" @click="${this.handleReset}">
          ${this.resetText}
        </zn-button>` : ''}
      <zn-button part="submit-button" color="primary" icon="${this.submitIcon}" @click="${this.handleSubmit}">
        ${this.submitText}
      </zn-button>`;
  }
}
