import {CSSResultGroup, html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {Dialog} from "@/Dialog";
import {unsafeHTML} from "lit/directives/unsafe-html.js";

import styles from './index-content.scss?inline';
import {PropertyValues} from "@lit/reactive-element";
import {classMap} from "lit/directives/class-map.js";

@customElement('zn-confirm-content')
export class ConfirmModalContent extends Dialog
{
  static get styles(): CSSResultGroup
  {
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

  getIcon()
  {
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

  connectedCallback()
  {
    this.emit('zn-element-added', {detail: {element: this}});
    super.connectedCallback();
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);

    const slot = this.shadowRoot.querySelector('slot');
    const nodes: Node[] = slot.assignedNodes();
    const form = nodes.filter((node) => node.nodeName === 'FORM');

    const elementNameMap = [
      'input', 'select', 'textarea', 'zn-select', 'zn-input', 'zn-textarea'
    ];

    const elements = [];
    elementNameMap.forEach((elementName) =>
    {
      elements.push(...(form[0] as HTMLFormElement).querySelectorAll(elementName));
    });

    // Check if there is an input that isn't hidden
    for(let i = 0; i < elements.length; i++)
    {
      if(elements[i].type !== 'hidden')
      {
        console.log('found input', elements[i]);
        this._hasVisibleInput = true;
        this.requestUpdate();
        break;
      }
    }
  }

  render()
  {
    const icon = this.getIcon();

    return html`<!-- default dialog close button -->
    ${!this.hideIcon ? icon : ''}
    <h2 class="title">${unsafeHTML(this.caption)}</h2>
    ${this.content && html`<p>${unsafeHTML(this.content)}</p>`}
    <slot></slot>
    <div class="${classMap({
      'button-group': true,
      'button-group--gap': this._hasVisibleInput
    })}">
      <zn-button class="grow" outline color="${this.type}" dialog-closer>${this.cancelText}</zn-button>
      <zn-button class="grow" color="${this.type}" @click="${this.submitDialog}"> ${this.confirmText}</zn-button>
    </div>
    `;
  }

  submitDialog()
  {
    // get the form from the slot
    let form = this.querySelector('form');
    if(!form && this.action)
    {
      form = document.createElement('form') as HTMLFormElement;
      form.action = this.action;
      form.method = 'POST';
      this.appendChild(form);
      document.dispatchEvent(new CustomEvent('zn-register-element', {
        detail: {element: form}
      }));
    }

    if(form && form.reportValidity())
    {
      form.requestSubmit();
      this.close();
    }
  }
}
