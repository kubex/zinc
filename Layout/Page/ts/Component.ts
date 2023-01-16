import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
// @ts-ignore
import sideStyles from '../scss/SideStyles.scss';

@customElement('zn-page')
export class ZincPage extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    render() {
        return html`
          <div>
            <slot></slot>
          </div>
          <div class="pageside">
            <slot name="side"></slot>
          </div>`
    }
}


@customElement('zn-pageside')
export class ZincPageSide extends LitElement {
    static get styles() {
        return [unsafeCSS(sideStyles)];
    }


    @property({attribute: 'open', type: Boolean, reflect: true})
    private open: boolean = false;


    constructor() {
        super();
        this.slot = "side"
    }

    _handleClick(e) {
        this.open = !this.open;
    }

    render() {
        return html`
          <div class="expander" @click="${this._handleClick}">&#8612;</div>
          <div class="content">
            <slot></slot>
          </div>`
    }
}
