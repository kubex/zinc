import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query} from 'lit/decorators.js';
import {unlockBodyScrolling} from "../../internal/scroll";
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";

import styles from './dialog.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/dialog
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 *
 * @event zn-show - Emitted when the dialog is opens.
 * @event zn-close - Emitted when the dialog is closed.
 * @event {{ source: 'close-button' | 'keyboard' | 'overlay' }} zn-request-close - Emitted when the user attempts to
 * close the dialog by clicking the close button, clicking the overlay, or pressing escape. Calling
 * `event.preventDefault()` will keep the dialog open. Avoid using this unless closing the dialog will result in
 * destructive behavior such as data loss.
 *
 * @slot - The default slot.
 * @slot label - The dialog's label. Alternatively you can use the `label` attribute.
 * @slot header-icon - Optional icon to add to the left of the dialog's label (title). A color will be applied
 * to the icon depending on the dialog variant.
 * @slot announcement-intro - Optional Intro text to display below the icon, when using the variant `announcement`.
 * @slot header-actions - Optional actions to add to the header. Works best with `<zn-button>` elements.
 * @slot footer - The dialog's footer. This is typically used for buttons representing various options.
 * @slot footer-text - Optional text to include below the footer buttons, when using the variant `announcement`.
 *
 * @csspart base - The component's base wrapper.
 * @csspart header - The dialog's header. This element wraps the title and header actions.
 * @csspart header-actions - Optional actions to add to the header. Works best with `<zn-button>` elements.
 * @csspart title - The dialog's title.
 * @csspart close-button - The dialog's close button.
 * @csspart close-button__base - The close buttons exported `base` part.
 * @csspart body - The dialog's body.
 * @csspart footer - The dialog's footer.
 *
 * @cssproperty --width - The preferred width of the dialog. Note the dialog will shrink to accommodate smaller screens.
 * @cssproperty --header-spacing - The amount of padding to use for the header.
 * @cssproperty --body-spacing - The amount of padding to use for the body.
 * @cssproperty --footer-spacing - The amount of padding to use for the footer.
 */
export default class ZnDialog extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton
  };

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'footer');
  private closeWatcher: CloseWatcher | null;

  @query('.dialog') dialog: HTMLDialogElement;
  @query('.dialog__panel') panel: HTMLElement;
  @query('.dialog__overlay') overlay: HTMLElement;


  /** The dialog's theme variant. */
  @property({reflect: true}) variant: 'default' | 'warning' | 'announcement' = 'default';

  /** The dialog's size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Indicated whether of not the dialog is open. You can toggle this attribute to show and hide the dialog, or you can
   * use the `show()` and `hide()` methods and this attribute will reflect the dialog's state.
   */
  @property({type: Boolean, reflect: true}) open = false;

  /**
   * The dialog's label as displayed in the header. You should always include a relevant label even when using
   * `no-header`, as it is required for proper accessibility. If you need to display HTML, use the `label` slot instead.
   */
  @property({reflect: true}) label: string;

  @property({type: Boolean, reflect: true}) cosmic = false;

  /**
   * Disables the header. This will also remove the default close button, so please ensure you provide an easy,
   * accessible way to close the dialog.
   */
  @property({attribute: 'no-header', type: Boolean, reflect: true}) noHeader = false;

  /**
   * The dialog's trigger element. This is used to open the dialog when clicked. If you do not provide a trigger, you
   * will need to manually open the dialog using the `show()` method.
   */
  @property({type: String, reflect: true}) trigger: string;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.open) {
      this.show();
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', this.closeClickHandler);
    this.shadowRoot?.addEventListener('click', this.closeClickHandler);

    if (this.trigger) {
      const trigger = this.parentNode?.querySelector('#' + this.trigger);
      if (trigger) {
        trigger.addEventListener('click', () => this.show());
      }
    }
    if (window.CSS.registerProperty) {
      try {
        window.CSS.registerProperty({
          inherits: false,
          initialValue: '0deg',
          name: '--rotate',
          syntax: '<angle>',
        });
      } catch (e) {
        // do nothing
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dialog.close();
    unlockBodyScrolling(this)
    this.closeWatcher?.destroy();
    this.removeEventListener('click', this.closeClickHandler);

    if (this.trigger) {
      const trigger = this.parentElement?.querySelector('#' + this.trigger);
      if (trigger) {
        trigger.removeEventListener('click', () => this.show());
      }
    }
  }

  private requestClose(source: 'close-button' | 'keyboard' | 'overlay') {
    const znRequestClose = this.emit('zn-request-close', {
      cancelable: true,
      detail: {source}
    });

    if (znRequestClose.defaultPrevented) {
      return;
    }

    this.hide();
  }

  private addOpenListeners() {
    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => this.requestClose('keyboard');
    }
  }

  private removeOpenListeners() {
    this.closeWatcher?.destroy();
  }

  /** Shows the dialog. */
  show() {
    this.emit('zn-show');
    this.addOpenListeners();
    this.open = true;
    this.dialog.showModal();
  }

  /** Hides the dialog. */
  hide() {
    this.emit('zn-close');
    this.removeOpenListeners();
    this.open = false;
    this.dialog.close();
  }

  private closeClickHandler = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement && event.target.hasAttribute('dialog-closer')) {
      this.hide();
    }
  }

  render() {
    const hasFooter = this.hasSlotController.test('footer');

    return html`
      <dialog
        part="base"
        role="alertdialog"
        aria-modal="true"
        aria-hidden=${this.open ? 'false' : 'true'}
        aria-label=${ifDefined(this.noHeader ? this.label : undefined)}
        aria-labelledby=${ifDefined(!this.noHeader ? 'title' : undefined)}
        tabindex="-1"
        class=${classMap({
          dialog: true,
          'dialog--open': this.open,
          'dialog--has-header-icon': this.hasSlotController.test('header-icon'),
          'dialog--has-footer': hasFooter,
          'dialog--default': this.variant === 'default',
          'dialog--warning': this.variant === 'warning',
          'dialog--announcement': this.variant === 'announcement',
          'dialog--small': this.size === 'small',
          'dialog--medium': this.size === 'medium',
          'dialog--large': this.size === 'large',
          'dialog--cosmic': this.cosmic
        })}>

        <div class=${classMap({
          'dialog-container': true,
        })}>

          ${!this.noHeader ? html`
            <header part="header" class="dialog__header">
              <h2 part="title" class="dialog__title" id="title">
                <slot name="header-icon"></slot>
                <slot name="announcement-intro"></slot>
                <slot name="label"> ${this.label && this.label.length > 0 ? this.label : String.fromCharCode(65279)}
                </slot>
              </h2>
              <div part="header-actions" class="dialog__header-actions">
                <slot name="header-actions"></slot>
                <zn-button
                  part="close-button"
                  exportparts="base:close-button__base"
                  class="dialog__close"
                  icon="close"
                  icon-size="24"
                  type="button"
                  color="transparent"
                  size="content"
                  @click="${() => this.requestClose('close-button')}"
                ></zn-button>
              </div>
            </header>` : ''}

          <div part="body" class="dialog__body" tabindex="-1">
            <slot></slot>
          </div>

          <footer part="footer" class="dialog__footer">
            <slot name="footer"></slot>
            <slot name="footer-text"></slot>
          </footer>
        </div>
      </dialog>
    `;
  }
}
