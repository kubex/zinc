import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-panel')
export class ZincPanel extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    render() {
        return html`<slot></slot>`
    }
}
