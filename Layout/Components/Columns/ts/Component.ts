import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
// @ts-ignore
import layoutStyles from '../../../scss/layout.scss';

@customElement('zn-cols')
export class ZincColumns extends LitElement {
    static get styles() {
        return [unsafeCSS(layoutStyles), unsafeCSS(styles)];
    }

    @property({attribute: 'layout', type: String, reflect: true})
    private layout: string = "2,2"

    layoutClass = "";

    render() {
        let cols = this.layout.replace(/,/g, ' ').split(" ");
        this.layoutClass = "col";
        let span = 0;
        let colCount = 0;
        for (let i = 0; i < cols.length; i++) {
            span += parseInt(cols[i]);
            if (span <= 4) {
                this.layoutClass += " col-" + (i + 1) + "-" + cols[i];
                colCount++;
            }
        }
        switch (colCount) {
            case 1:
                return html`
                <div class="${this.layoutClass}">
                    <div><slot name="col1"></slot></div>
                </div>
                `;
            case 2:
                return html`
                <div class="${this.layoutClass}">
                    <div><slot name="col1"></slot></div>
                    <div><slot name="col2"></slot></div>
                </div>
                `;
            case 3:
                return html`
                <div class="${this.layoutClass}">
                    <div><slot name="col1"></slot></div>
                    <div><slot name="col2"></slot></div>
                    <div><slot name="col3"></slot></div>
                </div>
                `;
            case 4:
                return html`
                <div class="${this.layoutClass}">
                    <div><slot name="col1"></slot></div>
                    <div><slot name="col2"></slot></div>
                    <div><slot name="col3"></slot></div>
                    <div><slot name="col4"></slot></div>
                </div>
                `;
        }
    }
}
