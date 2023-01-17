import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import {PropertyValues} from "@lit/reactive-element";
// @ts-ignore
import styles from '../scss/container.scss';
// @ts-ignore
import layoutStyles from '../scss/layout.scss';

@customElement('app-container')
export class AppContainer extends LitElement {
    @property({type: Boolean, attribute: 'allow-scripts'})
    private allowScripts;
    @property({type: Boolean, attribute: 'flex-frame'})
    private flexFrame;
    @property({type: Boolean, attribute: 'dark-mode', reflect: true})
    public darkMode;

    @property({type: HTMLDivElement})
    protected container: HTMLDivElement = (() => {
        return document.createElement('div');
    })();

    static get styles() {
        return [this.genericStyles(), unsafeCSS(styles)];
    }

    static genericStyles() {
        return unsafeCSS(layoutStyles);
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

        this.shadowRoot.append(this.container);
        //Form.init(this.shadowRoot);

        this.shadowRoot.addEventListener('submit', function (e) {
            // @ts-ignore
            if (!e.composed && e.path) {
                e.preventDefault()
                // @ts-ignore
                e.path[0].dispatchEvent(new CustomEvent("submit", {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }))
            }
        })
    }

    set innerHTML(data) {
        const slot = this.shadowRoot.getElementById('slot');
        if (slot) {
            this.shadowRoot.removeChild(slot);
        }

        this.prepareContainer()

        if (!this.flexFrame) {
            this.container.innerHTML += '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:400,500,600&display=swap">'
                + '<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">'
                + data;
        } else {
            this.container.innerHTML += data;
            return;
        }

        if (!this.allowScripts) {
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
              <div><p>Loading, please wait...</p>
                <img alt="Loading"
                     src="data:image/gif;base64,R0lGODlhKwALAPEAAP///wA1aYKbtQA1aSH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAKwALAAACMoSOCMuW2diD88UKG95W88uF4DaGWFmhZid93pq+pwxnLUnXh8ou+sSz+T64oCAyTBUAACH5BAkKAAAALAAAAAArAAsAAAI9xI4IyyAPYWOxmoTHrHzzmGHe94xkmJifyqFKQ0pwLLgHa82xrekkDrIBZRQab1jyfY7KTtPimixiUsevAAAh+QQJCgAAACwAAAAAKwALAAACPYSOCMswD2FjqZpqW9xv4g8KE7d54XmMpNSgqLoOpgvC60xjNonnyc7p+VKamKw1zDCMR8rp8pksYlKorgAAIfkECQoAAAAsAAAAACsACwAAAkCEjgjLltnYmJS6Bxt+sfq5ZUyoNJ9HHlEqdCfFrqn7DrE2m7Wdj/2y45FkQ13t5itKdshFExC8YCLOEBX6AhQAADsAAAAAAAAAAAA="/>
              </div>
            </div>
          </slot>`;
    }
}
