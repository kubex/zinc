import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, render, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';
import { md5 } from '../../utilities/md5';

import styles from './icon.scss';

const Library = {
  None: "",
  Material: "material",
  MaterialOutlined: "material-outlined",
  MaterialRound: "material-round",
  MaterialSharp: "material-sharp",
  MaterialTwoTone: "material-two-tone",
  MaterialSymbolOutlined: "material-symbols-outlined",
  Gravatar: "gravatar",
  Libravatar: "libravatar"
};

const LibraryAlias = {
  Material: "mi",
  MaterialOutlined: "mio",
  MaterialRound: "mir",
  MaterialSharp: "mis",
  MaterialTwoTone: "mit",
  MaterialSymbolOutlined: "mis",

  Gravatar: "grav",
};

const colors = {
  "primary": "rgb(var(--zn-primary))",
  "accent": "rgb(var(--zn-primary))",
  "info": "rgb(var(--zn-color-info))",
  "warning": "rgb(var(--zn-color-warning))",
  "error": "rgb(var(--zn-color-error))",
  "success": "rgb(var(--zn-color-success))",
  "white": "rgb(var(--zn-body))",
  "disabled": "rgb(var(--zn-color-disabled))",
};

type Color = keyof typeof colors;

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

  @property({ type: String, reflect: true }) src = "";
  @property({ type: String, reflect: true }) alt = "";
  @property({ type: Number, reflect: true }) size = 24;
  @property({ type: String, reflect: true }) library = Library.None;
  @property({ type: Boolean, reflect: true }) round = false;
  @property({ type: String, reflect: true }) color: Color = "primary";

  gravatarOptions = "";

  connectedCallback() {
    super.connectedCallback();

    //Register the material design icon packs
    render(html`
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined|Material+Icons|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone|Material+Icons+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet">`, document.head);

    if (this.src.includes(':') && !this.src.includes(':/')) {
      const split = this.src.split(':');
      this.src = split[0];
      switch (split[1]) {
        case 'round':
          this.round = true;
          break;
        case 'info':
          this.color = 'info';
          break;
        case 'warning':
          this.color = 'warning';
          break;
        case 'error':
          this.color = 'error';
          break;
        case 'success':
          this.color = 'success';
          break;
        case 'primary':
          this.color = 'primary';
          break;
        case 'accent':
          this.color = 'accent';
          break;
      }
    }

    if (this.src.includes('@')) {
      if (this.library == "") {
        const split = this.src.split('@');
        if (split[1].includes('.')) {
          this.library = Library.Gravatar;
        } else {
          this.library = split[1];
          this.src = split[0];
        }
      }

      if (this.library == Library.Gravatar || this.library == Library.Libravatar) {
        this.ravatarOptions();
        this.src = md5(this.src);
      }
    } else if (this.library == "" && !this.src.includes('/') && this.src) {
      this.library = Library.MaterialSymbolOutlined;
    }
    this.ravatarOptions();
  }

  ravatarOptions() {
    if ((this.library == Library.Gravatar || this.library == Library.Libravatar) && this.src.includes('#')) {
      const split = this.src.split('#');
      this.gravatarOptions = "&d=" + split[1];
      this.src = split[0];
    }
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    super.attributeChangedCallback(name, _old, value);
    if (name == "size") {
      this.size = Number(value) - Number(value) % 4;
      this.style.setProperty('--icon-size', this.size + "px");
    }
  }

  render() {
    const color = colors[this.color];
    switch (this.library) {
      case Library.Material:
      case LibraryAlias.Material:
        return html`<i part="icon" class="mi mi" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialOutlined:
      case LibraryAlias.MaterialOutlined:
        return html`<i part="icon" class="mi mi--outlined" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialRound:
      case LibraryAlias.MaterialRound:
        return html`<i part="icon" class="mi mi--round" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialSharp:
      case LibraryAlias.MaterialSharp:
        return html`<i part="icon" class="mi mi--sharp" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialTwoTone:
      case LibraryAlias.MaterialTwoTone:
        return html`<i part="icon" class="mi mi--two-tone" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialSymbolOutlined:
      case LibraryAlias.MaterialSymbolOutlined:
        return html`<i part="icon" class="mi mi--symbol-outlined" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.Gravatar:
      case LibraryAlias.Gravatar:
        return html`<img
          part="icon"
          alt="${this.alt}" src="https://www.gravatar.com/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`;
      case Library.Libravatar:
        return html`<img
          part="icon"
          alt="${this.alt}"
          src="https://seccdn.libravatar.org/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`;
    }

    if (this.src != "") {
      return html`
        <div>
          <img part="icon" src="${this.src}" alt="${this.alt}" class="${this.library}" height="${this.size}"
               width="${this.size}"/>
        </div>`;
    }

    return html`
      <slot></slot>`;
  }
}
