import type {Extension} from '../extension';

const plain = (block: Element) => block.tagName === 'P';

/** Headings 1 and 2; `# ` and `## ` at the start of a paragraph turn it into one. Levels 3 to 6 are kept as loaded. */
export const heading: Extension = {
  name: 'heading',
  blocks: [{name: 'header', tags: {H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6}}],
  inputRules: [
    {match: /^# $/, when: plain, run: (editor, index) => editor.formatText(index, 0, 'header', 1)},
    {match: /^## $/, when: plain, run: (editor, index) => editor.formatText(index, 0, 'header', 2)},
  ],
};
