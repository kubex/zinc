import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnIcon from '../../../icon';

import {emptyDragImage, FLOW_TYPE_MIME} from '../../flow.types';

import styles from './flow-step.scss';

/**
 * @summary A draggable step in the `<zn-flow-steps>`, representing a registered node type. Drag
 *   it onto the canvas (or a "+" slot) of a `<zn-flow-builder>` to add that step.
 * @documentation https://zinc.style/components/flow-step
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @event flow-step-drag - Emitted on dragstart with `detail.type`, so the builder can preview the drop.
 * @event flow-step-drag-end - Emitted on dragend.
 *
 * @slot - The step's label. May also hold `<zn-flow-filter>` declarations (never displayed)
 *   that drive the flow builder's built-in branch conditions editor.
 *
 * @csspart base - The row.
 */
export default class ZnFlowStep extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {'zn-icon': ZnIcon};

  /** The node type id this item creates when dropped. */
  @property() type: string;
  /** Display label; falls back to the slotted text. Also used as the node's label. */
  @property() label: string;
  @property() icon: string;
  @property({attribute: 'icon-library'}) iconLibrary: string;
  @property() color: string;
  @property() description: string;
  /** JSON array of input ports — `""` for a trigger (no input), omit for a single default input. */
  @property() inputs: string;
  /** JSON array of outputs (`"a"` or `{"id","label"}`), e.g. `'[{"id":"true","label":"TRUE"}]'`. Omit for one default output. */
  @property() outputs: string;

  connectedCallback() {
    super.connectedCallback();
    this.draggable = true;
    this.addEventListener('dragstart', this._onDragStart);
    this.addEventListener('dragend', this._onDragEnd);
  }

  disconnectedCallback() {
    this.removeEventListener('dragstart', this._onDragStart);
    this.removeEventListener('dragend', this._onDragEnd);
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    this.style.setProperty('--node-accent', this.color ?? 'rgb(var(--zn-color-primary))');
  }

  private _onDragStart = (e: DragEvent) => {
    if (!e.dataTransfer || !this.type) return;
    e.dataTransfer.setData(FLOW_TYPE_MIME, this.type);
    e.dataTransfer.effectAllowed = 'copyMove';
    // Hide the native drag image — the builder shows an in-canvas preview instead.
    e.dataTransfer.setDragImage(emptyDragImage(), 0, 0);
    this.dispatchEvent(new CustomEvent('flow-step-drag', {
      bubbles: true,
      composed: true,
      detail: {type: this.type}
    }));
  };

  private _onDragEnd = () => {
    this.dispatchEvent(new CustomEvent('flow-step-drag-end', {bubbles: true, composed: true}));
  };

  render() {
    return html`
      <span part="base" class="item__icon">
        <zn-icon src="${this.icon ?? 'circle'}" library="${ifDefined(this.iconLibrary)}" size="16"></zn-icon>
      </span>
      <span class="item__label"><slot>${this.label ?? ''}</slot></span>
    `;
  }
}
