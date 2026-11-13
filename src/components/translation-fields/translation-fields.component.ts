import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnNavbar from '../navbar';

import styles from './translation-fields.scss';

export type TranslationFieldsLayout = 'split' | 'stacked';

const LAYOUTS: { layout: TranslationFieldsLayout, label: string }[] = [
  {layout: 'split', label: 'Side by side'},
  {layout: 'stacked', label: 'Stacked'},
];

/**
 * @summary Lays out `zn-translation-field`s with their source beside or above the translation, chosen by the viewer.
 * @documentation https://zinc.style/components/translation-fields
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-navbar
 *
 * @slot - The `zn-translation-field`s.
 * @slot actions - Actions level with the layout switch, after the source toggle.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnTranslationFields extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-button': ZnButton, 'zn-navbar': ZnNavbar};

  @property({reflect: true}) layout: TranslationFieldsLayout = 'split';

  /** Hides every field's source, leaving only the translations. */
  @property({attribute: 'hide-source', type: Boolean, reflect: true}) hideSource = false;

  /** Names the source on the hide toggle, such as "Hide English". */
  @property({attribute: 'source-label'}) sourceLabel = 'English';

  /** Remembers the viewer's layout under this key in `localStorage`; leave empty to forget it. */
  @property({attribute: 'store-key'}) storeKey = 'zn-translation-fields-layout';

  connectedCallback() {
    super.connectedCallback();
    try {
      const stored = this.storeKey ? window.localStorage.getItem(this.storeKey) : null;
      if (stored === 'split' || stored === 'stacked') {
        this.layout = stored;
      }
      if (this.storeKey && window.localStorage.getItem(`${this.storeKey}-hide-source`) === '1') {
        this.hideSource = true;
      }
    } catch {
      // Storage can be blocked; the layout then starts as set
    }
  }

  private _choose(layout: TranslationFieldsLayout) {
    this.layout = layout;
    try {
      if (this.storeKey) {
        window.localStorage.setItem(this.storeKey, layout);
      }
    } catch {
      // The choice still applies, it just isn't remembered
    }
    this.emit('zn-change');
  }

  private _toggleSource() {
    this.hideSource = !this.hideSource;
    try {
      if (this.storeKey) {
        window.localStorage.setItem(`${this.storeKey}-hide-source`, this.hideSource ? '1' : '0');
      }
    } catch {
      // The choice still applies, it just isn't remembered
    }
    this.emit('zn-change');
  }

  render() {
    return html`
      <div part="base" class="translation-fields">
        <div class="translation-fields__bar">
          <zn-navbar slot="actions" pill size="small" isolated
                     .navigation=${LAYOUTS.map(option => ({
                       tab: option.layout,
                       title: option.label,
                       active: option.layout === this.layout,
                     }))}
                     @zn-select=${(e: CustomEvent<{ item: HTMLElement }>) =>
                       this._choose(e.detail.item.dataset.tab as TranslationFieldsLayout)}></zn-navbar>
          <div class="translation-fields__actions">
            <zn-button class="translation-fields__toggle" color="transparent" size="small"
                       icon=${this.hideSource ? 'eye@lu' : 'eye-off@lu'} icon-size="16"
                       aria-pressed=${this.hideSource ? 'true' : 'false'}
                       @click=${() => this._toggleSource()}>
              ${this.hideSource ? 'Show' : 'Hide'} ${this.sourceLabel}
            </zn-button>
            <slot name="actions"></slot>
          </div>
        </div>
        <slot></slot>
      </div>
    `;
  }
}
