import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('fusion-max-width')
export class FusionIcon extends LitElement {
    static styles = unsafeCSS(styles);

    @property({reflect: true})
    width = 1024

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if (Number(value) < 1) {
            this.width = Number(_old)
        }
        this.style.setProperty('--max-width', this.width + "px")
    }

    render() {
        return html`
          <div class="container">
            <slot></slot>
          </div>`;
    }
}
