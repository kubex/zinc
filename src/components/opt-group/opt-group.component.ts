import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';

import styles from './opt-group.scss';

/**
 * @summary Groups options within a `<zn-select>` under a labeled header, similar to `<optgroup>` in native HTML.
 * @documentation https://zinc.style/components/opt-group
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot for `<zn-option>` elements.
 *
 * @csspart base - The component's base wrapper.
 * @csspart label - The group label element.
 */
export default class ZnOptGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** The label for the opt-group, displayed as a non-selectable header above the grouped options. */
  @property() label = '';

  /** Disables all options within the group. */
  @property({type: Boolean, reflect: true}) disabled = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', this.label);
  }

  @watch('label')
  handleLabelChange() {
    this.setAttribute('aria-label', this.label);
  }

  @watch('disabled')
  handleDisabledChange() {
    this.propagateDisabled();
  }

  /** @internal - Updates visibility of the group based on whether any child options are visible. */
  updateVisibility() {
    const options = [...this.querySelectorAll('zn-option')];
    this.hidden = options.length > 0 && options.every(option => option.hidden);
  }

  render() {
    return html`
      <div part="base" class="opt-group">
        <div part="label" class="opt-group__label" aria-hidden="true">
          ${this.label}
        </div>
        <div class="opt-group__options" role="none">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  private handleSlotChange() {
    if (this.disabled) {
      this.propagateDisabled();
    }
  }

  private propagateDisabled() {
    this.querySelectorAll('zn-option').forEach(option => {
      option.disabled = this.disabled;
    });
  }
}
