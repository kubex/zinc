import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {isNavigationCollapsed, onNavigationCollapse} from '../../utilities/navigation';
import {property} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';

import styles from './menu-label.scss';

/**
 * @summary A heading for a group of items in a `zn-menu`, or a section of an app sidebar. It is skipped by the menu's keyboard
 * navigation.
 * @documentation https://zinc.style/components/menu
 * @status experimental
 * @since 1.0
 *
 * @slot - The label text.
 * @slot actions - Controls at the end of the heading, such as a settings dropdown's trigger. They stay faint until the
 * heading is hovered or focused, or a dropdown among them is open.
 *
 * @csspart base - The component's base wrapper.
 * @csspart label - The label text.
 *
 * @cssproperty --zn-menu-label-padding - Space around the label.
 * @cssproperty --zn-menu-label-color - The label's text colour.
 */
export default class ZnMenuLabel extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** The heading's look: a menu's, or an app sidebar's section heading. */
  @property({reflect: true}) variant: 'default' | 'navigation' = 'default';

  /** Draws a `navigation` heading as a dot, following the shell's sidebar (see setNavigationCollapsed). */
  @property({type: Boolean, reflect: true}) collapsed = false;

  private readonly hasSlotController = new HasSlotController(this, 'actions');
  private stopFollowingNavigation?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'presentation');
    this.stopFollowingNavigation = onNavigationCollapse(collapsed => {
      if (this.variant === 'navigation') this.collapsed = collapsed;
    });
    this.handleVariantChange();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopFollowingNavigation?.();
  }

  @watch('variant')
  handleVariantChange() {
    const collapsed = isNavigationCollapsed();
    if (this.variant === 'navigation' && collapsed !== undefined) this.collapsed = collapsed;
  }

  render() {
    const hasActions = this.hasSlotController.test('actions');
    return html`
      <div part="base" class="menu-label${hasActions ? ' menu-label--has-actions' : ''}">
        <span part="label" class="menu-label__text"><slot></slot></span>
        <slot name="actions" class="menu-label__actions"></slot>
      </div>`;
  }
}
