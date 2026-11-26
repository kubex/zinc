import type {Extension, InlineFormat} from '../extension';
import type {KeyBinding} from '../keymap';

const MARKS: InlineFormat[] = [
  {name: 'bold', tag: 'STRONG', aliases: ['B']},
  {name: 'italic', tag: 'EM', aliases: ['I']},
  {name: 'underline', tag: 'U'},
  {name: 'strike', tag: 'S', aliases: ['STRIKE', 'DEL']},
  {name: 'code', tag: 'CODE'},
  {name: 'sub', tag: 'SUB'},
  {name: 'sup', tag: 'SUP'},
];

const toggle = (name: string, key: string): KeyBinding => ({
  key,
  mod: true,
  run: editor => {
    editor.format(name, !editor.getFormat()[name]);
    return true;
  },
});

/** Bold, italic, underline, strikethrough and inline code, plus subscript and superscript as loaded. */
export const marks: Extension = {
  name: 'marks',
  inline: MARKS,
  keys: [toggle('bold', 'b'), toggle('italic', 'i'), toggle('underline', 'u')],
};
