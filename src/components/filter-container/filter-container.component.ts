import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './filter-container.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/filter-container
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnFilterContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() attr = 'filter';

  private _filterFrame = 0;

  public handleSearchChange(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    cancelAnimationFrame(this._filterFrame);
    this._filterFrame = requestAnimationFrame(() => this.applyFilter(searchTerm));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this._filterFrame);
  }

  private applyFilter(searchTerm: string) {
    const attr = `data-${this.attr}`;
    const filterableElements = this.querySelectorAll<HTMLElement>(`[${attr}]`);
    const panels = new Map<HTMLElement, boolean>();
    const accordions = new Map<HTMLElement, boolean>();
    let anyVisibleElements = false;

    filterableElements.forEach((el) => {
      const visible = searchTerm === '' || (el.getAttribute(attr)?.toLowerCase() || '').includes(searchTerm);
      setDisplay(el, visible);
      if (visible) anyVisibleElements = true;

      const panel = el.closest<HTMLElement>('zn-panel');
      if (panel) panels.set(panel, (panels.get(panel) ?? false) || visible);

      const accordion = el.closest<HTMLElement>('zn-accordion');
      if (accordion) accordions.set(accordion, (accordions.get(accordion) ?? false) || visible);
    });

    panels.forEach((visible, panel) => setDisplay(panel, visible));
    accordions.forEach((visible, accordion) => {
      if (visible) setDisplay(accordion, true);
    });

    let noResultsMessage = this.querySelector<HTMLElement>('.no-results-message');
    if (!anyVisibleElements) {
      if (!noResultsMessage) {
        noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.textContent = 'No results found';
        this.appendChild(noResultsMessage);
      }
      noResultsMessage.style.display = '';
    } else if (noResultsMessage) {
      noResultsMessage.style.display = 'none';
    }
  }

  render() {
    return html`
      <zn-input placeholder="Filter" clearable type="search" @zn-input=${this.handleSearchChange}
                style="margin-bottom: var(--zn-spacing-small)">
        <zn-icon src="search" slot="prefix"></zn-icon>
      </zn-input>
      <slot></slot> `;
  }
}

function setDisplay(el: HTMLElement, visible: boolean) {
  const display = visible ? '' : 'none';
  if (el.style.display !== display) el.style.display = display;
}
