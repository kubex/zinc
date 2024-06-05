import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {classMap} from "lit/directives/class-map.js";
import {PropertyValues} from "@lit/reactive-element";
import {Popup} from "@/Popup";
import {watch} from "@/watch";
import {ZincSlotElement} from "@/zinc-slot-element";

@customElement('zn-tooltip')
export class Tooltip extends ZincSlotElement
{
  static styles = unsafeCSS(styles);

  private hoverTimeout: number;

  @property({type: Boolean, reflect: true}) open = false;

  @property({attribute: 'caption', type: String, reflect: true}) caption;

  @property({reflect: true}) placement: | 'top' | 'bottom' | 'right' | 'left' = 'top';

  @query('.tooltip__body') body: HTMLElement;

  @query('zn-popup') popup: Popup;

  constructor()
  {
    super();
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
  }

  disconnectedCallback()
  {
    super.disconnectedCallback();
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    if(this.open)
    {
      this.body.hidden = false;
      this.popup.active = true;
      this.popup.reposition();
    }
  }

  // add click event to handle the menu
  connectedCallback()
  {
    super.connectedCallback();
    this.addEventListener('click', () =>
    {
      if(this.classList.contains('notification'))
      {
        this.classList.remove('notification');
      }
    });
  }

  private handleMouseOver(e)
  {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = window.setTimeout(() => this.show(), 0);
  }

  private handleMouseOut(e)
  {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = window.setTimeout(() => this.hide(), 0);
  }


  @watch('open', {waitUntilFirstUpdate: true})
  handleOpenChange()
  {
    if(this.open)
    {
      console.log('open');
      this.popup.active = true;
      this.popup.reposition();
      this.body.hidden = false;
    }
    else
    {
      this.popup.active = false;
      this.body.hidden = true;
    }
  }

  show()
  {
    console.log('show');
    return this.open = true;
  }

  hide()
  {
    console.log('hide');
    return this.open = false;
  }

  render()
  {
    return html`
      <zn-popup
        class="${classMap({
          'tooltip': true,
          'tooltip--open': this.open
        })}"
        strategy="fixed"
        distance="6"
        placement="${this.placement}"
        flip
        shift
        arrow
        flip-fallback-placements="top left"
        hover-bridge>
        <div slot="anchor">${this.renderSlot('')}</div>
        <div part="body" id="tooltip" class="tooltip__body">
          ${this.caption}
          ${this.renderSlot('content')}
        </div>
      </zn-popup>`;
  }
}


