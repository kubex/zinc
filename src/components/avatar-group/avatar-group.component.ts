import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnTooltip from '../tooltip';

import styles from './avatar-group.scss';

/**
 * @summary Overlapping avatars that show each person's name on hover, collapsing any past `max` into a "+N" count.
 * @documentation https://zinc.style/components/avatar-group
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-tooltip
 *
 * @slot - `zn-icon` avatars. Each one's tooltip shows its `alt`, or its `src` when it has none.
 *
 * @csspart base - The component's base wrapper.
 * @csspart overflow - The "+N" count standing in for the avatars past `max`.
 *
 * @cssproperty --zn-avatar-ring-color - The ring that separates overlapping avatars; defaults to the panel surface.
 */
export default class ZnAvatarGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-tooltip': ZnTooltip,
  };

  /** The most avatars to show; the rest are counted in a "+N" avatar whose tooltip lists them. 0 shows them all. */
  @property({type: Number}) max = 0;

  @state() private _avatars: HTMLElement[] = [];

  constructor() {
    super();
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'alt', 'size']},
      callback: () => this._syncAvatars(),
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncAvatars();
  }

  // Each avatar is routed to its own slot so it can sit inside a tooltip of its own
  private _syncAvatars() {
    this._avatars = [...this.children].filter((el): el is HTMLElement => el instanceof HTMLElement);
    this._avatars.forEach((avatar, i) => {
      const slot = `avatar-${i}`;
      if (avatar.slot !== slot) avatar.slot = slot;
      // The ring and overlap are circular, so a square avatar would show its corners outside them
      if (!avatar.hasAttribute('round')) avatar.setAttribute('round', '');
    });
  }

  private _name(avatar: HTMLElement) {
    return avatar.getAttribute('alt') || avatar.getAttribute('src') || avatar.textContent?.trim() || '';
  }

  render() {
    const shown = this.max > 0 && this._avatars.length > this.max ? this._avatars.slice(0, this.max) : this._avatars;
    const hidden = this._avatars.slice(shown.length);
    const hiddenNames = hidden.map(avatar => this._name(avatar)).filter(Boolean).join(', ');
    const size = (shown[0] as HTMLElement & { size?: number })?.size;

    return html`
      <div part="base" class="avatar-group" role="group">
        ${shown.map((avatar, i) => html`
          <zn-tooltip content="${this._name(avatar)}">
            <slot name="avatar-${i}"></slot>
          </zn-tooltip>`)}
        ${hidden.length > 0 ? html`
          <zn-tooltip content="${hiddenNames}">
            <span part="overflow" class="avatar-group__overflow" tabindex="0" role="img"
                  aria-label="${hidden.length} more: ${hiddenNames}"
                  style="${size ? `--avatar-size: ${size}px` : ''}">+${hidden.length}</span>
          </zn-tooltip>` : ''}
      </div>`;
  }
}
