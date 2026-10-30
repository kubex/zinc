import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './translation-field.scss';

/**
 * @summary A field's source text beside the control that translates it.
 * @documentation https://zinc.style/components/translation-field
 * @status experimental
 * @since 1.0
 *
 * @slot - The control the translation is written in, such as a `zn-input` with the language code as its prefix.
 * @slot source - The source text, shown read-only.
 * @slot actions - Actions beside the label.
 *
 * @csspart base - The component's base wrapper.
 * @csspart source - The box holding the source.
 */
export default class ZnTranslationField extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() label = '';

  /** The source's language code, shown beside it. */
  @property({attribute: 'source-code'}) sourceCode = '';

  /** For source text that runs over several lines, such as a message body. */
  @property({type: Boolean, reflect: true}) multiline = false;

  /** Lines the source up with a control that has a toolbar above it, such as a compact `zn-editor`. */
  @property({type: Boolean, reflect: true}) offset = false;

  render() {
    return html`
      <div part="base" class="translation-field">
        <div class="translation-field__label">
          <b>${this.label}</b>
          <slot name="actions"></slot>
        </div>
        <div class="translation-field__pair">
          <div part="source" class=${classMap({
            'translation-field__source': true,
            'translation-field__source--multiline': this.multiline,
          })}>
            <span class="translation-field__code">${this.sourceCode.toUpperCase()}</span>
            <div class="translation-field__text"><slot name="source"></slot></div>
          </div>
          <div class="translation-field__target"><slot></slot></div>
        </div>
      </div>
    `;
  }
}
