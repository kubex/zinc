import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {PropertyValues} from "@lit/reactive-element";

import styles from './index.scss';

@customElement('app-container')
export class Container extends LitElement {
  @property({type: Boolean, attribute: 'allow-scripts'}) allowScripts;
  @property({type: Boolean, attribute: 'flex-frame'}) flexFrame;
  @property({type: Boolean, attribute: 'dark-mode', reflect: true}) darkMode;
  @property({type: Object, attribute: false}) container: HTMLElement = document.createElement('div');

  static get styles() {
    return [unsafeCSS(styles)];
  }

  protected prepareContainer() {
    this.container.innerHTML = '';
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    this.container.classList.toggle('dark', this.darkMode == 'true');
  }

  connectedCallback() {
    super.connectedCallback();
    const shad = this.shadowRoot;

    // @ts-ignore
    this.container.createElement = function (tag) {
      return document.createElement(tag);
    };

    // @ts-ignore
    this.container.getElementById = function (id) {
      return shad.querySelector('#' + id);
    };
    // @ts-ignore
    this.container.getElementByClassName = function (className) {
      return shad.querySelector('.' + className);
    };
    // @ts-ignore
    this.container.getElementsByClassName = function (className) {
      return shad.querySelectorAll('.' + className);
    };
    // @ts-ignore
    this.container.getElementsByTagName = function (className) {
      return shad.querySelectorAll(className);
    };
    this.shadowRoot.appendChild(this.container);

    this.shadowRoot.addEventListener('submit', function (e) {
      if (!e.composed && e.composedPath()) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const frm = e.composedPath()[0]
        frm.dispatchEvent(new CustomEvent("submit", {
          bubbles: true,
          composed: true,
          cancelable: true
        }))
      }
    })
  }

  public setInnerContent(data, elementId) {
    const replaceElement = elementId.startsWith("!");
    if (replaceElement) {
      elementId = elementId.substring(1);
    }
    const element = this.shadowQuery(elementId, this.container);
    if (element) {
      if (replaceElement && element.outerHTML) {
        element.outerHTML = data;
      } else {
        element.innerHTML = data;
      }
      return true;
    }
    this.innerHTML = data;
    return true;
  }

  shadowQuery(selector: string, rootNode: Document | Element = document): Element | null {
    const selectors = String(selector).split('>>>');
    let currentNode = rootNode;

    selectors.find((selector, index) => {
      if (index === 0) {
        currentNode = rootNode.querySelector(selectors[index]) as Element;
      } else if (currentNode instanceof Element) {
        currentNode = currentNode?.shadowRoot?.querySelector(selectors[index]) as Element;
      }

      return currentNode === null;
    });

    if (currentNode === rootNode) {
      return null;
    }

    return currentNode as Element | null;
  }

  set innerHTML(data) {
    const slot = this.shadowRoot.getElementById('slot');
    if (slot) {
      (slot.parentElement || this.shadowRoot).removeChild(slot);
    }

    this.prepareContainer()

    this.container.innerHTML += data;

    if (this.flexFrame || !this.allowScripts) {
      return;
    }

    const scripts = this.container.querySelectorAll('script');
    scripts.forEach((script) => {
      if (script.matches('[src]')) {
        this._evalScript(script);
      } else {
        this._evalCode(script.innerHTML)
      }
    });
  }

  protected _evalCode(content, src = '') {
    const fn = new Function('document', content);
    try {
      fn(this.container);
    } catch (e) {
      console.error(e, src, fn);
    }
  }

  protected _evalScript(script: HTMLOrSVGScriptElement) {
    fetch(script.getAttribute('src'))
      .then(response => response.text())
      .then((body) => this._evalCode(body, script.getAttribute('src')))
      .catch(e => {
        console.error('failed to fetch script', e);
      });
  }

  render() {
    return html`
      <slot id="slot">
        <div class="page-loading">
          <div>
            <p>Loading, please wait...</p>
            <img alt="Loading"
                 src="data:image/gif;base64,R0lGODlhKwALAPEAAP///wA1aYKbtQA1aSH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAKwALAAACMoSOCMuW2diD88UKG95W88uF4DaGWFmhZid93pq+pwxnLUnXh8ou+sSz+T64oCAyTBUAACH5BAkKAAAALAAAAAArAAsAAAI9xI4IyyAPYWOxmoTHrHzzmGHe94xkmJifyqFKQ0pwLLgHa82xrekkDrIBZRQab1jyfY7KTtPimixiUsevAAAh+QQJCgAAACwAAAAAKwALAAACPYSOCMswD2FjqZpqW9xv4g8KE7d54XmMpNSgqLoOpgvC60xjNonnyc7p+VKamKw1zDCMR8rp8pksYlKorgAAIfkECQoAAAAsAAAAACsACwAAAkCEjgjLltnYmJS6Bxt+sfq5ZUyoNJ9HHlEqdCfFrqn7DrE2m7Wdj/2y45FkQ13t5itKdshFExC8YCLOEBX6AhQAADsAAAAAAAAAAAA="/>
          </div>
        </div>
      </slot>
    `;
  }
}


