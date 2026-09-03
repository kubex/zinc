import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import type ZnInlineEdit from '../inline-edit/inline-edit.component';
import type ZnInput from '../input/input.component';
import type ZnSelect from '../select/select.component';
import type ZnSlashMenu from '../slash-menu/slash-menu.component';
import type ZnTextarea from '../textarea/textarea.component';
import type ZnTranslations from './translations.component';

// The auto-resizing textarea's ResizeObserver can emit a benign "loop completed with undelivered
// notifications" warning while the slash menu is positioned. It's not a real error — ignore it so the
// test runner doesn't treat it as an uncaught exception (capture phase runs before the runner's).
window.addEventListener('error', (e: ErrorEvent) => {
  if (typeof e.message === 'string' && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

describe('<zn-translations>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-translations></zn-translations> `);
    expect(el).to.exist;
  });

  it('should have default language en', async () => {
    const el = await fixture<ZnTranslations>(html` <zn-translations></zn-translations> `);
    expect(el.languages).to.have.property('en');
    // We expect values to default to en: '' if strictly following requirements,
    // or at least the UI should show it.
    // Based on my plan, I will implement auto-population of 'en'.
    expect(el.values).to.have.property('en');
  });

  it('should update value when input changes', async () => {
    const el = await fixture<ZnTranslations>(html` <zn-translations></zn-translations> `);
    // Mock languages to ensure we have something to edit
    el.languages = { 'en': 'English', 'fr': 'French' };
    el.values = { 'en': 'Hello' };
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('zn-input') as ZnInput | null;
    expect(input).to.exist;
    expect(input!.value).to.equal('Hello');

    // Simulate change
    input!.value = 'Hello World';
    input!.dispatchEvent(new CustomEvent('zn-change'));

    await el.updateComplete;
    await expect(el.values['en']).to.equal('Hello World');
    await expect(JSON.parse(el.value)).to.deep.equal({'en': 'Hello World'});
  });

  describe('language select', () => {
    function selectOf(el: ZnTranslations) {
      return el.shadowRoot!.querySelector<ZnSelect>('zn-select');
    }

    it('is not rendered for a single language', async () => {
      const el = await fixture<ZnTranslations>(html`<zn-translations></zn-translations>`);
      await el.updateComplete;

      expect(selectOf(el)).to.be.null;
    });

    it('offers every configured language, translated or not', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French","de":"German"}'
          values='{"en":"Hello","de":"Hallo"}'></zn-translations>`);
      await el.updateComplete;

      const options = [...selectOf(el)!.querySelectorAll('zn-option')];
      expect(options.map(option => option.value)).to.deep.equal(['en', 'fr', 'de']);
    });

    it('marks a language with a value translated and a blank one as falling back to English', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French"}'
          values='{"en":"Hello"}'></zn-translations>`);
      await el.updateComplete;

      const chips = [...selectOf(el)!.querySelectorAll('zn-option zn-chip')];
      expect(chips.map(chip => chip.textContent?.trim())).to.deep.equal(['Translated', 'English']);
      expect(chips.map(chip => chip.getAttribute('type'))).to.deep.equal(['success', 'error']);
    });

    it('summarises progress on the closed select, leaving the options their own states', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French","de":"German"}'
          values='{"en":"Hello","de":"Hallo"}'></zn-translations>`);
      await el.updateComplete;

      const summary = selectOf(el)!.querySelector('zn-chip[slot="suffix"]')!;
      expect(summary.textContent?.trim()).to.equal('1/2');
      expect(summary.getAttribute('type')).to.equal('warning');

      const options = [...selectOf(el)!.querySelectorAll('zn-option zn-chip')];
      expect(options.map(chip => chip.textContent?.trim())).to.deep.equal(['Translated', 'English', 'Translated']);
    });

    it('switches the edited language when the select changes', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French"}'
          values='{"en":"Hello","fr":"Bonjour"}'></zn-translations>`);
      await el.updateComplete;

      const select = selectOf(el)!;
      select.value = 'fr';
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await el.updateComplete;

      expect(el.getActiveLanguage()).to.equal('fr');
      expect(el.shadowRoot!.querySelector<ZnInput>('zn-input')!.value).to.equal('Bonjour');
    });

    it("does not report the select's own change as a value change", async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French"}'
          values='{"en":"Hello"}'></zn-translations>`);
      await el.updateComplete;

      let changes = 0;
      el.addEventListener('zn-change', () => changes++);

      const select = selectOf(el)!;
      select.value = 'fr';
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
      await el.updateComplete;

      expect(changes).to.equal(0);
    });

    it('leaves a browsed language out of the submitted value until it is typed into', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French"}'
          values='{"en":"Hello"}'></zn-translations>`);
      el.setActiveLanguage('fr');
      await el.updateComplete;

      expect(JSON.parse(el.value)).to.deep.equal({en: 'Hello'});
    });

    it('shows the English text as the placeholder for a blank language', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations
          languages='{"en":"English","fr":"French"}'
          values='{"en":"Hello"}'></zn-translations>`);
      el.setActiveLanguage('fr');
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector<ZnInput>('zn-input')!.placeholder).to.equal('Hello');
    });
  });

  describe('help text', () => {
    function helpTextOf(el: ZnTranslations) {
      return el.shadowRoot!.querySelector<HTMLElement>('[part="form-control-help-text"]');
    }

    it('is not rendered when unset', async () => {
      const el = await fixture<ZnTranslations>(html`<zn-translations></zn-translations>`);
      await el.updateComplete;

      expect(helpTextOf(el)).to.not.exist;
    });

    it('renders the help-text attribute below the field', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations help-text="Type / to insert a replacement"></zn-translations>`);
      await el.updateComplete;

      expect(helpTextOf(el)?.textContent?.trim()).to.equal('Type / to insert a replacement');
    });

    it('renders the help-text slot', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations>
          <div slot="help-text">Type <strong>/</strong> to insert</div>
        </zn-translations>`);
      await el.updateComplete;

      expect(helpTextOf(el), 'a slotted help text should still render the wrapper').to.exist;
    });

    it('shows the same help text after switching language', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations help-text="Type / to insert a replacement"></zn-translations>`);
      el.languages = {'en': 'EN', 'fr': 'FR'};
      el.values = {'en': '', 'fr': ''};
      el.setActiveLanguage('fr');
      await el.updateComplete;

      expect(helpTextOf(el)?.textContent?.trim()).to.equal('Type / to insert a replacement');
    });
  });

  describe('field', () => {
    it('renders a plain input by default', async () => {
      const el = await fixture<ZnTranslations>(html`<zn-translations></zn-translations>`);
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('zn-input')).to.exist;
      expect(el.shadowRoot!.querySelector('zn-inline-edit')).to.be.null;
    });

    it('renders a plain textarea for input-type="textarea"', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations input-type="textarea"></zn-translations>`);
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('zn-textarea')).to.exist;
      expect(el.shadowRoot!.querySelector('zn-input')).to.be.null;
    });

    it('renders an inline edit when asked for one', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations inline-edit values='{"en":"Hello"}'></zn-translations>`);
      await el.updateComplete;

      const inlineEdit = el.shadowRoot!.querySelector<ZnInlineEdit>('zn-inline-edit');
      expect(inlineEdit).to.exist;
      expect(inlineEdit!.value).to.equal('Hello');
      expect(el.shadowRoot!.querySelector('zn-input')).to.be.null;
    });

    it('takes no slotted actions of its own', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations label="Name">
          <zn-button slot="actions">Auto translate</zn-button>
        </zn-translations>`);
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector('slot[name="actions"]')).to.be.null;
    });

    it('passes disabled down to the field', async () => {
      const el = await fixture<ZnTranslations>(html`<zn-translations disabled></zn-translations>`);
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector<ZnInput>('zn-input')!.disabled).to.be.true;
    });
  });

  describe('slash menu', () => {
    async function textareaOf(el: ZnTranslations) {
      await el.updateComplete;
      const textarea = el.shadowRoot!.querySelector<ZnTextarea>('zn-textarea')!;
      await textarea.updateComplete;

      return textarea;
    }

    async function openSlashMenu(textarea: ZnTextarea) {
      textarea.focus();
      textarea.input.value = '/';
      textarea.input.setSelectionRange(1, 1);
      textarea.input.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));

      const menuOf = () => textarea.shadowRoot!.querySelector<ZnSlashMenu>('zn-slash-menu');
      await waitUntil(() => menuOf()?.open, 'the slash menu never opened');

      return menuOf()!;
    }

    it('offers its slash items on the textarea', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations input-type="textarea"
                         slash-items="Brand name={{BRAND_NAME}}, Support email={{SUPPORT_EMAIL}}"></zn-translations>`);
      const menu = await openSlashMenu(await textareaOf(el));

      expect(menu.items.map(item => item.label)).to.deep.equal(['Brand name', 'Support email']);
    });

    it('offers the same items after switching language', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations input-type="textarea"
                         slash-items="Brand name={{BRAND_NAME}}"></zn-translations>`);
      el.languages = {'en': 'EN', 'fr': 'FR'};
      el.values = {'en': '', 'fr': ''};
      el.setActiveLanguage('fr');

      const menu = await openSlashMenu(await textareaOf(el));

      expect(el.getActiveLanguage()).to.equal('fr');
      expect(menu.items.map(item => item.label)).to.deep.equal(['Brand name']);
    });

    it('inserts the token into the active language only', async () => {
      const el = await fixture<ZnTranslations>(html`
        <zn-translations input-type="textarea"
                         slash-items="Brand name={{BRAND_NAME}}"></zn-translations>`);
      el.languages = {'en': 'EN', 'fr': 'FR'};
      el.values = {'en': 'Hello', 'fr': ''};
      el.setActiveLanguage('fr');

      const textarea = await textareaOf(el);
      await openSlashMenu(textarea);

      textarea.input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true
      }));
      await el.updateComplete;

      expect(el.values.fr).to.equal('{{BRAND_NAME}}');
      expect(el.values.en, 'the other languages should be untouched').to.equal('Hello');
    });
  });
});
