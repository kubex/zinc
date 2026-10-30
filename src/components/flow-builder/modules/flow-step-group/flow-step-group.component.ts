import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnCollapsible from '../../../collapsible';

import styles from './flow-step-group.scss';

/**
 * @summary A collapsible category of `<zn-flow-step>`s inside a `<zn-flow-steps>` (typically a `<zn-tabs>` panel).
 *   Wraps `<zn-collapsible>` for the standard expand/collapse behaviour and spacing.
 * @documentation https://zinc.style/components/flow-step-group
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-collapsible
 *
 * @slot - The group's `<zn-flow-step>`s.
 */
export default class ZnFlowStepGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {'zn-collapsible': ZnCollapsible};

  @property() caption: string;
  /** Start collapsed. Defaults to open. */
  @property({type: Boolean, reflect: true}) collapsed = false;

  render() {
    return html`
      <zn-collapsible caption="${this.caption ?? ''}" default="${this.collapsed ? 'closed' : 'open'}">
        <slot></slot>
      </zn-collapsible>
    `;
  }
}
