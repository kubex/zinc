import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {LocalizeController} from '../../utilities/localize';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';

import styles from './empty-dialog.scss';

/**
* @summary Short summary of the component's intended use.
* @documentation https://zinc.style/components/empty-dialog
* @status experimental
* @since 1.0
*
* @dependency zn-example
*
* @event zn-event-name - Emitted as an example.
*
* @slot - The default slot.
* @slot example - An example slot.
*
* @csspart base - The component's base wrapper.
*
* @cssproperty --example - An example CSS custom property.
*/
export default class ZnEmptyDialog extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  /** An example attribute. */
  @property() attr = 'example';

  @watch('example')
  handleExampleChange() {
    // do something
  }

  render() {
    return html` <slot></slot> `;
  }
}
