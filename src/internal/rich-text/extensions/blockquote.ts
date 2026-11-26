import type {Extension} from '../extension';

/** Quoted lines; `> ` at the start of a paragraph starts one. */
export const blockquote: Extension = {
  name: 'blockquote',
  blocks: [{name: 'blockquote', tags: {BLOCKQUOTE: true}}],
  inputRules: [{
    match: /^> $/,
    when: block => block.tagName === 'P',
    run: (editor, index) => editor.formatText(index, 0, 'blockquote', true),
  }],
};
