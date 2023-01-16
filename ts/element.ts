import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import {PropertyValues} from "@lit/reactive-element";


export class ZincElement extends LitElement {
    @property({type: Boolean, attribute: 'd', reflect: true})
    public d: boolean = false;

    constructor() {
        super();
        this.d = document.documentElement.classList.contains('dark')
            || document.documentElement.attributes.getNamedItem('d') != null;
    }
}
