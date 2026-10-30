import {deepQuerySelectorAll, idSelector} from '../utilities/query';
import type {ReactiveController, ReactiveControllerHost} from 'lit';

export interface ConditionalHost {
  conditional: string;
  requires: string;
  disabled: boolean;
}

type ValuedElement = Element & { value: string | string[] };

function hasValue(el: ValuedElement): boolean {
  const values = Array.isArray(el.value) ? el.value : [el.value];
  return values.some(v => v !== '' && v !== '0');
}

/**
 * A reactive controller that drives the host's disabled state from other form
 * controls: `conditional` disables the host once a linked control has a value,
 * `requires` keeps it disabled until every named control has one.
 */
export class ConditionalController implements ReactiveController {
  host: ReactiveControllerHost & Element & ConditionalHost;
  private conditionals: ValuedElement[] = [];
  private required: ValuedElement[] = [];
  private initiallyDisabled = false;
  private readonly handleChange = () => this.checkConditionals();

  constructor(host: ReactiveControllerHost & Element & ConditionalHost) {
    (this.host = host).addController(this);
  }

  /** Call from the host's `firstUpdated()` to parse IDs, find elements, attach listeners, and run the initial check. */
  setup() {
    this.conditionals = this.resolve(this.host.conditional);
    this.required = this.resolve(this.host.requires);

    this.initiallyDisabled = this.host.disabled;

    const watched = [...this.conditionals, ...this.required];
    if (watched.length === 0) {
      return;
    }

    watched.forEach(el => {
      el.addEventListener('zn-change', this.handleChange);
      el.addEventListener('zn-input', this.handleChange);
    });

    // trigger the check once to initialize
    this.checkConditionals();
  }

  /** Resolve a comma-separated list of ids or names to the controls they name. */
  private resolve(list: string): ValuedElement[] {
    if (!list) {
      return [];
    }

    const found: ValuedElement[] = [];
    const seen = new Set<Element>();

    list.split(',').map(id => id.trim()).filter(Boolean).forEach(id => {
      const byId = deepQuerySelectorAll(idSelector(id), document.documentElement, '') as ValuedElement[];
      const byName = deepQuerySelectorAll(`[name="${id}"]`, document.documentElement, '') as ValuedElement[];

      // de-duplicate in case the same element matches both id and name
      [...byId, ...byName].forEach(el => {
        if (!seen.has(el)) {
          seen.add(el);
          found.push(el);
        }
      });
    });

    return found;
  }

  hostConnected() {
    // No-op; setup is deferred to setup() which the host calls from firstUpdated()
  }

  hostDisconnected() {
    [...this.conditionals, ...this.required].forEach(el => {
      el.removeEventListener('zn-change', this.handleChange);
      el.removeEventListener('zn-input', this.handleChange);
    });

    this.conditionals = [];
    this.required = [];
  }

  /** Re-evaluate the conditional state. Call from the host when needed. */
  check() {
    this.checkConditionals();
  }

  private checkConditionals() {
    const blocked = this.conditionals.some(hasValue);
    const unmet = this.required.length > 0 && !this.required.every(hasValue);

    const latched = this.required.length > 0 ? false : this.initiallyDisabled;

    this.host.disabled = latched || blocked || unmet;
  }
}
