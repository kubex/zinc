import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from '../../internal/default-value';
import {FormControlController, validValidityState} from '../../internal/form';
import {live} from 'lit/directives/live.js';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnOption from '../option';

import styles from './badge.scss';

/**
 * @summary Badges label the status or category of a record, such as "Active" or "Past due".
 * @documentation https://zinc.style/components/badge
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-dropdown
 * @dependency zn-menu
 * @dependency zn-menu-item
 * @dependency zn-tooltip
 *
 * @event zn-change - Emitted when an option is picked from the badge's dropdown.
 *
 * @slot - The badge's label, or `<zn-option>` elements to make the badge a clickable select. An option's own `type`
 * and `dot` attributes style the badge while it is selected. With a `name`, the selected value is submitted with its form.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnBadge extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {assumeInteractionOn: ['zn-change']});

  /** `ai` marks AI-generated content only. */
  @property({reflect: true}) type: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'ai' = 'neutral';

  @property({reflect: true}) size: 'medium' | 'large' = 'medium';

  /** Fills the badge with its type colour. */
  @property({type: Boolean, reflect: true}) solid = false;

  /** Leads the label with a dot in the type colour. */
  @property({type: Boolean, reflect: true}) dot = false;

  /** The selected option's value, when the badge holds `<zn-option>` elements. */
  @property() value = '';

  @defaultValue() defaultValue = '';

  /** Submits the selected value under this name. */
  @property() name = '';

  @property({reflect: true}) form: string;

  @property({type: Boolean, reflect: true}) disabled = false;

  /** Submits the badge's form as soon as an option is picked. */
  @property({type: Boolean, attribute: 'trigger-submit'}) triggerSubmit = false;

  /** Tooltip shown on hover, such as "Change status". */
  @property() tooltip: string;

  @property({attribute: 'tooltip-placement'}) tooltipPlacement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

  @state() private menuOpen = false;

  private get options(): ZnOption[] {
    return [...this.querySelectorAll<ZnOption>(':scope > zn-option')];
  }

  private handleSelect(event: CustomEvent<{value: string}>) {
    const value = event.detail.value;
    if (value === this.value) return;
    this.value = value;
    this.emit('zn-change');
    if (this.triggerSubmit) this.formControlController.submit();
  }

  private handleMenuToggle(event: Event) {
    if (event.target !== event.currentTarget) return;
    this.menuOpen = event.type === 'zn-show';
  }

  get validity(): ValidityState { return validValidityState; }
  get validationMessage(): string { return ''; }
  checkValidity(): boolean { return true; }
  reportValidity(): boolean { return true; }
  getForm(): HTMLFormElement | null { return this.formControlController.getForm(); }
  setCustomValidity() { this.formControlController.updateValidity(); }

  render() {
    const options = this.options;
    if (!options.length) return this.renderBadge(html`<slot @slotchange=${() => this.requestUpdate()}></slot>`, false);

    const selected = options.find(o => o.value === this.value);
    const badge = html`
      <zn-dropdown ?disabled=${this.disabled}
                   @zn-show=${this.handleMenuToggle}
                   @zn-hide=${this.handleMenuToggle}>
        ${this.renderBadge(selected?.getTextLabel() ?? this.value, true, selected)}
        <zn-menu @zn-menu-select=${this.handleSelect}>
          ${options.map(o => html`
            <zn-menu-item type="checkbox" value=${o.value} ?disabled=${o.disabled}
                          .checked=${live(o === selected)}>${o.getTextLabel()}</zn-menu-item>`)}
        </zn-menu>
      </zn-dropdown>
      <slot hidden @slotchange=${() => this.requestUpdate()}></slot>`;

    return this.tooltip ? html`<zn-tooltip placement=${this.tooltipPlacement} content=${this.tooltip} ?disabled=${this.menuOpen}>${badge}</zn-tooltip>` : badge;
  }

  private renderBadge(label: unknown, clickable: boolean, option?: ZnOption) {
    const type = option?.getAttribute('type') ?? this.type;
    const dot = option ? option.hasAttribute('dot') : this.dot;
    const classes = classMap({
      'badge': true,
      [`badge--${type}`]: true,
      'badge--large': this.size === 'large',
      'badge--solid': this.solid,
      'badge--dot': dot,
      'badge--clickable': clickable,
    });
    const content = html`
      ${type === 'ai' ? html`
        <zn-icon class="badge__icon" src="sparkle" library="lucide" size="14"></zn-icon>` : ''}
      ${label}
      ${clickable ? html`
        <zn-icon class="badge__caret" src="chevron-down" library="lucide" size="10"></zn-icon>` : ''}`;

    return clickable
      ? html`<button part="base" slot="trigger" type="button" class=${classes} ?disabled=${this.disabled}>${content}</button>`
      : html`<span part="base" class=${classes}>${content}</span>`;
  }
}
