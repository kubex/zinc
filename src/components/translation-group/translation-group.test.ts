import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnInput from '../input/input.component';
import type ZnSelect from '../select/select.component';
import type ZnTranslationGroup from './translation-group.component';
import type ZnTranslations from '../translations/translations.component';

describe('<zn-translation-group>', () => {
  // The group syncs its children from its own first update, which runs before theirs, so a child's
  // pending value attribute must survive the language keys the group adds.
  it("keeps a child's rendered value when it syncs the group language", async () => {
    const group = await fixture(html`
      <zn-translation-group label="Text" .languages=${{en: 'English', fr: 'French'}}>
        <zn-translations name="heading" value='{"en":"Chat to us"}'></zn-translations>
      </zn-translation-group>`);

    const child = group.querySelector<ZnTranslations>('zn-translations')!;
    await child.updateComplete;

    expect(child.values).to.deep.equal({en: 'Chat to us'});
    const input = child.shadowRoot!.querySelector<ZnInput>('zn-input')!;
    expect(input.value).to.equal('Chat to us');
  });

  describe('inline', () => {
    it('keeps the panel chrome by default', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const panel = group.shadowRoot!.querySelector('.panel')!;
      expect(panel.classList.contains('panel--transparent')).to.be.false;
      expect(panel.classList.contains('panel--flush')).to.be.false;
    });

    it('drops the border, background and padding so the fields align with the form', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group inline label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const panel = group.shadowRoot!.querySelector<HTMLElement>('.panel')!;
      expect(panel.classList.contains('panel--transparent')).to.be.true;
      expect(panel.classList.contains('panel--flush')).to.be.true;

      const styles = getComputedStyle(panel);
      expect(styles.borderTopWidth).to.equal('0px');
      expect(styles.backgroundColor).to.equal('rgba(0, 0, 0, 0)');

      const body = group.shadowRoot!.querySelector<HTMLElement>('.panel__body')!;
      expect(getComputedStyle(body).paddingLeft).to.equal('0px');
      expect(getComputedStyle(group.shadowRoot!.querySelector<HTMLElement>('.panel__header')!).paddingLeft)
        .to.equal('0px');
    });

    it('leaves the same gap under the caption as between the fields', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group inline label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      // The spacing tokens live in the theme stylesheet, which the bundle under test does not carry.
      group.style.setProperty('--zn-spacing-medium', '24px');
      await group.updateComplete;

      const header = group.shadowRoot!.querySelector<HTMLElement>('.panel__header')!;
      const body = group.shadowRoot!.querySelector<HTMLElement>('.panel__body')!;

      // zn-form-group's row gap between stacked controls. The caption heads the same stack, so its gap matches.
      expect(getComputedStyle(body).rowGap).to.equal('24px');
      expect(getComputedStyle(header).paddingBottom).to.equal('24px');
    });

    it('hugs the caption instead of holding the header at its 36px action-row height', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group inline label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const header = group.shadowRoot!.querySelector('zn-header')!;
      await header.updateComplete;
      const content = header.shadowRoot!.querySelector<HTMLElement>('.content')!;

      expect(getComputedStyle(content).minHeight).to.equal('0px');
    });

    it("does not clip the language select's focus ring once the padding is gone", async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group inline .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      ['.panel__inner', '.panel__content', '.panel__body'].forEach(selector => {
        const el = group.shadowRoot!.querySelector<HTMLElement>(selector)!;
        expect(getComputedStyle(el).overflow, selector).to.equal('visible');
      });
    });
  });

  describe('language select', () => {
    function selectOf(group: ZnTranslationGroup) {
      return group.shadowRoot!.querySelector<ZnSelect>('zn-select')!;
    }

    function chipsOf(group: ZnTranslationGroup) {
      return [...selectOf(group).querySelectorAll('zn-option zn-chip')]
        .map(chip => chip.textContent?.trim());
    }

    async function groupFixture(languages: Record<string, string>, values: string[]) {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group .languages=${languages}>
          ${values.map(value => html`<zn-translations name="f" value=${value}></zn-translations>`)}
        </zn-translation-group>`);
      await Promise.all([...group.querySelectorAll<ZnTranslations>('zn-translations')]
        .map(child => child.updateComplete));
      group.requestUpdate();
      await group.updateComplete;
      return group;
    }

    it('marks a language translated only when every child has a value for it', async () => {
      const group = await groupFixture(
        {en: 'English', fr: 'French', de: 'German'},
        ['{"en":"Hello","fr":"Bonjour","de":"Hallo"}', '{"en":"Hi","fr":"Salut"}']);

      expect(chipsOf(group)).to.deep.equal(['Translated', 'Translated', 'Partial']);
    });

    it('falls back to English where no child has a value', async () => {
      const group = await groupFixture(
        {en: 'English', fr: 'French'},
        ['{"en":"Hello"}', '{"en":"Hi"}']);

      expect(chipsOf(group)).to.deep.equal(['Translated', 'English']);
    });

    it('counts the target languages, not English', async () => {
      const group = await groupFixture(
        {en: 'English', fr: 'French', de: 'German'},
        ['{"en":"Hello","fr":"Bonjour"}']);

      const count = group.shadowRoot!.querySelector('.translation-group__language-count');
      expect(count?.textContent?.trim()).to.equal('(1 of 2 translated)');
    });

    it('switches every child when the select changes', async () => {
      const group = await groupFixture(
        {en: 'English', fr: 'French'},
        ['{"en":"Hello","fr":"Bonjour"}', '{"en":"Hi","fr":"Salut"}']);

      const select = selectOf(group);
      select.value = 'fr';
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await group.updateComplete;

      const children = [...group.querySelectorAll<ZnTranslations>('zn-translations')];
      await Promise.all(children.map(child => child.updateComplete));
      expect(children.map(child => child.getActiveLanguage())).to.deep.equal(['fr', 'fr']);
      expect(children.map(child => child.shadowRoot!.querySelector<ZnInput>('zn-input')!.value as string))
        .to.deep.equal(['Bonjour', 'Salut']);
    });

    it('emits zn-language-change without reporting a value change', async () => {
      const group = await groupFixture({en: 'English', fr: 'French'}, ['{"en":"Hello"}']);

      let language = '';
      let changes = 0;
      group.addEventListener('zn-language-change', (e: Event) => {
        language = (e as CustomEvent<{language: string}>).detail.language;
      });
      group.addEventListener('zn-change', () => changes++);

      const select = selectOf(group);
      select.value = 'fr';
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await group.updateComplete;

      expect(language).to.equal('fr');
      expect(changes).to.equal(0);
    });
  });
});
