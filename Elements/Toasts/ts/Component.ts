import {customElement} from "lit/decorators.js";
import {unsafeCSS} from "lit";

// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-toasts-container')
export class ZincToastsContainer extends ZincElement {

  static get styles() {
    return [unsafeCSS(styles)]
  }

  render() {
    
  }
}
