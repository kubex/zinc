import {html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type {CSSResultGroup} from 'lit';
import type {SlashMenuItem} from '../slash-menu';

import styles from './slash-item.scss';

/**
 * @summary Declares a single insertion for a slash menu. Renders nothing itself — it describes an
 *  entry for the component it is slotted into, e.g. `<zn-textarea>`'s `slash-items` slot.
 * @documentation https://zinc.style/components/slash-item
 * @status experimental
 * @since 1.1
 *
 * @slot - The text to insert, for values that are long or span multiple lines. Ignored when the
 *  `value` attribute is set.
 */
export default class ZnSlashItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** The text shown in the menu. */
  @property() label = '';

  /** The text inserted into the field. Falls back to this element's text content. */
  @property() value: string;

  /** Icon shown against the item, e.g. `tag@lu`. */
  @property() icon: string;

  /** Supporting text shown under the label. */
  @property() description: string;

  /** Extra terms the item can be found by, comma separated. */
  @property() keywords: string;

  /** Heading the item is listed under. */
  @property() group: string;

  /** Overrides the item's position in the menu. Lower sorts first. */
  @property({type: Number}) order: number;

  /** Where the caret lands after insertion, as an offset into the inserted value. */
  @property({attribute: 'caret-offset', type: Number}) caretOffset: number;

  /** Identifier passed through on `zn-slash-select`, for items that do something other than insert. */
  @property() action: string;

  /** Listed, but not selectable. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** The item as the slash menu consumes it. */
  toSlashMenuItem(): SlashMenuItem {
    return {
      label: this.label || this.insertValue,
      value: this.insertValue,
      icon: this.icon,
      description: this.description,
      keywords: this.keywords,
      group: this.group,
      order: this.order,
      action: this.action,
      caretOffset: this.caretOffset,
      disabled: this.disabled
    };
  }

  private get insertValue(): string {
    return this.value ?? (this.textContent ?? '').trim();
  }

  render() {
    return html`
      <slot></slot>`;
  }
}
