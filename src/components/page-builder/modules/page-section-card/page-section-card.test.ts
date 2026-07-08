import '../../../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnPageSectionCard from './page-section-card.component';

describe('<zn-page-section-card>', () => {
  it('should render the label and summary', async () => {
    const el = await fixture<ZnPageSectionCard>(html`
      <zn-page-section-card label="Hero" summary="Big banner"></zn-page-section-card>`);
    expect(el.shadowRoot?.querySelector('.card__label')?.textContent).to.equal('Hero');
    expect(el.shadowRoot?.querySelector('.card__summary')?.textContent).to.equal('Big banner');
  });

  it('should dispatch action events without triggering selection clicks', async () => {
    const el = await fixture<ZnPageSectionCard>(html`
      <zn-page-section-card label="Hero"></zn-page-section-card>`);
    const fired: string[] = [];
    el.addEventListener('page-card-duplicate', () => fired.push('duplicate'));
    el.addEventListener('page-card-remove', () => fired.push('remove'));
    el.addEventListener('click', () => fired.push('click'));

    // Real MouseEvents, not .click() — zn-button overrides the native click()
    // method with internal handling that dispatches no event.
    const buttons = el.shadowRoot!.querySelectorAll('zn-button.card__action');
    const click = () => new MouseEvent('click', {bubbles: true, composed: true, cancelable: true});
    buttons[0].dispatchEvent(click());
    buttons[1].dispatchEvent(click());

    expect(fired).to.deep.equal(['duplicate', 'remove']); // stopPropagation keeps click out
  });

  it('should keep Enter/Space on action buttons from reaching the host', async () => {
    const el = await fixture<ZnPageSectionCard>(html`
      <zn-page-section-card label="Hero"></zn-page-section-card>`);
    let hostSawKeydown = false;
    el.addEventListener('keydown', () => (hostSawKeydown = true));

    const button = el.shadowRoot!.querySelector<HTMLButtonElement>('.card__action')!;
    button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, composed: true, cancelable: true}));
    button.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, composed: true, cancelable: true}));

    expect(hostSawKeydown, 'host keydown suppressed for button activation keys').to.be.false;
  });

  it('should reflect selected and unknown states', async () => {
    const el = await fixture<ZnPageSectionCard>(html`
      <zn-page-section-card label="Hero" selected unknown></zn-page-section-card>`);
    expect(el.hasAttribute('selected')).to.be.true;
    expect(el.hasAttribute('unknown')).to.be.true;
  });
});
