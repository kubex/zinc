import {animateTo} from "../../internal/animate";
import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {LocalizeController} from "../../utilities/localize";
import {property, query} from 'lit/decorators.js';
import {getAnimation, setDefaultAnimation} from "../../utilities/animation-registry";
import {unlockBodyScrolling} from "../../internal/scroll";
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";

import styles from './slideout.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/slideout
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 *
 * @event zn-show - Emitted when the slideout is opens.
 * @event zn-close - Emitted when the slideout is closed.
 * @event {{ source: 'close-button' | 'keyboard' | 'overlay' }} zn-request-close - Emitted when the user attempts to
 * close the slideout by clicking the close button, clicking the overlay, or pressing escape. Calling
 * `event.preventDefault()` will keep the slideout open. Avoid using this unless closing the slideout will result in
 * destructive behavior such as data loss.
 *
 * @slot - The default slot.
 * @slot label - The slideout's label. Alternatively you can use the `label` attribute.
 *
 * @csspart base - The component's base wrapper.
 * @csspart header - The slideout's header. This element wraps the title and header actions.
 * @csspart close-button - The slideout's close button.
 * @csspart close-button__base - The close buttons exported `base` part.
 * @csspart body - The slideout's body.
 *
 * @cssproperty --width - The preferred width of the slideout. Note the slideout will shrink to accommodate smaller screens.
 * @cssproperty --header-spacing - The amount of padding to use for the header.
 * @cssproperty --body-spacing - The amount of padding to use for the body.
 */
export default class ZnSlideout extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton
  };

  private readonly localize = new LocalizeController(this);
  private closeWatcher: CloseWatcher | null;

  @query('.slideout') slideout: HTMLDialogElement;
  @query('.slideout__panel') panel: HTMLElement;
  @query('.slideout__overlay') overlay: HTMLElement;

  /**
   * Indicated whether of not the slideout is open. You can toggle this attribute to show and hide the slideout, or you can
   * use the `show()` and `hide()` methods and this attribute will reflect the slideout's state.
   */
  @property({type: Boolean, reflect: true}) open = false;

  /**
   * The slideout's label as displayed in the header. You should always include a relevant label even when using
   * `no-header`, as it is required for proper accessibility. If you need to display HTML, use the `label` slot instead.
   */
  @property({reflect: true}) label: string;

  /**
   * The slideout's trigger element. This is used to open the slideout when clicked. If you do not provide a trigger, you
   * will need to manually open the slideout using the `show()` method.
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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.slideout.close();
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

  /** Shows the slideout. */
  async show() {
    this.emit('zn-show');
    this.addOpenListeners();
    this.open = true;
    this.slideout.showModal();

    const {keyframes, options} = getAnimation(this, 'slideout.show', {dir: this.localize.dir()});
    await animateTo(this.slideout, keyframes, options);
  }

  /** Hides the slideout. */
  async hide() {
    this.emit('zn-close');
    this.removeOpenListeners();

    const {keyframes, options} = getAnimation(this, 'slideout.hide', {dir: this.localize.dir()});
    await animateTo(this.slideout, keyframes, options);

    this.open = false;
    this.slideout.close();
  }

  private closeClickHandler = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement && event.target.hasAttribute('slideout-closer')) {
      this.hide();
    }
  }

  render() {
    return html`
      <dialog
        part="base"
        role="alertdialog"
        aria-modal="true"
        aria-hidden=${this.open ? 'false' : 'true'}
        aria-label=${this.label}
        tabindex="-1"
        class=${classMap({
          slideout: true,
          'slideout--open': this.open,
          'slideout--default': true
        })}>

        <header part="header" class="slideout__header">
          <h2 part="title" class="slideout__title" id="title">
            <slot name="label"> ${this.label && this.label.length > 0 ? this.label : String.fromCharCode(65279)}</slot>
          </h2>
          <div part="header-actions" class="slideout__header-actions">
            <zn-button
              part="close-button"
              exportparts="base:close-button__base"
              class="slideout__close"
              icon="close"
              icon-size="24"
              type="button"
              color="transparent"
              size="content"
              @click="${() => this.requestClose('close-button')}"
            ></zn-button>
          </div>
        </header>

        <div part="body" class="slideout__body" tabindex="-1">
          <slot></slot>
        </div>

        <footer part="footer" class="slideout__footer">
          <slot name="footer"></slot>
        </footer>

      </dialog>
    `;
  }
}

setDefaultAnimation('slideout.show', {
  keyframes: [
    {transform: 'translateX(100%)', opacity: 0},
    {transform: 'translateX(0)', opacity: 1}
  ],
  options: {duration: 150, easing: 'ease'}
});

setDefaultAnimation('slideout.hide', {
  keyframes: [
    {transform: 'translateX(0)', opacity: 1},
    {transform: 'translateX(100%)', opacity: 0}
  ],
  options: {duration: 150, easing: 'ease'}
});
