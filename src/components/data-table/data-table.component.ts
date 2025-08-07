import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type TemplateResult, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import {ref} from "lit/directives/ref.js";
import {Task} from "@lit/task";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {type ZnFilterChangeEvent} from "../../events/zn-filter-change";
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnButtonGroup from "../button-group";
import ZnChip from "../chip";
import ZnConfirm from "../confirm";
import ZnDataTableFilter from "../data-table-filter";
import ZnDropdown from "../dropdown";
import ZnEmptyState from "../empty-state";
import ZnHoverContainer from "../hover-container";
import ZnMenu from "../menu";
import ZnMenuItem from "../menu-item";
import ZnSkeleton from "../skeleton";
import type ZnSelect from "../select";

import styles from './data-table.scss';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const DEFAULT_TOTAL_PAGES = 10;

interface TableData {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: any[];
}

export enum ActionSlots {
  delete = 'delete-action',
  modify = 'modify-action',
  create = 'create-action',
  filter = 'filter',
  sort = 'sort',
}

interface RowData {
  [key: string]: string | number | object | undefined;
}

interface RenderDataValue {
  value: string | number;
  type: string;
  tag: string;
  url: string;
  target: string;
  gaid?: string;
  html?: string;
  caption: CaptionConfig;
  buttons: ButtonConfig[];
  menu: MenuConfig[];
  icon: IconConfig;
  hover: HoverContainerConfig;
}

interface CaptionConfig {
  title: string;
  summary: string;
  uri: string;
  target: string;
  gaid: string;
  icon: IconConfig;
}

interface IconConfig {
  src: string;
  size: number;
  color: string;
}

interface HoverContainerConfig {
  label: string;
  content: string;
  anchor: string;
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end';
  icon: IconConfig;
}

interface ButtonConfig {
  id: string;
  href: string;
  gaid: string;
  size: string;
  color: string;
  icon: string;
  iconSize: string;
  tooltip: string;
  target: string;
  label: string;
  outline: boolean;
  confirm: ConfirmConfig;
}

interface MenuConfig {
  id: string;
  href: string;
  gaid: string;
  target: string;
  label: string;
}

interface ConfirmConfig {
  type: string;
  trigger: string;
  fid: string;
  caption: string;
  content: string;
  action: string;
}

interface HeaderConfig {
  title: string;
  position: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-table
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-empty-state
 * @dependency zn-chip
 * @dependency zn-hover-container
 * @dependency zn-dropdown
 * @dependency zn-menu
 * @dependency zn-menu-item
 * @dependency zn-button-group
 * @dependency zn-confirm
 * @dependency zn-skeleton
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
export default class ZnDataTable extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-empty-state': ZnEmptyState,
    'zn-chip': ZnChip,
    'zn-hover-container': ZnHoverContainer,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
    'zn-button-group': ZnButtonGroup,
    'zn-confirm': ZnConfirm,
    'zn-skeleton': ZnSkeleton,
  };

  @property({attribute: 'data-uri'}) dataUri: string;
  @property({attribute: 'data', type: Object, reflect: true}) data: any;
  @property({attribute: 'sort-column'}) sortColumn: string;
  @property({attribute: 'sort-direction'}) sortDirection: string;
  @property({attribute: 'filter'}) filter: string = '';

  @property({attribute: 'wide-column'}) wideColumn: string;
  @property({attribute: 'key'}) key: string = 'id';

  @property({attribute: 'headers', type: Object})
  headers: Record<string, string | HeaderConfig> = {};

  // Hide header text keeping the content - e.g. Action buttons without a header
  @property({attribute: 'hide-headers', type: Object}) hiddenHeaders = '{}';

  // Hide entire columns of data - e.g IDs
  @property({attribute: 'hide-columns', type: Object}) hiddenColumns = '{}';

  // Specify individual unsortable headers
  @property({attribute: 'unsortable-headers', type: Object}) unsortableHeaders = '{}';

  // Make table unsortable
  @property({attribute: 'unsortable', type: Boolean}) unsortable: boolean = false;

  // Hide pagination
  @property({attribute: 'hide-pagination', type: Boolean}) hidePagination: boolean;

  @property({type: Boolean}) standalone: boolean = false;

  @property() caption: string;

  // Hide the checkbox column
  @property({attribute: 'hide-checkboxes', type: Boolean}) hideCheckboxes: boolean;
  @property() filters: [] = [];

  // Data Table Properties
  private _initialLoad = true;
  private _lastTableContent: TemplateResult = html``;

  private resizeObserver: ResizeObserver;

  private itemsPerPage: number = DEFAULT_PER_PAGE;
  private page: number = DEFAULT_PAGE;
  private totalPages: number;

  private _rows: any[] = [];
  private _filteredRows: any[] = [];

  private numberOfRowsSelected: number = 0;
  private selectedRows: any[] = [];
  private tableContainer: Element | undefined;

  private hasSlotController = new HasSlotController(
    this,
    '[default]',
    'search-action',
    ActionSlots.delete.valueOf(),
    ActionSlots.modify.valueOf(),
    ActionSlots.create.valueOf(),
    ActionSlots.filter.valueOf(),
    ActionSlots.sort.valueOf()
  );

  private _dataTask = new Task(this, {
    task: async ([dataUri], {signal}) => {
      let url = dataUri;

      const params = new URLSearchParams();
      params.append('page', this.page.toString());
      params.append('per_page', this.itemsPerPage.toString());
      if (this.sortColumn) {
        params.append('sort_column', this.sortColumn);
      }
      if (this.sortDirection) {
        params.append('sort_direction', this.sortDirection);
      }
      if (this.filter) {
        params.append('filter', this.filter);
      }
      url += '?' + params.toString();

      if (!this.dataUri) {
        return new Promise<TableData>((resolve) => {
          if (!this.data) throw new Error('No data provided, please provide data or dataUri');
          let localData = Array.isArray(this.data?.data) ? this.data.data as RowData[] : [];

          if (this.sortColumn) {
            localData = localData.sort((a, b) => {
              const aValue = a?.[this.sortColumn];
              const bValue = b?.[this.sortColumn];
              return this.sortData(aValue, bValue);
            });
          }

          const totalPages = Math.ceil(localData.length / this.itemsPerPage);
          const start = (this.page - 1) * this.itemsPerPage;
          const end = start + this.itemsPerPage;
          const paginatedData = localData.slice(start, end);

          resolve({
            page: this.page,
            per_page: this.itemsPerPage,
            total: localData.length,
            total_pages: totalPages,
            data: paginatedData,
          } satisfies TableData);
        });
      }

      // This is also used for Rubix, so it may not work for your application.
      const response = await fetch(url, {
        signal,
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    },
    args: () => [this.dataUri]
  });

  render() {
    const tableBody = this._dataTask.render({
      pending: () => {
        if (this._initialLoad) {
          return html`
            <div>${this.loadingTable()}</div>`;
        }
        return html`
          <div class="reduced-opacity">${this._lastTableContent}</div>`;
      },
      complete: (data) => {
        this._initialLoad = false;
        this._lastTableContent = html`
          <div>${this.renderTable(data as TableData)}</div>`;
        return this._lastTableContent;
      },
      error: (error) => html`
        <div>${error}</div>`
    }) as TemplateResult;

    const hasActions = this.hasSlotController.test(ActionSlots.delete.valueOf())
      || this.hasSlotController.test(ActionSlots.modify.valueOf())
      || this.hasSlotController.test(ActionSlots.create.valueOf())
      || this.hasSlotController.test(ActionSlots.sort.valueOf())
      || this.hasSlotController.test(ActionSlots.filter.valueOf());

    // Headers do not need to be re-rendered with new data
    return html`
      <div class="table-container" ${ref((el) => (this.tableContainer = el))}>
        ${hasActions ? this.getTableHeader() : html``}
        ${tableBody}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.tableContainer) {
        this.tableContainer.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    });

    this.addEventListener('zn-filter-change', this.changeEventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.removeEventListener('zn-filter-change', this.changeEventListener);
  }

  changeEventListener = (e: ZnFilterChangeEvent) => {
    if (e.target instanceof ZnDataTableFilter) {
      this.filter = (e.target as ZnDataTableFilter).value as string;
      this._dataTask.run().then(r => r);
    }
  }

  renderTable(data: TableData) {
    this.itemsPerPage = data.per_page ?? DEFAULT_PER_PAGE;
    this.page = data.page ?? DEFAULT_PAGE;
    this.totalPages = data.total_pages ?? DEFAULT_TOTAL_PAGES;

    if (!data?.data || data.data.length === 0) {
      return html`
        <div class="table--empty">
          <zn-empty-state
            caption="${this.caption ? "No " + this.caption.toLowerCase() + " found" : "No data found"}"
            icon="data_alert">
          </zn-empty-state>
        </div>`;
    }

    const keys = Object.entries(this.headers).map(([key, _]) => key);
    const filteredKeys = keys.filter((key) => !Object.values(this.hiddenColumns).includes(key));

    this._filteredRows = this.getRows(filteredKeys, data);
    this._rows = this.getRows(keys, data);

    const hasSelectedRows = this.selectedRows.length > 0;

    return html`
      <div style="overflow-x: auto">
        <table class="${classMap({
          'table': true,
          'table--standalone': this.standalone,
          'with-hover': !this.unsortable,
          'table-with--checkboxes': !this.hideCheckboxes,
        })}">
          <thead>
          <tr>
            ${this.hideCheckboxes || !hasSelectedRows ? html`` : html`
              <th>
                <div><input type="checkbox" @change="${this.selectAll}"></div>
              </th>`}
            ${filteredKeys.map((key: any) => this.renderCellHeader(key))}
          </tr>
          </thead>
          <tbody>
          ${this._filteredRows.map((row: any) => html`
            <tr>
              ${this.hideCheckboxes ? html`` : html`
                <td class="${classMap({'hidden': !hasSelectedRows})}">
                  <div><input type="checkbox" @change="${this.selectRow}"></div>
                </td>`}
              ${row.map((value: RenderDataValue, index: number) => this.renderCellBody(index, value))}
            </tr>`)}
          </tbody>
        </table>
      </div>

      ${this.getTableFooter()}
    `;
  }

  getTableHeader() {
    return html`
      <div class="table__header">
        <div class="table__header__actions">
          ${this.getActions()}
        </div>
        <div class="table__header__right">
          <slot name="${ActionSlots.sort.valueOf()}"></slot>
          <slot name="${ActionSlots.filter.valueOf()}"></slot>
        </div>
      </div>
    `;
  }

  getTableFooter() {
    const rowSelected = this.getRowsSelected();
    const pagination = this.getPagination();

    if (rowSelected !== null || pagination !== null) {
      return html`
        <div class="table__footer">
          <div class="table__footer__left">
            ${rowSelected}
          </div>
          <div class="table__footer__right">
            ${pagination}
          </div>
        </div>`;
    }

    return html``;
  }

  getRowsSelected() {
    if (this.hideCheckboxes || this.selectedRows.length <= 0) return null;

    return html`
      <p>${this.numberOfRowsSelected} of ${this._rows.length} rows selected</p>`
  }

  getPagination() {
    if (this.hidePagination || (this.totalPages <= 1 && this._rows.length <= 10)) return null;

    const optionsRowsPerPage = [10, 20, 30, 40, 50];
    optionsRowsPerPage.filter((option) => option <= this._rows.length);

    return html`
      <div class="table__footer__rows-per-page">
        <p>Rows per page</p>
        <zn-select name="rowPerPage"
                   size="small"
                   value="${this.itemsPerPage}"
                   @zn-change="${this.updateRowsPerPage}">
          ${optionsRowsPerPage.map((option) => html`
            <zn-option value="${option}"
                       selected="${option === this.itemsPerPage || nothing}">${option}
            </zn-option>`
          )}
        </zn-select>
      </div>

      ${this.totalPages <= 1
        ? html``
        : html`
          <div class="table__footer__pagination-count">
            <p>Page ${this.page} of ${this.totalPages}</p>
          </div>

          <div class="table__footer__pagination-buttons">
            <zn-button @click="${this.page !== 1 ? this.goToFirstPage : undefined}"
                       ?disabled="${this.page === 1}"
                       icon-size="16"
                       size="small"
                       icon="keyboard_double_arrow_left"
                       outline>
            </zn-button>
            <zn-button @click="${this.page !== 1 ? this.goToPreviousPage : undefined}"
                       ?disabled="${this.page === 1}"
                       icon-size="16"
                       size="small"
                       icon="chevron_left"
                       outline>
            </zn-button>
            <zn-button @click="${this.page !== this.totalPages ? this.goToNextPage : undefined}"
                       ?disabled="${this.page === this.totalPages}"
                       icon-size="16"
                       size="small"
                       icon="chevron_right"
                       outline>
            </zn-button>
            <zn-button @click="${this.page !== this.totalPages ? this.goToLastPage : undefined}"
                       ?disabled="${this.page === this.totalPages}"
                       icon-size="16"
                       size="small"
                       icon="keyboard_double_arrow_right"
                       outline>
            </zn-button>
          </div>`}`;
  }

  getActions() {
    const actions = [];

    if (this.selectedRows.length > 0) {
      actions.push(html`
        <zn-button @click="${this.clearSelectedRows}" size="small" outline>
          Clear Selection
        </zn-button>`);

      if (this.hasSlotController.test(ActionSlots.delete.valueOf())) {
        actions.push(html`
          <slot name="${ActionSlots.delete.valueOf()}"></slot>`);
      }

      if (this.hasSlotController.test(ActionSlots.modify.valueOf())) {
        actions.push(html`
          <slot name="${ActionSlots.modify.valueOf()}"></slot>`);
      }
    }

    if (this.hasSlotController.test(ActionSlots.create.valueOf())) {
      actions.push(html`
        <slot name="${ActionSlots.create.valueOf()}"></slot>`);
    }

    return actions;
  }

  goToPage(page: number) {
    this.page = page;
    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this._dataTask.run().then(r => r);

    if (this.resizeObserver) {
      this.resizeObserver.observe(this);
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToPreviousPage() {
    this.goToPage(Math.max(this.page - 1, 1));
  }

  goToNextPage() {
    this.goToPage(Math.min(this.page + 1, this.totalPages));
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  updateRowsPerPage(event: Event) {
    const select = event.target as ZnSelect;
    this.itemsPerPage = parseInt(select.value as string);
    this.page = 1; // reset the page to 1 when changing the number of rows per page
    this.requestUpdate();
    this._dataTask.run().then(r => r);
  }

  selectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;

    // go through all the checkboxes and check them
    for (const row of this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')) {
      (row as HTMLInputElement).checked = checked;
    }

    this.selectedRows = checked ? this._rows : [];
    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }


  private updateActionKeys(slotName: string) {
    if (this.hasSlotController.test(slotName)) {
      // we need to look into the slot controller for the keys input
      const slots = this.hasSlotController.getSlots(slotName);
      if (slots) {
        slots.forEach((slot) => {
          const input = slot.querySelector('input[name="keys"]');
          if (input && input instanceof HTMLInputElement) {
            input.value = this.getSelectedKeys().join(',');
          }
        });
      }
    }
  }

  selectRow(e: PointerEvent) {
    if (!(e.target && (e.target instanceof Element))) {
      return;
    }

    let target: HTMLElement = e.target as HTMLElement;
    // if is a button or a link continue
    if (target.tagName === 'ZN-BUTTON' || target.tagName === 'A' || target.tagName === 'BUTTON') {
      return
    }

    // traverse parent until we reach a tr
    while (target && target.tagName !== 'TR') {
      target = target.parentElement as HTMLElement;
    }

    if (target === null) {
      return;
    }

    const checkbox = target.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = !checkbox.checked;

    this.selectedRows = this._rows.filter((_, index) => {
      return (this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')[index] as HTMLInputElement)?.checked;
    });

    this.numberOfRowsSelected = this.selectedRows.length;
    this.updateKeys();
    this.requestUpdate();
  }

  clearSelectedRows(event: Event) {
    const button = event.target as ZnButton;
    if (button.disabled) return;

    (this.renderRoot.querySelectorAll('thead input[type="checkbox"]')[0] as HTMLInputElement).checked = false;
    for (const row of this.renderRoot.querySelectorAll('tbody input[type="checkbox"]')) {
      (row as HTMLInputElement).checked = false;
    }

    this.selectedRows = [];
    this.numberOfRowsSelected = 0;
    this.requestUpdate();
  }

  updateSort(key: string) {
    // Rerun the render task with the extra params
    return () => {
      this.sortColumn = key;
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this._dataTask.run().then(r => r);
    };
  }

  renderData(data: RenderDataValue) {
    if (data && typeof data === 'object') {
      let content: TemplateResult = html`${data['value']}`;

      if (data['html']) {
        return html`${unsafeHTML(data['html'])}`;
      }

      if (data['type'] === 'timestamp') {
        const timestamp = typeof data['value'] === 'string' ? parseInt(data['value']) : data['value'];
        content = html`${new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          hourCycle: 'h12',
          timeZone: 'UTC'
        }).format(new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp))}`;
      }

      if (data['tag'] === 'zn-chip') {
        const type = data['type'];
        content = html`
          <zn-chip type="${type}">${content}</zn-chip>`;
      }

      if (data['tag'] === 'code') {
        content = html`
          <code>${content}</code>`;
      }

      if (data['url']) {
        content = html`
          <a href="${data['url']}"
             data-target="${ifDefined(data['target'])}"
             gaid="${ifDefined(data['gaid'])}">${content}</a>`;
      }

      if (data['caption']) {
        let title = html`<span class="title">${data['caption'].title}</span>`;
        let captionIcon = html``;

        if (data['caption'].icon) {
          const icon = data['caption'].icon;
          const src = icon['src'] ?? icon;
          const size = icon['size'] ?? 16;
          const color = icon['color'] ?? '';

          captionIcon = html`
            <zn-icon src="${src}" size="${size}" color="${color}"></zn-icon>`;
        }

        if (data['caption'].uri) {
          title = html` <a data-target=${ifDefined(data['caption'].target || nothing)}
                           href="${data['caption'].uri}"
                           gaid=${ifDefined(data['caption'].gaid)}
                           class="title">
            ${data['caption'].title}
          </a>`
        }

        content = html`
          <div class="${classMap({
            'caption': true,
            'caption--icon': data['caption'].icon !== undefined,
          })}">
            ${captionIcon}
            ${title}
            <span class="summary">${data['caption'].summary}</span>
          </div>`;
      }

      if (data['hover']) {
        const placement = data['hover'].placement ?? 'top';

        if (data['hover'].icon) {
          const icon = data['hover'].icon;
          const src = icon['src'] ?? icon;
          const size = icon['size'] ?? 16;
          const color = icon['color'] ?? '';

          return html`
            ${data['hover'].label}
            <zn-hover-container placement="${placement}"
                                flip>
              <zn-icon src="${src}" size="${size}" color="${color}"></zn-icon>
              <div slot="content">
                ${unsafeHTML(data['hover'].content)}
              </div>
            </zn-hover-container>`;
        }

        return html`
          ${data['hover'].label}
          <zn-hover-container placement="${placement}"
                              flip>
            <div slot="anchor">${data['hover'].anchor}</div>
            ${unsafeHTML(data['hover'].content)}
          </zn-hover-container>`;
      }

      if (data['menu']) {
        return html`
          <zn-dropdown>
            <zn-button slot="trigger" icon="more_horiz" icon-size="24" color="transparent" size="content"></zn-button>
            <zn-menu>
              ${data['menu'].map((item: MenuConfig) => {
                return html`
                  <zn-menu-item id="${item.id}"
                                href="${item.href}"
                                gaid="${item.gaid}"
                                data-target="${ifDefined(item.target)}">
                    ${item.label}
                  </zn-menu-item>`;
              })}
            </zn-menu>
          </zn-dropdown>`
      }

      if (data['buttons']) {
        content = html`
          ${Object.values(data['buttons']).map((button) => {
            if (button.confirm) {
              return html`
                <div>
                  <zn-button
                    id="${button.id}"
                    size="${button.size}"
                    color="${button.color}"
                    icon="${button.icon}"
                    icon-size="${button.iconSize}"
                    tooltip="${button.tooltip}"
                    outline="${ifDefined(button.outline)}">
                    ${button.label || nothing}
                  </zn-button>
                  <zn-confirm
                    fid="${button.confirm.fid}"
                    trigger="${button.confirm.trigger}"
                    type="${button.confirm.type}"
                    caption="${button.confirm.caption}"
                    content="${button.confirm.content}"
                    action="${button.confirm.action}"></zn-confirm>
                </div>`;
            }
            return html`
              <zn-button
                id="${button.id}"
                href="${button.href}"
                gaid="${button.gaid}"
                size="${button.size}"
                color="${button.color}"
                icon="${button.icon}"
                icon-size="${button.iconSize}"
                tooltip="${button.tooltip}"
                data-target="${['modal', 'slide'].includes(button.target) ? button.target : nothing}"
                target="${!['modal', 'slide'].includes(button.target) ? button.target : nothing}"
                outline="${ifDefined(button.outline)}">
                ${button.label || nothing}
              </zn-button>`;
          })}`;
      }

      if (data['icon']) {
        const icon = data['icon']?.['src'] ?? data['icon'];
        const size = data['icon']?.['size'] ?? 16;
        const color = data['icon']?.['color'] ?? '';

        content = html`
          <zn-icon src="${icon}" size="${size}" color="${color}"></zn-icon> ${content}`;
      }

      return content;
    }

    return data;
  }

  private getTableSortIcon(key: any) {
    if (this.sortColumn !== key) {
      return html`
        <div class="table__head__sort">
          <zn-icon src="unfold_more" size="14"></zn-icon>
        </div>`;
    }

    if (this.sortDirection === 'asc') {
      return html`
        <div class="table__head__sort table__head__sort--active">
          <zn-icon src="arrow_downward_alt" size="16"></zn-icon>
        </div>`;
    }

    return html`
      <div class="table__head__sort table__head__sort--active">
        <zn-icon src="arrow_upward_alt" size="16"></zn-icon>
      </div>`;
  }

  private renderCellHeader(key: string) {
    const sortable = !Object.values(this.unsortableHeaders).includes(key) && !Object.values(this.hiddenHeaders).includes(key) && !this.unsortable;
    let headerKeys = Object.keys(this.headers);
    headerKeys = headerKeys.filter((k) => !Object.values(this.hiddenColumns).includes(k));
    const header: string | HeaderConfig = this.headers[key];

    if (this.hasHeaderPosition(header)) {
      return html`
        <th
          class="${classMap({
            'table__head': true,
            'table__head--wide': key === this.wideColumn,
            'table__head--last': key === headerKeys[headerKeys.length - 1],
            'table__head--hidden': Object.values(this.hiddenHeaders).includes(key),
            [`table__head--${header.position}`]: true
          })}"
          @click="${sortable ? this.updateSort(key) : undefined}">
          <div>
            ${header.title}
            ${sortable ? this.getTableSortIcon(key) : nothing}
          </div>
        </th>
      `;
    }

    return html`
      <th
        class="${classMap({
          'table__head': true,
          'table__head--wide': key === this.wideColumn,
          'table__head--last': key === headerKeys[headerKeys.length - 1],
          'table__head--hidden': Object.values(this.hiddenHeaders).includes(key),
        })}"
        @click="${sortable ? this.updateSort(key) : undefined}">
        <div>
          ${header}
          ${sortable ? this.getTableSortIcon(key) : nothing}
        </div>
      </th>
    `;
  }

  private renderCellBody(index: number, value: RenderDataValue) {
    const headerKeys: string[] = Object.keys(this.headers).filter(
      (key) => !Object.values(this.hiddenColumns).includes(key)
    );
    const headerKey: string = headerKeys[index];
    const header = this.headers[headerKey];

    if (this.hasHeaderPosition(header)) {
      return html`
        <td
          @click="${this.selectRow}"
          class="${classMap({
            'table__cell': true,
            'table__cell--wide': headerKey === this.wideColumn,
            'table__cell--last': headerKey === headerKeys[headerKeys.length - 1],
            [`table__cell--${header.position}`]: true
          })}">
          <div>${this.renderData(value)}</div>
        </td>`;
    }

    return html`
      <td
        @click="${this.selectRow}"
        class="${classMap({
          'table__cell': true,
          'table__cell--wide': headerKey === this.wideColumn,
          'table__cell--last': headerKey === headerKeys[headerKeys.length - 1],
        })}">
        <div>${this.renderData(value)}</div>
      </td>`;
  }

  private hasHeaderPosition(header: string | HeaderConfig) {
    return typeof header === 'object' && header !== null && 'position' in header && 'title' in header;
  }

  private getRows(keys: string[], data: TableData) {
    let rows = Object.values(data.data).map((row: any) => {
      return keys.map((header: any) => row[header]);
    });

    if (this.dataUri && this.sortColumn) {
      // sort the rows by the key
      rows = rows.sort((a, b) => {
        return this.sortData(a[keys.indexOf(this.sortColumn)], b[keys.indexOf(this.sortColumn)]);
      });
    }

    return rows;
  }

  private getSelectedKeys() {
    const headerKeys = Object.keys(this.headers);
    return this.selectedRows.map((row) => row[headerKeys.indexOf(this.key)]);
  }

  private updateKeys() {
    this.updateModifyKeys();
    this.updateDeleteKeys();
  }

  private updateModifyKeys() {
    this.updateActionKeys('modify-action');
  }

  private updateDeleteKeys() {
    this.updateActionKeys('delete-action');
  }

  private sortData(a: RenderDataValue | string | number | object | undefined, b: RenderDataValue | string | number | object | undefined) {
    if (a === undefined || b === undefined) {
      return 0;
    }

    if (typeof a === 'object' && 'caption' in a && 'title' in a.caption) {
      a = a.caption.title as string;
    } else if (typeof a === 'object' && a && 'value' in a) {
      a = a.value as string | number;
    }

    if (typeof b === 'object' && 'caption' in b && 'title' in b.caption) {
      b = b.caption.title as string;
    } else if (typeof b === 'object' && b && 'value' in b) {
      b = b.value as string | number;
    }

    if (typeof a === 'string') {
      a = a.toLowerCase();
    }

    if (typeof b === 'string') {
      b = b.toLowerCase();
    }

    if (this.sortDirection === 'asc') {
      return a > b ? 1 : a < b ? -1 : 0;
    }

    return a < b ? 1 : a > b ? -1 : 0;
  }

  private loadingTable() {
    return html`
      <div class="table-container">
        <table class="${classMap({
          'table': true,
          'table--standalone': this.standalone,
        })}">
          <thead>
          <tr>
            <th colspan="30%"></th>
            <th colspan="25%"></th>
            <th colspan="20%"></th>
            <th colspan="15%"></th>
            <th colspan="10%"></th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td colspan="30%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="25%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="20%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="15%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="10%">
              <zn-skeleton></zn-skeleton>
            </td>
          </tr>
          <tr>
            <td colspan="30%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="25%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="20%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="15%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="10%">
              <zn-skeleton></zn-skeleton>
            </td>
          </tr>
          <tr>
            <td colspan="30%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="25%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="20%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="15%">
              <zn-skeleton></zn-skeleton>
            </td>
            <td colspan="10%">
              <zn-skeleton></zn-skeleton>
            </td>
          </tr>
          </tbody>
        </table>
      </div>`;
  }
}
