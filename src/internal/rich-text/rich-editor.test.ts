import {alignment, blockquote, codeBlock, color, heading, hr, image, link, lists, marks, mergeFields, sanitizeHref, textStyle, video} from './extensions';
import {expect} from '@open-wc/testing';
import {History} from './history';
import {isApple} from './keymap';
import {readRange} from './selection';
import {sendKeys} from '@web/test-runner-commands';
import RichEditor from './rich-editor';

const hosts: HTMLElement[] = [];

function setup(html = '') {
  const host = document.createElement('div');
  document.body.append(host);
  hosts.push(host);
  const root = document.createElement('div');
  host.attachShadow({mode: 'open'}).append(root);
  const editor = new RichEditor(root, {extensions: [marks, heading, lists, link, hr]});
  editor.setHTML(html);
  return editor;
}

function setupAll(html = '') {
  const host = document.createElement('div');
  document.body.append(host);
  hosts.push(host);
  const root = document.createElement('div');
  host.attachShadow({mode: 'open'}).append(root);
  const editor = new RichEditor(root, {extensions: [
    marks, heading, lists, link, hr, color, textStyle, alignment, blockquote, codeBlock, image, video,
    mergeFields({'{{first_name}}': 'First name'}),
  ]});
  editor.setHTML(html);
  return editor;
}

function fire(editor: RichEditor, inputType: string, data: string | null = null) {
  editor.root.dispatchEvent(new InputEvent('beforeinput', {inputType, data, cancelable: true, bubbles: true}));
}

function key(editor: RichEditor, init: KeyboardEventInit) {
  editor.root.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, cancelable: true, ...init}));
}

describe('RichEditor', () => {
  afterEach(() => hosts.splice(0).forEach(host => host.remove()));

  describe('loading HTML', () => {
    const cases: [string, string, string][] = [
      ['keeps formatting', '<p>Hello <strong>world</strong></p>', '<p>Hello <strong>world</strong></p>'],
      ['renames b and i', '<p><b>a</b><i>b</i></p>', '<p><strong>a</strong><em>b</em></p>'],
      ['turns divs into paragraphs', '<div>a</div><div>b</div>', '<p>a</p><p>b</p>'],
      ['wraps loose text', 'a<p>b</p>', '<p>a</p><p>b</p>'],
      ['splits lines on breaks', '<p>a<br>b</p>', '<p>a</p><p>b</p>'],
      ['keeps empty lines', '<p>a</p><p><br></p><p>b</p>', '<p>a</p><p><br></p><p>b</p>'],
      ['collapses source whitespace', '<p>\n  a   b \n</p>', '<p>a b</p>'],
      ['drops script and handlers', '<p onclick="x()">a<script>alert(1)</script><img src=x onerror="x()"></p>', '<p>a</p>'],
      ['unwraps unknown inline tags', '<p><span style="font-size:20px">a</span><font>b</font></p>', '<p>ab</p>'],
      ['drops script links', '<p><a href="javascript:alert(1)">a</a></p>', '<p>a</p>'],
      ['keeps links opening in a new tab', '<p><a href="https://x.test" target="_blank" rel="noopener noreferrer">a</a></p>',
        '<p><a href="https://x.test" target="_blank" rel="noopener noreferrer">a</a></p>'],
      ['merges neighbouring marks', '<p><strong>a</strong><strong>b</strong></p>', '<p><strong>ab</strong></p>'],
      ['keeps nested lists', '<ul><li>a<ul><li>b</li></ul></li></ul>', '<ul><li>a<ul><li>b</li></ul></li></ul>'],
      ['keeps nested items apart', '<ol><li>a<ol><li>b</li><li>c<ol><li>d</li></ol></li></ol></li></ol>',
        '<ol><li>a<ol><li>b</li><li>c<ol><li>d</li></ol></li></ol></li></ol>'],
      ['nests a list placed straight in a list', '<ul><li>a</li><ul><li>b</li></ul></ul>', '<ul><li>a<ul><li>b</li></ul></li></ul>'],
      ['merges neighbouring lists', '<ul><li>a</li></ul><ul><li>b</li></ul>', '<ul><li>a</li><li>b</li></ul>'],
      ['unwraps paragraphs in items', '<ul><li><p>a</p></li></ul>', '<ul><li>a</li></ul>'],
      ['reads quotes as paragraphs without the quote extension', '<blockquote><p>a</p></blockquote>', '<p>a</p>'],
      ['reads Quill bullet lists', '<ul><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>a</li></ul>',
        '<ul><li>a</li></ul>'],
      ['reads Quill checklists', '<ul><li data-list="checked"><span class="ql-ui" contenteditable="false"></span>done</li>'
        + '<li data-list="unchecked"><span class="ql-ui" contenteditable="false"></span>todo</li></ul>',
        '<ul data-checklist=""><li data-checked="true">done</li><li data-checked="false">todo</li></ul>'],
      ['reads Quill dividers', '<p>a</p><hr class="ql-hr"><p>b</p>', '<p>a</p><hr><p>b</p>'],
      ['saves an empty document as nothing', '<p><br></p>', ''],
    ];
    cases.forEach(([name, input, output]) => it(name, () => {
      expect(setup(input).getHTML()).to.equal(output);
    }));

    // Content saved by the editor's Quill version, as its semantic HTML and, before that, as its editing markup
    const quillCases: [string, string, string][] = [
      ['keeps alignment and indent', '<p class="ql-align-center">a</p><h2 class="ql-align-right ql-indent-2">b</h2>',
        '<p class="ql-align-center">a</p><h2 class="ql-align-right ql-indent-2">b</h2>'],
      ['reads a pasted text-align as Quill did', '<p style="text-align: justify">a</p>', '<p class="ql-align-justify">a</p>'],
      ['keeps headings 3 to 6', '<h3>a</h3><h6>b</h6>', '<h3>a</h3><h6>b</h6>'],
      ['keeps sub and superscript', '<p>H<sub>2</sub>O x<sup>2</sup></p>', '<p>H<sub>2</sub>O x<sup>2</sup></p>'],
      ['keeps highlights', '<p><span style="background-color: yellow;">a</span></p>',
        '<p><span style="background-color: yellow;">a</span></p>'],
      ['keeps a colour and highlight on one span', '<p><span style="color: red; background-color: yellow;">a</span></p>',
        '<p><span style="color: red;"><span style="background-color: yellow;">a</span></span></p>'],
      ['keeps a colour Quill put on bold text', '<p><strong style="color: red;">a</strong></p>',
        '<p><strong><span style="color: red;">a</span></strong></p>'],
      ['keeps Quill sizes and fonts', '<p><span class="ql-size-large">a</span><em class="ql-font-serif">b</em></p>',
        '<p><span class="ql-size-large">a</span><em><span class="ql-font-serif">b</span></em></p>'],
      ['lifts a list that skipped a level', '<ul><li><ul><li>a</li></ul></li></ul>', '<ul><li>a</li></ul>'],
      ['nests Quill editing-markup lists by their indent',
        '<ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>a</li>'
        + '<li data-list="bullet" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>b</li>'
        + '<li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>c</li>'
        + '<li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>d</li></ol>',
        '<ul><li>a<ul><li>b</li></ul><ol><li>c</li></ol></li><li>d</li></ul>'],
      ['reads Quill editing-markup checklists', '<ol><li data-list="checked">a</li><li data-list="unchecked">b</li></ol>',
        '<ul data-checklist=""><li data-checked="true">a</li><li data-checked="false">b</li></ul>'],
      ['reads Quill editing-markup code blocks',
        '<div class="ql-code-block-container" spellcheck="false"><div class="ql-code-block">a &lt; b</div>'
        + '<div class="ql-code-block"><br></div><div class="ql-code-block">c</div></div>',
        '<pre><code>a &lt; b\n\nc</code></pre>'],
      ['reads Quill code blocks', '<pre>\nline 1\nline 2\n</pre>', '<pre><code>line 1\nline 2</code></pre>'],
    ];
    quillCases.forEach(([name, input, output]) => it(name, () => {
      expect(setupAll(input).getHTML()).to.equal(output);
    }));

    it('keeps a line\'s alignment when it becomes a heading and when Enter splits it', () => {
      const editor = setupAll('<p class="ql-align-center">ab</p>');
      editor.formatText(0, 0, 'header', 1);
      editor.setSelection(1);
      fire(editor, 'insertParagraph');
      expect(editor.getHTML()).to.equal('<h1 class="ql-align-center">a</h1><h1 class="ql-align-center">b</h1>');
    });

    it('reads its own output back unchanged', () => {
      cases.forEach(([, input]) => {
        const once = setup(input).getHTML();
        expect(setup(once).getHTML()).to.equal(once);
      });
      quillCases.forEach(([, input]) => {
        const once = setupAll(input).getHTML();
        expect(setupAll(once).getHTML()).to.equal(once);
      });
    });

    it('keeps the caret in the text when the content is replaced while editing', () => {
      const editor = setup('<p>Hello</p>');
      editor.setSelection(5);
      editor.setHTML('');
      const range = readRange(editor.root)!;
      expect(range.startContainer, 'inside the new first line, not loose in the root').to.equal(editor.root.firstChild);
      expect(editor.getSelection()).to.deep.equal({index: 0, length: 0});
    });
  });

  describe('text model', () => {
    it('counts a line break after every line and one for each embed', () => {
      const editor = setup('<p>Hello</p><hr><ul><li>Kyle</li></ul>');
      expect(editor.getText()).to.equal('Hello\n￼Kyle\n');
      expect(editor.getLength()).to.equal(12);
      expect(editor.getText(6, 1)).to.equal('￼');
    });

    it('maps the selection inside a shadow root to indexes and back', () => {
      const editor = setup('<p>ab</p><p><strong>cd</strong>ef</p>');
      editor.setSelection(4, 3);
      expect(editor.getSelection()).to.deep.equal({index: 4, length: 3});
    });
  });

  describe('API edits', () => {
    it('inserts text with formats', () => {
      const editor = setup('<p>ab</p>');
      editor.insertText(1, 'X', {bold: true});
      expect(editor.getHTML()).to.equal('<p>a<strong>X</strong>b</p>');
    });

    it('splits lines on newlines in inserted text', () => {
      const editor = setup('<p>ab</p>');
      editor.insertText(1, '1\n2');
      expect(editor.getHTML()).to.equal('<p>a1</p><p>2b</p>');
    });

    it('formats and unformats part of a mark', () => {
      const editor = setup('<p>abcd</p>');
      editor.formatText(0, 4, 'bold', true);
      editor.formatText(1, 2, 'bold', false);
      expect(editor.getHTML()).to.equal('<p><strong>a</strong>bc<strong>d</strong></p>');
      expect(editor.getFormat(0, 1)).to.deep.equal({bold: true});
      expect(editor.getFormat(0, 4)).to.deep.equal({});
    });

    it('neutralises script links hidden with tabs, line breaks and control characters', () => {
      // eslint-disable-next-line no-script-url -- checks script links are neutralised
      ['java\tscript:alert(1)', 'java\nscript:alert(1)', '\u0001javascript:alert(1)'].forEach(href => {
        expect(sanitizeHref(href)).to.equal('about:blank');
      });
      expect(sanitizeHref(' https://x.test ')).to.equal('https://x.test');
    });

    it('applies links and reports their href', () => {
      const editor = setup('<p>abc</p>');
      editor.formatText(0, 3, 'link', 'https://x.test');
      expect(editor.getFormat(1, 1).link).to.equal('https://x.test');
      // eslint-disable-next-line no-script-url -- checks a script link is neutralised
      editor.formatText(0, 3, 'link', 'javascript:alert(1)');
      expect(editor.getHTML()).to.include('href="about:blank"');
    });

    it('sets and clears headings', () => {
      const editor = setup('<p>a</p><p>b</p>');
      editor.formatText(0, 3, 'header', 1);
      expect(editor.getHTML()).to.equal('<h1>a</h1><h1>b</h1>');
      expect(editor.getFormat(0, 0)).to.deep.equal({header: 1});
      editor.formatText(2, 0, 'header', false);
      expect(editor.getHTML()).to.equal('<h1>a</h1><p>b</p>');
    });

    it('toggles lists on and off', () => {
      const editor = setup('<p>a</p><p>b</p><p>c</p>');
      editor.formatText(0, 3, 'list', 'bullet');
      expect(editor.getHTML()).to.equal('<ul><li>a</li><li>b</li></ul><p>c</p>');
      editor.formatText(0, 3, 'list', 'checked');
      expect(editor.getHTML()).to.equal('<ul data-checklist=""><li data-checked="false">a</li><li data-checked="false">b</li></ul><p>c</p>');
      editor.formatText(2, 0, 'list', 'checked');
      expect(editor.getHTML()).to.equal('<ul data-checklist=""><li data-checked="false">a</li></ul><p>b</p><p>c</p>');
    });

    it('joins lines when a deletion spans them', () => {
      const editor = setup('<p>abc</p><h1>def</h1>');
      editor.deleteText(2, 3);
      expect(editor.getHTML()).to.equal('<p>abef</p>');
    });

    it('inserts HTML blocks by splitting the line', () => {
      const editor = setup('<p>abcd</p>');
      editor.insertHTML(2, '<p>1</p><ul><li>2</li></ul><p>3</p>');
      expect(editor.getHTML()).to.equal('<p>ab1</p><ul><li>2</li></ul><p>3cd</p>');
    });

    it('inserts inline HTML into the line', () => {
      const editor = setup('<p>abcd</p>');
      editor.insertHTML(2, '<b>X</b>');
      expect(editor.getHTML()).to.equal('<p>ab<strong>X</strong>cd</p>');
    });

    it('inserts a divider between blocks, adding a line after it at the end', () => {
      const editor = setup('<p>ab</p>');
      editor.insertEmbed(2, 'hr');
      expect(editor.getHTML()).to.equal('<p>ab</p><hr><p><br></p>');
    });

    it('undoes and redoes edits', () => {
      const editor = setup('<p>a</p>');
      editor.insertText(1, 'b');
      editor.formatText(0, 2, 'bold', true);
      editor.undo();
      expect(editor.getHTML()).to.equal('<p>ab</p>');
      editor.undo();
      expect(editor.getHTML()).to.equal('<p>a</p>');
      editor.redo();
      expect(editor.getHTML()).to.equal('<p>ab</p>');
    });

    it('drops the oldest undo steps once their HTML passes the size budget, keeping the latest', () => {
      const big = (c: string) => ({html: c.repeat(8_000_000), selection: null});
      const history = new History(big('a'));
      ['b', 'c', 'd', 'e'].forEach(c => history.record(big(c)));
      // 8M characters a step against a 20M budget leaves two steps to undo
      expect(history.undo()?.html[0]).to.equal('d');
      expect(history.undo()?.html[0]).to.equal('c');
      expect(history.undo()).to.equal(null);
    });

    it('emits change for each edit but not for setHTML', () => {
      const editor = setup('<p>a</p>');
      let changes = 0;
      editor.addEventListener('change', () => changes++);
      editor.setHTML('<p>b</p>');
      editor.insertText(0, 'x');
      expect(changes).to.equal(1);
    });
  });

  describe('typing', () => {
    it('splits a line on Enter', () => {
      const editor = setup('<p>abcd</p>');
      editor.setSelection(2);
      fire(editor, 'insertParagraph');
      expect(editor.getHTML()).to.equal('<p>ab</p><p>cd</p>');
      expect(editor.getSelection()).to.deep.equal({index: 3, length: 0});
    });

    it('carries bold onto the next line on Enter, but not a link', () => {
      const editor = setup('<p><strong><a href="https://x.test">ab</a></strong></p>');
      editor.setSelection(2);
      fire(editor, 'insertParagraph');
      fire(editor, 'insertText', 'c');
      expect(editor.getHTML()).to.equal('<p><strong><a href="https://x.test" target="_blank" rel="noopener noreferrer">ab</a></strong></p><p><strong>c</strong></p>');
    });

    it('starts a paragraph after a heading', () => {
      const editor = setup('<h1>ab</h1>');
      editor.setSelection(2);
      fire(editor, 'insertParagraph');
      expect(editor.getHTML()).to.equal('<h1>ab</h1><p><br></p>');
    });

    it('adds an item on Enter in a list, and leaves the list on Enter in an empty item', () => {
      const editor = setup('<ul><li>a</li></ul>');
      editor.setSelection(1);
      fire(editor, 'insertParagraph');
      expect(editor.getHTML()).to.equal('<ul><li>a</li><li><br></li></ul>');
      fire(editor, 'insertParagraph');
      expect(editor.getHTML()).to.equal('<ul><li>a</li></ul><p><br></p>');
    });

    it('joins a line onto the one before on Backspace at its start', () => {
      const editor = setup('<p>ab</p><p><em>cd</em></p>');
      editor.setSelection(3);
      fire(editor, 'deleteContentBackward');
      expect(editor.getHTML()).to.equal('<p>ab<em>cd</em></p>');
      expect(editor.getSelection()).to.deep.equal({index: 2, length: 0});
    });

    it('turns an item into a paragraph on Backspace at its start', () => {
      const editor = setup('<ul><li>a</li><li>b</li></ul>');
      editor.setSelection(2);
      fire(editor, 'deleteContentBackward');
      expect(editor.getHTML()).to.equal('<ul><li>a</li></ul><p>b</p>');
    });

    it('removes a divider the caret sits on with Backspace or Delete', () => {
      ['deleteContentBackward', 'deleteContentForward'].forEach(inputType => {
        const editor = setup('<p>a</p><hr><p>b</p>');
        editor.setSelection(2);
        fire(editor, inputType);
        expect(editor.getHTML()).to.equal('<p>a</p><p>b</p>');
        expect(editor.getSelection()).to.deep.equal({index: 2, length: 0});
      });
    });

    it('joins the next line on Delete at the end', () => {
      const editor = setup('<p>ab</p><p>cd</p>');
      editor.setSelection(2);
      fire(editor, 'deleteContentForward');
      expect(editor.getHTML()).to.equal('<p>abcd</p>');
    });

    it('replaces a selection across lines with typed text', () => {
      const editor = setup('<p>abc</p><p>def</p>');
      editor.setSelection(1, 4);
      fire(editor, 'insertText', 'X');
      expect(editor.getHTML()).to.equal('<p>aXef</p>');
    });

    it('types in a format toggled with nothing selected', () => {
      const editor = setup('<p>ab</p>');
      editor.setSelection(1);
      editor.format('bold', true);
      fire(editor, 'insertText', 'X');
      expect(editor.getHTML()).to.equal('<p>a<strong>X</strong>b</p>');
    });

    it('keeps the caret after typed text when focus has moved to a toolbar', () => {
      const editor = setup('<p>ab</p>');
      editor.setSelection(2);
      editor.formatText(2, 0, 'bold', true);
      const button = document.createElement('button');
      hosts.push(button);
      document.body.append(button);
      button.focus();
      // The selection stays in the text while focus sits elsewhere, as after choosing from a toolbar menu
      const text = editor.root.querySelector('p')!.firstChild!;
      document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
      fire(editor, 'insertText', 'x');
      expect(editor.getHTML()).to.equal('<p>ab<strong>x</strong></p>');
      expect(editor.getSelection()).to.deep.equal({index: 3, length: 0});
    });

    it('puts the caret back where the undone edit was when undo comes from a toolbar', () => {
      const editor = setup('<p>ab</p>');
      editor.setSelection(2);
      editor.insertText(2, 'c');
      editor.insertText(3, 'd');
      const button = document.createElement('button');
      hosts.push(button);
      document.body.append(button);
      button.focus();
      const line = editor.root.querySelector('p')!;
      document.getSelection()!.setBaseAndExtent(line, line.childNodes.length, line, line.childNodes.length);
      editor.undo();
      expect(editor.getHTML()).to.equal('<p>abc</p>');
      expect(editor.getSelection()).to.deep.equal({index: 3, length: 0});
    });

    it('starts a list from a typed marker', () => {
      const editor = setup('<p>-&nbsp;</p>');
      editor.setSelection(2);
      editor.root.dispatchEvent(new InputEvent('input', {inputType: 'insertText', data: ' '}));
      expect(editor.getHTML()).to.equal('<ul><li><br></li></ul>');
    });

    it('nests a numbered list three levels deep with Enter and Tab', async () => {
      const editor = setup('');
      editor.setSelection(0);
      await sendKeys({type: '1. one'});
      for (const text of ['two', 'three']) {
        await sendKeys({press: 'Enter'});
        await sendKeys({press: 'Tab'});
        await sendKeys({type: text});
      }
      await sendKeys({press: 'Enter'});
      await sendKeys({type: 'four'});
      expect(editor.getHTML()).to.equal('<ol><li>one<ol><li>two<ol><li>three</li><li>four</li></ol></li></ol></li></ol>');
    });

    it('ticks a checklist item from its box when written right to left', () => {
      const editor = setup('<ul data-checklist><li data-checked="false">a</li></ul>');
      editor.root.dir = 'rtl';
      const item = editor.root.querySelector('li')!;
      item.style.paddingInlineStart = '24px';
      const box = item.getBoundingClientRect();
      item.dispatchEvent(new PointerEvent('pointerdown', {clientX: box.right - 5, clientY: box.top + 5, bubbles: true, cancelable: true}));
      expect(editor.root.querySelector('li')!.getAttribute('data-checked')).to.equal('true');
    });

    it('nests and un-nests list items with Tab', () => {
      const editor = setup('<ul><li>a</li><li>b</li></ul>');
      editor.setSelection(2);
      key(editor, {key: 'Tab'});
      expect(editor.getHTML()).to.equal('<ul><li>a<ul><li>b</li></ul></li></ul>');
      key(editor, {key: 'Tab', shiftKey: true});
      expect(editor.getHTML()).to.equal('<ul><li>a</li><li>b</li></ul>');
    });

    it('pastes sanitised HTML over the selection', () => {
      const editor = setup('<p>abc</p>');
      editor.setSelection(1, 1);
      const data = new DataTransfer();
      data.setData('text/html', '<b>X</b><script>alert(1)</script>');
      data.setData('text/plain', 'X');
      editor.root.dispatchEvent(new ClipboardEvent('paste', {clipboardData: data, cancelable: true, bubbles: true}));
      expect(editor.getHTML()).to.equal('<p>a<strong>X</strong>c</p>');
    });

    it('marks itself empty for the placeholder', () => {
      const editor = setup('');
      expect(editor.root.hasAttribute('data-empty')).to.be.true;
      editor.insertText(0, 'a');
      expect(editor.root.hasAttribute('data-empty')).to.be.false;
    });
  });
  describe('real keystrokes', () => {
    const mod = (k: string) => `${isApple() ? 'Meta' : 'Control'}+${k}`;
    const focusAt = (editor: RichEditor, index: number) => editor.setSelection(index);

    it('types lines', async () => {
      const editor = setup('');
      focusAt(editor, 0);
      await sendKeys({type: 'Hello'});
      await sendKeys({press: 'Enter'});
      await sendKeys({type: 'World'});
      expect(editor.getHTML()).to.equal('<p>Hello</p><p>World</p>');
    });

    it('starts a list from a typed dash', async () => {
      const editor = setup('');
      focusAt(editor, 0);
      await sendKeys({type: '- a'});
      expect(editor.getHTML()).to.equal('<ul><li>a</li></ul>');
    });

    it('types bold after the shortcut', async () => {
      const editor = setup('<p>a</p>');
      focusAt(editor, 1);
      await sendKeys({press: mod('b')});
      await sendKeys({type: 'xy'});
      expect(editor.getHTML()).to.equal('<p>a<strong>xy</strong></p>');
    });

    it('joins lines on Backspace', async () => {
      const editor = setup('<p>ab</p><p>cd</p>');
      focusAt(editor, 3);
      await sendKeys({press: 'Backspace'});
      await sendKeys({type: 'X'});
      expect(editor.getHTML()).to.equal('<p>abXcd</p>');
    });

    it('undoes a burst of typing in one step', async () => {
      const editor = setup('<p>a</p>');
      focusAt(editor, 1);
      await sendKeys({type: 'bcd'});
      await sendKeys({press: mod('z')});
      expect(editor.getHTML()).to.equal('<p>a</p>');
    });

    it('replaces everything after select all', async () => {
      const editor = setup('<h1>a</h1><ul><li>b</li></ul><p>c</p>');
      focusAt(editor, 0);
      await sendKeys({press: mod('a')});
      await sendKeys({type: 'z'});
      expect(editor.getHTML()).to.equal('<h1>z</h1>');
    });
  });
  describe('all formats', () => {
    it('reads a saved Quill document and saves it as clean HTML', () => {
      const quill = '<h1>Title</h1>'
        + '<p>Hi <span style="color: red;">{{first_name}}</span>, <strong>bold</strong> '
        + '<a href="https://x.test" rel="noopener noreferrer" target="_blank">link</a></p>'
        + '<ul><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>one</li></ul>'
        + '<ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>two</li></ol>'
        + '<ul><li data-list="checked"><span class="ql-ui" contenteditable="false"></span>done</li></ul>'
        + '<blockquote>quote</blockquote>'
        + '<pre data-language="plain">a\n  b</pre>'
        + '<hr class="ql-hr">'
        + '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/x?showinfo=0"></iframe>'
        + '<p><img src="data:image/png;base64,AAAA" alt="pic" title="pic"></p>';
      const clean = '<h1>Title</h1>'
        + '<p>Hi <span style="color: red;">{{first_name}}</span>, <strong>bold</strong> '
        + '<a href="https://x.test" target="_blank" rel="noopener noreferrer">link</a></p>'
        + '<ul><li>one</li></ul>'
        + '<ol><li>two</li></ol>'
        + '<ul data-checklist=""><li data-checked="true">done</li></ul>'
        + '<blockquote>quote</blockquote>'
        + '<pre><code>a\n  b</code></pre>'
        + '<hr>'
        + '<iframe frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/x?showinfo=0"></iframe>'
        + '<p><img src="data:image/png;base64,AAAA" alt="pic" title="pic"></p>';
      const editor = setupAll(quill);
      expect(editor.getHTML()).to.equal(clean);
      expect(setupAll(clean).getHTML()).to.equal(clean);
    });

    it('colours text', () => {
      const editor = setupAll('<p>abc</p>');
      editor.formatText(1, 1, 'color', 'red');
      expect(editor.getHTML()).to.equal('<p>a<span style="color: red;">b</span>c</p>');
      expect(editor.getFormat(1, 1).color).to.equal('red');
    });

    it('keeps only the colour of a pasted style', () => {
      expect(setupAll('<p><span style="color: blue; background: url(https://x.test/t.png)">a</span></p>').getHTML())
        .to.equal('<p><span style="color: blue;">a</span></p>');
    });

    it('saves code lines as one block, without formatting', () => {
      const editor = setupAll('<p>a</p><p><b>b</b></p>');
      editor.formatText(0, 3, 'code-block', true);
      expect(editor.getHTML()).to.equal('<pre><code>a\nb</code></pre>');
      expect(editor.getFormat(0, 0)).to.deep.equal({'code-block': true});
    });

    it('continues a code block on Enter and leaves it on Enter in an empty line', () => {
      const editor = setupAll('<pre>a</pre>');
      editor.setSelection(1);
      fire(editor, 'insertParagraph');
      fire(editor, 'insertParagraph');
      expect(editor.getHTML()).to.equal('<pre><code>a</code></pre><p><br></p>');
    });

    it('starts a quote from a typed marker', () => {
      const editor = setupAll('<p>&gt;&nbsp;</p>');
      editor.setSelection(2);
      editor.root.dispatchEvent(new InputEvent('input', {inputType: 'insertText', data: ' '}));
      expect(editor.getHTML()).to.equal('<blockquote><br></blockquote>');
    });

    it('inserts images inline', () => {
      const editor = setupAll('<p>ab</p>');
      editor.insertEmbed(1, 'image', {src: 'https://x.test/a.png', alt: 'a'});
      expect(editor.getHTML()).to.equal('<p>a<img src="https://x.test/a.png" alt="a">b</p>');
      expect(editor.getText()).to.equal('a\ufffcb\n');
    });

    it('embeds video players from page URLs and drops non-web frames', () => {
      const editor = setupAll('<p>a</p><iframe src="javascript:alert(1)"></iframe>');
      expect(editor.getHTML()).to.equal('<p>a</p>');
      editor.insertEmbed(1, 'video', 'https://youtu.be/abc');
      expect(editor.getHTML()).to.equal('<p>a</p><iframe src="https://www.youtube.com/embed/abc?showinfo=0" frameborder="0" allowfullscreen="true"></iframe><p><br></p>');
    });

    it('shows merge fields as labelled chips and saves the raw token', () => {
      const editor = setupAll('<p>Hi {{ first_name }} and {{other}}</p>');
      const chips = editor.root.querySelectorAll('[data-token]');
      expect(Array.from(chips).map(chip => chip.textContent)).to.deep.equal(['First name', 'other']);
      expect(editor.getText()).to.equal('Hi \ufffc and \ufffc\n');
      expect(editor.getHTML()).to.equal('<p>Hi {{first_name}} and {{other}}</p>');
    });

    it('types around a merge field', async () => {
      const editor = setupAll('<p>{{first_name}}</p>');
      editor.setSelection(1);
      await sendKeys({type: ' x'});
      editor.setSelection(0);
      await sendKeys({type: 'Hi '});
      expect(editor.getHTML()).to.equal('<p>Hi {{first_name}} x</p>');
    });

    it('deletes a selected image with Backspace', async () => {
      const editor = setupAll('<p>a<img src="https://x.test/a.png">b</p>');
      editor.setSelection(1, 1);
      await sendKeys({press: 'Backspace'});
      expect(editor.getHTML()).to.equal('<p>ab</p>');
    });
  });
});
