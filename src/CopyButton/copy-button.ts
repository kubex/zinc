import {ZincElement} from "@/zinc-element";
import {unsafeCSS} from "lit";
import {customElement, property, query, state} from 'lit/decorators.js';
import {html} from "lit/static-html.js";
import {classMap} from "lit/directives/class-map.js";

import {Tooltip} from "@/Tooltip";

import styles from './index.scss?inline';

@customElement('zn-copy-button')
export class CopyButton extends ZincElement
{
  static styles = unsafeCSS(styles);

  @query('slot[name="copy-icon"') copyIcon: HTMLSlotElement;
  @query('slot[name="success-icon"') successIcon: HTMLSlotElement;
  @query('slot[name="error-icon"') errorIcon: HTMLSlotElement;

  @query('zn-tooltip') tooltip: Tooltip;

  @state() isCopying = false;
  @state() status: 'rest' | 'success' | 'error' = 'rest';

  @property() value = '';
  @property() copyLabel = '';


  render()
  {
    const copyLabel = this.copyLabel || 'Copy';

    return html`
      <zn-tooltip
        class=${classMap({
          'copy-button': true,
          'copy-button--error': this.status === 'error',
          'copy-button--success': this.status === 'success',
        })}
        content=${copyLabel}>
        <button class="copy-button__button" part="button" @click=${this.handleCopy}>
          <slot part="copy-icon" name="copy-icon">
            <zn-icon src="content_copy"></zn-icon>
          </slot>
          <slot part="success-icon" name="success-icon" hidden>
            <zn-icon src="check"></zn-icon>
          </slot>
          <slot part="error-icon" name="error-icon" hidden>
            <zn-icon src="priority_high"></zn-icon>
          </slot>
        </button>
      </zn-tooltip>
    `;
  }

  private async showStatus(status: 'success' | 'error')
  {
    const iconToShow = status === 'success' ? this.successIcon : this.errorIcon;
    this.tooltip.content = status === 'success' ? 'Copied!' : 'Error!';

    this.copyIcon.hidden = true;
    this.status = status;
    iconToShow.hidden = false;

    setTimeout(() =>
    {
      this.status = 'rest';
      this.copyIcon.hidden = false;
      iconToShow.hidden = true;
      this.tooltip.content = this.copyLabel || 'Copy';
      this.isCopying = false;
    }, 1500);
  }

  private async handleCopy()
  {
    if(this.isCopying)
    {
      return;
    }

    this.isCopying = true;
    try
    {
      await navigator.clipboard.writeText(this.value);
      await this.showStatus('success');
    }
    catch(error)
    {
      await this.showStatus('error');
    }
  }
}


