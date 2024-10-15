import {ReactiveController, ReactiveControllerHost} from "lit";

export class HasSlotController implements ReactiveController
{
  host: ReactiveControllerHost & Element;
  slotNames: string[] = [];

  constructor(host: ReactiveControllerHost & Element, ...slotNames: string[])
  {
    (this.host = host).addController(this);
    this.slotNames = slotNames;
  }

  hostConnected()
  {
    this.host.shadowRoot!.addEventListener('slotchange', this.handleSlotChange);
  }

  hostDisconnected()
  {
    this.host.shadowRoot!.removeEventListener('slotchange', this.handleSlotChange);
  }

  test(slotName: string)
  {
    return slotName === '[default]' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  getSlot(slotName: string)
  {
    return this.host.querySelector(`:scope > [slot="${slotName}"]`) as HTMLElement;
  }

  private hasDefaultSlot()
  {
    return [...this.host.childNodes].some(node =>
    {
      // Check to see if it's just text passed through
      if(node.nodeType === node.TEXT_NODE && node.textContent!.trim() !== '')
      {
        return true;
      }

      if(node.nodeType === node.ELEMENT_NODE)
      {
        // Check to see if it's a slot and not part of the default slot
        // Otherwise it's a slotted element
        return !(node as HTMLElement).hasAttribute('slot');
      }

      return false;
    });
  }

  private hasNamedSlot(slotName: string)
  {
    return this.host.querySelector(`:scope > [slot="${slotName}"]`) !== null;
  }

  private handleSlotChange = (event: Event) =>
  {
    const slot = event.target as HTMLSlotElement;
    const slotName = slot.name || '[default]';

    if(this.slotNames.includes(slotName))
    {
      this.host.requestUpdate();
    }
  };
}
