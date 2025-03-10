import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import ZnDialog from "../dialog";
import {classMap} from "lit/directives/class-map.js";
import {unsafeHTML} from "lit/directives/unsafe-html.js";

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
export default class ZnConfirm extends ZnDialog {

  static get styles(): CSSResultGroup {
    return [super.styles, unsafeCSS(styles)];
  }

  @property() caption: string = '';
  @property() content: string = '';
  @property() action: string = '';
  @property() confirmText: string = "Confirm";
  @property() cancelText: string = "Cancel";
  @property({type: Boolean, attribute: 'hide-icon'}) hideIcon: boolean = false;

  @property() type: 'warning' | 'error' | 'success' | 'info' = 'warning';
  @property() size: 'small' | 'medium' | 'large' = 'medium';

  private _hasVisibleInput: boolean = false;

  getIcon() {
    const src = {
      'warning': 'priority_high',
      'error': 'priority_high',
      'success': 'check',
      'info': 'help'
    };

    return html`
      <zn-icon slot="primary" color="${this.type}" src="${src[this.type]}" size="24"></zn-icon>
    `;
  }

  connectedCallback() {
    this.emit('zn-element-added', {detail: {element: this}});
    super.connectedCallback();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      const nodes: Node[] = slot.assignedNodes();
      const form = nodes.filter((node) => node.nodeName === 'FORM');

      const elementNameMap = [
        'input', 'select', 'textarea', 'zn-select', 'zn-input', 'zn-textarea'
      ];

      const elements: any[] = [];
      if (form[0]) {
        elementNameMap.forEach((elementName) => {
          elements.push(...(form[0] as HTMLFormElement).querySelectorAll(elementName));
        });
      }

      // Check if there is an input that isn't hidden
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].type !== 'hidden') {
          this._hasVisibleInput = true;
          this.requestUpdate();
          break;
        }
      }
    }
  }

  render() {
    const icon = this.getIcon();

    return html`
      <dialog class=${classMap({
        'dialog': true,
        'dialog--small': this.size === 'small',
        'dialog--medium': this.size === 'medium',
        'dialog--large': this.size === 'large'
      })}>
        <div id="content"> <!-- default dialog close button -->
          ${!this.hideIcon ? icon : ''}
          <h2 class="title">${unsafeHTML(this.caption)}</h2>
          ${this.content && html`<p>${unsafeHTML(this.content)}</p>`}
          <slot></slot>
          <div class="${classMap({
            'button-group': true,
            'button-group--gap': this._hasVisibleInput
          })}">
            <zn-button style="flex-grow:1" outline color="${this.type}" dialog-closer modal-closer
                       @click="${this.closeModal}">
              ${this.cancelText}
            </zn-button>
            <zn-button style="flex-grow:1" color="${this.type}" @click="${this.submitDialog}"> ${this.confirmText}
            </zn-button>
          </div>
        </div>
        <div class="done">
          <zn-icon src="check:success" size="150"></zn-icon>
        </div>
      </dialog>`;
  }

  closeModal() {
    this.emit('zn-close', {detail: {element: this}});
  }

  submitDialog() {
    // get the form from the slot
    let form = this.querySelector('form');
    if (!form && this.action) {
      form = document.createElement('form') as HTMLFormElement;
      form.action = this.action;
      form.method = 'POST';
      this.appendChild(form);
      document.dispatchEvent(new CustomEvent('zn-register-element', {
        detail: {element: form}
      }));
    }

    if (form && form.reportValidity()) {
      form.requestSubmit();
      this.close();
    }
  }
}
