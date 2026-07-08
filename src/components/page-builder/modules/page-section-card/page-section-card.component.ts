import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnButton from '../../../button';
import ZnIcon from '../../../icon';

import styles from './page-section-card.scss';

/**
 * @summary A section card on the `<zn-page-builder>` canvas: icon tile, label, one-line
 *   summary, and hover actions (duplicate / remove). Purely presentational — the builder
 *   wires up dragging, focus, selection and keyboard handling on the host element.
 * @documentation https://zinc.style/components/page-section-card
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 *
 * @event page-card-duplicate - The duplicate action was clicked (internal; not in the typed event map).
 * @event page-card-remove - The remove action was clicked (internal; not in the typed event map).
 *
 * @csspart base - The card row.
 */
export default class ZnPageSectionCard extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-button': ZnButton,
    'zn-icon': ZnIcon,
  };

  @property() label = '';
  @property() summary = '';
  @property() icon = '';
  @property({attribute: 'icon-library'}) iconLibrary: string;
  @property() color = '';
  @property({type: Boolean, reflect: true}) selected = false;
  /** Set when the section's type has no registered template — renders greyed. */
  @property({type: Boolean, reflect: true}) unknown = false;

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this.style.setProperty('--section-accent', this.color || 'rgb(var(--zn-color-primary))');
  }

  private _action(e: Event, name: 'page-card-duplicate' | 'page-card-remove') {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true}));
  }

  // Keep Enter/Space on the action buttons from reaching the host, where the
  // builder's card keydown handler would preventDefault and suppress the
  // button's native activation.
  private _actionKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
  }

  render() {
    return html`
      <div part="base" class="card">
        <span class="card__icon">
          <zn-icon src="${this.icon || 'widgets'}" library="${ifDefined(this.iconLibrary)}" size="18"></zn-icon>
        </span>
        <span class="card__text">
          <span class="card__label">${this.label}</span>
          ${this.summary ? html`<span class="card__summary">${this.summary}</span>` : ''}
        </span>
        <span class="card__actions" @keydown="${this._actionKeydown}">
          <zn-button
            class="card__action"
            icon-button="small"
            plain
            icon="content_copy"
            icon-size="14"
            title="Duplicate section"
            aria-label="Duplicate section"
            @click="${(e: Event) => this._action(e, 'page-card-duplicate')}"></zn-button>
          <zn-button
            class="card__action"
            icon-button="small"
            plain
            icon="delete"
            icon-size="14"
            title="Remove section"
            aria-label="Remove section"
            @click="${(e: Event) => this._action(e, 'page-card-remove')}"></zn-button>
        </span>
      </div>
    `;
  }
}
