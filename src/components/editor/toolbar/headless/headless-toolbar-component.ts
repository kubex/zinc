import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from "../../../../internal/zinc-element";

import styles from './headless-toolbar-module.scss';

export interface ResultItem {
  icon: string;
  label: string;
  format?: string;
  module?: string;
  value?: string | boolean;
}

export default class HeadlessToolbarComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Boolean, reflect: true}) open = false;
  @property({type: String}) query = '';
  @property({type: Array}) results: ResultItem[] = [];

  @state() private _activeIndex = -1;

  public show() {
    this.open = true;
  }

  public hide() {
    this.open = false;
    this._activeIndex = -1;
  }

  setPosition(left: number, top: number) {
    this.style.left = `${Math.max(0, left)}px`;
    this.style.top = `${top}px`;
  }

  setActiveIndex(index: number) {
    const len = this.results?.length ?? 0;
    if (!len) {
      this._activeIndex = -1;
      return;
    }

    if (index < 0) {
      index = len - 1;
    }
    if (index >= len) {
      index = 0;
    }
    this._activeIndex = index;
    this.requestUpdate();

    requestAnimationFrame(() => {
      const items = Array.from(this.renderRoot.querySelectorAll<HTMLButtonElement>('[data-toolbar-option]'));
      const active = items[this._activeIndex];
      active?.scrollIntoView?.({block: 'nearest'});
    });
  }

  getActiveIndex() {
    return this._activeIndex;
  }

  private _onClickItem = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const idx = parseInt(target.dataset.index || '-1', 10);
    if (Number.isNaN(idx)) return;

    this.setActiveIndex(idx);

    const item = this.results?.[idx];
    if (!item) return;

    this.dispatchEvent(new CustomEvent('zn-format-select', {
      bubbles: true,
      composed: true,
      detail: {icon: item.icon, label: item.label, format: item.format, value: item.value, module: item.module}
    }));
  }

  protected willUpdate(changed: PropertyValues) {
    if (changed.has('results')) {
      // Reset active index when results change
      this._activeIndex = this.results?.length ? 0 : -1;
    }
  }

  render() {
    return html`
      <div class="header">${this.query ? `Search: ${this.query}` : 'Options'}</div>
      ${Array.isArray(this.results) && this.results.length > 0 ? (
        this.results.slice(0, 20).map((res, i) => html`
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="${String(i === this._activeIndex)}"
            data-toolbar-option
            data-index="${i}"
            @click="${this._onClickItem}"
          >
            <zn-icon src="${res.icon}" size="16"></zn-icon>
            <span class="label">${res.label}</span>
          </button>
        `)
      ) : html`
        <div class="empty">${this.query ? 'No results' : 'Type something'}</div>`}
    `;
  }
}

HeadlessToolbarComponent.define('zn-headless-toolbar');
