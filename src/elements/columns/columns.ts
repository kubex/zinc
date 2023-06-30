import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './columns.scss';

@customElement('zn-cols')
export class ZincColumns extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'layout', type: String, reflect: true})
  private layout: string = ""
  @property({attribute: 'expanded', type: Boolean, reflect: true})
  private expanded: boolean = false
  @property({attribute: 'min', type: Number, reflect: true})
  private min

  layoutClass = "";

  connectedCallback() {
    super.connectedCallback();
    new ResizeObserver(this.resize).observe(this)
  }

  resize = (e) => {
    this.expanded = e[0].contentRect.width > 800;
  }

  render() {

    if (this.min > 0) {
      this.style.setProperty('--col-min', this.min + "px");
    }

    let c1c = this.querySelectorAll('[slot="c1"]').length > 0 ? 1 : 0;
    let c2c = this.querySelectorAll('[slot="c2"]').length > 0 ? 1 : 0;
    let c3c = this.querySelectorAll('[slot="c3"]').length > 0 ? 1 : 0;
    let c4c = this.querySelectorAll('[slot="c4"]').length > 0 ? 1 : 0;

    let slotCount = c1c + c2c + c3c + c4c;
    if (this.layout.length < 1) {

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

    let cols = this.layout.replace(/,/g, '').split("");
    this.layoutClass = "lo-" + this.layout.replace(/,/g, '');
    let span = 0;
    let slots = ['', '', '', ''];

    for (let i = 0; i < cols.length; i++) {
      span = span + parseInt(cols[i]);
      if (span <= 4) {
        this.layoutClass += " c" + (i + 1);
        slots[i] = "s" + cols[i];
      }
    }

    let c1 = c1c ? html`
      <div class="${slots[0]}">
        <slot name="c1"></slot>
      </div>` : null;
    let c2 = c2c ? html`
      <div class="${slots[1]}">
        <slot name="c2"></slot>
      </div>` : null;
    let c3 = c3c ? html`
      <div class="${slots[2]}">
        <slot name="c3"></slot>
      </div>` : null;
    let c4 = c4c ? html`
      <div class="${slots[3]}">
        <slot name="c4"></slot>
      </div>` : null;


    return html`
      <div class="${this.layoutClass}">
        ${c1} ${c2} ${c3} ${c4}
      </div>
    `;
  }
}
