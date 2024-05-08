import { html, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { ZincElement } from "../zinc-element";

import styles from './index.scss?inline';

@customElement('zn-button-group')
export class ButtonGroup extends ZincElement
{
  @property({ type: String }) direction: 'horizontal' | 'vertical' = 'horizontal';

  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div part="base"
           class="button-group"
           role="group">
        <slot></slot>
      </div>`;
  }
}
