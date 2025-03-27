import {choose} from 'lit/directives/choose.js';
import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, render, unsafeCSS} from 'lit';
import {md5} from '../../utilities/md5';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import {styleMap} from "lit/directives/style-map.js";

import styles from './icon.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/icon
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
export default class ZnIcon extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) src: string;

  @property({reflect: true}) alt: string;

  @property({type: Number, reflect: true}) size: number = 24;

  @property({type: Boolean, reflect: true}) round = false;

  @property({reflect: true}) library: "material" | "material-outlined" | "material-round" | "material-sharp" |
    "material-two-tone" | "material-symbols-outlined" | "gravatar" | "libravatar" | "avatar";

  @property({reflect: true}) color: "primary" | "accent" | "info" | "warning" | "error" | "success" | "white" |
    "disabled";

  gravatarOptions = "";

  connectedCallback() {
    super.connectedCallback();

    if (this.src.includes('@')) {
      const split = this.src.split('@');
      if (split[1].includes('.')) {
        this.library = "gravatar";
      }

      if (this.library === "gravatar" || this.library === "libravatar") {
        this.ravatarOptions();
        this.src = md5(this.src);
      }
    } else if (!this.library && this.src && !this.src.includes('/')) {
      this.library = "material-symbols-outlined";
    }

    // load the material icons font if the library is set to material
    render(html`
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined|Material+Icons|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone|Material+Icons+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet">`, document.head);

    this.ravatarOptions();
  }

  ravatarOptions() {
    if ((this.library === "gravatar" || this.library === "libravatar") && this.src.includes('#')) {
      const split = this.src.split('#');
      this.gravatarOptions = "&d=" + split[1];
      this.src = split[0];
    }
  }

  render() {
    return html`
      <div class="icon-wrapper">
        <div class="${classMap({
          'icon': true,
          'icon--round': this.round,
          'icon--primary': this.color === "primary",
          'icon--accent': this.color === "accent",
          'icon--info': this.color === "info",
          'icon--warning': this.color === "warning",
          'icon--error': this.color === "error",
          'icon--success': this.color === "success",
          'icon--white': this.color === "white",
          'icon--disabled': this.color === "disabled",
          'icon--avatar': this.library === "avatar"
        })}" style="${styleMap({'--icon-size': this.library === "avatar" ? "40px" : this.size + "px"})}">
          ${this.library ? html`
            ${choose(this.library, [
              ["material", () => html`<i part="icon" class="mi mi">${this.src}</i>`],
              ["material-outlined", () => html`<i part="icon" class="mi mi--outlined">${this.src}</i>`],
              ["material-round", () => html`<i part="icon" class="mi mi--round">${this.src}</i>`],
              ["material-sharp", () => html`<i part="icon" class="mi mi--sharp">${this.src}</i>`],
              ["material-two-tone", () => html`<i part="icon" class="mi mi--two-tone">${this.src}</i>`],
              ["material-symbols-outlined", () => html`<i part="icon"
                                                          class="mi mi--symbol-outlined">${this.src}</i>`],
              ["gravatar", () => html`<img part="icon" alt="${this.alt}"
                                           src="https://www.gravatar.com/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`],
              ["libravatar", () => html`<img part="icon" alt="${this.alt}"
                                             src="https://seccdn.libravatar.org/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`],
              ["avatar", () => html`<span class="avatar__text">${this.src}</span>`]
            ], () => html`Library not supported: ${this.library}`)}` : ''}

          ${!this.library && this.src ? html`
            <img part="icon" src="${this.src}" alt="${this.alt}" class="${this.library}" height="${this.size}"
                 width="${this.size}"/>` : ''}

          ${!this.library && !this.src ? html`
            <slot></slot>` : ''}
        </div>
      </div>`;
  }
}
