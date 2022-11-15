import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-cols')
export class ZincColumns extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property()
    layout = "2,1"

    render() {
        switch (this.layout) {
            case "2,1":
                return html`
                  <div
                    class="grid grid-cols-1 gap-6 p-3 sm:p-6 lg:grid-flow-col-dense lg:grid-cols-3">
                    <div class="lg:col-start-1 lg:col-span-2">
                      <slot name="col1"></slot>
                    </div>
                    <div class="lg:col-start-3 lg:col-span-1">
                      <slot name="col2"></slot>
                    </div>
                  </div>
                `;
            case "1,2":
                return html`
                  <div
                    class="grid grid-cols-1 gap-6 p-3 sm:p-6 lg:grid-flow-col-dense lg:grid-cols-3">
                    <div class="lg:col-start-1 lg:col-span-1">
                      <slot name="col1"></slot>
                    </div>
                    <div class="lg:col-start-2 lg:col-span-2">
                      <slot name="col2"></slot>
                    </div>
                  </div>
                `;
            case "1,1,1":
                return html`
                  <div
                    class="grid grid-cols-1 gap-6 p-3 sm:p-6 lg:grid-flow-col-dense lg:grid-cols-3">
                    <div class="lg:col-start-1 lg:col-span-1">
                      <slot name="col1"></slot>
                    </div>
                    <div class="lg:col-start-2 lg:col-span-1">
                      <slot name="col2"></slot>
                    </div>
                    <div class="lg:col-start-3 lg:col-span-1">
                      <slot name="col3"></slot>
                    </div>
                  </div>`;
        }
    }
}
