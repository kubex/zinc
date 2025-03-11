import {property, query} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import {classMap} from "lit/directives/class-map.js";
import {ifDefined} from "lit/directives/if-defined.js";
import {getTabbableBoundary} from "../../internal/tabbable";
import {waitForEvent} from "../../internal/event";
import type ZnButton from "../button";
import type ZnPopup from "../popup";
import type ZnMenu from "../menu";

import styles from './dropdown.scss';
import {ZnSelectEvent} from "../../events/zn-select";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/dropdown
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
export default class ZnDropdown extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @query('.dropdown') popup: ZnPopup;
  @query('.dropdown__trigger') trigger: HTMLSlotElement;
  @query('.dropdown__panel') panel: HTMLSlotElement;

  private closeWatcher: CloseWatcher | null;

  /** Indicates whether the dropdown is open */
  @property({type: Boolean, reflect: true}) open: boolean = false;

  /** The placement of the dropdown. Note the actual placement may vary based on the available space */
  @property({reflect: true}) placement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' |
    'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' = 'bottom-start';

  /** Disable the dropdown */
  @property({type: Boolean, reflect: true}) disabled: boolean = false;

  /** By default, the dropdown will close when an item is selected. Set this to true to keep the dropdown open */
  @property({attribute: 'stay-open-on-select', type: Boolean, reflect: true}) stayOpenOnSelect: boolean = false;

  /** The dropdown will close when the user interacts outside the element**/
  @property({attribute: false}) containingElement?: HTMLElement;

  /** The distance in pixels from which to offset the panel away from the trigger */
  @property({type: Number}) distance: number = 0;

  /** The distance in pixels from which to offset the panel away from the trigger */
  @property({type: Number}) skidding: number = 0;

  /** Enable this option if the parent is overflow hidden and the dropdown is not visible */
  @property({type: Boolean}) hoist: boolean = true;

  /** Syncs the popup width or height with the trigger element */
  @property({reflect: true}) sync: 'width' | 'height' | 'both' | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();

    if (!this.containingElement) {

      this.containingElement = this;
    }
  }

  public focusOnTrigger() {
    const trigger = this.trigger?.assignedElements({flatten: true})[0] as HTMLElement | undefined;
    if (typeof trigger?.focus === 'function') {
      trigger.focus();
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.panel.hidden = !this.open;

    if (this.open) {
      this.addOpenListeners();
      this.popup.active = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
    this.hide();
  }

  private getMenu() {
    return this.panel.assignedElements({flatten: true}).find(el => el.tagName.toLowerCase() === 'zn-menu') as
      ZnMenu | undefined;
  }

  private addOpenListeners() {
    this.panel.addEventListener('zn-select', this.handlePanelSelect);
    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => {
        this.hide();
        this.focusOnTrigger();
      };
    } else {
      this.panel.addEventListener('keydown', this.handleKeyDown);
    }
    document.addEventListener('keydown', this.handleDocumentKeyDown.bind(this));
    document.addEventListener('mousedown', this.handleDocumentMouseDown.bind(this));

    this.closeWatcher?.destroy();
  }

  private removeOpenListeners() {
    if (this.panel) {
      this.panel.removeEventListener('zn-select', this.handlePanelSelect);
      this.panel.removeEventListener('keydown', this.handleKeyDown);
    }
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    this.closeWatcher?.destroy();
  }

  /** Events */
  handlePanelSelect = (event: ZnSelectEvent) => {
    const target = event.target as HTMLElement;
    if (!this.stayOpenOnSelect && target.tagName.toLowerCase() === 'zn-menu') {
      this.hide();
      this.focusOnTrigger();
    }
  }

  handleTriggerClick() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
      this.focusOnTrigger();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.open && event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
      this.focusOnTrigger();
    }
  }

  private async handleTriggerKeyDown(event: KeyboardEvent) {
    if ([' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
      this.handleTriggerClick();
      return;
    }

    const menu = this.getMenu();
    if (menu) {
      const menuItems = menu.getAllItems();
      const firstMenuItem = menuItems[0];
      const lastMenuItem = menuItems[menuItems.length - 1];

      // When up/down is pressed, we make the assumption the user is familiar with the menu and wants to navigate it
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();

        // Show the menu if it's not already open
        if (!this.open) {
          this.show();

          // Wait for the dropdown to open before focusing but not the animation
          await this.updateComplete;
        }

        if (menuItems.length > 0) {
          // Focus on the first/last menu item after showing
          this.updateComplete.then(() => {
            if (event.key === 'ArrowDown' || event.key === 'Home') {
              menu.setCurrentItem(firstMenuItem);
              firstMenuItem.focus();
            }

            if (event.key === 'ArrowUp' || event.key === 'End') {
              menu.setCurrentItem(lastMenuItem);
              lastMenuItem.focus();
            }
          });
        }
      }
    }
  }

  private handleTriggerKeyUp(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  private handleTriggerSlotChange() {
    this.updateAccessibleTrigger();
  }

  private handleDocumentMouseDown(event: MouseEvent) {
    const path = event.composedPath();

    if (this.containingElement && !path.includes(this.containingElement)) {
      this.hide();
    }
  }

  handleDocumentKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.open && !this.closeWatcher) {
      event.stopPropagation();
      this.focusOnTrigger();
      this.hide();
      return;
    }

    if (event.key === 'Tab') {
      if (this.open && document.activeElement?.tagName.toLowerCase() === 'zn-menu-item') {
        event.preventDefault();
        this.hide();
        this.focusOnTrigger();
        return;
      }

      setTimeout(() => {
        const activeElement =
          this.containingElement?.getRootNode() instanceof ShadowRoot
            ? document.activeElement?.shadowRoot?.activeElement
            : document.activeElement;

        if (!this.containingElement || activeElement?.closest(this.containingElement.tagName.toLowerCase()) !== this.containingElement) {
          this.hide();
        }
      });
    }
  }

  /** Opens the dropdown */
  async show() {
    if (this.open) return undefined;

    this.open = true;
    return waitForEvent(this, 'zn-after-show');
  }

  /** Closes the dropdown */
  async hide() {
    if (!this.open) return undefined;

    this.open = false;
    return waitForEvent(this, 'zn-after-hide');
  }

  /** Instructs the dropdown to reposition itself */
  reposition() {
    this.popup.reposition();
  }

  /** Aria related method */
  private updateAccessibleTrigger() {
    const assignedElements = this.trigger.assignedElements({flatten: true}) as HTMLElement[];
    const accessibleTrigger = assignedElements.find(el => getTabbableBoundary(el).start);
    let target: HTMLElement | null = null;

    if (accessibleTrigger) {
      switch (accessibleTrigger.tagName.toLowerCase()) {
        case 'zn-button':
          target = (accessibleTrigger as ZnButton).button;
          break;
        default:
          target = accessibleTrigger;
      }
    }

    if (target) {
      target.setAttribute('aria-haspopup', 'true');
      target.setAttribute('aria-expanded', this.open.toString());
    }
  }

  @watch('open', {waitUntilFirstUpdate: true})
  async handleOpenChange() {
    if (this.disabled) {
      this.open = false;
      return;
    }

    this.updateAccessibleTrigger();

    if (this.open) {
      this.emit('zn-show');
      this.addOpenListeners();
      this.panel.hidden = false;
      this.popup.active = true;
      this.emit('zn-after-show');
    } else {
      this.emit('zn-hide');
      this.removeOpenListeners();
      this.panel.hidden = true;
      this.popup.active = false;
      this.emit('zn-after-hide');
    }
  }

  render() {
    return html`
      <zn-popup
        part="base"
        exportparts="popup:base__popup"
        id="dropdown"
        placement=${this.placement}
        skidding=${this.skidding}
        strategy=${this.hoist ? 'fixed' : 'absolute'}
        flip
        shift
        auto-size="vertical"
        auto-size-padding="10"
        sync=${ifDefined(this.sync ? this.sync : undefined)}
        class=${classMap({
          dropdown: true,
          'dropdown--open': this.open
        })}>
        <slot
          name="trigger"
          slot="anchor"
          part="trigger"
          class="dropdown__trigger"
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeyDown}
          @keyup=${this.handleTriggerKeyUp}
          @slotchange=${this.handleTriggerSlotChange}
        ></slot>

        <div aria-hidden=${this.open ? 'false' : 'true'} aria-labelledby="dropdown">
          <slot part="panel" class="dropdown__panel"></slot>
        </div>
      </zn-popup>
    `
      ;
  }
}
