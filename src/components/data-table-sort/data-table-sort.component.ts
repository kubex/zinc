import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './data-table-sort.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-table-sort
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
export default class ZnDataTableSort extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  render() {
    return html`
      <zn-dropdown distance="50" placement="bottom-start" class="data-table-sort">
        <zn-button color="transparent" size="x-small" icon="sort" icon-size="22" slot="trigger" tooltip="Open Sort">
          Sort
        </zn-button>

        <div class="data-table-sort__dropdown">
          <span class="data-table-sort__header">Sort by:</span>

          <div class="data-table-sort__controls">
            <zn-select>
              <zn-option value="0">Option 1</zn-option>
              <zn-option value="1">Option 2</zn-option>
            </zn-select>
            <zn-select value="ASC">
              <zn-option value="ASC">Ascending</zn-option>
              <zn-option value="DESC">Descending</zn-option>
            </zn-select>
          </div>

          <div class="data-table-sort__btn-group">
            <zn-button color="secondary" slot="footer">Cancel</zn-button>
            <div>
              <zn-button color="transparent" size="x-small" slot="footer">Clear</zn-button>
              <zn-button color="default" slot="footer">Update</zn-button>
            </div>
          </div>
      </zn-dropdown>`;
  }
}
