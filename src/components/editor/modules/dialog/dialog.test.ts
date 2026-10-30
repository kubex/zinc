import '../../../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type DialogComponent from './dialog.component';
import type {ZnEditorInsertEvent} from '../events/zn-editor-insert';

describe('<zn-editor-dialog> content inserts', () => {
  const dialog = () => fixture<DialogComponent>(html`
    <zn-editor-dialog>
      <template id="reply"><p>Hi <b>there</b></p></template>
      <span id="plain">Plain reply</span>
      <button id="html" editor-mode="replace" editor-content-id="reply">Replace</button>
      <button id="text" editor-mode="insert" editor-content-id="plain">Insert</button>
    </zn-editor-dialog>`);

  it('inserts a template as HTML', async () => {
    const el = await dialog();
    setTimeout(() => el.querySelector<HTMLElement>('#html')!.click());
    const event = await oneEvent(el, 'zn-editor-insert') as ZnEditorInsertEvent;
    expect(event.detail).to.deep.equal({mode: 'replace', html: '<p>Hi <b>there</b></p>'});
  });

  it('inserts any other element as text', async () => {
    const el = await dialog();
    setTimeout(() => el.querySelector<HTMLElement>('#text')!.click());
    const event = await oneEvent(el, 'zn-editor-insert') as ZnEditorInsertEvent;
    expect(event.detail).to.deep.equal({mode: 'insert', text: 'Plain reply'});
  });
});
