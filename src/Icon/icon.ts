import {html, LitElement, render, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {md5} from './md5';

import styles from './index.scss';

const Library = {
  None: "",
  Material: "material",
  MaterialOutlined: "material-outlined",
  MaterialRound: "material-round",
  MaterialSharp: "material-sharp",
  MaterialTwoTone: "material-two-tone",
  Gravatar: "gravatar",
  Libravatar: "libravatar"
};

const LibraryAlias = {
  Material: "mi",
  MaterialOutlined: "mio",
  MaterialRound: "mir",
  MaterialSharp: "mis",
  MaterialTwoTone: "mit",
  Gravatar: "grav",
};

const colors = {
  "primary": "rgb(var(--zn-primary))",
  "accent": "rgb(var(--zn-primary))",
  "info": "rgb(var(--zn-color-info))",
  "warning": "rgb(var(--zn-color-warning))",
  "error": "rgb(var(--zn-color-error))",
  "success": "rgb(var(--zn-color-success))",
};

type Color = keyof typeof colors;


@customElement('zn-icon')
export class Icon extends LitElement
{
  @property({type: String, reflect: true}) src = "";
  @property({type: String, reflect: true}) alt = "";
  @property({type: Number, reflect: true}) size = 24;
  @property({type: String, reflect: true}) library = Library.None;
  @property({type: Boolean, reflect: true}) round = false;
  @property({type: String, reflect: true}) color: Color = null;

  gravatarOptions = "";

  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();

    //Register the material design icon packs
    render(html`
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone|Material+Icons+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet">`, document.head);

    if(this.src.includes(':') && !this.src.includes(':/'))
    {
      const split = this.src.split(':');
      this.src = split[0];
      switch(split[1])
      {
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

    if(this.src.includes('@'))
    {
      if(this.library == "")
      {
        const split = this.src.split('@');
        if(split[1].includes('.'))
        {
          this.library = Library.Gravatar;
        }
        else
        {
          this.library = split[1];
          this.src = split[0];
        }
      }

      if(this.library == Library.Gravatar || this.library == Library.Libravatar)
      {
        this.ravatarOptions();
        this.src = md5(this.src);
      }
    }
    else if(this.library == "" && !this.src.includes('/'))
    {
      this.library = Library.MaterialOutlined;
    }
    this.ravatarOptions();
  }

  ravatarOptions()
  {
    if((this.library == Library.Gravatar || this.library == Library.Libravatar) && this.src.includes('#'))
    {
      const split = this.src.split('#');
      this.gravatarOptions = "&d=" + split[1];
      this.src = split[0];
    }
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null)
  {
    super.attributeChangedCallback(name, _old, value);
    if(name == "size")
    {
      this.size = Number(value) - Number(value) % 4;
      this.style.setProperty('--icon-size', this.size + "px");
    }
  }

  render()
  {
    const color = colors[this.color];
    switch(this.library)
    {
      case Library.Material:
      case LibraryAlias.Material:
        return html`<i class="mi mi" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialOutlined:
      case LibraryAlias.MaterialOutlined:
        return html`<i class="mi mi--outlined" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialRound:
      case LibraryAlias.MaterialRound:
        return html`<i class="mi mi--round" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialSharp:
      case LibraryAlias.MaterialSharp:
        return html`<i class="mi mi--sharp" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.MaterialTwoTone:
      case LibraryAlias.MaterialTwoTone:
        return html`<i class="mi mi--two-tone" style="--icon-color: ${color}">${this.src}</i>`;
      case Library.Gravatar:
      case LibraryAlias.Gravatar:
        return html`<img
           alt="${this.alt}" src="https://www.gravatar.com/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`;
      case Library.Libravatar:
        return html`<img
           alt="${this.alt}" src="https://seccdn.libravatar.org/avatar/${this.src}?s=${this.size}${this.gravatarOptions}"/>`;
    }

    if(this.src != "")
    {
      return html`
        <img src="${this.src}" alt="${this.alt}" class="${this.library}"/>`;
    }

    return html`
      <slot></slot>`;
  }
}


