import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './translation-fields.scss';

export type TranslationFieldsLayout = 'split' | 'stacked';

const LAYOUTS: { layout: TranslationFieldsLayout, label: string, icon: string }[] = [
  {layout: 'split', label: 'Side by side', icon: 'columns-2@lu'},
  {layout: 'stacked', label: 'Stacked', icon: 'rows-2@lu'},
];

/**
 * @summary Lays out `zn-translation-field`s with their source beside or above the translation, chosen by the viewer.
 * @documentation https://zinc.style/components/translation-fields
 * @status experimental
 * @since 1.0
 *
 * @slot - The `zn-translation-field`s.
 * @slot actions - Actions level with the layout switch.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnTranslationFields extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) layout: TranslationFieldsLayout = 'split';

  /** Remembers the viewer's layout under this key in `localStorage`; leave empty to forget it. */
  @property({attribute: 'store-key'}) storeKey = 'zn-translation-fields-layout';

  connectedCallback() {
    super.connectedCallback();
    try {
      const stored = this.storeKey ? window.localStorage.getItem(this.storeKey) : null;
      if (stored === 'split' || stored === 'stacked') {
        this.layout = stored;
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

  render() {
    return html`
      <div part="base" class="translation-fields">
        <div class="translation-fields__bar">
          <div class="translation-fields__switch" role="group" aria-label="Layout">
            ${LAYOUTS.map(option => html`
              <button type="button"
                      class=${classMap({
                        'translation-fields__option': true,
                        'translation-fields__option--active': option.layout === this.layout,
                      })}
                      aria-pressed=${option.layout === this.layout ? 'true' : 'false'}
                      @click=${() => this._choose(option.layout)}>
                <zn-icon src=${option.icon} size="16"></zn-icon>${option.label}
              </button>`)}
          </div>
          <slot name="actions"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }
}
