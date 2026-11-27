import '../../../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import type RichEditor from '../../../../internal/rich-text/rich-editor';
import type ZnEditor from '../../editor.component';

interface SlashMenuLike extends HTMLElement {
  open: boolean;
  items: { label: string }[];
  setActiveIndex: (index: number) => void;
}

interface EditorDialogLike extends HTMLElement {
  dialogEl: HTMLDialogElement;
}


describe('<zn-editor> context menu tools', () => {
  afterEach(() => {
    document.querySelectorAll('zn-slash-menu, zn-editor-dialog').forEach(el => el.remove());
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

  const openContextMenu = async (el: ZnEditor): Promise<RichEditor> => {
    const editor = el.commands;
    editor.focus();
    editor.insertText(0, '/');
    editor.setSelection(1, 0);
    await aTimeout(50);
    return editor;
  };

  const contextMenu = (): SlashMenuLike =>
    document.querySelector('zn-slash-menu') as unknown as SlashMenuLike;

  it('lists a context-menu flagged tool in the slash menu', async () => {
    const el = await editorWithTool();
    await openContextMenu(el);

    const menu = contextMenu();
    expect(menu, 'context menu should exist').to.exist;
    expect(menu.open, 'context menu should be open').to.be.true;

    const labels = menu.items.map(item => item.label);
    expect(labels).to.include('Canned Responses');
  });

  it('opens the tool dialog when the slash menu entry is activated with Enter', async () => {
    const el = await editorWithTool();
    const editor = await openContextMenu(el);

    const menu = contextMenu();
    const index = menu.items.findIndex(item => item.label === 'Canned Responses');
    expect(index).to.be.greaterThan(-1);
    menu.setActiveIndex(index);

    editor.root.dispatchEvent(new KeyboardEvent('keydown', {
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

  it('keeps the date picker open when Date is chosen with the mouse', async () => {
    const el = await fixture<ZnEditor>(html`
      <zn-editor id="test-editor" dates></zn-editor>`);
    const editor = await openContextMenu(el);
    editor.insertText(1, 'date');
    editor.setSelection(5, 0);
    await aTimeout(50);

    const menu = contextMenu();
    const index = menu.items.findIndex(item => item.label === 'Date');
    expect(index, 'Date should be listed').to.be.greaterThan(-1);

    const button = menu.shadowRoot!.querySelectorAll<HTMLButtonElement>('[data-slash-item]')[index];
    expect(button, 'Date item should be rendered').to.exist;

    button.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true, composed: true}));
    await aTimeout(100);

    const picker = el.shadowRoot!.querySelector<HTMLElement & {active: boolean}>('.editor__picker')!;
    expect(picker.active, 'the picker popup should be open').to.be.true;
    expect(picker.querySelector('.air-datepicker'), 'it should hold the calendar').to.exist;
  });
  it('inserts a quick action on the line the slash was typed on', async () => {
    const el = await fixture<ZnEditor>(html`
      <zn-editor>
        <zn-editor-quick-action slot="context-items" icon="braces@lu" label="First name"
                                content="Kyle"></zn-editor-quick-action>
      </zn-editor>`);
    const editor = el.commands;
    editor.focus();
    editor.insertText(0, 'Hello\n/');
    editor.setSelection(7, 0);
    await aTimeout(50);

    const menu = contextMenu();
    menu.setActiveIndex(menu.items.findIndex(item => item.label === 'First name'));
    editor.root.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, composed: true, cancelable: true}));
    await aTimeout(50);

    expect(editor.getText()).to.equal('Hello\nKyle\n');
  });
});
