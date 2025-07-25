import {choose} from 'lit/directives/choose.js';
import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, render, unsafeCSS} from 'lit';
import {md5} from '../../utilities/md5';
import {property} from 'lit/decorators.js';
import {styleMap} from "lit/directives/style-map.js";
import ZincElement from '../../internal/zinc-element';

import styles from './icon.scss';

type IconLibrary = "material" | "material-outlined" | "material-round" | "material-sharp" |
  "material-two-tone" | "material-symbols-outlined" | "gravatar" | "libravatar" | "avatar" | "brands" | "line";

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

  @property({reflect: true}) library: IconLibrary;

  @property({reflect: true}) color: "primary" | "accent" | "info" | "warning" | "error" | "success" | "white" |
    "disabled";

  gravatarOptions = "";
  defaultLibrary: IconLibrary = "material-symbols-outlined";

  convertToLibrary(input: string): IconLibrary {
    switch (input) {
      case "material":
      case "mat":
      case "m":
        return "material";
      case "material-outlined":
      case "mo":
        return "material-outlined";
      case "material-round":
      case "mr":
        return "material-round";
      case "material-sharp":
      case "ms":
        return "material-sharp";
      case "material-two-tone":
      case "mt":
      case "m2":
        return "material-two-tone";
      case "material-symbols-outlined":
      case "mso":
        return "material-symbols-outlined";
      case "gravatar":
      case "grav":
        return "gravatar";
      case "libravatar":
        return "libravatar";
      case "avatar":
      case "av":
        return "avatar";
      case "line":
        return "line";
      case 'brand':
      case 'brands':
        return "brands";
    }

    return this.defaultLibrary
  }

  connectedCallback() {
    super.connectedCallback();


    if (this.src && this.src.includes('#')) {
      const split = this.src.split('#');
      this.src = split[0];
      const attributes = split[1].split(',');
      attributes.forEach(attr => {
        if (attr === "round") {
          this.round = true;
        }
      });
    }

    if (this.src && this.src.includes('@')) {
      const split = this.src.split('@');
      if (split[1].includes('.')) {
        this.library = "gravatar";
      } else if ((this.library === undefined) && split[1] !== "") {
        // if split[1] is a valid library name, set it
        this.library = this.convertToLibrary(split[1]);
        this.src = split[0];
      }

      if (this.library === "gravatar" || this.library === "libravatar") {
        this.ravatarOptions();
        this.src = md5(this.src);
      }
    } else if (!this.library && this.src && !this.src.includes('/')) {
      this.library = this.defaultLibrary;
    }

    // load the material icons font if the library is set to material
    render(html`
      <link
        href="https://cdn.jsdelivr.net/gh/kubex/icons@0.0.6/dist/kubex-icons.css"
        rel="stylesheet">
      <link
        href="https://cdn.lineicons.com/5.0/lineicons.css"
        rel="stylesheet">
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
        })}" style="${styleMap({
          '--icon-size': this.library === "avatar" ? "40px" : this.size + "px",
          '--avatar-color': this.library === 'avatar' ? this.getColorForAvatar(this.getAvatarInitials(this.src)) : null
        })}">
          ${this.library ? html`
            ${choose(this.library, [
              ["material", () => html`<i part="icon" class="mi">${this.src}</i>`],
              ["material-outlined", () => html`<i part="icon" class="mi mi--outlined">${this.src}</i>`],
              ["material-round", () => html`<i part="icon" class="mi mi--round">${this.src}</i>`],
              ["material-sharp", () => html`<i part="icon" class="mi mi--sharp">${this.src}</i>`],
              ["material-two-tone", () => html`<i part="icon" class="mi mi--two-tone">${this.src}</i>`],
              ["brands", () => html`<i part="icon" class="kb">${this.src}</i>`],
              ["line", () => html`<i part="icon" class="lni lni-${this.src}"></i>`],
              ["material-symbols-outlined", () => html`<i part="icon" class="mi mi--symbol-outlined">${this.src}</i>`],
              ["gravatar", () => html`<img part="icon" alt="${this.alt}"
                                           src="https://www.gravatar.com/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`],
              ["libravatar", () => html`<img part="icon" alt="${this.alt}"
                                             src="https://seccdn.libravatar.org/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`],
              ["avatar", () => html`<span class="avatar__text">${this.getAvatarInitials(this.src)}</span>`]
            ], () => html`Library not supported: ${this.library}`)}` : ''}

          ${!this.library && this.src ? html`
            <img part="icon" src="${this.src}" alt="${this.alt}" class="${this.library}" height="${this.size}"
                 width="${this.size}"/>` : ''}

          ${!this.library && !this.src ? html`
            <slot></slot>` : ''}
        </div>
      </div>`;
  }

  private getAvatarInitials(avatar: string) {
    const words = avatar.split(' ');
    if (words.length > 1) {
      return words.map(word => word.charAt(0)).join('').toUpperCase();
    } else {
      return avatar.slice(0, 2).toUpperCase();
    }
  }


  protected getColorForAvatar(avatarInitials: string) {
    const colors = [
      '#d1573a', '#4fbf62', '#3357FF', '#F1C40F', '#E67E22', '#9B59B6',
      '#1ABC9C', '#2ECC71', '#3498DB', '#E74C3C', '#8E44AD', '#34495E'
    ];

    // Generate a hash from the initials
    const hash = Array.from(avatarInitials).reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use the hash to select a color
    return colors[hash % colors.length];
  }
}
