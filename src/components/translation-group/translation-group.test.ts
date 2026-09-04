import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnFormGroup from '../form-group/form-group.component';
import type ZnInput from '../input/input.component';
import type ZnOption from '../option/option.component';
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

  describe('actions', () => {
    async function actionsFixture() {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
          <zn-button slot="actions" align="start" id="left">Auto translate</zn-button>
          <zn-button slot="actions" id="cancel">Cancel</zn-button>
          <zn-button slot="actions" id="save">Save</zn-button>
        </zn-translation-group>`);
      group.style.setProperty('--zn-spacing-small', '16px');
      await group.updateComplete;
      return group;
    }

    it('is not rendered when nothing is slotted into it', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      expect(group.shadowRoot!.querySelector('.translation-group__actions')).to.be.null;
    });

    it('sits at the bottom of the body, not in the footer', async () => {
      const group = await actionsFixture();

      const actions = group.shadowRoot!.querySelector<HTMLElement>('.translation-group__actions')!;
      expect(actions.closest('.panel__body'), 'on the white body').to.exist;
      expect(actions.closest('.panel__footer')).to.be.null;

      const body = [...group.shadowRoot!.querySelectorAll('.panel__body > *')];
      expect(body.indexOf(actions), 'last thing in the body').to.equal(body.length - 1);
    });

    it('holds align="start" children left and the rest right, in one group each', async () => {
      const group = await actionsFixture();

      const left = group.querySelector<HTMLElement>('#left')!.getBoundingClientRect();
      const cancel = group.querySelector<HTMLElement>('#cancel')!.getBoundingClientRect();
      const save = group.querySelector<HTMLElement>('#save')!.getBoundingClientRect();
      const row = group.shadowRoot!.querySelector<HTMLElement>('.translation-group__actions')!
        .getBoundingClientRect();

      expect(left.left).to.be.closeTo(row.left, 1);
      expect(save.right).to.be.closeTo(row.right, 1);
      // The right-hand pair stays together rather than spreading across the free space.
      expect(cancel.right).to.be.closeTo(save.left - 16, 1);
    });

    it('takes no border from the panel between the fields and the buttons', async () => {
      const group = await actionsFixture();

      const actions = group.shadowRoot!.querySelector<HTMLElement>('.translation-group__actions')!;
      expect(getComputedStyle(actions).borderTopWidth).to.equal('0px');
    });
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

      const formGroup = group.shadowRoot!.querySelector<ZnFormGroup>('zn-form-group')!;
      expect(formGroup.getBoundingClientRect().left, 'flush with the form around it')
        .to.equal(group.getBoundingClientRect().left);
    });

    it('leaves the same gap between the fields as between the group and its actions', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group inline label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      // The spacing tokens live in the theme stylesheet, which the bundle under test does not carry. The form
      // group's gap is one shorthand across both axes, so an unset column gap would void the row gap with it.
      group.style.setProperty('--zn-spacing-medium', '24px');
      group.style.setProperty('--zn-spacing-small', '16px');
      await group.updateComplete;

      const formGroup = group.shadowRoot!.querySelector<ZnFormGroup>('zn-form-group')!;
      await formGroup.updateComplete;
      const fields = formGroup.shadowRoot!.querySelector<HTMLElement>('.form-control-input')!;
      const body = group.shadowRoot!.querySelector<HTMLElement>('.panel__body')!;

      expect(getComputedStyle(fields).rowGap, "the form group's gap between fields").to.equal('24px');
      expect(getComputedStyle(body).rowGap, 'and down to the actions row').to.equal('24px');
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

    it("sits under the caption, in the form group's chip slot", async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const field = group.shadowRoot!.querySelector<HTMLElement>('.translation-group__language-field')!;
      expect(field.assignedSlot?.name, 'assigned to the chip slot').to.equal('chip');

      const formGroup = group.shadowRoot!.querySelector<ZnFormGroup>('zn-form-group')!;
      await formGroup.updateComplete;
      const label = formGroup.shadowRoot!.querySelector<HTMLElement>('[part="form-control-label"]')!;
      expect(field.getBoundingClientRect().top, 'below the caption')
        .to.be.greaterThan(label.getBoundingClientRect().bottom - 1);
    });

    it('leaves the caption to the form group label, with the count on the chip', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading" value='{"en":"Hi","fr":"Salut"}'></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const formGroup = group.shadowRoot!.querySelector<ZnFormGroup>('zn-form-group')!;
      await formGroup.updateComplete;
      const label = formGroup.shadowRoot!.querySelector<HTMLElement>('[part="form-control-label"]')!;
      expect(label.textContent?.trim(), 'nothing else rides the caption').to.equal('Content');

      const summary = selectOf(group).querySelector('zn-chip[slot="suffix"]')!;
      expect(summary.textContent?.trim()).to.equal('1/1');
    });

    it('wears the same chrome as any other select', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      // The input tokens live in the theme stylesheet, which the bundle under test does not carry.
      group.style.setProperty('--zn-input-background-color', 'rgb(1, 2, 3)');
      group.style.setProperty('--zn-shadow-x-small', '0 1px 2px rgb(7, 8, 9)');
      group.style.setProperty('--zn-input-border-width', '1px');
      group.style.setProperty('--zn-input-border-color', 'rgb(9, 9, 9)');
      await group.updateComplete;

      const select = selectOf(group);
      await select.updateComplete;
      const styles = getComputedStyle(select.shadowRoot!.querySelector<HTMLElement>('[part~="combobox"]')!);

      expect(styles.backgroundColor, 'the fill').to.equal('rgb(1, 2, 3)');
      expect(styles.boxShadow, 'the shadow').to.include('rgb(7, 8, 9)');
      expect(styles.borderTopWidth, 'the border').to.equal('1px');
      expect(styles.borderTopColor, 'the border').to.equal('rgb(9, 9, 9)');
    });

    it('fills the width of the label column', async () => {
      const el = await fixture<HTMLElement>(html`
        <div style="width: 900px">
          <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
            <zn-translations name="heading"></zn-translations>
          </zn-translation-group>
        </div>`);
      const group = el.querySelector<ZnTranslationGroup>('zn-translation-group')!;
      await group.updateComplete;

      const formGroup = group.shadowRoot!.querySelector<ZnFormGroup>('zn-form-group')!;
      await formGroup.updateComplete;
      const column = formGroup.shadowRoot!.querySelector<HTMLElement>('[part="form-control-chip"]')!;

      const select = selectOf(group);
      await select.updateComplete;
      expect(select.getBoundingClientRect().width).to.be.closeTo(column.getBoundingClientRect().width, 1);
    });

    it('filters the list on the name or the code, which stays off the option', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French', de: 'German'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const select = selectOf(group);
      await select.updateComplete;
      const option = (code: string) => select.querySelector<ZnOption>(`zn-option[value="${code}"]`)!;
      expect(option('de').getTextLabel().trim(), 'the code is not on show').to.equal('German');

      await select.show();
      const input = select.shadowRoot!.querySelector<HTMLInputElement>('[part~="display-input"]')!;
      input.value = 'de';
      input.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
      await select.updateComplete;

      expect(option('de').hidden, 'matched on its code').to.be.false;
      expect(option('fr').hidden, 'and nothing else').to.be.true;
    });

    it('names the select for a screen reader without showing the label', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const select = selectOf(group);
      expect(select.label).to.equal('Edit Languages');
      await select.updateComplete;
      const label = select.shadowRoot!.querySelector<HTMLElement>('[part~="form-control-label"]')!;
      expect(label.getBoundingClientRect().width).to.be.lessThan(2);
    });

    it('stands the select on its own with no caption', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group .languages=${{en: 'English', fr: 'French'}}>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const formGroup = group.shadowRoot!.querySelector<ZnFormGroup>('zn-form-group')!;
      await formGroup.updateComplete;

      expect(selectOf(group)).to.exist;
      expect(formGroup.shadowRoot!.querySelector('[part="form-control-label"]'), 'no empty caption').to.be.null;
      expect(formGroup.shadowRoot!.querySelector('[part="form-control-chip"]'), 'the select keeps its column').to.exist;
    });

    it('keeps the form group to the fields, with slotted actions going to the bottom', async () => {
      const group = await fixture<ZnTranslationGroup>(html`
        <zn-translation-group label="Content" .languages=${{en: 'English', fr: 'French'}}>
          <zn-button slot="actions">Auto translate</zn-button>
          <zn-translations name="heading"></zn-translations>
        </zn-translation-group>`);
      await group.updateComplete;

      const actionsSlot = group.shadowRoot!.querySelector('slot[name="actions"]')!;
      expect(actionsSlot.closest('zn-form-group'), 'the form group takes no actions').to.be.null;
      expect(actionsSlot.closest('.panel__body'), 'they go to the body').to.exist;
    });

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

    it('summarises progress on the closed select, leaving the options their own states', async () => {
      const group = await groupFixture(
        {en: 'English', fr: 'French', de: 'German', es: 'Spanish'},
        ['{"en":"Hello","fr":"Bonjour","de":"Hallo"}', '{"en":"Hi","fr":"Salut"}']);

      const summary = selectOf(group).querySelector('zn-chip[slot="suffix"]')!;
      expect(summary.textContent?.trim()).to.equal('1/3');
      expect(summary.getAttribute('type')).to.equal('warning');

      expect(chipsOf(group)).to.deep.equal(['Translated', 'Translated', 'Partial', 'English']);
    });

    it('marks the summary chip done once every target language is translated', async () => {
      const group = await groupFixture(
        {en: 'English', fr: 'French'},
        ['{"en":"Hello","fr":"Bonjour"}']);

      const summary = selectOf(group).querySelector('zn-chip[slot="suffix"]')!;
      expect(summary.textContent?.trim()).to.equal('1/1');
      expect(summary.getAttribute('type')).to.equal('success');
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

      const summary = selectOf(group).querySelector('zn-chip[slot="suffix"]')!;
      expect(summary.textContent?.trim()).to.equal('1/2');
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

  describe('form reset', () => {
    it('re-reads the children once the form has restored them', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <zn-translation-group .languages=${{en: 'English', fr: 'French'}}>
            <zn-translations name="a" value='{"en":"Hello","fr":"Bonjour"}'></zn-translations>
          </zn-translation-group>
        </form>`);
      const group = form.querySelector<ZnTranslationGroup>('zn-translation-group')!;
      const child = group.querySelector<ZnTranslations>('zn-translations')!;
      await child.updateComplete;
      group.requestUpdate();
      await group.updateComplete;

      child.values = {en: 'Hello', fr: ''};
      child.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await group.updateComplete;

      const summary = () => group.shadowRoot!.querySelector('zn-select zn-chip[slot="suffix"]')!.textContent?.trim();
      expect(summary()).to.equal('0/1');

      form.reset();
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
      await group.updateComplete;

      expect(child.values).to.deep.equal({en: 'Hello', fr: 'Bonjour'});
      expect(summary()).to.equal('1/1');
    });
  });
});
