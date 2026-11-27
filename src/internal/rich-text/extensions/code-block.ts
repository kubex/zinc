import type {Extension} from '../extension';

/**
 * Plain-text code. Each line is its own `<pre>` while editing, so lines split and join like any other block; saved,
 * a run of them is one `<pre><code>`.
 */
export const codeBlock: Extension = {
  name: 'code-block',
  blocks: [{name: 'code-block', tags: {PRE: true}}],
  parse: root => {
    // Quill's editing markup: a container holding a div per line
    root.querySelectorAll('.ql-code-block-container').forEach(container => {
      const lines = Array.from(container.querySelectorAll('.ql-code-block'), line => line.textContent ?? '');
      container.replaceWith(...lines.map(line => Object.assign(document.createElement('pre'), {textContent: line})));
    });
    root.querySelectorAll('pre').forEach(pre => {
      const lines = (pre.textContent ?? '').replace(/\n$/, '').split('\n');
      pre.replaceWith(...lines.map(line => Object.assign(document.createElement('pre'), {textContent: line})));
    });
  },
  serialize: root => {
    root.querySelectorAll('pre').forEach(pre => {
      // A line already folded into the block above has no parent left
      if (!pre.parentNode || pre.previousElementSibling?.tagName === 'PRE') return;
      const lines: string[] = [];
      let next: Element | null = pre;
      while (next?.tagName === 'PRE') {
        lines.push(next.textContent ?? '');
        const after: Element | null = next.nextElementSibling;
        if (next !== pre) next.remove();
        next = after;
      }
      const code = document.createElement('code');
      code.textContent = lines.join('\n');
      pre.replaceChildren(code);
    });
  },
};
