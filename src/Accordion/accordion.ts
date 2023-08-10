import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-accordion')
export class Accordion extends LitElement {
  @property({type: String, reflect: true}) caption = '';
  @property({type: String, reflect: true}) summary = '';
  @property({type: String, reflect: true}) label = '';
  @property({type: Boolean, reflect: true}) expanded: boolean = false;

  static styles = unsafeCSS(styles);

  render() {
    return html`
      <div @click="${() => (!this.expanded ? (this.expanded = true) : '')}">
        <slot name="header" slot="header" class="header" @click="${(e: MouseEvent) => this.handleCollapse(e)}">
          <div>
            <p class="caption">${this.caption}</p>
            <p class="summary">${this.summary}</p>
          </div>
          <div class="header__right">
            <p class="label">${this.label}</p>
            <zn-icon library="material-outlined" src="expand_more" class="expand"></zn-icon>
          </div>
        </slot>
        <div class="content">
          <slot @slotchange="${(e) => (e.target.assignedNodes().length === 0)}">

          </slot>
        </div>
      </div>`
  }

  handleCollapse(e) {
    if (this.expanded) {
      this.expanded = false;
      e.stopPropagation();
    }
  }
}


