import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {classMap} from "lit/directives/class-map.js";
import {ConfirmModal} from "@/ConfirmModal";
import {ZincElement} from "@/zinc-element";
import {ifDefined} from "lit/directives/if-defined.js";

type NavItem = {
  title: string;
  type: string;
  path: string;
  target: string;
  style: string;
  confirm: {
    type: string;
    title: string;
    caption: string;
    content: string;
    trigger: string;
    action: string;
  }
}

@customElement('zn-menu')
export class Menu extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'actions', type: Array}) actions = [];

  public closer;

  private handleClick(e)
  {
    if(this.hasAttribute('popover'))
    {
      this.hidePopover();
    }
    if(this.closer)
    {
      this.closer();
    }
    this.emit('zn-menu-select', {
      detail: {
        value: e.target.getAttribute('href'),
        element: e.target
      }
    });
  }

  private handleConfirm(triggerId: string)
  {
    const confirm = this.shadowRoot.querySelector('zn-confirm[trigger="' + triggerId + '"]') as ConfirmModal;
    if(confirm)
    {
      confirm.addEventListener('zn-close', (e) => this.handleClick(e));
      confirm.open();
    }
  }

  private handleKeyDown(event: KeyboardEvent)
  {
    if([' ', 'Enter'].includes(event.key))
    {
      const item = this.getCurrentItem();
      event.preventDefault();
      event.stopPropagation();

      item?.click();
    }
    else if(['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
    {
      const items = this.getAllItems();
      const activeItem = this.getCurrentItem();
      let index = activeItem ? items.indexOf(activeItem) : 0;

      if(items.length > 0)
      {
        event.preventDefault();
        event.stopPropagation();

        switch(event.key)
        {
          case 'ArrowDown':
            index++;
            break;
          case 'ArrowUp':
            index--;
            break;
          case 'Home':
            index = 0;
            break;
          case 'End':
            index = items.length - 1;
            break;
        }

        if(index < 0)
        {
          index = items.length - 1;
        }

        if(index > items.length - 1)
        {
          index = 0;
        }

        this.setCurrentItem(items[index]);
        items[index].focus();
      }
    }
  }

  isMenuItem(item: HTMLElement)
  {
    return (
      item.tagName.toLowerCase() === 'a'
    );
  }

  handleMouseDown(event: MouseEvent)
  {
    const target = event.target as HTMLElement;

    if(this.isMenuItem(target))
    {
      this.setCurrentItem(target as HTMLElement);
    }
  }

  getAllItems(): HTMLElement[]
  {
    const a = this.shadowRoot.querySelectorAll('a');
    return Array.from(a).filter((el: HTMLElement) =>
    {
      return !el.inert;
    });
  }

  getCurrentItem(): HTMLElement
  {
    return this.getAllItems().find(i => i.getAttribute('tabindex') === '0');
  }

  setCurrentItem(item: HTMLElement)
  {
    const items = this.getAllItems();
    items.forEach(i =>
    {
      i.setAttribute('tabindex', i === item ? '0' : '-1');
    });
  }

  render()
  {
    let menu = html``;
    if(this.actions.length > 0)
    {
      menu = html`
        <ul>
          ${this.actions.map((item: NavItem) =>
          {
            const liClass = item.style ? item.style : 'def';
            if(item.confirm)
            {
              return html`
                <zn-confirm trigger="${item.confirm.trigger}"
                            type="${ifDefined(item.confirm.type)}"
                            caption="${item.confirm.caption}"
                            content="${item.confirm.content}"
                            action="${item.confirm.action}"></zn-confirm>
                <li class="${liClass}">
                  <span @mousedown=${this.handleMouseDown}
                        @keydown=${this.handleKeyDown}
                        @click="${this.handleConfirm.bind(this, item.confirm.trigger)}"
                        id="${item.confirm.trigger}">${item.title}</span>
                </li>`;
            }
            else
            {
              if(item.type !== 'dropdown')
              {
                return html`
                  <li class="${liClass}">
                    <a @click="${this.handleClick}"
                       @keydown=${this.handleKeyDown}
                       @mousedown=${this.handleMouseDown}
                       href="${item.path}"
                       data-target="${ifDefined(item.target)}">${item.title}</a>
                  </li>`;
              }
              else
              {
                return html`
                  <li class="${liClass}">
                    <span @click="${this.handleClick}"
                          @keydown=${this.handleKeyDown}
                          @mousedown=${this.handleMouseDown}
                          data-path="${ifDefined(item.path)}">${item.title}</span>
                  </li>`;
              }
            }
          })}
        </ul>
      `;
    }

    return html`
      <div class="${classMap({'menu': true})}">${menu}</div>`;
  }
}
