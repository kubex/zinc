import {html, LitElement, render, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {md5} from './md5'

import styles from './icon.scss';

const Library = {
  None: "",
  Material: "material",
  MaterialOutlined: "material-outlined",
  MaterialRound: "material-round",
  MaterialSharp: "material-sharp",
  MaterialTwoTone: "material-two-tone",
  Gravatar: "gravatar",
  Libravatar: "libravatar"
}

const LibraryAlias = {
  Material: "mi",
  MaterialOutlined: "mio",
  MaterialRound: "mir",
  MaterialSharp: "mit",
  MaterialTwoTone: "mis",
  Gravatar: "grav",
}

@customElement('zn-icon')
export class ZincIcon extends LitElement {
  static styles = unsafeCSS(styles);

  gravatarOptions = ""

  @property({reflect: true})
  src = ""

  @property({reflect: true})
  size = 24

  @property({reflect: true})
  library = Library.None

  @property()
  round = false

  connectedCallback() {
    super.connectedCallback();

    //Register the material design icon packs
    render(html`
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone|Material+Icons+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet">`, document.head);

    if (this.src.includes('@')) {
      if (this.library == "") {
        const split = this.src.split('@')
        if (split[1].includes('.')) {
          this.library = Library.Gravatar
        } else {
          this.library = split[1]
          this.src = split[0]
        }
      }

      if (this.library == Library.Gravatar || this.library == Library.Libravatar) {
        this.ravatarOptions()
        this.src = md5(this.src)
      }
    }
    this.ravatarOptions()
  }

  ravatarOptions() {
    if ((this.library == Library.Gravatar || this.library == Library.Libravatar) && this.src.includes('#')) {
      const split = this.src.split('#')
      this.gravatarOptions = "&d=" + split[1]
      this.src = split[0]
    }
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    super.attributeChangedCallback(name, _old, value);
    if (name == "size") {
      this.size = Number(value) - Number(value) % 4;
      this.style.setProperty('--icon-size', this.size + "px")
    }
  }

  render() {
    switch (this.library) {
      case Library.Material:
      case LibraryAlias.Material:
        return html`<i class="mi mi">${this.src}</i>`;
      case Library.MaterialOutlined:
      case LibraryAlias.MaterialOutlined:
        return html`<i class="mi mi--outlined">${this.src}</i>`;
      case Library.MaterialRound:
      case LibraryAlias.MaterialRound:
        return html`<i class="mi mi--round">${this.src}</i>`;
      case Library.MaterialSharp:
      case LibraryAlias.MaterialSharp:
        return html`<i class="mi mi--sharp">${this.src}</i>`;
      case Library.MaterialTwoTone:
      case LibraryAlias.MaterialTwoTone:
        return html`<i class="mi mi--two-tone">${this.src}</i>`;
      case Library.Gravatar:
      case LibraryAlias.Gravatar:
        return html`<img
          src="https://www.gravatar.com/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`;
      case Library.Libravatar:
        return html`<img
          src="https://seccdn.libravatar.org/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`;
    }

    if (this.src != "") {
      return html`
        <img src="${this.src}" class="${this.library}/">`;
    }

    return html`
      <slot></slot>`;
  }
}
