import {html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../../../../internal/zinc-element';
import type {CSSResultGroup, PropertyValues} from 'lit';

import styles from './headless-emoji.scss';

export interface ResultItem {
  emojiChar: string;
  label: string;
}

export default class HeadlessEmojiComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Boolean, reflect: true}) open = false;
  @property({type: String}) query = '';
  @property({type: Array}) results: ResultItem[] = [];

  @state() private _activeIndex = -1;

  show() {
    this.open = true;
  }

  hide() {
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
      const items = Array.from(this.renderRoot.querySelectorAll<HTMLButtonElement>('[data-emoji-item]'));
      const active = items[this._activeIndex];
      active?.scrollIntoView?.({block: 'nearest'});
    });
  }

  getActiveIndex() {
    return this._activeIndex;
  }

  private onMouseEnterItem = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const idx = parseInt(target.dataset.index || '-1', 10);
    if (!Number.isNaN(idx)) {
      this.setActiveIndex(idx);
    }
  }

  private onClickItem = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const idx = parseInt(target.dataset.index || '-1', 10);
    if (Number.isNaN(idx)) return;

    const item = this.results?.[idx];
    if (!item) return;

    this.dispatchEvent(new CustomEvent('zn-emoji-select', {
      bubbles: true,
      composed: true,
      detail: {emojiChar: item.emojiChar, label: item.label}
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
      <div class="header">${this.query ? `Emoji: ${this.query}` : 'Emoji'}</div>
      ${Array.isArray(this.results) && this.results.length > 0 ? (
        this.results.slice(0, 20).map((res, i) => html`
          <button
            type="button"
            class="item"
            role="option"
            aria-selected="${String(i === this._activeIndex)}"
            data-emoji-item
            data-index="${i}"
            @mouseenter="${this.onMouseEnterItem}"
            @click="${this.onClickItem}"
          >
            <span class="emoji">${res.emojiChar}</span>
            <span class="label">${res.label}</span>
          </button>
        `)
      ) : html`
        <div class="empty">${this.query ? 'No results' : 'Type something'}</div>`}
    `;
  }
}

HeadlessEmojiComponent.define('zn-headless-emoji-module');
