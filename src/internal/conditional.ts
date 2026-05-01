import {deepQuerySelectorAll} from '../utilities/query';
import type {ReactiveController, ReactiveControllerHost} from 'lit';

export interface ConditionalHost {
  conditional: string;
  disabled: boolean;
}

/** A reactive controller that disables the host when linked selects have a value. */
export class ConditionalController implements ReactiveController {
  host: ReactiveControllerHost & Element & ConditionalHost;
  private conditionals: (Element & { value: string | string[] })[] = [];
  private initiallyDisabled = false;
  private readonly handleChange = () => this.checkConditionals();

  constructor(host: ReactiveControllerHost & Element & ConditionalHost) {
    (this.host = host).addController(this);
  }

  /** Call from the host's `firstUpdated()` to parse IDs, find elements, attach listeners, and run the initial check. */
  setup() {
    if (this.host.conditional === '') {
      return;
    }

    const ids = this.host.conditional.split(',').map(id => id.trim());

    ids.forEach(id => {
      const byId = deepQuerySelectorAll(`#${id}`, document.documentElement, '') as (Element & {
        value: string | string[];
      })[];
      const byName = deepQuerySelectorAll(`[name="${id}"]`, document.documentElement, '') as (Element & {
        value: string | string[];
      })[];

      // de-duplicate in case the same element matches both id and name
      const seen = new Set<Element>();
      [...byId, ...byName].forEach(el => {
        if (!seen.has(el)) {
          seen.add(el);
          this.conditionals.push(el);
        }
      });
    });

    this.initiallyDisabled = this.host.disabled;

    if (ids.length === 0) {
      return;
    }

    this.conditionals.forEach(select => {
      select.addEventListener('zn-change', this.handleChange);
      select.addEventListener('zn-input', this.handleChange);
    });

    // trigger the check once to initialize
    this.checkConditionals();
  }

  hostConnected() {
    // No-op; setup is deferred to setup() which the host calls from firstUpdated()
  }

  hostDisconnected() {
    this.conditionals.forEach(select => {
      select.removeEventListener('zn-change', this.handleChange);
      // select.removeEventListener('zn-input', this.handleChange);
    });

    this.conditionals = [];
  }

  /** Re-evaluate the conditional state. Call from the host when needed. */
  check() {
    this.checkConditionals();
  }

  private checkConditionals() {
    const shouldDisable = this.conditionals.some(select => {
      let linkedValues = Array.isArray(select.value) ? select.value : [select.value];
      linkedValues = linkedValues.filter(v => (v !== '' && v !== "0"));
      return linkedValues.length > 0;
    });

    this.host.disabled = this.initiallyDisabled || shouldDisable;
  }
}
