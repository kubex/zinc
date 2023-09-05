import {html, LitElement, unsafeCSS} from 'lit'
import {customElement, property} from 'lit/decorators.js'

import styles from './chat-container.scss';

@customElement('zn-chat-container')
export class ChatContainer extends LitElement {
  static styles = unsafeCSS(styles);

  @property({type: String})
  private heading = 'default header';

  @property({type: String})
  private subHeading = 'default subheading';

  render() {
    return html`
      <div>
        <div class="header">
          <h3>${this.subHeading}</h3>
          <h2>${this.heading}</h2>
        </div>
        <div class="container">
          <slot></slot>
        </div>
      </div>`
  }
}
