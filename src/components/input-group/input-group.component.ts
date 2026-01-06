import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type ZnInput from "../input";
import type ZnSelect from "../select";

import styles from './input-group.scss';

/**
 * @summary A wrapper component that groups inputs and selects visually.
 * @documentation https://zinc.style/components/input-group
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot for inputs and selects.
 * @slot label - The input group's label. Alternatively, you can use the `label` attribute.
 *
 * @csspart base - The component's base wrapper.
 * @csspart form-control - The form control wrapper.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input group container.
 */
export default class ZnInputGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, 'label');

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;

  /** The input group's label. If you need to display HTML, use the `label` slot. */
  @property() label = '';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('zn-change', this.handleDependencyChange);
    this.addEventListener('zn-input', this.handleDependencyChange);
    this.addEventListener('change', this.handleDependencyChange);
    this.addEventListener('input', this.handleDependencyChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('zn-change', this.handleDependencyChange);
    this.removeEventListener('zn-input', this.handleDependencyChange);
    this.removeEventListener('change', this.handleDependencyChange);
    this.removeEventListener('input', this.handleDependencyChange);
  }

  private handleDependencyChange = () => {
    const dependentElements = this.querySelectorAll('[data-disable-on]');

    dependentElements.forEach(el => {
      const selector = el.getAttribute('data-disable-on');
      if (!selector) return;

      let trigger: ZnInput | ZnSelect | null = null;

      try {
        trigger = this.querySelector(selector);
      } catch (e) {
        // no-op
      }

      if (!trigger) {
        const idSelector = selector.startsWith('#') ? selector : `#${selector}`;
        try {
          trigger = this.querySelector(idSelector)!;
        } catch (e) {
          // no-op
        }
      }

      if (trigger) {
        this.updateDependencyState(el as HTMLElement, trigger);
      }
    });
  };

  private updateDependencyState(target: HTMLElement, trigger: ZnInput | ZnSelect) {
    const disableValue = target.getAttribute('data-disable-value');
    if (disableValue !== null) {
      const triggerValue = String(trigger.value);
      const valuesToCheck = disableValue.split(',').map(v => v.trim());
      const shouldDisable = valuesToCheck.includes(triggerValue);
      this.toggleDisabled(target, shouldDisable);
    }
  }

  private toggleDisabled(target: HTMLElement, disabled: boolean) {
    if ('disabled' in target) {
      target.disabled = disabled;
    } else {
      if (disabled) {
        target.setAttribute('disabled', '');
      } else {
        target.removeAttribute('disabled');
      }
    }
  }

  private handleSlotChange() {
    const slottedElements = [...this.defaultSlot.assignedElements({flatten: true})] as HTMLElement[];

    // Filter for inputs and selects
    const supportedTags = ['ZN-INPUT', 'ZN-SELECT', 'ZN-BUTTON'];
    const controls = slottedElements.filter(el => supportedTags.includes(el.tagName));

    controls.forEach(el => {
      const index = controls.indexOf(el);

      el.toggleAttribute('data-zn-input-group__input', true);
      el.toggleAttribute('data-zn-input-group__input--first', index === 0);
      el.toggleAttribute('data-zn-input-group__input--inner', index > 0 && index < controls.length - 1);
      el.toggleAttribute('data-zn-input-group__input--last', index === controls.length - 1);
    });

    this.handleDependencyChange();
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabel = this.label ? true : hasLabelSlot;

    return html`
      <div part="form-control"
           class="${classMap({
             'form-control': true,
             'form-control--has-label': hasLabel,
           })}">

        <label part="form-control-label"
               id="label"
               class="form-control__label"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
        </label>

        <div part="base form-control-input" class="input-group" role="group" aria-labelledby="label">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>`;
  }
}
