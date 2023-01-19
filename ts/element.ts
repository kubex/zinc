import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
// @ts-ignore
import {PropertyValues} from "@lit/reactive-element";

import twConfig from "../tailwind.config";

export class ZincElement extends LitElement {
    @property({type: Boolean, attribute: 'd', reflect: true})
    public d: boolean = false;

    containerSize(width) {
        const screens = twConfig.theme.screens;
        if (width > screens['4k']) {
            return '4k';
        } else if (width > parseInt(screens['hd'])) {
            return 'hd';
        } else if (width > parseInt(screens['lg'])) {
            return 'lg';
        } else if (width > parseInt(screens['md'])) {
            return 'md';
        } else if (width > parseInt(screens['sm'])) {
            return 'sm';
        } else {
            return 'xs';
        }
    }

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

