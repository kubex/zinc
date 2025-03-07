import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './form-group.scss';
import {classMap} from "lit/directives/class-map.js";
import {HasSlotController} from "../../internal/slot";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/form-group
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 *
 */
export default class ZnFormGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');

  /**
   * The form group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot
   * instead.
   */
  @property() label = '';

  /**
   * Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the
   * `label-tooltip` slot instead.
   */
  @property({attribute: 'label-tooltip'}) labelTooltip = '';

  /** The form groups help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText = '';


  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltipSlot = this.hasSlotController.test('label-tooltip');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasLabelTooltip = this.labelTooltip ? true : hasLabelTooltipSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;

    return html`
      <fieldset
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control--has-label': hasLabel,
          'form-control--has-label-tooltip': hasLabelTooltip,
          'form-control--has-help-text': hasHelpText
        })}
        aria-labelledby="label"
        aria-describedby="help-text">

        <zn-cols layout="1,2" mc="2">
          <div>
            <label
              part="form-control-label"
              id="label"
              class="form-control__label"
              aria-hidden=${hasLabel ? 'false' : 'true'}>
              <slot name="label">${this.label}</slot>
              ${hasLabelTooltip
                ? html`
                  <zn-tooltip class="form-control--label-tooltip">
                    <div slot="content">
                      <slot name="label-tooltip">${this.labelTooltip}</slot>
                    </div>
                    <zn-icon src="info"></zn-icon>
                  </zn-tooltip>`
                : ''}
            </label>

            <div
              part="form-control-help-text"
              id="help-text"
              class="form-control__help-text"
              aria-hidden=${hasHelpText ? 'false' : 'true'}>
              <slot name="help-text">${this.helpText}</slot>
            </div>
          </div>


          <div part="form-control-input" class="form-control-input">
            <slot></slot>
          </div>
        </zn-cols>
      </fieldset>`;
  }
}
