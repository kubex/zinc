import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import type ZnButton from "../button";
import type ZnMenuItem from "../menu-item";

import styles from './button-menu.scss';
import ZnConfirm from "../confirm";


interface CustomButtonWidths {
  button: ZnButton;
  width: number;
}

/**
 * @summary Automatically hides buttons in a menu when the screen is too small.
 * @documentation https://zinc.style/components/button-menu
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 *
 */
export default class ZnButtonMenu extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Number, attribute: 'max-width'})
  public maxWidth: number;

  @property({type: Number})
  public containerWidth: number;

  @property({type: Number, attribute: 'limit'})
  public limit: number = -1;

  @property({type: Number, attribute: 'max-level'})
  public maxLevel: number = 2; // primary = 1, secondary = 2, transparent = 3

  @property({type: Boolean, attribute: 'no-gap'}) public noGap: boolean;
  @property({type: Boolean, attribute: 'no-padding'}) public noPadding: boolean;

  private _buttons: CustomButtonWidths[] = [];
  private _originalButtons: CustomButtonWidths[] = [];

  private resizeObserver: ResizeObserver | null = null;


  protected async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    const buttons = this.querySelectorAll<ZnButton>('zn-button');

    for (const button of buttons) {
      // wait for the buttons to finish rendering
      await button.updateComplete;
    }

    this._originalButtons = Array.from(buttons).map((button: ZnButton) => {
      return {
        button: button,
        width: Math.max(button.offsetWidth, 150)
      }
    });

    // remove buttons
    this.querySelectorAll('zn-button').forEach((button: ZnButton) => {
      button.remove();
    });

    this.containerWidth = this.parentNode ? (this.parentNode as HTMLElement).offsetWidth : 0;
    if (this.maxWidth) {
      this.containerWidth = Math.min(this.containerWidth, this.maxWidth);
    }
  }

  @watch('containerWidth', {waitUntilFirstUpdate: true})
  watchContainerMaxWidth() {
    if (this.maxWidth) {
      this.containerWidth = Math.min(this.containerWidth, this.maxWidth);
    }
    this.calculateVisibleButtons();
  }

  connectedCallback() {
    super.connectedCallback();
    this.containerWidth = this.offsetWidth;

    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(this.parentNode as HTMLElement); // Observe the parent node
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  handleResize = () => {
    this.containerWidth = this.offsetWidth;
  }

  calculateVisibleButtons() {
    const containerWidth = this.containerWidth;

    let primaryButtons = 0;
    let secondaryButtons = 0;

    let visibleButtons = 0;
    let totalButtons = 0;
    let remainingWidth = containerWidth;
    this._buttons = [...this._originalButtons];
    remainingWidth -= 50; // Allow for more-vert button

    // Sort the buttons
    this._buttons.sort((a, b) => {
      const aWidth = a.button.hasAttribute('primary') ? 1 : a.button.hasAttribute('secondary') ? 2 : 3;
      const bWidth = b.button.hasAttribute('primary') ? 1 : b.button.hasAttribute('secondary') ? 2 : 3;

      return aWidth - bWidth;
    });

    // Calculate the number of visible buttons
    this._buttons.forEach((button: CustomButtonWidths) => {
      totalButtons++;
      if (button.button.hasAttribute('primary')) {
        primaryButtons++;
      } else if (button.button.hasAttribute('secondary')) {
        secondaryButtons++;
      }
      // remove button width and some default padding and spacing
      if ((remainingWidth - button.width) > 0) {
        remainingWidth -= button.width;
        visibleButtons++;
      } else {
        remainingWidth = 0
      }
    })

    if (this.maxLevel < 2) {
      this.limit = this.limit > 0 ? Math.min(this.limit, primaryButtons) : primaryButtons;
    } else if (this.maxLevel < 3) {
      this.limit = this.limit > 0 ? Math.min(this.limit, primaryButtons + secondaryButtons) : primaryButtons + secondaryButtons;
    }

    if (this.limit > -1) {
      // Limit the number of buttons to show
      visibleButtons = Math.min(visibleButtons, this.limit);
    }

    // Remove all buttons from the ui and menu
    const container = this.shadowRoot?.querySelector('.button-menu__container');
    if (container) {
      container.innerHTML = '';
    }

    const menu = this.shadowRoot?.querySelector('zn-menu');
    if (menu) {
      menu.innerHTML = '';
    }

    // Add colors to the buttons depending on type
    this._buttons.forEach((button: CustomButtonWidths, index: number) => {
      if (index < visibleButtons) {
        this.shadowRoot?.querySelector('.button-menu__container')?.appendChild(button.button);

        if (!button.button.hasAttribute('color')) {
          button.button.setAttribute('color', button.button.hasAttribute('primary') ? 'primary' : button.button.hasAttribute('secondary') ? 'secondary' : 'transparent');
        }

      }
    });

    this.calculateMenuButtons(totalButtons, visibleButtons, this._buttons);
  }

  calculateMenuButtons(totalButtons: number, visibleButtons: number, buttons: CustomButtonWidths[]) {
    const menu = this.shadowRoot?.querySelector('zn-menu');
    const dropdown = this.shadowRoot?.querySelector('zn-dropdown');

    if (menu && dropdown) {
      const categories = new Set<string>();
      // list of menu items ID by category
      const menuItems: { [key: string]: Element[] } = {};

      dropdown.toggleAttribute('hidden', buttons.length === 0 || buttons.length <= visibleButtons)

      // if there's any buttons to add to the menu
      if (visibleButtons !== buttons.length && totalButtons > 0) {
        buttons.forEach((button: CustomButtonWidths, index: number) => {
          if (index >= visibleButtons) {
            const menuItem = document.createElement('zn-menu-item');
            menuItem.innerText = button.button.innerText;

            const attr = button.button.attributes;
            // Copy all attributes from the button to the menu item
            for (let i = 0; i < attr.length; i++) {
              const attribute = attr[i];
              if (attribute.name !== 'icon' && attribute.name !== 'category') {
                menuItem.setAttribute(attribute.name, attribute.value);
              }
            }

            const icon = button.button.getAttribute('icon');
            if (icon) {
              const iconElement = document.createElement('zn-icon');
              iconElement.setAttribute('src', icon);
              iconElement.setAttribute('size', '18');
              iconElement.setAttribute('slot', 'prefix');
              menuItem.appendChild(iconElement);
            }

            const category: string = button.button.getAttribute('category') || 'default'
            categories.add(category);

            if (!menuItems[category]) {
              menuItems[category] = [];
            }

            menuItems[category].push(menuItem);
          }
        });

        categories.forEach((category: string) => {
          if (category === 'default') {
            menuItems[category].forEach((item: Element) => {
              menu.appendChild(item);
            });
            // if only 1 catefory item
          } else if (menuItems[category].length === 1) {
            const menuItem = menuItems[category][0] as ZnMenuItem;
            menu.appendChild(menuItem);
          } else {
            const menuItem = document.createElement('zn-menu-item');
            // uppercase the first letter of the category
            menuItem.innerText = category.charAt(0).toUpperCase() + category.slice(1);
            const submenu = document.createElement('zn-menu');
            submenu.setAttribute('slot', 'submenu');

            menuItems[category].forEach((item: Element) => {
              submenu.appendChild(item);
            });

            menuItem.appendChild(submenu);
            menu.appendChild(menuItem);
          }
        })
      }
    }

    // check if there are an zn-confirms attached
    const confirms: NodeListOf<ZnConfirm> = this.querySelectorAll('zn-confirm');
    confirms.forEach(confirm => {
      confirm.updateTriggers(); // update the triggers for the confirm dialog
    })
  }

  render() {
    return html`
      <div class=${classMap({
      'button-menu': true,
      'button-menu--no-padding': this.noPadding,
      'button-menu--no-gap': this.noGap,
    })}>
        <div class="button-menu__container"></div>
        <zn-dropdown placement="bottom-end">
          <zn-button slot="trigger" icon="more_vert" icon-size="24" color="transparent" size="content"></zn-button>
          <zn-menu></zn-menu>
        </zn-dropdown>
        <slot></slot>
      </div>`;
  }
}
