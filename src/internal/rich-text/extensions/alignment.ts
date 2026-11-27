import type {Extension} from '../extension';

const ALIGNMENTS = ['center', 'right', 'justify'];

/**
 * Alignment and indent, kept on the lines that have them as Quill's `ql-align-*` and `ql-indent-*` classes. Nothing
 * offers them; they keep content written in the editor's Quill version intact when it is edited.
 */
export const alignment: Extension = {
  name: 'alignment',
  blockClasses: ['ql-align-', 'ql-indent-'],
  // Quill read a pasted line's text-align into its class
  parse: root => {
    root.querySelectorAll<HTMLElement>('[style*="text-align"]').forEach(el => {
      const align = el.style.textAlign;
      if (ALIGNMENTS.includes(align)) el.classList.add(`ql-align-${align}`);
    });
  },
};
