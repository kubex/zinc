import { html, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { ZincElement } from "@/zinc-element";
import { classMap } from "lit/directives/class-map.js";

import styles from './index.scss?inline';

@customElement('zn-avatar')
export class Avatar extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property() avatar: string = '';

  getRandomColorCssVar()
  {
    const colors = [
      'var(--zn-primary)',
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  protected firstUpdated()
  {
    this.style.setProperty('--avatar-background-color', this.getRandomColorCssVar());
  }

  render()
  {
    // if avatar is 2 characters long, use them as content
    if(this.avatar.length === 2)
    {
      return html`
        <div class="${classMap({ 'avatar': true })}">
          <span class="${classMap({ 'avatar__text': true })}">${this.avatar}</span>
        </div>`;
    }
    else
    {
      return html`
        <div class="${classMap({ 'avatar': true })}">
          <zn-icon src="${this.avatar}" size="24"></zn-icon>
        </div>`;
    }
  }
}


