import Delta from "quill-delta";
import Embed from "quill/blots/embed";
import Quill from "quill";
import type {Op} from "quill-delta";

export interface MergeFieldValue {
  token: string;
  label: string;
}

const TOKEN = /\{\{\s*[^{}]+?\s*\}\}/g;

/** A `{{token}}` replacement shown as a labelled chip, saved back out as the raw token. */
export class MergeFieldBlot extends Embed {
  static blotName = 'mergeField';
  static tagName = 'SPAN';
  static className = 'ql-merge-field';

  static create(value: MergeFieldValue): HTMLElement {
    const node = super.create() as HTMLElement;
    node.dataset.token = value.token;
    node.dataset.label = value.label;
    node.title = value.token;
    node.textContent = value.label;
    return node;
  }

  static value(node: HTMLElement): MergeFieldValue {
    return {token: node.dataset.token ?? '', label: node.dataset.label ?? ''};
  }

  html(): string {
    return ((this.domNode as HTMLElement).dataset.token ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

export const normaliseToken = (token: string) => token.replace(/\s+/g, '');

class MergeField {
  constructor(quill: Quill, options: { labels?: Record<string, string> }) {
    const labels = options.labels ?? {};

    // The browser types a space after an embed into its caret guard and leaves the caret before it
    quill.keyboard.addBinding({key: ' '}, (range: { index: number; length: number }) => {
      if (range.length || !range.index) return true;
      const before = quill.getContents(range.index - 1, 1).ops[0]?.insert;
      if (typeof before !== 'object' || !('mergeField' in before)) return true;

      quill.insertText(range.index, ' ', Quill.sources.USER);
      quill.setSelection(range.index + 1, 0, Quill.sources.SILENT);
      return false;
    });
    // Ahead of Quill's own space handlers, such as list autofill
    const spaceBindings = (quill.keyboard as unknown as { bindings: Record<string, unknown[]> }).bindings[' '];
    spaceBindings?.unshift(spaceBindings.pop());

    // Text nodes only, so tokens inside attributes such as href stay as they are
    quill.clipboard.addMatcher(Node.TEXT_NODE, (_node: Node, delta: Delta) => {
      return new Delta(delta.ops.flatMap((op: Op) => {
        if (typeof op.insert !== 'string' || !op.insert.includes('{{')) return [op];

        const attrs = op.attributes ? {attributes: op.attributes} : {};
        const ops: Op[] = [];
        let last = 0;
        for (const match of op.insert.matchAll(TOKEN)) {
          if (match.index! > last) {
            ops.push({insert: op.insert.slice(last, match.index), ...attrs});
          }
          const token = normaliseToken(match[0]);
          ops.push({insert: {mergeField: {token, label: labels[token] ?? token.slice(2, -2)}}, ...attrs});
          last = match.index! + match[0].length;
        }
        if (last < op.insert.length) {
          ops.push({insert: op.insert.slice(last), ...attrs});
        }
        return ops;
      }));
    });
  }
}

export default MergeField;
