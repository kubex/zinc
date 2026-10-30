import {type CSSResultGroup, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LocalizeController} from '../../utilities/localize';
import ZincElement from '../../internal/zinc-element';

import styles from './style.scss';

@customElement('zn-style')
export default class ZnStyle extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  @property() color = '';
  @property() border = '';
  @property() size = '';
  @property({type: Boolean}) error = false;
  @property({type: Boolean}) success = false;
  @property({type: Boolean}) info = false;
  @property({type: Boolean}) warning = false;
  @property({type: Boolean}) primary = false;
  @property({type: Boolean}) accent = false;
  @property({type: Boolean}) center = false;
  @property({type: String}) display = null;
  @property() font = '';
  @property() width = '';
  @property() height = '';
  @property() pad = '';
  @property() margin = '';
  @property({type: Boolean}) muted = false;
  @property({type: Boolean}) gutter = false;
  @property({attribute: 'a-margin'}) autoMargin = '';

  connectedCallback() {
    super.connectedCallback();

    let display = this.display || 'contents';

    if (this.gutter) {
      this.classList.add('zn-gutter');
      if (display === 'contents') {
        display = 'block'
      }
    }

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


    if (this.center) {
      display = "flex"
      this.classList.toggle('flex-mid', true);
      this.classList.toggle('flex-jc', true);
    }

    if (this.font) {
      if (this.font === 'mono') {
        this.classList.toggle('zn-mono', true);
      }
    }

    if (this.width === "f") {
      this.classList.toggle('w-full', true);
    }

    if (this.height === "f") {
      this.classList.toggle('h-full', true);
    }

    // border accepts any combination of t/b/l/r, plus 'a' (or 'tblr') as a
    // shortcut for all four sides. Existing `<zn-style border>` (boolean
    // attribute → empty string value with attribute present) keeps rendering
    // all four sides; pure absence renders no border.
    const borderSides = this.hasAttribute('border')
      ? (this.border || 'a')
      : '';
    if (borderSides) {
      display = 'inline-block'
      for (const c of borderSides) {
        switch (c) {
          case 'a':
            this.classList.toggle('zn-border', true);
            break;
          case 't':
            this.classList.toggle('zn-bt', true);
            break;
          case 'b':
            this.classList.toggle('zn-bb', true);
            break;
          case 'l':
            this.classList.toggle('zn-bl', true);
            break;
          case 'r':
            this.classList.toggle('zn-br', true);
            break;
        }
      }
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
    if (this.autoMargin) {
      display = 'inline-block'
      for (const pt of this.autoMargin) {
        switch (pt) {
          case 'a':
            this.classList.toggle('m-auto', true);
            break;
          case 't':
            this.classList.toggle('zn-mta', true);
            break;
          case 'b':
            this.classList.toggle('zn-mba', true);
            break;
          case 'l':
            this.classList.toggle('zn-mla', true);
            break;
          case 'r':
            this.classList.toggle('zn-mra', true);
            break;
          case 'x':
            this.classList.toggle('zn-mra', true);
            this.classList.toggle('zn-mla', true);
            break;
          case 'y':
            this.classList.toggle('zn-mta', true);
            this.classList.toggle('zn-mba', true);
            break;
        }
      }
    }

    if (this.muted) {
      display = 'inline-block';
      this.classList.toggle('zn-muted', true);
    }

    // size: xs/s/l/xl each toggle a sizing class. 'm' (and empty) are the
    // default and apply no class.
    if (this.size && this.size !== 'm') {
      this.classList.toggle('zn-size-' + this.size, true);
    }

    if (this.display) {
      // Force attribute display
      display = this.display
    }

    this.style.display = display;
  }

  createRenderRoot() {
    return this;
  }
}
