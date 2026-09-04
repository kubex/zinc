import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-form-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-form-group></zn-form-group> `);

    expect(el).to.exist;
  });

  it('should render the chip slot under the help text', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-form-group label="Settings" help-text="Configure your settings">
        <zn-chip slot="chip">New</zn-chip>
      </zn-form-group>`);

    const helpText = el.shadowRoot!.querySelector('[part="form-control-help-text"]')!;
    const chip = el.shadowRoot!.querySelector('[part="form-control-chip"]')!;

    expect(chip).to.exist;
    expect(helpText.nextElementSibling).to.equal(chip);
  });

  it('should not render the chip container without a chip slot', async () => {
    const el = await fixture<HTMLElement>(html` <zn-form-group label="Settings"></zn-form-group> `);

    expect(el.shadowRoot!.querySelector('[part="form-control-chip"]')).to.not.exist;
  });

  describe('sticky label', () => {
    const tallForm = Array.from({length: 25}, (_, i) => `<zn-input label="Field ${i}"></zn-input>`).join('');

    async function scrollPast(group: HTMLElement) {
      group.innerHTML = tallForm;
      await new Promise(resolve => setTimeout(resolve, 400));

      const label = group.shadowRoot!.querySelector<HTMLElement>('.form-control__text')!;
      const before = label.getBoundingClientRect().top;

      for (let node: Node | null = label; node; node = flatParent(node)) {
        if (node instanceof HTMLElement && node.scrollHeight > node.clientHeight + 1) node.scrollTop = 500;
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      return {before, after: label.getBoundingClientRect().top};
    }

    function flatParent(node: Node): Node | null {
      if (node instanceof Element && node.assignedSlot) return node.assignedSlot;
      return node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode;
    }

    it('holds the label in view when the scroll container is the nearest one', async () => {
      const el = await fixture<HTMLElement>(html`
        <div style="max-height: 300px; overflow-y: auto">
          <zn-form-group label="Sticky"></zn-form-group>
        </div>`);

      const {before, after} = await scrollPast(el.querySelector('zn-form-group')!);

      expect(after).to.be.closeTo(before, 4);
    });

    it('gives up sticky once the columns stack', async () => {
      const wide = await fixture<HTMLElement>(html`
        <div style="width: 900px"><zn-form-group label="Sticky"></zn-form-group></div>`);
      const narrow = await fixture<HTMLElement>(html`
        <div style="width: 500px"><zn-form-group label="Sticky"></zn-form-group></div>`);
      await new Promise(resolve => setTimeout(resolve, 100));

      const position = (root: HTMLElement) => {
        const group = root.querySelector('zn-form-group')!;
        return getComputedStyle(group.shadowRoot!.querySelector('.form-control__text')!).position;
      };

      expect(position(wide)).to.equal('sticky');
      expect(position(narrow)).to.equal('static');
    });

    it('leaves the label level with the inputs while nothing scrolls', async () => {
      const el = await fixture<HTMLElement>(html`
        <div style="width: 900px">
          <zn-panel>
            <zn-form-group label="Sticky"><zn-input label="Name"></zn-input></zn-form-group>
          </zn-panel>
        </div>`);
      await new Promise(resolve => setTimeout(resolve, 100));

      const root = el.querySelector('zn-form-group')!.shadowRoot!;
      const label = root.querySelector('.form-control__text')!.getBoundingClientRect().top;
      const inputs = root.querySelector('.form-control-input')!.getBoundingClientRect().top;

      expect(label).to.be.closeTo(inputs, 2);
    });

    it('hands the movement to a scroll timeline where the browser has one', async () => {
      if (!window.ScrollTimeline) return;

      const el = await fixture<HTMLElement>(html`
        <div style="max-height: 300px; overflow-y: auto">
          <zn-panel>
            <zn-form-group label="Sticky"></zn-form-group>
          </zn-panel>
        </div>`);
      const group = el.querySelector<HTMLElement>('zn-form-group')!;
      group.innerHTML = tallForm;
      await new Promise(resolve => setTimeout(resolve, 400));

      const label = group.shadowRoot!.querySelector<HTMLElement>('.form-control__text')!;
      const [animation] = label.getAnimations();

      expect(animation, 'the compositor drives the label, not the scroll handler').to.exist;
      expect(animation.timeline).to.be.instanceOf(window.ScrollTimeline);
    });

    it('holds the label in view when a panel sits between the form and the scroll container', async () => {
      const el = await fixture<HTMLElement>(html`
        <div style="max-height: 300px; overflow-y: auto">
          <zn-panel>
            <zn-form-group label="Sticky"></zn-form-group>
          </zn-panel>
        </div>`);

      const {before, after} = await scrollPast(el.querySelector('zn-form-group')!);

      expect(after).to.be.closeTo(before, 4);
    });
  });
});
