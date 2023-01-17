import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
// @ts-ignore
import sideStyles from '../scss/SideStyles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-page')
export class ZincPage extends ZincElement {
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
export class ZincPageSide extends ZincElement {
    static get styles() {
        return [unsafeCSS(sideStyles)];
    }

    @property({attribute: 'caption', type: String, reflect: true})
    private caption;

    public slot = "side";

    @property({attribute: 'open', type: Boolean, reflect: true})
    private open: boolean = false;

    _handleClick(e) {
        this.open = !this.open;
    }

    render() {
        let smpCap = this.caption ?? "Close"
        return html`
          <div class="expander" @click="${this._handleClick}">
            <zn-icon src="arrow_downward" library="material"></zn-icon>
            <span class="close">Close</span>
            <span class="close-sm">${smpCap}</span>
            <span class="open">Show ${this.caption}</span>
          </div>
          <div class="content">
            <slot></slot>
          </div>`
    }
}
