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

  public handleSearchChange(event: Event) {
    // get all element that have data-'this.attr' attribute
    const filterableElements = this.querySelectorAll(`[data-${this.attr}]`);
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    filterableElements.forEach((el) => {
      const filterValue = el.getAttribute(`data-${this.attr}`)?.toLowerCase() || '';
      if (filterValue.includes(searchTerm)) {
        (el as HTMLElement).style.display = '';
      } else {
        (el as HTMLElement).style.display = 'none';
      }

      const panel = el.closest('zn-panel');
      if (panel) {
        const panelItems = panel.querySelectorAll(`[data-${this.attr}]`);
        let anyVisible = false;
        panelItems.forEach((item) => {
          if ((item as HTMLElement).style.display !== 'none') {
            anyVisible = true;
          }

        });
        if (anyVisible) {
          (panel as HTMLElement).style.display = '';
        } else {
          (panel as HTMLElement).style.display = 'none';
        }
      }

      const accordionItem = el.closest('zn-accordion');
      if (accordionItem) {
        const itemElements = accordionItem.querySelectorAll(`[data-${this.attr}]`);
        let anyVisible = false;
        itemElements.forEach((item) => {
          if ((item as HTMLElement).style.display !== 'none') {
            anyVisible = true;
          }
        });

        if (anyVisible) {
          (accordionItem as HTMLElement).style.display = '';
        }
      }
    });

    if (searchTerm === '') {
      filterableElements.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }

    // if nothing is visible, show a "no results found" message
    const anyVisibleElements = Array.from(filterableElements).some((el) => {
      return (el as HTMLElement).style.display !== 'none';
    });

    let noResultsMessage = this.querySelector('.no-results-message') as HTMLElement;
    if (!anyVisibleElements) {
      if (!noResultsMessage) {
        noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.textContent = 'No results found';
        this.appendChild(noResultsMessage);
      }
      noResultsMessage.style.display = '';
    } else {
      if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
      }
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
