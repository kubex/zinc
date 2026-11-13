import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnSkeleton from '../skeleton';

import styles from './infinite-scroll.scss';

/**
 * @summary Loads further pages of server-rendered content as the user scrolls to the end.
 * @documentation https://zinc.style/components/infinite-scroll
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-skeleton
 *
 * @event zn-load - Emitted after a page has been appended.
 * @event zn-finish - Emitted when a page comes back empty, so there is nothing more to load.
 * @event zn-error - Emitted when a page request fails. Loading stops.
 *
 * @slot - The first page of content. Later pages are appended here.
 * @slot loader - Placeholder content shown at the end while a page loads. Defaults to a skeleton bar.
 *
 * @csspart loader - The default skeleton bar shown while a page loads.
 */
export default class ZnInfiniteScroll extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-skeleton': ZnSkeleton};

  /** The page URL, with `#page#` replaced by the page number to load. */
  @property() uri = '';

  /** The last page already rendered. The next request is for `page + 1`. */
  @property({type: Number, reflect: true}) page = 1;

  /** Set once there is nothing more to load. */
  @property({type: Boolean, reflect: true}) finished = false;

  @state() private loading = false;

  @query('.sentinel') private sentinel: HTMLElement;

  private observer?: IntersectionObserver;
  private abort?: AbortController;
  private scroller: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    // rootMargin only grows the root, so a viewport root can't look ahead inside a scrolling container
    this.scroller = findScrollContainer(this);
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) this.loadNext();
    }, {root: this.scroller, rootMargin: '0px 0px 100% 0px'});
    this.updateComplete.then(() => this.watchSentinel());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.abort?.abort();
  }

  // Re-observing reports the sentinel's current state, so a page too short to push it off-screen loads the next one.
  private watchSentinel() {
    if (!this.sentinel || !this.observer || this.finished) return;
    this.observer.unobserve(this.sentinel);
    this.observer.observe(this.sentinel);
  }

  private async loadNext() {
    if (this.loading || this.finished || !this.uri) return;
    this.loading = true;
    this.abort = new AbortController();
    // Reaching the end mid-load would otherwise hand the wheel to the page
    const scroller = this.scroller;
    const overscroll = scroller?.style.overscrollBehaviorY ?? '';
    if (scroller) scroller.style.overscrollBehaviorY = 'contain';
    try {
      const response = await fetch(this.uri.replace('#page#', String(this.page + 1)), {
        credentials: 'same-origin',
        headers: {'x-kx-inline': 'inline'},
        signal: this.abort.signal,
      });
      if (!response.ok) {
        this.stop();
        this.emit('zn-error', {detail: {status: response.status, message: response.statusText}});
        return;
      }
      const content = await response.text();
      if (!content.trim()) {
        this.stop();
        this.emit('zn-finish');
        return;
      }
      const previousLast = this.lastElementChild;
      this.insertAdjacentHTML('beforeend', content);
      this.fadeIn(previousLast ? previousLast.nextElementSibling : this.firstElementChild);
      this.page++;
      this.emit('zn-load');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      this.stop();
      this.emit('zn-error', {detail: {message: (err as Error).message}});
      return;
    } finally {
      this.loading = false;
      if (scroller) scroller.style.overscrollBehaviorY = overscroll;
    }
    await this.updateComplete;
    this.watchSentinel();
  }

  // Opacity only, so nothing shifts under the reader; WAAPI so the items' own transitions are left alone
  private fadeIn(from: Element | null) {
    for (let el = from; el; el = el.nextElementSibling) {
      if (el.slot) continue;
      el.animate([{opacity: 0}, {opacity: 1}], {duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)'});
    }
  }

  private stop() {
    this.finished = true;
    this.observer?.disconnect();
  }

  protected willUpdate() {
    this.setAttribute('aria-busy', String(this.loading));
  }

  render() {
    return html`
      <slot></slot>
      <div class="sentinel" aria-hidden="true">
        ${this.loading
          ? html`<slot name="loader"><zn-skeleton part="loader" height="40px"></zn-skeleton></slot>`
          : nothing}
      </div>
    `;
  }
}

function findScrollContainer(el: Element): HTMLElement | null {
  const parentOf = (node: Element): Element | null =>
    node.assignedSlot ?? node.parentElement ?? (node.getRootNode() instanceof ShadowRoot ? (node.getRootNode() as ShadowRoot).host : null);

  for (let node = parentOf(el); node && node !== document.body && node !== document.documentElement; node = parentOf(node)) {
    const {overflowY} = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node as HTMLElement;
  }
  return null;
}
