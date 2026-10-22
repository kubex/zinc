import '../../../dist/zn.min.js';
import { emulateMedia } from '@web/test-runner-commands';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-slideout>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-slideout></zn-slideout> `);

    expect(el).to.exist;
  });

  describe('reduced motion', () => {
    before(() => emulateMedia({reducedMotion: 'reduce'}));
    after(() => emulateMedia({reducedMotion: 'no-preference'}));

    it('fades without sliding', async () => {
      const el = await fixture<HTMLElement & { show: () => Promise<void> }>(html` <zn-slideout></zn-slideout> `);
      const dialog = el.shadowRoot!.querySelector('.slideout')!;

      void el.show();
      const [animation] = dialog.getAnimations();
      const keyframes = (animation.effect as KeyframeEffect).getKeyframes();

      expect(keyframes.map(keyframe => keyframe.opacity)).to.deep.equal(['0', '1']);
      expect(keyframes.some(keyframe => 'transform' in keyframe)).to.be.false;
      expect(animation.effect!.getTiming().duration).to.equal(150);
    });
  });
});
