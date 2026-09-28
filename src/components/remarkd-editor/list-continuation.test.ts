import {continueList} from './list-continuation';
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
  });

  it('should continue numbered lists with the next number', () => {
    expect(enter('1. hello')).to.equal('1. hello\n2. |');
    expect(enter('9. nine')).to.equal('9. nine\n10. |');
  });

  it('should renumber the items after one inserted mid-list', () => {
    expect(enter('1. a\n2. b\n3. c', 4)).to.equal('1. a\n2. |\n3. b\n4. c');
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
