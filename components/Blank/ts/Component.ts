import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('fusion-blank')
export class FusionIcon extends LitElement {
    static styles = unsafeCSS(styles);

    render() {

        return html`
          Hello <slot></slot>`;
    }
}
