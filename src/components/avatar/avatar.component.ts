import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './avatar.scss?inline';
import { classMap } from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/avatar
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
export default class ZnAvatar extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() avatar: string = '';

  getRandomColorCssVar() {
    const colors = [
      'var(--zn-primary)',
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  protected firstUpdated() {
    this.style.setProperty('--avatar-background-color', this.getRandomColorCssVar());
  }

  render() {
    // if avatar is 2 characters long, use them as content
    if (this.avatar.length === 2) {
      return html`
        <div class="${classMap({ 'avatar': true })}">
          <span class="${classMap({ 'avatar__text': true })}">${this.avatar}</span>
        </div>`;
    } else {
      return html`
        <div class="${classMap({ 'avatar': true })}">
          <zn-icon src="${this.avatar}" size="24"></zn-icon>
        </div>`;
    }
  }
}
