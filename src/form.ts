import type {ReactiveController, ReactiveControllerHost} from "lit";
import {ZincFormControl} from "./zinc-element";
import {Button} from "./Button";

export const formCollections: WeakMap<HTMLFormElement, Set<ZincFormControl>> = new WeakMap();

const reportValidityOverloads: WeakMap<HTMLFormElement, () => boolean> = new WeakMap();
const checkValidityOverloads: WeakMap<HTMLFormElement, () => boolean> = new WeakMap();

const userInteractedControls: WeakSet<ZincFormControl> = new WeakSet();

const interactions = new WeakMap<ZincFormControl, string[]>();

export interface FormControlControllerOptions
{
  form: (input: ZincFormControl) => HTMLFormElement | null;
  name: (input: ZincFormControl) => string;
  value: (input: ZincFormControl) => unknown | unknown[];
  defaultValue: (input: ZincFormControl) => unknown | unknown[];
  disabled: (input: ZincFormControl) => boolean;
  reportValidity: (input: ZincFormControl) => boolean;
  checkValidity: (input: ZincFormControl) => boolean;
  setValue: (input: ZincFormControl, value: unknown) => void;
  assumeInteractionOn: string[];
}

export class FormControlController implements ReactiveController
{
  host: ZincFormControl & ReactiveControllerHost;
  form?: HTMLFormElement | null;
  options: FormControlControllerOptions;

  constructor(host: ReactiveControllerHost & ZincFormControl, options?: Partial<FormControlControllerOptions>)
  {
    (this.host = host).addController(this);
    this.options = {
      form: input =>
      {
        const formId = input.form;

        if(formId)
        {
          const root = input.getRootNode() as Document | ShadowRoot | HTMLElement;
          const form = root.querySelector(`form#${formId}`);

          if(form)
          {
            return form as HTMLFormElement;
          }
        }

        return input.closest('form');
      },
      name: input => input.name,
      value: input => input.value,
      defaultValue: input => input.defaultValue,
      disabled: input => input.disabled,
      reportValidity: input => (typeof input.reportValidity === 'function' ? input.reportValidity() : true),
      checkValidity: input => (typeof input.checkValidity === 'function' ? input.checkValidity() : true),
      setValue: (input, value: string) => (input.value = value),
      assumeInteractionOn: ['input'],
      ...options
    };
  }

  hostConnected()
  {
    const form = this.options.form(this.host);

    if(form)
    {
      this.attachForm(form);
    }

    interactions.set(this.host, []);
    this.options.assumeInteractionOn.forEach(event =>
    {
      this.host.addEventListener(event, this.handleInteraction);
    });
  }

  hostDisconnected()
  {
    this.detachForm();
    interactions.delete(this.host);
    this.options.assumeInteractionOn.forEach(event =>
    {
      this.host.removeEventListener(event, this.handleInteraction);
    });
  }

  hostUpdated()
  {
    const form = this.options.form(this.host);

    if(!form)
    {
      this.detachForm();
    }

    if(form && this.form !== form)
    {
      this.detachForm();
      this.attachForm(form);
    }

    if(this.host.hasUpdated)
    {
      this.setValidity(this.host.validity.valid);
    }
  }

  private attachForm(form?: HTMLFormElement)
  {
    if(!form)
    {
      this.form = undefined;
      return;
    }

    this.form = form;

    // Add this element to the form's collection
    if(formCollections.has(this.form))
    {
      formCollections.get(this.form)!.add(this.host);
    }
    else
    {
      formCollections.set(this.form, new Set<ZincFormControl>([this.host]));
    }

    this.form.addEventListener('formdata', this.handleFormData);
    this.form.addEventListener('submit', this.handleFormSubmit);
    this.form.addEventListener('reset', this.handleFormReset);

    // Overload the form's reportValidity() method so it looks at Shoelace form controls
    if(!reportValidityOverloads.has(this.form))
    {
      reportValidityOverloads.set(this.form, this.form.reportValidity);
      this.form.reportValidity = () => this.reportFormValidity();
    }

    // Overload the form's checkValidity() method so it looks at Shoelace form controls
    if(!checkValidityOverloads.has(this.form))
    {
      checkValidityOverloads.set(this.form, this.form.checkValidity);
      this.form.checkValidity = () => this.checkFormValidity();
    }
  }

  private detachForm()
  {
    if(!this.form) return;

    const formCollection = formCollections.get(this.form);

    if(!formCollection)
    {
      return;
    }

    formCollection.delete(this.host);

    if(formCollection.size <= 0)
    {
      this.form.removeEventListener('formdata', this.handleFormData);
      this.form.removeEventListener('submit', this.handleFormSubmit);
      this.form.removeEventListener('reset', this.handleFormReset);


      if(reportValidityOverloads.has(this.form))
      {
        this.form.reportValidity = reportValidityOverloads.get(this.form)!;
        reportValidityOverloads.delete(this.form);
      }

      if(checkValidityOverloads.has(this.form))
      {
        this.form.checkValidity = checkValidityOverloads.get(this.form)!;
        checkValidityOverloads.delete(this.form);
      }
      this.form = undefined;
    }
  }

  private handleFormData = (event: FormDataEvent) =>
  {
    const disabled = this.options.disabled(this.host);
    const name = this.options.name(this.host);
    const value = this.options.value(this.host);

    // For buttons, we only submit the value if they were the submitter. This is currently done in doAction() by
    // injecting the name/value on a temporary button, so we can just skip them here.
    const isButton = this.host.tagName.toLowerCase() === 'zn-button';

    if(
      this.host.isConnected &&
      !disabled &&
      !isButton &&
      typeof name === 'string' &&
      name.length > 0 &&
      typeof value !== 'undefined'
    )
    {
      if(Array.isArray(value))
      {
        (value as unknown[]).forEach(val =>
        {
          event.formData.append(name, (val as string | number | boolean).toString());
        });
      }
      else
      {
        event.formData.append(name, (value as string | number | boolean).toString());
      }

      this.host.dispatchEvent(new CustomEvent('zn-formdata', {bubbles: true, composed: true}));
    }
  };

  private handleFormSubmit = (event: Event) =>
  {
    const disabled = this.options.disabled(this.host);
    const reportValidity = this.options.reportValidity;

    // Update the interacted state for all controls when the form is submitted
    if(this.form && !this.form.noValidate)
    {
      formCollections.get(this.form)?.forEach(control =>
      {
        this.setUserInteracted(control, true);
      });
    }

    // get the submit button
    const submitButton = this.form?.querySelector('[type ="submit"]') as HTMLButtonElement | null;
    const content = submitButton?.innerHTML;
    if(submitButton)
    {
      setTimeout(() =>
      {
        // disable duplicate submit
        submitButton.disabled = true;
        submitButton.innerHTML = 'Processing...';
      }, 20);

      setTimeout(() =>
      {
        submitButton.disabled = false;
        submitButton.innerHTML = content ?? '';
      }, 2000);
    }

    if(this.form && !this.form.noValidate && !disabled && !reportValidity(this.host))
    {
      event.preventDefault();
      event.stopImmediatePropagation();

      // remove the disabled state from the submit button
      if(submitButton)
      {
        submitButton.removeAttribute('disabled');
        submitButton.innerHTML = content ?? '';
      }
    }
  };

  private handleFormReset = () =>
  {
    this.options.setValue(this.host, this.options.defaultValue(this.host));
    this.setUserInteracted(this.host, false);
    interactions.set(this.host, []);
  };

  private handleInteraction = (event: Event) =>
  {
    const emittedEvents = interactions.get(this.host)!;

    if(!emittedEvents.includes(event.type))
    {
      emittedEvents.push(event.type);
    }

    // Mark it as user-interacted as soon as all associated events have been emitted
    if(emittedEvents.length === this.options.assumeInteractionOn.length)
    {
      this.setUserInteracted(this.host, true);
    }
  };

  private checkFormValidity = () =>
  {
    if(this.form && !this.form.noValidate)
    {
      const elements: NodeListOf<HTMLInputElement> = this.form.querySelectorAll<HTMLInputElement>('*');
      for(const element of elements)
      {
        if(typeof element.checkValidity === 'function' && !element.checkValidity())
        {
          return false;
        }
      }
    }

    return true;
  };

  private reportFormValidity = () =>
  {
    if(this.form && !this.form.noValidate)
    {
      const elements: NodeListOf<HTMLInputElement> = this.form.querySelectorAll<HTMLInputElement>('*');
      for(const element of elements)
      {
        if(typeof element.reportValidity === 'function' && !element.reportValidity())
        {
          return false;
        }
      }
    }

    return true;
  };

  private setUserInteracted(el: ZincFormControl, hasInteracted: boolean)
  {
    if(hasInteracted)
    {
      userInteractedControls.add(el);
    }
    else
    {
      userInteractedControls.delete(el);
    }

    el.requestUpdate();
  }

  private doAction(type: 'submit' | 'reset', submitter?: HTMLInputElement | Button)
  {
    if(this.form)
    {
      const button = document.createElement('button');
      button.type = type;
      button.style.position = 'absolute';
      button.style.width = '0';
      button.style.height = '0';
      button.style.clipPath = 'inset(50%)';
      button.style.overflow = 'hidden';
      button.style.whiteSpace = 'nowrap';

      // Pass name, value, and form attributes through to the temporary button
      if(submitter)
      {
        if(!(submitter instanceof Button))
        {
          button.name = submitter.name;
          button.value = submitter.value;
        }

        ['formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget'].forEach(attr =>
        {
          if(submitter.hasAttribute(attr))
          {
            button.setAttribute(attr, submitter.getAttribute(attr)!);
          }
        });
      }

      this.form.append(button);
      button.click();
      button.remove();
    }
  }

  getForm()
  {
    return this.form ?? null;
  }

  reset(submitter?: HTMLInputElement | Button)
  {
    this.doAction('reset', submitter);
  }

  submit(submitter?: HTMLInputElement | Button)
  {
    // Calling form.submit() bypasses the submit event and constraint validation. To prevent this, we can inject a
    // native submit button into the form, "click" it, then remove it to simulate a standard form submission.
    this.doAction('submit', submitter);
  }

  setValidity(isValid: boolean)
  {
    const host = this.host;
    const hasInteracted = Boolean(userInteractedControls.has(host));
    const required = Boolean(host.required);

    host.toggleAttribute('data-required', required);
    host.toggleAttribute('data-optional', !required);
    host.toggleAttribute('data-invalid', !isValid);
    host.toggleAttribute('data-valid', isValid);
    host.toggleAttribute('data-user-invalid', !isValid && hasInteracted);
    host.toggleAttribute('data-user-valid', isValid && hasInteracted);
  }

  updateValidity()
  {
    const host = this.host;
    this.setValidity(host.validity.valid);
  }

  emitInvalidEvent(originalInvalidEvent?: Event)
  {
    const znInvalidEvent = new CustomEvent<Record<PropertyKey, never>>('zn-invalid', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: {}
    });

    if(!originalInvalidEvent)
    {
      znInvalidEvent.preventDefault();
    }

    if(!this.host.dispatchEvent(znInvalidEvent))
    {
      originalInvalidEvent?.preventDefault();
    }
  }
}

export const validValidityState: ValidityState = Object.freeze({
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false
});

export const customErrorValidityState: ValidityState = Object.freeze({
  ...validValidityState,
  customError: true,
  valid: false
});

export const valueMissingValidityState: ValidityState = Object.freeze({
  ...validValidityState,
  valueMissing: true,
  valid: false
});
