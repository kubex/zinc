import {html, LitElement, render, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Icon.scss';

enum Library {
    None = "",
    Material = "material",
    MaterialOutlined = "material-outlined",
    MaterialRound = "material-round",
    MaterialSharp = "material-sharp",
    MaterialTwoTone = "material-two-tone"
}

@customElement('fusion-icon')
export class FusionIcon extends LitElement {
    static styles = unsafeCSS(styles);


    @property()
    src = ""

    @property({reflect: true})
    size = 8

    @property()
    library = Library.None

    connectedCallback() {
        super.connectedCallback();

        //Register the material design icon packs
        render(html`
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone"
            rel="stylesheet">`, document.head);

    }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        super.attributeChangedCallback(name, _old, value);
        if (name == "size") {

            this.size = Number(value) - Number(value) % 8;
            this.style.setProperty('--icon-size', this.size + "px")
        }
    }

    render() {
        switch (this.library) {
            case Library.Material:
                return html`<i class="mi mi">${this.src}</i>`;
            case Library.MaterialOutlined:
                return html`<i class="mi mi--outlined">${this.src}</i>`;
            case Library.MaterialRound:
                return html`<i class="mi mi--round">${this.src}</i>`;
            case Library.MaterialSharp:
                return html`<i class="mi mi--sharp">${this.src}</i>`;
            case Library.MaterialTwoTone:
                return html`<i class="mi mi--two-tone">${this.src}</i>`;
        }

        if (this.src != "") {
            return html`
              <img src="${this.src}">`;
        }

        return html`
          <slot></slot>`;
    }
}