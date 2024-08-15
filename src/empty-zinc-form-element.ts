import {ZincElement, ZincFormControl} from "@/zinc-element";
import {FormControlController, validValidityState} from "@/form";
import {property} from "lit/decorators.js";

export abstract class EmptyZincFormElement extends ZincElement implements ZincFormControl
{
  @property() name: string;
  @property() value;

  protected readonly formControlController = new FormControlController(this);

  get validationMessage()
  {
    return '';
  }

  get validity(): ValidityState
  {
    return validValidityState;
  }


  checkValidity(): boolean
  {
    return true;
  }

  getForm(): HTMLFormElement | null
  {
    return null;
  }


  reportValidity(): boolean
  {
    return true;
  }

  setCustomValidity(message: string): void
  {
    return;
  }
}
