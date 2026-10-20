import {classMap} from 'lit/directives/class-map.js';
import {html, nothing, type ReactiveController, type ReactiveControllerHost, type TemplateResult} from 'lit';
import {ref} from 'lit/directives/ref.js';
import {squishTabIndicator} from './tab-indicator';

export interface TableTab {
  value: string;
  label: string;
  count?: number | string;
}

export class TabRowController implements ReactiveController {
  private readonly onSelect: (value: string) => void;
  private indicator: HTMLElement | null = null;
  private indicatorTab: HTMLElement | null = null;
  private observer: ResizeObserver | null = null;

  constructor(host: ReactiveControllerHost, opts: { onSelect: (value: string) => void }) {
    this.onSelect = opts.onSelect;
    host.addController(this);
  }

  hostUpdated() {
    this.syncTabIndicator();
  }

  hostDisconnected() {
    this.observer?.disconnect();
    this.observer = null;
  }

  render(tabs: TableTab[], active: string, pill: boolean): TemplateResult | typeof nothing {
    if (tabs.length === 0) return nothing;

    return html`
      <div class="${classMap({'table__tabs': true, 'table__tabs--pill': pill})}" role="tablist" ${ref(this.observeBar)}>
        <span class="table__tabs__indicator" part="tab-indicator" aria-hidden="true" ${ref(this.setIndicator)}></span>
        ${tabs.map(tab => html`
          <button role="tab"
                  aria-selected="${tab.value === active ? 'true' : 'false'}"
                  class="${classMap({'table__tab': true, 'table__tab--active': tab.value === active})}"
                  @click="${() => this.onSelect(tab.value)}">
            ${tab.label}
            ${tab.count !== undefined && tab.count !== null && tab.count !== '' ? html`
              <span class="table__tab__count">${tab.count}</span>` : nothing}
          </button>`)}
      </div>`;
  }

  private setIndicator = (el: Element | undefined) => {
    this.indicator = (el as HTMLElement) ?? null;
  };

  private observeBar = (el: Element | undefined) => {
    this.observer?.disconnect();
    this.observer = null;
    if (!el) return;
    this.observer = new ResizeObserver(() => this.syncTabIndicator());
    this.observer.observe(el);
  };

  /**
   * One indicator shared by every tab, positioned by its two edges as zn-navbar's is: on a tab
   * change the edge nearest the destination leads and the other trails, so it slides across.
   */
  syncTabIndicator() {
    const indicator = this.indicator;
    const bar = indicator?.parentElement;
    const active = bar?.querySelector<HTMLElement>('.table__tab--active');
    if (!indicator || !bar || !active || active.offsetWidth === 0) {
      indicator?.classList.remove('table__tabs__indicator--shown');
      return;
    }

    const left = active.offsetLeft;
    const right = bar.clientWidth - left - active.offsetWidth;
    const previousLeft = parseFloat(indicator.style.left);
    const ready = indicator.classList.contains('table__tabs__indicator--ready');
    const tabChanged = active !== this.indicatorTab;
    if (ready && tabChanged && !Number.isNaN(previousLeft) && Math.abs(left - previousLeft) > 0.5) {
      indicator.classList.toggle('table__tabs__indicator--forward', left > previousLeft);
      indicator.classList.toggle('table__tabs__indicator--backward', left < previousLeft);
      squishTabIndicator(indicator);
    }
    this.indicatorTab = active;

    // Only a tab change slides; a resize under the same tab follows it instantly, unless a slide is still running
    const follow = ready && !tabChanged && indicator.getAnimations().length === 0;
    if (follow) {
      indicator.style.transition = 'none';
    }

    indicator.style.left = `${left}px`;
    indicator.style.right = `${right}px`;
    indicator.classList.add('table__tabs__indicator--shown');

    if (follow) {
      // Commit the jump before transitions come back on
      void indicator.offsetWidth;
      indicator.style.removeProperty('transition');
    }

    // The first placement jumps into position; only later moves animate
    if (!ready) {
      requestAnimationFrame(() => indicator.classList.add('table__tabs__indicator--ready'));
    }
  }
}
