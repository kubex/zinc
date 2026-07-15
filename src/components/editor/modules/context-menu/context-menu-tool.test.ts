import '../../../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import type ZnEditor from '../../editor.component';

interface QuillLike {
  focus: () => void;
  insertText: (index: number, text: string, source: string) => void;
  setSelection: (index: number, length: number, source: string) => void;
  root: HTMLElement;
}

interface ContextMenuLike extends HTMLElement {
  open: boolean;
  results: { label: string }[];
  setActiveIndex: (index: number) => void;
}

interface EditorDialogLike extends HTMLElement {
  dialogEl: HTMLDialogElement;
}

describe('<zn-editor> context menu tools', () => {
  afterEach(() => {
    document.querySelectorAll('zn-context-menu, zn-editor-dialog').forEach(el => el.remove());
  });

  const editorWithTool = () => fixture<ZnEditor>(html`
    <zn-editor id="test-editor">
      <zn-editor-tool uri="/canned"
                      label="Canned Responses"
                      icon="messages-square@lu"
                      key="canned-responses"
                      context-menu
                      slot="tools"></zn-editor-tool>
    </zn-editor>`);

  const openContextMenu = async (el: ZnEditor): Promise<QuillLike> => {
    const quill = (el as unknown as { quillElement: QuillLike }).quillElement;
    quill.focus();
    quill.insertText(0, '/', 'user');
    quill.setSelection(1, 0, 'user');
    await aTimeout(50);
    return quill;
  };

  const contextMenu = (): ContextMenuLike =>
    document.querySelector('zn-context-menu') as unknown as ContextMenuLike;

  it('lists a context-menu flagged tool in the slash menu', async () => {
    const el = await editorWithTool();
    await openContextMenu(el);

    const menu = contextMenu();
    expect(menu, 'context menu should exist').to.exist;
    expect(menu.open, 'context menu should be open').to.be.true;

    const labels = menu.results.map(r => r.label);
    expect(labels).to.include('Canned Responses');
  });

  it('opens the tool dialog when the slash menu entry is activated with Enter', async () => {
    const el = await editorWithTool();
    const quill = await openContextMenu(el);

    const menu = contextMenu();
    const index = menu.results.findIndex(r => r.label === 'Canned Responses');
    expect(index).to.be.greaterThan(-1);
    menu.setActiveIndex(index);

    quill.root.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      composed: true,
      cancelable: true,
    }));
    await aTimeout(100);

    const dialog = document.querySelector('zn-editor-dialog') as unknown as EditorDialogLike;
    expect(dialog, 'editor dialog should exist').to.exist;
    expect(dialog.dialogEl.open, 'dialog should be open').to.be.true;
    expect(dialog.innerHTML).to.contain('/canned');
  });
});
