import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import type ZnAnimatedButton from './animated-button.component';

describe('<zn-animated-button>', () => {
  it('should be accessible', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);
    await expect(el).to.be.accessible();
  });

  it('should render with default idle text', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);
    const button = el.shadowRoot?.querySelector('button');
    expect(button?.textContent?.trim()).to.equal('Purchase');
  });

  it('should render with custom idle text', async () => {
    const el = await fixture<ZnAnimatedButton>(
      html`<zn-animated-button idle-text="Buy Now"></zn-animated-button>`
    );
    const button = el.shadowRoot?.querySelector('button');
    expect(button?.textContent?.trim()).to.equal('Buy Now');
  });

  it('should be disabled when processing', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);
    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;

    expect(button.disabled).to.be.false;

    button.click();
    await el.updateComplete;

    expect(button.disabled).to.be.true;
  });

  it('should emit zn-purchase event when clicked', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);
    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;

    let eventFired = false;
    el.addEventListener('zn-purchase', () => {
      eventFired = true;
    });

    button.click();
    await el.updateComplete;

    expect(eventFired).to.be.true;
  });

  it('should transition to success state when setSuccess is called', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);

    el.setSuccess();
    await el.updateComplete;

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('purchase-button--success')).to.be.true;
  });

  it('should transition to failure state when setFailure is called', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);

    el.setFailure('Payment failed');
    await el.updateComplete;

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('purchase-button--failure')).to.be.true;
    expect(button.textContent).to.include('Payment failed');
  });

  it('should reset to idle state after failure timeout', async () => {
    const el = await fixture<ZnAnimatedButton>(
      html`<zn-animated-button failure-reset-delay="100"></zn-animated-button>`
    );

    el.setFailure('Error');
    await el.updateComplete;

    let button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('purchase-button--failure')).to.be.true;

    await waitUntil(
      () => {
        button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
        return button.classList.contains('purchase-button--idle');
      },
      '',
      { timeout: 500 }
    );

    expect(button.classList.contains('purchase-button--idle')).to.be.true;
  });

  it('should show spinner icon in processing state', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    const spinner = el.shadowRoot?.querySelector('.purchase-button__spinner');
    expect(spinner).to.exist;
  });

  it('should show success icon in success state', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);

    el.setSuccess();
    await el.updateComplete;

    const successIcon = el.shadowRoot?.querySelector('.purchase-button__icon--success');
    expect(successIcon).to.exist;
  });

  it('should show failure icon in failure state', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button></zn-animated-button>`);

    el.setFailure();
    await el.updateComplete;

    const failureIcon = el.shadowRoot?.querySelector('.purchase-button__icon--failure');
    expect(failureIcon).to.exist;
  });

  it('should respect disabled attribute', async () => {
    const el = await fixture<ZnAnimatedButton>(html`<zn-animated-button disabled></zn-animated-button>`);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).to.be.true;

    let eventFired = false;
    el.addEventListener('zn-purchase', () => {
      eventFired = true;
    });

    button.click();
    await el.updateComplete;

    expect(eventFired).to.be.false;
  });
});
