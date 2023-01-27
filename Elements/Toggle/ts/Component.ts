import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-toggle')
export class ZincToggle extends ZincElement {
    static styles = unsafeCSS(styles);

    static get formAssociated() {
        return true;
    }

    @property({attribute: 'name', type: String, reflect: true})
    private name;

    @property({attribute: 'required', type: Boolean, reflect: true})
    private _isRequired;

    get required() {
        return this._isRequired;
    }

    set required(isRequired) {
        this._isRequired = isRequired;
        this.internals.ariaRequired = isRequired;
    }

    @property({attribute: 'checked', type: Boolean, reflect: true})
    private checked;

    @property({attribute: 'value', type: String, reflect: true})
    private value;


    _handleClick() {
        let input = this.shadowRoot.querySelector('input');
        input.checked = !input.checked;
        if (input.checked) {
            this.value = input.value;
        } else {
            this.value = '';
        }
        this.checked = input.checked;
        this.internals.setFormValue(this.value);
    }

    constructor() {
        super();
        this.addEventListener('click', this._handleClick);
        this.internals = this.attachInternals();
    }

    _manageRequired() {
        const input = this.shadowRoot.querySelector('input');
        if (!input.checked && this.required) {
            this.internals.setValidity({
                valueMissing: true
            }, 'This field is required', input);
        } else {
            this.internals.setValidity({});
        }
    }

    firstUpdated(...args) {
        super.firstUpdated(...args);
        /** This ensures our element always participates in the form */
        this.internals.setFormValue(this.checked ? this.value : null);

        /** Make sure validations are set up */
        this._manageRequired();
    }

    render() {
        return html`
          <input type="checkbox" name="${this.name}" id="input" .value="${this.value}" ?required="${this.required}"
                 novalidate>
          <span></span>
        `;
    }
}
