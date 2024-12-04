import {unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "@/zinc-element";

import styles from './tag.scss?inline';
import {html} from "lit/static-html.js";

@customElement('zn-tag')
export class Tag extends ZincElement
{
  static styles = unsafeCSS(styles);

  /** Makes the tag removable and shows a remove button. */
  @property({type: Boolean}) removable = false;

  private handleRemoveClick()
  {
    this.emit('zn-remove');
  }

  render()
  {
    return html`
      <span part="base" class="tag">
        ${this.removable ? html`
          <zn-icon
            part="remove-button"
            exportparts="base:remove-button__base"
            src="close"
            size="12"
            @click=${this.handleRemoveClick}
            tabindex="-1"></zn-icon>` : ''}
        <slot part="content" class="tag__content"></slot>
      </span>
    `;
  }
}
