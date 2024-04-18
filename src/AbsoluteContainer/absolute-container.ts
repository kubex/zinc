import { html, unsafeCSS } from "lit";
import { customElement } from 'lit/decorators.js';

import styles from './index.scss';
import { ZincElement } from "../zinc";
import { PropertyValues } from "@lit/reactive-element";

@customElement('zn-absolute-container')
export class AbsoluteContainer extends ZincElement
{
  static styles = unsafeCSS(styles);

  // the height of this element is set to the height of it's children (absolute positioned)
  // to push the content element down
  updated(changedProperties: PropertyValues)
  {
    super.updated(changedProperties);

    const children = this.children as HTMLCollectionOf<HTMLElement>;
    const childrenArray = Array.from(children);
    console.log('childrenArray', childrenArray);

    setTimeout(() =>
    {
      const height = childrenArray.reduce((acc, child) =>
      {
        const rect = child.getBoundingClientRect();
        console.log('rect', rect);
        return acc + rect.height;
      }, 0);

      console.log('height', height);
      this.style.height = `${height}px`;
    }, 100);
  }

  render()
  {
    return html`
      <slot></slot>`;
  }

}


