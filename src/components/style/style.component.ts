import {property} from 'lit/decorators.js';
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {LocalizeController} from '../../utilities/localize';
import ZincElement from '../../internal/zinc-element';

import styles from './style.scss';

export default class ZnStyle extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  @property() color = '';
  @property({type: Boolean}) border = false;
  @property({type: Boolean}) error = false;
  @property({type: Boolean}) success = false;
  @property({type: Boolean}) info = false;
  @property({type: Boolean}) warning = false;
  @property({type: Boolean}) primary = false;
  @property({type: Boolean}) accent = false;
  @property() pad = '';
  @property() margin = '';

  connectedCallback() {
    super.connectedCallback();

    let display = 'contents';

    if (this.color === '') {
      if (this.error) {
        this.color = 'error';
      } else if (this.success) {
        this.color = 'success';
      } else if (this.info) {
        this.color = 'info';
      } else if (this.warning) {
        this.color = 'warning';
      } else if (this.primary) {
        this.color = 'primary';
      } else if (this.accent) {
        this.color = 'accent';
      }
    }
    if (this.color) {
      this.classList.toggle('zn-' + this.color, true);
    }

    if (this.border) {
      display = 'inline-block'
      this.classList.toggle('zn-border', true);
    }

    if (this.pad) {
      display = 'inline-block'
      this.style.display = 'inline-block';
      for (const pt of this.pad) {
        switch (pt) {
          case 'a':
            this.classList.toggle('zn-pad', true);
            break;
          case 'l':
            this.classList.toggle('zn-pl', true);
            break;
          case 'r':
            this.classList.toggle('zn-pr', true);
            break;
          case 't':
            this.classList.toggle('zn-pt', true);
            break;
          case 'b':
            this.classList.toggle('zn-pb', true);
            break;
          case 'x':
            this.classList.toggle('zn-px', true);
            break;
          case 'y':
            this.classList.toggle('zn-py', true);
            break;
        }
      }
    }
    if (this.margin) {
      display = 'inline-block'
      for (const pt of this.margin) {
        switch (pt) {
          case 'auto':
            this.classList.toggle('m-auto', true);
            break;
          case 'ta':
            this.classList.toggle('zn-mta', true);
            break;
          case 'ba':
            this.classList.toggle('zn-mba', true);
            break;
          case 'la':
            this.classList.toggle('zn-mla', true);
            break;
          case 'ra':
            this.classList.toggle('zn-mra', true);
            break;
          case 'a':
            this.classList.toggle('zn-margin', true);
            break;
          case 'l':
            this.classList.toggle('zn-ml', true);
            break;
          case 'r':
            this.classList.toggle('zn-mr', true);
            break;
          case 't':
            this.classList.toggle('zn-mt', true);
            break;
          case 'b':
            this.classList.toggle('zn-mb', true);
            break;
          case 'x':
            this.classList.toggle('zn-mx', true);
            break;
          case 'y':
            this.classList.toggle('zn-my', true);
            break;
        }
      }
    }


    this.style.display = display;
  }

  createRenderRoot() {
    return this;
  }
}
