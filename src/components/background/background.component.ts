import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {styleMap} from 'lit/directives/style-map.js';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';

import styles from './background.scss';

export type BackgroundImageStrength = 'soft' | 'medium' | 'full';
export type BackgroundMotion = 'none' | 'drift' | 'breathe';
export type BackgroundOverlay = 'none' | 'soft' | 'strong';
export type BackgroundOverlayTone = 'light' | 'dark';

/**
 * @summary Composes a colour, decorative image, image strength, optional motion and contrast overlay behind slotted content.
 *
 * @documentation https://zinc.style/components/background
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - Content displayed above the background layers.
 *
 * @csspart base - The component's full-size background canvas.
 * @csspart image - The decorative background image.
 * @csspart overlay - The contrast overlay between the image and content.
 * @csspart floating-icons - The non-interactive layer containing the floating icons.
 * @csspart floating-icon - Each floating `zn-icon`.
 * @csspart content - The wrapper around the default slot.
 *
 * @cssproperty --zn-background-color - Fallback colour when the `color` attribute is not set.
 * @cssproperty --zn-background-image-position - Position of the background image. Defaults to `center`.
 * @cssproperty --zn-background-overlay-angle - Direction of the overlay gradient. Defaults to `110deg`.
 * @cssproperty --zn-background-floating-icon-color - Colour of the floating icons. Defaults to `currentColor`.
 */
export default class ZnBackground extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-icon': ZnIcon};

  private readonly resizeObserver = new ResizeController<number>(this, {
    callback: entries => {
      const width = entries[0]?.contentRect.width ?? this.offsetWidth;
      return Math.max(1, Math.min(width * 0.05, 150));
    },
  });

  /** URL of the decorative background image. */
  @property() image = '';

  /** CSS colour painted beneath the image. */
  @property() color = '';

  /** Visibility of the image: `soft` (30%), `medium` (62%) or `full` (100%). */
  @property({attribute: 'image-strength', reflect: true}) imageStrength: BackgroundImageStrength = 'full';

  /** Subtle animation applied to the image. Motion stops when reduced motion is requested. */
  @property({reflect: true}) motion: BackgroundMotion = 'none';

  /** Strength of the contrast gradient above the image. */
  @property({reflect: true}) overlay: BackgroundOverlay = 'soft';

  /** Whether the overlay uses a light or dark contrast treatment. */
  @property({attribute: 'overlay-tone', reflect: true}) overlayTone: BackgroundOverlayTone = 'light';

  /** Comma-separated Zinc icon names placed as ambient decoration. At most eight are rendered. */
  @property({attribute: 'floating-icons'}) floatingIcons = '';

  /** Pauses background motion without changing the selected motion treatment. */
  @property({type: Boolean, reflect: true}) paused = false;

  render() {
    const floatingIcons = this.floatingIcons
      .split(',')
      .map(icon => icon.trim())
      .filter(Boolean)
      .slice(0, 8);
    const floatingIconSize = this.resizeObserver.value ?? 1;

    return html`
      <div
        part="base"
        class="background"
        style=${styleMap({'--_zn-background-color': this.color || undefined})}>
        ${this.image ? html`
          <img
            part="image"
            class="background__image"
            src=${this.image}
            alt=""
            decoding="async">
        ` : ''}
        <div part="overlay" class="background__overlay" aria-hidden="true"></div>
        ${floatingIcons.length ? html`
          <div part="floating-icons" class="background__floating-icons" aria-hidden="true">
            ${floatingIcons.map(icon => html`
              <zn-icon
                part="floating-icon"
                class="background__floating-icon"
                src=${icon}
                size=${floatingIconSize}
                aria-hidden="true"></zn-icon>
            `)}
          </div>
        ` : ''}
        <div part="content" class="background__content"><slot></slot></div>
      </div>
    `;
  }
}
