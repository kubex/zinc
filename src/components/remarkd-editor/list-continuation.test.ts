import {continueList, indentList} from './list-continuation';
import {expect} from '@open-wc/testing';

/** Enter at `caret` (the end by default), rendered as the new value with `|` at the caret, or null. */
function enter(value: string, caret = value.length): string | null {
  const edit = continueList(value, caret, caret);
  return edit ? `${edit.value.slice(0, edit.caret)}|${edit.value.slice(edit.caret)}` : null;
}

describe('continueList', () => {
  it('should continue bullet lists with the same marker, including nested depth', () => {
    expect(enter('- a')).to.equal('- a\n- |');
    expect(enter('* a')).to.equal('* a\n* |');
    expect(enter('-- nested')).to.equal('-- nested\n-- |');
    expect(enter('- a\n---- deep\n---- deeper')).to.equal('- a\n---- deep\n---- deeper\n---- |');
  });

  it('should continue numbered lists with the next number', () => {
    expect(enter('1. hello')).to.equal('1. hello\n2. |');
    expect(enter('9. nine')).to.equal('9. nine\n10. |');
    expect(enter('1. a\n1.1. b')).to.equal('1. a\n1.1. b\n1.2. |');
  });

  it('should number skipped levels from one', () => {
    expect(enter('1. a\n1.1.1. b\n2. c', 4)).to.equal('1. a\n2. |\n2.1.1. b\n3. c');
  });

  it('should renumber the items after one inserted mid-list', () => {
    expect(enter('1. a\n2. b\n3. c', 4)).to.equal('1. a\n2. |\n3. b\n4. c');
    expect(enter('1. a\n1.1. b\n2. c', 4)).to.equal('1. a\n2. |\n2.1. b\n3. c');
    expect(enter('1. a\n-- x\n2. b', 4)).to.equal('1. a\n2. |\n-- x\n3. b');
  });

  it('should continue checklists unticked, keeping the editable kind', () => {
    expect(enter('- [ ] a')).to.equal('- [ ] a\n- [ ] |');
    expect(enter('- [x] done')).to.equal('- [x] done\n- [ ] |');
    expect(enter('- [_] editable')).to.equal('- [_] editable\n- [_] |');
    expect(enter('- [*] editable done')).to.equal('- [*] editable done\n- [_] |');
  });

  it('should continue definition lists with the caret on the new term', () => {
    expect(enter('CPU:: Central processor')).to.equal('CPU:: Central processor\n|:: ');
  });

  it('should end the list when Enter is pressed on an empty item', () => {
    expect(enter('1. a\n1.1. ')).to.equal('1. a\n|');
    expect(enter('- a\n- ')).to.equal('- a\n|');
    expect(enter('1. a\n2. ')).to.equal('1. a\n|');
    expect(enter('- [ ] a\n- [ ] ')).to.equal('- [ ] a\n|');
    expect(enter('CPU:: x\n:: ')).to.equal('CPU:: x\n|');
  });

  it('should carry the text after the caret into the new item', () => {
    expect(enter('- hello world', 7)).to.equal('- hello\n- |world');
  });

  it('should leave Enter alone outside list items', () => {
    expect(enter('plain text')).to.be.null;
    expect(enter('---')).to.be.null;
    expect(enter('NOTE: hi')).to.be.null;
    expect(enter('include::file[]')).to.be.null;
    expect(enter('ifdef::flag[]')).to.be.null;
    // Caret before the marker ends, e.g. at the start of the line.
    expect(enter('- a', 0)).to.be.null;
  });

  it('should leave Enter alone inside verbatim blocks', () => {
    expect(enter('```\n- a')).to.be.null;
    expect(enter('----\n1. a')).to.be.null;
    expect(enter('```\ncode\n```\n- a')).to.equal('```\ncode\n```\n- a\n- |');
  });

  it('should leave Enter alone with a selection', () => {
    expect(continueList('- abc', 2, 4)).to.be.null;
  });
});

/** Tab over `[start, end]` (a caret at the end by default), rendered with `[`/`]` around the selection, or null. */
function tab(value: string, outdent = false, start = value.length, end = start): string | null {
  const edit = indentList(value, start, end, outdent);
  if (!edit) return null;
  const v = edit.value;
  return edit.start === edit.end
    ? `${v.slice(0, edit.start)}|${v.slice(edit.start)}`
    : `${v.slice(0, edit.start)}[${v.slice(edit.start, edit.end)}]${v.slice(edit.end)}`;
}

describe('indentList', () => {
  it('should nest a bullet item one level deeper on Tab', () => {
    expect(tab('- a')).to.equal('-- a|');
    expect(tab('* a')).to.equal('** a|');
    expect(tab('- [ ] task')).to.equal('-- [ ] task|');
    expect(tab('- a\n- b')).to.equal('- a\n-- b|');
    expect(tab('---- a\n---- b')).to.equal('---- a\n----- b|');
  });

  it('should un-nest a bullet item on Shift+Tab, stopping at the top level', () => {
    expect(tab('--- a', true)).to.equal('-- a|');
    expect(tab('- a', true)).to.equal('- a|');
  });

  it('should stop at the deepest level the parser supports', () => {
    expect(tab('---------- a')).to.equal('---------- a|');
  });

  it('should keep the caret on the same text', () => {
    expect(tab('- hello', false, 4)).to.equal('-- he|llo');
    expect(tab('-- hello', true, 5)).to.equal('- he|llo');
    expect(tab('- a', false, 0)).to.equal('|-- a');
  });

  it('should nest every bullet item a selection touches', () => {
    const value = '- a\n- b\n- c';
    expect(tab(value, false, 4, 11)).to.equal('- a\n[-- b\n-- c]');
    expect(tab(value, false, 0, 4)).to.equal('[-- a\n]- b\n- c');
  });

  it('should nest a numbered item under the one above, renumbering the items after it', () => {
    expect(tab('1. a\n2. b')).to.equal('1. a\n1.1. b|');
    expect(tab('1. a\n2. b\n3. c', false, 9)).to.equal('1. a\n1.1. b|\n2. c');
    expect(tab('1. a\n1.1. b\n2. c')).to.equal('1. a\n1.1. b\n1.2. c|');
    expect(tab('1. a\n-- x\n2. b')).to.equal('1. a\n-- x\n1.1. b|');
    expect(tab('1. first')).to.equal('1. first|');
    expect(tab('1. a\n1.1. b')).to.equal('1. a\n1.1. b|');
    expect(tab('1. a\n1.1. b\n1.2. c')).to.equal('1. a\n1.1. b\n1.1.1. c|');
  });

  it('should un-nest a numbered item on Shift+Tab, adopting the items after it', () => {
    expect(tab('1. a\n1.1. b\n1.2. c\n2. d', true, 10)).to.equal('1. a\n2. |b\n2.1. c\n3. d');
    expect(tab('1. a', true)).to.equal('1. a|');
  });

  it('should keep the caret on the same text when the marker changes length', () => {
    expect(tab('1. a\n2. hello', false, 10)).to.equal('1. a\n1.1. he|llo');
    expect(tab('1. a\n1.1. hello', true, 12)).to.equal('1. a\n2. he|llo');
  });

  it('should leave Tab alone outside list items', () => {
    expect(tab('plain text')).to.be.null;
    expect(tab('CPU:: x')).to.be.null;
    expect(tab('```\n- a')).to.be.null;
  });
});
