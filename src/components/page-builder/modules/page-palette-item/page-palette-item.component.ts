import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnIcon from '../../../icon';

import {PAGE_TYPE_MIME} from '../../page.types';

import styles from './page-palette-item.scss';

/**
 * @summary A draggable palette entry in `<zn-page-builder>`, representing a registered
 *   section type. Drag it onto the canvas to add that section. Unlike zn-page-section-card
 *   (host-wired), this element wires its own drag behaviour so it is draggable standalone.
 * @documentation https://zinc.style/components/page-palette-item
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @csspart base - The card row.
 */
export default class ZnPagePaletteItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {'zn-icon': ZnIcon};

  /** The section type id this item creates when dropped. */
  @property() type: string;
  @property() label: string;
  @property() description: string;
  @property() icon: string;
  @property({attribute: 'icon-library'}) iconLibrary: string;
  @property() color: string;

  connectedCallback() {
    super.connectedCallback();
    this.draggable = true;
    this.addEventListener('dragstart', this._onDragStart);
  }

  disconnectedCallback() {
    this.removeEventListener('dragstart', this._onDragStart);
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this.style.setProperty('--section-accent', this.color ?? 'rgb(var(--zn-color-primary))');
  }

  private _onDragStart = (e: DragEvent) => {
    if (!e.dataTransfer || !this.type) return;
    e.dataTransfer.setData(PAGE_TYPE_MIME, this.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  render() {
    return html`
      <div part="base" class="item">
        <span class="item__icon">
          <zn-icon src="${this.icon ?? 'widgets'}" library="${ifDefined(this.iconLibrary)}" size="16"></zn-icon>
        </span>
        <span class="item__text">
          <span class="item__label">${this.label ?? ''}</span>
          ${this.description ? html`<span class="item__description">${this.description}</span>` : ''}
        </span>
      </div>
    `;
  }
}
