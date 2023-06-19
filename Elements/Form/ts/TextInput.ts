import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/TextInput.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-text-input')
export class ZincTextInput extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'id', type: String, reflect: true})
    private id;
    @property({attribute: 'name', type: String, reflect: true})
    private name;
    @property({attribute: 'prefix', type: String, reflect: true})
    private prefix;
    @property({attribute: 'placeholder', type: String, reflect: true})
    private placeholder;
    @property({attribute: 'value', type: String, reflect: true})
    private value;
    @property({attribute: 'type', type: String, reflect: true})
    private type = 'text';

    createRenderRoot() {
        return this;
    }

    render() {
        return html`<div class="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
          <span class="flex select-none items-center pl-3 text-gray-500 sm:text-sm">${this.prefix}</span><input
          class="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
          id="${this.id}"
                           name="${this.name}"
                           placeholder="${this.placeholder}"
                           value="${this.value}"/></div>
        `
    }
}
