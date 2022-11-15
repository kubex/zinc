import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-panel')
export class ZincPanel extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }


    @property()
    colspan = "3"//of 12


    connectedCallback() {
        super.connectedCallback();
        this.classList.add("col-span-" + this.colspan);
    }

    render() {
        return html`<slot></slot>`
    }
}
