import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnTranslationGrid from './translation-grid.component';

describe('<zn-translation-grid>', () => {
  it('renders one Translation row without fields', async () => {
    const el = await fixture<ZnTranslationGrid>(html`
      <zn-translation-grid languages='[{"code":"en","label":"English","status":"source"},{"code":"fr","label":"French","status":"missing","href":"#fr"}]'>
        <zn-checkbox slot="enable-fr"></zn-checkbox>
      </zn-translation-grid>`);
    const rows = el.shadowRoot!.querySelectorAll('tbody tr');
    expect(rows).to.have.length(2);
    expect(rows[1].querySelector('th')!.textContent).to.equal('Translation');
  });

  it('renders a row per field and rings the selected cell', async () => {
    const el = await fixture<ZnTranslationGrid>(html`
      <zn-translation-grid selected="fr" selected-field="content"
        languages='[{"code":"en","label":"English"},{"code":"fr","label":"French"}]'
        fields='[{"key":"name","label":"Name","cells":{"en":{"status":"source"},"fr":{"status":"outdated","href":"#n"}}},{"key":"content","label":"Content","cells":{"en":{"status":"source"},"fr":{"status":"translated","href":"#c"}}}]'></zn-translation-grid>`);
    const rows = el.shadowRoot!.querySelectorAll('tbody tr');
    expect(rows).to.have.length(2);
    expect(rows[0].querySelector('.translation-grid__cell--outdated')).to.exist;
    const selected = el.shadowRoot!.querySelectorAll('.translation-grid__cell--selected');
    expect(selected).to.have.length(1);
    expect(selected[0].getAttribute('href')).to.equal('#c');
  });
});
