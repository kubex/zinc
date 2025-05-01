import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS, type PropertyValues} from 'lit';
import ZincElement from '../../internal/zinc-element';
import type ZnButton from "../button";
import {watch} from "../../internal/watch";

import styles from './button-menu.scss';


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

  @property({type: Number, attribute: 'limit-buttons'})
  public limitButtons: number;

  private _buttons: CustomButtonWidths[] = [];
  private _originalButtons: CustomButtonWidths[] = [];

  private resizeObserver: ResizeObserver | null = null;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    const buttons = this.querySelectorAll<ZnButton>('zn-button');
    this._originalButtons = Array.from(buttons).map((button: ZnButton) => {
      return {
        button: button,
        width: button.offsetWidth
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
    this.containerWidth = this.parentNode ? (this.parentNode as HTMLElement).offsetWidth : 0;
  }

  calculateVisibleButtons() {
    const containerWidth = this.containerWidth;
    let visibleButtons = 0;
    let remainingWidth = containerWidth; // Some default padding

    this._buttons = [...this._originalButtons];


    // Calculate the number of visible buttons
    this._buttons.forEach((button: CustomButtonWidths, index: number) => {
      if (remainingWidth >= button.width) {
        // remove button width and some default padding and spacing
        remainingWidth -= (Math.min(200, button.width) + (20 * index));
        visibleButtons++;
      }
    })

    if (this.limitButtons) {
      // Limit the number of buttons to show
      visibleButtons = Math.min(visibleButtons, this.limitButtons);
    }

    // Remove all buttons from the ui and menu
    const container = this.shadowRoot?.querySelector('.zn-button-menu__container');
    if (container) {
      container.innerHTML = '';
    }

    const menu = this.shadowRoot?.querySelector('zn-menu');
    if (menu) {
      menu.innerHTML = '';
    }

    // Sort the buttons
    this._buttons.sort((a, b) => {
      const aWidth = a.button.hasAttribute('primary') ? 1 : a.button.hasAttribute('secondary') ? 2 : 3;
      const bWidth = b.button.hasAttribute('primary') ? 1 : b.button.hasAttribute('secondary') ? 2 : 3;

      return aWidth - bWidth;
    });


    // Add colors to the buttons depending on type
    this._buttons.forEach((button: CustomButtonWidths, index: number) => {
      if (index < visibleButtons) {
        this.shadowRoot?.querySelector('.zn-button-menu__container')?.appendChild(button.button);

        if (!button.button.hasAttribute('color')) {
          button.button.setAttribute('color', button.button.hasAttribute('primary') ? 'primary' : button.button.hasAttribute('secondary') ? 'secondary' : 'warning');
        }

      }
    });

    this.calculateMenuButtons(visibleButtons, this._buttons);
  }

  calculateMenuButtons(visibleButtons: number, buttons: CustomButtonWidths[]) {
    const menu = this.shadowRoot?.querySelector('zn-menu');
    const dropdown = this.shadowRoot?.querySelector('zn-dropdown');

    if (menu && dropdown) {
      // if there's any buttons to add to the menu
      if (visibleButtons !== buttons.length && visibleButtons > 0) {
        dropdown.removeAttribute('hidden');
        buttons.forEach((button: CustomButtonWidths, index: number) => {
          if (index >= visibleButtons) {
            const menuItem = document.createElement('zn-menu-item');
            menuItem.innerText = button.button.innerText;
            menu.appendChild(menuItem);
          }
        });
      } else {
        dropdown.setAttribute('hidden', '');
      }
    }
  }

  render() {
    return html`
      <div class="zn-button-menu">
        <div class="zn-button-menu__container"></div>
        <zn-dropdown placement="bottom-end">
          <zn-button slot="trigger" icon="more_vert" icon-size="24" color="transparent" size="content"></zn-button>
          <zn-menu></zn-menu>
        </zn-dropdown>
        <slot></slot>
      </div>`;
  }
}
