import {html, unsafeCSS} from "lit";
import {property} from "lit/decorators.js";
import ZincElement from "../../../../../internal/zinc-element";
import type {CSSResultGroup} from "lit";

import styles from './ai-tooltip.scss';

export default class AITooltipComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Boolean, reflect: true}) open = false;

  public show() {
    this.open = true;
  }

  public hide() {
    this.open = false;
  }

  render() {
    return html`
      <button type="button" class="ai-tooltip">
        <zn-icon src="stylus" size="18"></zn-icon>
        <span class="label">Refine</span>
      </button>`;
  }
}

AITooltipComponent.define('zn-ai-tooltip');
