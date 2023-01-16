import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-cols')
export class ZincColumns extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'layout', type: String, reflect: true})
    private layout: string = ""

    layoutClass = "";

    render() {
        if (this.layout.length < 1) {
            let c1c = this.querySelectorAll('[slot="c1"]').length > 0 ? 1 : 0;
            let c2c = this.querySelectorAll('[slot="c2"]').length > 0 ? 1 : 0;
            let c3c = this.querySelectorAll('[slot="c3"]').length > 0 ? 1 : 0;
            let c4c = this.querySelectorAll('[slot="c4"]').length > 0 ? 1 : 0;
            let slotCount = c1c + c2c + c3c + c4c;

            switch (slotCount) {
                case 1:
                    this.layout += "4";
                    break;
                case 2:
                    this.layout += "2,2";
                    break;
                case 3:
                    this.layout += "1,1,2";
                    break;
                case 4:
                    this.layout += "1,1,1,1";
                    break;
            }
        }

        let cols = this.layout.replace(/,/g, ' ').split(" ");
        this.layoutClass = "";
        let span = 0;
        let colCount = 0;

        let slots = ['', '', '', ''];

        for (let i = 0; i < cols.length; i++) {
            span += parseInt(cols[i]);
            if (span <= 4) {
                this.layoutClass += " c" + (i + 1);
                slots[i] = "s" + cols[i];
                colCount++;
            }
        }
        console.log(slots);

        console.log('render', span, colCount)
        return html`
          <div class="${this.layoutClass}">
            <div class="${slots[0]}">
              <slot name="c1"></slot>
            </div>
            <div class="${slots[1]}">
              <slot name="c2"></slot>
            </div>
            <div class="${slots[2]}">
              <slot name="c3"></slot>
            </div>
            <div class="${slots[3]}">
              <slot name="c4"></slot>
            </div>
          </div>
        `;
    }
}
