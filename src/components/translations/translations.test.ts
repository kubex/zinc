import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import type ZnInlineEdit from '../inline-edit/inline-edit.component';
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

    const input = el.shadowRoot!.querySelector('zn-inline-edit') as ZnInlineEdit | null;
    expect(input).to.exist;
    expect(input!.value).to.equal('Hello');

    // Simulate change
    input!.value = 'Hello World';
    input!.dispatchEvent(new CustomEvent('zn-change'));

    await el.updateComplete;
    await expect(el.values['en']).to.equal('Hello World');
    await expect(JSON.parse(el.value)).to.deep.equal({'en': 'Hello World'});
  });

  describe('slash menu', () => {
    /** Puts the active language's field into edit mode, the way clicking it does. */
    async function textareaOf(el: ZnTranslations) {
      await el.updateComplete;
      const inlineEdit = el.shadowRoot!.querySelector<ZnInlineEdit>('zn-inline-edit')!;
      await inlineEdit.updateComplete;

      inlineEdit.shadowRoot!.querySelector<HTMLElement>('.ai__left')!
        .dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true}));
      await inlineEdit.updateComplete;

      const textarea = inlineEdit.shadowRoot!.querySelector<ZnTextarea>('zn-textarea')!;
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
