import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnBackground from './background.component';

const transparentImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

describe('<zn-background>', () => {
  it('renders slotted content above the background layers', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background><p>Lesson content</p></zn-background>`);

    const content = el.shadowRoot!.querySelector<HTMLElement>('.background__content')!;
    const slot = content.querySelector<HTMLSlotElement>('slot')!;

    expect(slot.assignedElements()[0].textContent).to.equal('Lesson content');
    expect(getComputedStyle(content).zIndex).to.equal('1');
  });

  it('composes the configured colour and decorative image', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background color="#123456" image=${transparentImage}></zn-background>`);

    const base = el.shadowRoot!.querySelector<HTMLElement>('.background')!;
    const image = el.shadowRoot!.querySelector<HTMLImageElement>('.background__image')!;

    expect(getComputedStyle(base).backgroundColor).to.equal('rgb(18, 52, 86)');
    expect(image.src).to.equal(transparentImage);
    expect(image.alt).to.equal('');
    expect(image.getAttribute('part')).to.equal('image');
  });

  it('does not render an image element without an image URL', async () => {
    const el = await fixture<ZnBackground>(html`<zn-background></zn-background>`);

    expect(el.shadowRoot!.querySelector('.background__image')).to.not.exist;
  });

  it('applies soft, medium and full image strengths', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background image=${transparentImage} image-strength="soft"></zn-background>`);
    const image = el.shadowRoot!.querySelector<HTMLImageElement>('.background__image')!;

    expect(getComputedStyle(image).opacity).to.equal('0.3');
    el.imageStrength = 'medium';
    await el.updateComplete;
    expect(getComputedStyle(image).opacity).to.equal('0.62');
    el.imageStrength = 'full';
    await el.updateComplete;
    expect(getComputedStyle(image).opacity).to.equal('1');
  });

  it('supports drift and breathe motion and can pause it', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background image=${transparentImage} motion="drift"></zn-background>`);
    const image = el.shadowRoot!.querySelector<HTMLImageElement>('.background__image')!;

    expect(getComputedStyle(image).animationName).to.equal('zn-background-drift');
    el.motion = 'breathe';
    el.paused = true;
    await el.updateComplete;
    expect(getComputedStyle(image).animationName).to.equal('zn-background-breathe');
    expect(getComputedStyle(image).animationPlayState).to.equal('paused');
  });

  it('supports none, soft and strong light or dark overlays', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background overlay="none"></zn-background>`);
    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.background__overlay')!;

    expect(getComputedStyle(overlay).display).to.equal('none');
    el.overlay = 'soft';
    await el.updateComplete;
    const lightGradient = getComputedStyle(overlay).backgroundImage;
    expect(lightGradient).to.contain('255, 255, 255');

    el.overlay = 'strong';
    el.overlayTone = 'dark';
    await el.updateComplete;
    const darkGradient = getComputedStyle(overlay).backgroundImage;
    expect(darkGradient).to.contain('4, 12, 32');
    expect(darkGradient).to.not.equal(lightGradient);
  });

  it('renders up to eight comma-separated floating Zinc icons', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background
        floating-icons="school, lightbulb, quiz, psychology, star, rocket, science, public, hidden">
      </zn-background>`);
    const icons = el.shadowRoot!.querySelectorAll<HTMLElement>('.background__floating-icon');

    expect(icons).to.have.lengthOf(8);
    expect(icons[0].getAttribute('src')).to.equal('school');
    expect(icons[7].getAttribute('src')).to.equal('public');
    expect(el.shadowRoot!.querySelector('.background__floating-icons')!.getAttribute('aria-hidden')).to.equal('true');
  });

  it('sizes floating icons to five percent of the background width', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background floating-icons="school" style="width: 1000px;"></zn-background>`);
    const icon = el.shadowRoot!.querySelector<HTMLElement & {size: number}>('.background__floating-icon')!;

    await waitUntil(() => icon.size === 50);
    expect(icon.size).to.equal(50);
  });

  it('caps floating icons at 150 pixels and keeps opacity within one to fifty percent', async () => {
    const el = await fixture<ZnBackground>(html`
      <zn-background floating-icons="school,lightbulb" style="width: 4000px;"></zn-background>`);
    const icons = [...el.shadowRoot!.querySelectorAll<HTMLElement & {size: number}>('.background__floating-icon')];

    await waitUntil(() => icons[0].size === 150);
    expect(icons[0].size).to.equal(150);
    icons.forEach(icon => {
      const styles = getComputedStyle(icon);
      expect(Number(styles.getPropertyValue('--_zn-background-icon-opacity-min'))).to.be.at.least(0.01);
      expect(Number(styles.getPropertyValue('--_zn-background-icon-opacity-max'))).to.be.at.most(0.5);
      expect(styles.animationName).to.equal('zn-background-icon-float');
    });
  });
});
