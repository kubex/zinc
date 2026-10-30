import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-well>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-well></zn-well> `);
    expect(el).to.exist;
  });

  it('should render the default slot in a div by default', async () => {
    const el = await fixture(html`
      <zn-well>content</zn-well> `);
    const content = el.shadowRoot!.querySelector('.well__content')!;
    expect(content.tagName).to.equal('DIV');
    expect(content.classList.contains('well__content--pre')).to.be.false;
  });

  it('should render the default slot in a pre when pre is set', async () => {
    const el = await fixture(html`
      <zn-well pre>content</zn-well> `);
    const content = el.shadowRoot!.querySelector('.well__content')!;
    expect(content.tagName).to.equal('PRE');
    expect(getComputedStyle(content).whiteSpace).to.equal('pre');
  });

  it('should break long words when break-long is set', async () => {
    const el = await fixture(html`
      <zn-well break-long>content</zn-well> `);
    const content = el.shadowRoot!.querySelector('.well__content')!;
    expect(content.classList.contains('well__content--break-long')).to.be.true;
    expect(getComputedStyle(content).overflowWrap).to.equal('anywhere');
  });

  it('should wrap preformatted content when pre and break-long are combined', async () => {
    const el = await fixture(html`
      <zn-well pre break-long>content</zn-well> `);
    const content = el.shadowRoot!.querySelector('.well__content')!;
    expect(content.tagName).to.equal('PRE');
    expect(getComputedStyle(content).whiteSpace).to.equal('pre-wrap');
    expect(getComputedStyle(content).overflowWrap).to.equal('anywhere');
  });

  it('should not let long unbroken content widen the well when break-long is set', async () => {
    const token = 'a'.repeat(400);
    const container = await fixture(html`
      <div style="width: 300px">
        <zn-well break-long>${token}</zn-well>
      </div> `);
    const el = container.querySelector('zn-well')!;
    expect(el.getBoundingClientRect().width).to.be.at.most(300);
  });
});
