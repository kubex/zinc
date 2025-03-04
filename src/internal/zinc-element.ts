import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import {
  EventTypeDoesNotRequireDetail,
  EventTypeRequiresDetail,
  EventTypesWithoutRequiredDetail,
  EventTypesWithRequiredDetail,
  GetCustomEventType,
  ValidEventTypeMap,
  ZincEventInit
} from "./event";
import { ThemeController } from "./theme";

export default class ZincElement extends LitElement {
  @property() dir: string; // LTR or RTL direction
  @property() lang: string; // Language
  @property() t: string; // Theme (light or dark)
  
  static define(name: string, elementConstructor = this, options: ElementDefinitionOptions = {}) {
    const currentRegisteredConstructor = customElements.get(name) as
      | CustomElementConstructor
      | typeof ZincElement;

    if (!currentRegisteredConstructor) {
      customElements.define(name, class extends elementConstructor {
      } as unknown as CustomElementConstructor, options);
      return;
    }

    let newVersion = ' (unknown version)';
    let existingVersion = newVersion;

    if ('version' in elementConstructor && elementConstructor.version) {
      newVersion = ` v${elementConstructor.version}`;
    }

    if ('version' in currentRegisteredConstructor && currentRegisteredConstructor.version) {
      existingVersion = ` v${currentRegisteredConstructor.version}`;
    }

    // need to make sure we're not working with null or empty strings before doing version comparison
    if (newVersion && existingVersion && newVersion === existingVersion) {
      // if version match, we don't need to warn anyone, carry on.
      return;
    }

    console.warn(
      `Attempted to register <${name}>${newVersion} but it is already registered as <${name}>${existingVersion}.`
    )
  }

  static dependencies: Record<string, typeof ZincElement> = {};

  constructor() {
    super();

    // All Zinc components should have a theme controller
    new ThemeController(this);

    // Make sure we have access to all dependencies and they are defined
    Object.entries((this.constructor as typeof ZincElement).dependencies).forEach(([name, component]) => {
      (this.constructor as typeof ZincElement).define(name, component);
    });
  }

  emit<T extends string & keyof EventTypesWithoutRequiredDetail>(name: EventTypeDoesNotRequireDetail<T>, options?: ZincEventInit<T> | undefined): GetCustomEventType<T>;
  emit<T extends string & keyof EventTypesWithRequiredDetail>(name: EventTypeRequiresDetail<T>, options?: ZincEventInit<T>): GetCustomEventType<T>;
  emit<T extends string & keyof ValidEventTypeMap>(name: T, options?: ZincEventInit<T>): GetCustomEventType<T> {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        element: this,
      },
      ...options
    });

    this.dispatchEvent(event);

    return event as GetCustomEventType<T>;
  }
}

export interface ZincFormControl extends ZincElement {
  // Form attributes
  name: string;
  value: unknown;
  disabled?: boolean;
  defaultValue?: unknown;
  defaultChecked?: boolean;
  form?: string;

  // Constraint validation attributes
  pattern?: string;
  min?: number | string | Date;
  max?: number | string | Date;
  step?: number | 'any';
  required?: boolean;
  minlength?: number;
  maxlength?: number;

  // Form validation properties
  readonly validity: ValidityState;
  readonly validationMessage: string;

  // Form validation methods
  checkValidity: () => boolean;
  getForm: () => HTMLFormElement | null;
  reportValidity: () => boolean;
  setCustomValidity: (message: string) => void;
}
