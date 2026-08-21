import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnInlineEdit from '../inline-edit/inline-edit.component';
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
    const input = child.shadowRoot!.querySelector<ZnInlineEdit>('zn-inline-edit')!;
    expect(input.value).to.equal('Chat to us');
  });
});
