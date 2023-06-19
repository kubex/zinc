import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Group.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-form-group')
export class ZincFormGroup extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'title', type: String, reflect: true})
    private title;
    @property({attribute: 'description', type: String, reflect: true})
    private description;


    render() {
        return html`
          <div><h2 class="text-base font-semibold leading-7">${this.title}</h2>
            <p class="mt-1 text-sm leading-6">${this.description}</p></div>
          <div class="fg-inputs">
            <slot></slot>
          </div>`
    }
}
