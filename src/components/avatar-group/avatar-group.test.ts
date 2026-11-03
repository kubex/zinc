import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnAvatarGroup from './avatar-group.component';

describe('<zn-avatar-group>', () => {
  it('should wrap each avatar in a tooltip with its name', async () => {
    const el = await fixture<ZnAvatarGroup>(html`
      <zn-avatar-group>
        <zn-icon src="Ben Brooks" library="avatar"></zn-icon>
        <zn-icon src="JE" alt="Jade Ellis" library="avatar"></zn-icon>
      </zn-avatar-group>
    `);
    await el.updateComplete;

    const tooltips = [...el.shadowRoot!.querySelectorAll('zn-tooltip')];
    expect(tooltips.map(tooltip => tooltip.getAttribute('content'))).to.deep.equal(['Ben Brooks', 'Jade Ellis']);
    expect(tooltips[0].querySelector('slot')!.assignedElements()[0]).to.equal(el.children[0]);
  });

  it('should make its avatars round', async () => {
    const el = await fixture<ZnAvatarGroup>(html`
      <zn-avatar-group><zn-icon src="Ben Brooks" library="avatar"></zn-icon></zn-avatar-group>
    `);
    expect(el.children[0].hasAttribute('round')).to.be.true;
  });

  it('should count the avatars past max and list them in the overflow tooltip', async () => {
    const el = await fixture<ZnAvatarGroup>(html`
      <zn-avatar-group max="2">
        <zn-icon src="Ben Brooks" library="avatar" size="lg"></zn-icon>
        <zn-icon src="Jade Ellis" library="avatar" size="lg"></zn-icon>
        <zn-icon src="Kai Walsh" library="avatar" size="lg"></zn-icon>
        <zn-icon src="Ann Isaacs" library="avatar" size="lg"></zn-icon>
      </zn-avatar-group>
    `);
    await el.updateComplete;

    const overflow = el.shadowRoot!.querySelector<HTMLElement>('[part="overflow"]')!;
    expect(overflow.textContent!.trim()).to.equal('+2');
    expect(overflow.closest('zn-tooltip')!.getAttribute('content')).to.equal('Kai Walsh, Ann Isaacs');
    expect(overflow.getBoundingClientRect().width).to.equal(40);
    expect((el.children[2] as HTMLElement).getBoundingClientRect().width).to.equal(0);
  });

  it('should update when avatars are added', async () => {
    const el = await fixture<ZnAvatarGroup>(html`
      <zn-avatar-group><zn-icon src="Ben Brooks" library="avatar"></zn-icon></zn-avatar-group>
    `);
    const added = document.createElement('zn-icon');
    added.setAttribute('src', 'Jade Ellis');
    added.setAttribute('library', 'avatar');
    el.append(added);
    await new Promise(resolve => setTimeout(resolve, 0));
    await el.updateComplete;

    expect(el.shadowRoot!.querySelectorAll('zn-tooltip')).to.have.length(2);
    expect(added.slot).to.equal('avatar-1');
  });
});
