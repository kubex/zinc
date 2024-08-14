import {html, unsafeCSS} from "lit";

import styles from './index.scss?inline';
import {customElement, property} from "lit/decorators.js";
import {EmptyZincFormElement} from "@/empty-zinc-form-element";
import {HasSlotController} from "@/slot";
import {classMap} from "lit/directives/class-map.js";

@customElement('zn-color-select')
export class ColorSelect extends EmptyZincFormElement
{
  static styles = unsafeCSS(styles);

  @property() label: string;
  @property() helpText: string;
  @property() placeholder: string;

  // Popup
  @property() placement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' = 'bottom-start';

  @property() size: 'small' | 'medium' | 'large' = 'medium';

  @property({type: Boolean}) clearable: boolean;
  @property({type: Boolean}) disabled: boolean;

  protected readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');

  private handleLabelClick() {

  }

  protected render()
  {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHelpText = this.helpText ? true : !!hasHelpTextSlot;
    const hasClearIcon = this.clearable && !this.disabled && this.value.length > 0;
    const isPlaceholderVisible = this.placeholder && this.value.length === 0;

    return html`
      <div
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--has-label': hasLabel,
          'form-control--has-help-text': hasHelpText,
        })}>
        <label
          id="label"
          part="form-control-label"
          class="form-control__label"
          aria-hidden=${hasLabel ? 'false' : 'true'}
          @click=${this.handleLabelClick}>
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <zn-popup
            placement="bottom-start"
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10"
          >
            omskfmsdf
          </zn-popup>
          sdf
        </div>
      </div>
    `;
  }
}
