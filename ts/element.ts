import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import {PropertyValues} from "@lit/reactive-element";


export class ZincElement extends LitElement {
    @property({type: Boolean, attribute: 'darkMode', reflect: true})
    public darkMode: boolean = false;

    constructor() {
        super();
        this.darkMode = document.documentElement.classList.contains('dark')
            || document.documentElement.attributes.getNamedItem('darkMode') != null;
    }
}
