import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import layoutStyles from '../scss/layout.scss';

@customElement('zn-layout')
export class ZincLayout extends LitElement {
    static get styles() {
        return [unsafeCSS(layoutStyles)];
    }

    render() {
        return html`
          <slot></slot>`;
    }
}
