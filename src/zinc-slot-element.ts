import {ZincElement} from "./zinc-element";

export class ZincSlotElement extends ZincElement
{
  protected _slots = new Map<string, DocumentFragment>();

  connectedCallback()
  {
    super.connectedCallback();
    this._registerSlots();
  }

  createRenderRoot()
  {
    return this;
  }

  _registerSlots()
  {
    Array.from(this.children).forEach((element) =>
    {
      if(!this._slots.has(element.slot))
      {
        this._slots.set(element.slot, new DocumentFragment());
      }
      this._slots.get(element.slot).appendChild(element);
      element.removeAttribute('slot');
      element.classList.toggle('zn-slotted-element', true);
    });
  }

  renderSlot(slot: string)
  {
    return this._slots.get(slot);
  }

}
