import {unsafeCSS} from "lit";
import styles from './index.scss?inline';
import {ZincElement} from "../zinc-element";
import {customElement, property} from "lit/decorators.js";

@customElement('zn-sp')
export class Spacer extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'divide', type: Boolean, reflect: true}) divide;

  connectedCallback()
  {
    super.connectedCallback();
    if(this.divide)
    {
      this.classList.add('zn-divide');
    }
  }

  createRenderRoot()
  {
    return this;
  }
}


