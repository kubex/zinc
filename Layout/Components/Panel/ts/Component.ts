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
    portion = "3"//of 12

    render() {
        return html`<div class="panel panel--col-${this.portion}"><slot></slot></div>`
    }
}
