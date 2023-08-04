import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';

const screenSizes = {
  'sm': '360px',
  'smp': '480px',
  'md': '768px',
  'lg': '1100px',
  'hd': '1440px',
  '4k': '2560px'
}

export class ZincElement extends LitElement {
  @property({type: Boolean, attribute: 'd', reflect: true})
  public d: boolean = false;

  containerSize(width) {
    const screens = screenSizes
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

