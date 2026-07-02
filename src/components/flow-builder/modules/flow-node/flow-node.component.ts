import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import ZincElement from '../../../../internal/zinc-element';
import ZnButton from '../../../button';
import ZnDropdown from '../../../dropdown';
import ZnIcon from '../../../icon';
import ZnMenu from '../../../menu';
import ZnMenuItem from '../../../menu-item';

import {
  type FlowNodeInstance,
  type FlowNodeType,
  type FlowPort,
  NODE_HEIGHT,
  NODE_WIDTH,
  nodeInputs,
  nodeOutputs,
} from '../../flow.types';

import styles from './flow-node.scss';

/**
 * @summary A single node tile on the flow canvas, with input/output ports and a context menu.
 * @documentation https://zinc.style/components/flow-node
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-button
 * @dependency zn-dropdown
 * @dependency zn-menu
 * @dependency zn-menu-item
 *
 * @event flow-node-select - Emitted when the node body is clicked.
 * @event flow-node-grab - Emitted on pointerdown of the node body to begin a move (handled by the canvas).
 * @event flow-node-action - Emitted when a context-menu action (delete/duplicate/move) is chosen.
 * @event flow-port-click - An output port was clicked; the canvas starts (or attaches) a branch.
 *
 * @csspart base - The node card wrapper.
 */
export default class ZnFlowNode extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-button': ZnButton,
    'zn-dropdown': ZnDropdown,
    'zn-menu': ZnMenu,
    'zn-menu-item': ZnMenuItem,
  };

  @property({attribute: false}) node: FlowNodeInstance;
  @property({attribute: false}) type: FlowNodeType;

  @property({type: Boolean, reflect: true}) selected = false;
  @property({type: Boolean, reflect: true}) error = false;
  @property({type: Boolean, reflect: true}) dragging = false;
  /** A stray branch is snapped onto this node — highlight it as the drop target. */
  @property({type: Boolean, reflect: true, attribute: 'link-target'}) linkTarget = false;

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    // Position is owned by the canvas (a transformed wrapper) so it updates live
    // during a drag; the node owns only its size and accent colour.
    this.style.width = `${NODE_WIDTH}px`;
    this.style.height = `${NODE_HEIGHT}px`;
    this.style.setProperty('--node-accent', this.type?.color ?? 'rgb(var(--zn-color-primary))');
  }

  private get nodeTitle(): string {
    return this.node?.label ?? this.type?.label ?? this.node?.type ?? 'Node';
  }

  private get nodeSubtitle(): string {
    const sub = this.node?.data?.['subtitle'] ?? this.node?.data?.['description'];
    return typeof sub === 'string' ? sub : (this.type?.description ?? '');
  }

  private _emit(name: string, detail: Record<string, unknown>) {
    this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true, detail}));
  }

  private _onBodyPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.port') || target.closest('zn-dropdown')) return;
    e.stopPropagation();
    this._emit('flow-node-select', {nodeId: this.node.id});
    this._emit('flow-node-grab', {nodeId: this.node.id, clientX: e.clientX, clientY: e.clientY});
  };

  private _action(action: 'delete' | 'duplicate' | 'move') {
    this._emit('flow-node-action', {nodeId: this.node.id, action});
  }

  // Input ports are visual anchors only; the output stem port (rendered in
  // `render`) spawns a branch on click.
  private _renderPorts(ports: FlowPort[], side: 'in' | 'out') {
    const count = ports.length;
    return html`
      <div class="ports ports--${side}">
        ${ports.map((port, i) => {
      const left = `${(100 * (i + 1)) / (count + 1)}%`;
      return html`
            <div class="port-wrap" style="left:${left}">
              ${side === 'out' && port.label
        ? html`<span class="port-label">${port.label}</span>`
        : ''}
              <span class="port port--${side}" data-node="${this.node.id}" data-port="${port.id}"></span>
            </div>
          `;
    })}
      </div>
    `;
  }

  render() {
    if (!this.node) return html``;

    const inputs = nodeInputs(this.node, this.type);
    const outputs = nodeOutputs(this.node, this.type);

    return html`
      <div
        part="base"
        class="${classMap({card: true, selected: this.selected, error: this.error, 'link-target': this.linkTarget})}"
        @pointerdown="${this._onBodyPointerDown}"
      >
        ${inputs.length ? this._renderPorts(inputs, 'in') : ''}

        <div class="body">
          <div class="icon-tile">
            ${this.type?.icon
      ? html`
                <zn-icon src="${this.type.icon}" library="${ifDefined(this.type.iconLibrary)}" size="20"></zn-icon>`
      : html`
                <zn-icon src="circle" library="lucide" size="20"></zn-icon>`}
          </div>
          <div class="text">
            <span class="title">${this.nodeTitle}</span>
            ${this.nodeSubtitle ? html`<span class="subtitle">${this.nodeSubtitle}</span>` : ''}
          </div>
          <zn-dropdown class="menu">
            <zn-button slot="trigger" icon="ellipsis@lu" icon-size="20" icon-button="small" plain></zn-button>
            <zn-menu>
              <zn-menu-item class="danger" @click="${() => this._action('delete')}">Delete</zn-menu-item>
              <zn-menu-item @click="${() => this._action('move')}">Move</zn-menu-item>
              <zn-menu-item @click="${() => this._action('duplicate')}">Duplicate</zn-menu-item>
            </zn-menu>
          </zn-dropdown>
        </div>

        ${outputs.length
      ? html`
            <div class="ports ports--out">
              <div class="port-wrap" style="left:50%">
                <span
                  class="port port--out"
                  title="Start a branch"
                  @pointerdown="${(e: PointerEvent) => e.button === 0 && e.stopPropagation()}"
                  @click="${(e: Event) => {
        e.stopPropagation();
        this._emit('flow-port-click', {nodeId: this.node.id});
      }}"
                ></span>
              </div>
            </div>`
      : ''}
      </div>
    `;
  }
}
