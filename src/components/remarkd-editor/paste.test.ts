import {expect} from '@open-wc/testing';
import {htmlToRemarkd, pastedRemarkd, plainTextToRemarkd} from './paste';
import {parse} from 'remarkd-js';

function clipboard(data: Record<string, string>): DataTransfer {
  const transfer = new DataTransfer();
  for (const [type, value] of Object.entries(data)) transfer.setData(type, value);
  return transfer;
}

describe('htmlToRemarkd', () => {
  it('should keep nested bullet and numbered lists', () => {
    expect(htmlToRemarkd('<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li><li>d</li></ul>'))
      .to.equal('- a\n-- b\n--- c\n- d');
    expect(htmlToRemarkd('<ol><li>a</li><li>b<ol><li>c</li><li>d</li></ol></li><li>e</li></ol>'))
      .to.equal('1. a\n2. b\n2.1. c\n2.2. d\n3. e');
    expect(htmlToRemarkd('<ol start="4"><li>four</li></ol>')).to.equal('4. four');
  });

  it('should nest numbered and bullet lists inside each other', () => {
    expect(htmlToRemarkd('<ol><li>a<ul><li>b</li></ul></li></ol>')).to.equal('1. a\n- b');
    expect(htmlToRemarkd('<ul><li>a<ol><li>b</li></ol></li></ul>')).to.equal('- a\n1. b');
  });

  it('should keep a list item on one line', () => {
    expect(htmlToRemarkd('<ul><li><p>first</p><p>second</p></li><li>line<br>break</li></ul>'))
      .to.equal('- first second\n- line break');
  });

  it('should keep checkboxes in list items', () => {
    expect(htmlToRemarkd('<ul><li><input type="checkbox" checked> done</li><li><input type="checkbox"> todo</li></ul>'))
      .to.equal('- [x] done\n- [ ] todo');
  });

  it('should keep headings, paragraphs and inline formatting', () => {
    expect(htmlToRemarkd('<h2>Title</h2><p>Some <b>bold</b>, <em>italic</em>, <code>code</code>, <s>gone</s> and '
      + '<a href="https://example.com">a link</a>.</p><p>Next</p>'))
      .to.equal('## Title\n\nSome **bold**, __italic__, `code`, ~~gone~~ and [a link](https://example.com).\n\nNext');
  });

  it('should keep the spaces around a mark outside it', () => {
    expect(htmlToRemarkd('<p>a<b> bold </b>b</p>')).to.equal('a **bold** b');
  });

  it('should not nest a mark inside the same mark', () => {
    expect(htmlToRemarkd('<p><b>a <strong>b</strong></b></p>')).to.equal('**a b**');
  });

  it('should drop links that are not web, mail or phone links', () => {
    expect(htmlToRemarkd('<p><a href="javascript:alert(1)">x</a> <a href="#top">y</a> <b>z</b></p>')).to.equal('x y **z**');
  });

  it('should keep code blocks verbatim', () => {
    expect(htmlToRemarkd('<pre><code>  indented\n- not a list\n</code></pre>'))
      .to.equal('```\n  indented\n- not a list\n```');
  });

  it('should keep quotes, rules and tables', () => {
    expect(htmlToRemarkd('<blockquote><p>quoted</p></blockquote><hr>'))
      .to.equal('____\nquoted\n____\n\n---');
    expect(htmlToRemarkd('<table><tr><th>Name</th><th>Value</th></tr><tr><td>Alpha</td><td><b>1</b></td></tr></table>'))
      .to.equal('|===\n|Name |Value\n\n|Alpha |**1**\n|===');
  });

  it('should read Google Docs styling', () => {
    const html = '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1">'
      + '<p dir="ltr"><span style="font-weight:700;">Bold</span><span style="font-weight:400;"> and </span>'
      + '<span style="font-style:italic;">italic</span></p>'
      + '<ul><li dir="ltr" aria-level="1"><p dir="ltr"><span>one</span></p></li>'
      + '<ul><li dir="ltr" aria-level="2"><p dir="ltr"><span>nested</span></p></li></ul>'
      + '<li dir="ltr" aria-level="1"><p dir="ltr"><span>two</span></p></li></ul></b>';
    expect(htmlToRemarkd(html)).to.equal('**Bold** and __italic__\n\n- one\n-- nested\n- two');
  });

  it('should read Word list paragraphs', () => {
    const html = '<p class="MsoListParagraphCxSpFirst" style="mso-list:l0 level1 lfo1">'
      + '<span style="mso-list:Ignore">1.<span>&nbsp;&nbsp;</span></span>First</p>'
      + '<p class="MsoListParagraphCxSpMiddle" style="mso-list:l0 level2 lfo1">'
      + '<span style="mso-list:Ignore">a.<span>&nbsp;</span></span>Sub</p>'
      + '<p class="MsoListParagraphCxSpLast" style="mso-list:l0 level1 lfo1">'
      + '<span style="mso-list:Ignore">2.<span>&nbsp;</span></span>Second</p>'
      + '<p class="MsoNormal">After</p>'
      + '<p class="MsoListParagraph" style="mso-list:l1 level1 lfo2">'
      + '<span style="font-family:Symbol"><span style="mso-list:Ignore">·<span>&nbsp;</span></span></span>Bullet</p>';
    expect(htmlToRemarkd(html)).to.equal('1. First\n1.1. Sub\n2. Second\n\nAfter\n\n- Bullet');
  });

  it('should produce source remarkd renders as the same structure', () => {
    const source = htmlToRemarkd('<ol><li>a<ol><li>b</li></ol></li><li>c</li></ol>')!;
    expect(parse(source)).to.contain('<ol><li><p>a</p>\n<ol><li><p>b</p></li></ol></li>\n<li><p>c</p></li></ol>');
  });

  it('should leave HTML with no formatting to the plain-text paste', () => {
    expect(htmlToRemarkd('<div><span style="color:red">const</span> x = 1;</div>')).to.be.null;
    expect(htmlToRemarkd('<p>just text</p>')).to.be.null;
  });
});

describe('plainTextToRemarkd', () => {
  it('should turn bullet glyphs into list markers, nesting by indent', () => {
    expect(plainTextToRemarkd('Intro\n• one\n  ◦ nested\n• two')).to.equal('Intro\n- one\n-- nested\n- two');
  });

  it('should leave text without bullet glyphs alone', () => {
    expect(plainTextToRemarkd('- already remarkd')).to.be.null;
  });
});

describe('pastedRemarkd', () => {
  it('should prefer the HTML flavour', () => {
    expect(pastedRemarkd(clipboard({'text/html': '<ul><li>a</li></ul>', 'text/plain': 'a'}))).to.equal('- a');
  });

  it('should leave code editor copies to the plain-text paste', () => {
    expect(pastedRemarkd(clipboard({
      'text/html': '<div><b>**bold**</b></div>', 'text/plain': '**bold**', 'vscode-editor-data': '{}',
    }))).to.be.null;
  });
});
