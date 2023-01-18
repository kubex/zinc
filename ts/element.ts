import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
// @ts-ignore
import {PropertyValues} from "@lit/reactive-element";


export class ZincElement extends LitElement {
    @property({type: Boolean, attribute: 'd', reflect: true})
    public d: boolean = false;

    constructor() {
        super();

        window.addEventListener('darkmode', this._updateDarkMode.bind(this));
        this._updateDarkMode();
    }

    public _updateDarkMode() {
        this.d = document.documentElement.classList.contains('dark');
        this.classList.toggle('dark', this.d);
    }
}

