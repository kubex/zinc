import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon/icon.component';

import styles from './animated-button.scss';

type AnimatedButtonState = 'idle' | 'processing' | 'success' | 'failure';

export default class ZnAnimatedButton extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-icon': ZnIcon
  };

  @state() private currentState: AnimatedButtonState = 'idle';
  @state() private errorMessage = '';

  /** The text to display in the idle state */
  @property({attribute: 'idle-text'}) idleText = 'Purchase';

  /** The text to display in the processing state */
  @property({attribute: 'processing-text'}) processingText = 'Purchasing';

  /** The text to display in the success state */
  @property({attribute: 'success-text'}) successText = 'Success';

  /** The text to display in the failure state */
  @property({attribute: 'failure-text'}) failureText = 'Failed';

  /** The URL to redirect to after successful purchase */
  @property({attribute: 'redirect-url'}) redirectUrl = '';

  /** Delay in milliseconds before redirecting after success (default: 1500ms) */
  @property({type: Number, attribute: 'redirect-delay'}) redirectDelay = 1500;

  /** Delay in milliseconds before resetting from failure state (default: 2000ms) */
  @property({type: Number, attribute: 'failure-reset-delay'}) failureResetDelay = 2000;

  /** Disabled state */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** The name of the form control (required for form submission) */
  @property() name = '';

  /** The value of the form control */
  @property() value = '';

  private resetTimeout?: number;
  private redirectTimeout?: number;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimeouts();
  }

  private clearTimeouts() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = undefined;
    }
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = undefined;
    }
  }

  /** Programmatically trigger the purchase flow */
  public purchase(): void {
    if (this.currentState !== 'idle' || this.disabled) {
      return;
    }

    this.handlePurchase();
  }

  /** Set the button to success state manually */
  public setSuccess(): void {
    this.clearTimeouts();
    this.currentState = 'success';
    this.scheduleRedirect();
  }

  /** Set the button to failure state manually with optional error message */
  public setFailure(message = ''): void {
    this.clearTimeouts();
    this.errorMessage = message;
    this.currentState = 'failure';
    this.scheduleReset();
  }

  /** Reset the button to idle state */
  public reset(): void {
    this.clearTimeouts();
    this.currentState = 'idle';
    this.errorMessage = '';
  }

  private handlePurchase() {
    this.clearTimeouts();
    this.currentState = 'processing';

    const event = this.emit('zn-purchase', {
      cancelable: true,
      detail: {
        value: this.value,
        setSuccess: () => this.setSuccess(),
        setFailure: (message?: string) => this.setFailure(message)
      }
    });

    // If the event was prevented, reset to idle
    if (event.defaultPrevented) {
      this.currentState = 'idle';
    }
  }

  private scheduleRedirect() {
    this.redirectTimeout = window.setTimeout(() => {
      if (this.redirectUrl) {
        window.location.href = this.redirectUrl;
      }
      this.emit('zn-redirect', {
        detail: {url: this.redirectUrl}
      });
    }, this.redirectDelay);
  }

  private scheduleReset() {
    this.resetTimeout = window.setTimeout(() => {
      this.reset();
    }, this.failureResetDelay);
  }

  private handleClick() {
    if (this.currentState === 'idle' && !this.disabled) {
      this.handlePurchase();
    }
  }

  protected render() {
    const isDisabled = this.disabled || this.currentState !== 'idle';
    const showSpinner = this.currentState === 'processing';
    const showSuccess = this.currentState === 'success';
    const showFailure = this.currentState === 'failure';

    const classes = {
      'animated-button': true,
      'animated-button--idle': this.currentState === 'idle',
      'animated-button--processing': this.currentState === 'processing',
      'animated-button--success': this.currentState === 'success',
      'animated-button--failure': this.currentState === 'failure'
    };

    let buttonText = this.idleText;
    if (this.currentState === 'processing') buttonText = this.processingText;
    if (this.currentState === 'success') buttonText = this.successText;
    if (this.currentState === 'failure') buttonText = this.failureText;

    return html`
      <button
        class=${classMap(classes)}
        ?disabled=${isDisabled}
        @click=${this.handleClick}
        type="button"
        aria-live="polite"
        aria-busy=${showSpinner}
      >
        ${showSpinner
          ? html`
            <span class="animated-button__content">
                <zn-icon
                  class="animated-button__spinner"
                  src="progress_activity"
                  size="20"
                  color="white"
                ></zn-icon>
                <span class="animated-button__text">${buttonText}</span>
              </span>
            <span class="animated-button__shimmer"></span>
          `
          : showSuccess
            ? html`
              <span class="animated-button__content">
                  <svg
                    class="animated-button__icon animated-button__icon--success"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      class="animated-button__tick"
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span class="animated-button__text">${buttonText}</span>
                </span>
            `
            : showFailure
              ? html`
                <span class="animated-button__content">
                    <zn-icon
                      class="animated-button__icon animated-button__icon--failure"
                      src="cancel"
                      size="20"
                      color="white"
                    ></zn-icon>
                    <span class="animated-button__text">
                      ${buttonText}${this.errorMessage ? `: ${this.errorMessage}` : ''}
                    </span>
                  </span>
              `
              : html`
                <span class="animated-button__content">
                    <span class="animated-button__text">${buttonText}</span>
                  </span>
              `}
      </button>
    `;
  }
}
