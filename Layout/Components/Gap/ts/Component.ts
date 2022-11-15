import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-gap')
export class ZincGap extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    render() {
        return html`<slot></slot>`
    }
}
