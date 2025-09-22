import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {deepQuerySelectorAll} from "../../utilities/query";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query} from 'lit/decorators.js';
import ZincElement from "../../internal/zinc-element";
import ZnDialog from "../dialog";

import styles from './confirm.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/confirm-modal
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
export default class ZnConfirm extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-dialog': ZnDialog
  };

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'footer');

  /** The dialog's theme variant. */
  @property({reflect: true}) variant: 'default' | 'warning' | 'announcement' = 'default';

  /** The dialog's size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** The dialogs type, which will determine the icon and color. */
  @property() type: 'warning' | 'error' | 'success' | 'info' = 'warning';

  /**
   * Indicated whether of not the dialog is open. You can toggle this attribute to show and hide the dialog, or you can
   * use the `show()` and `hide()` methods and this attribute will reflect the dialog's state.
   */
  @property({type: Boolean, reflect: true}) open = false;

  @property() caption: string = '';

  @property() action: string = '';

  @property() content: string = '';

  @property() confirmText: string = "Confirm";

  @property() cancelText: string = "Cancel";

  @property({type: Boolean, attribute: 'hide-icon'}) hideIcon: boolean = false;

  /**
   * The dialog's trigger element. This is used to open the dialog when clicked. If you do not provide a trigger, you
   * will need to manually open the dialog using the `show()` method.
   */
  @property({reflect: true}) trigger: string;

  /** The Dialogs announcement text. */
  @property() announcement: string = '';

  /** The Dialogs footer text. */
  @property({attribute: 'footer-text'}) footerText: string = '';

  @query('zn-dialog') dialog: ZnDialog;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.open) {
      this.dialog.show();
    }
  }

  connectedCallback() {
    super.connectedCallback();


    if (this.hasSlotController.test('trigger')) {
      const trigger = this.hasSlotController.getSlot('trigger');
      trigger?.addEventListener('click', this.show);
    } else if (this.trigger) {
      const triggers = deepQuerySelectorAll('#' + this.trigger, this.parentElement as Element, '');
      triggers.forEach((el: HTMLButtonElement) => {
        el.addEventListener('click', this.show);
      });
    }
  }

  updateTriggers() {
    const triggers = deepQuerySelectorAll('#' + this.trigger, this.parentElement as Element, '');
    triggers.forEach((el: HTMLButtonElement) => {
      // if already has a click listener, remove it
      el.removeEventListener('click', this.show);
      el.addEventListener('click', this.show);
    });
  }

  show = (event: Event | undefined = undefined) => {
    const trigger = event?.target as HTMLButtonElement
    if (trigger?.disabled) return;
    this.dialog.show();
  }

  hide() {
    this.dialog.hide();
  }


  render() {
    const src = {
      'warning': 'priority_high',
      'error': 'priority_high',
      'success': 'check',
      'info': 'help'
    };

    return html`
      <slot name="trigger" slot="trigger"></slot>
      <zn-dialog size="${this.size}" variant="${this.variant}" label=${ifDefined(this.caption)} trigger=${this.trigger}
                 class=${classMap({
                   'confirm-dialog': true,
                   'confirm-dialog--warning': this.type === 'warning',
                   'confirm-dialog--error': this.type === 'error',
                   'confirm-dialog--success': this.type === 'success',
                   'confirm-dialog--info': this.type === 'info',
                   'confirm-dialog--has-default-slot': this.hasSlotController.test('[default]'),
                 })}>

        <slot name="announcement-intro" slot="announcement-intro">${this.announcement}</slot>

        ${!this.hideIcon ? html`
            <zn-icon slot="header-icon" color="${this.type}" src="${src[this.type]}"></zn-icon>`
          : ''}

        <div class="confirm-dialog__content">
          ${this.content ? html`${this.content}` : ''}
          <slot></slot>
        </div>

        <zn-button outline color="${this.type}" slot="footer" dialog-closer>${this.cancelText}</zn-button>
        <zn-button color="${this.type}" slot="footer" @click="${this.submitDialog}"> ${this.confirmText}</zn-button>

        <slot name="footer-text" slot="footer-text">${this.footerText}</slot>
      </zn-dialog>`;
  }

  submitDialog() {
    // get the form from the slot
    let form = this.querySelector('form');
    if (!form && this.action) {
      form = document.createElement('form') as HTMLFormElement;
      form.action = this.action;
      form.method = 'POST';

      this.querySelectorAll('input').forEach((el: HTMLInputElement) => {
        form?.appendChild(el.cloneNode() as Node);
      })

      this.appendChild(form);
    }

    if (form && form.reportValidity()) {
      document.dispatchEvent(new CustomEvent('zn-register-element', {
        detail: {element: form}
      }))
      form.requestSubmit();
      this.hide();
    }
  }
}
