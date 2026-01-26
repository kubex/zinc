let count = 1;

function escapeHtml(str)
{
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Turns code fields with the :preview suffix into interactive code previews.
 */
module.exports = function (doc, options)
{
  options = {
    within: 'body', // the element containing the code fields to convert
    ...options
  };

  const within = doc.querySelector(options.within);
  if(!within)
  {
    return doc;
  }

  within.querySelectorAll('[class*=":preview"]').forEach(code =>
  {
    const pre = code.closest('pre');
    if(!pre)
    {
      return;
    }
    const adjacentPre = pre.nextElementSibling?.tagName.toLowerCase() === 'pre' ? pre.nextElementSibling : null;
    const sourceGroupId = `code-preview-source-group-${count}`;
    const isExpanded = code.getAttribute('class').includes(':expanded');

    count++;

    const codePreview = `
      <div class="code-preview ${isExpanded ? 'code-preview--expanded' : ''}">
        <div class="code-preview__preview">
          ${code.textContent}
          <div class="code-preview__resizer">
            <zn-icon src="drag_indicator"></zn-icon>
          </div>
        </div>

        <div class="code-preview__source-group" id="${sourceGroupId}">
          <div class="code-preview__source code-preview__source--html">
            <pre><code class="language-html">${escapeHtml(code.textContent)}</code></pre>
          </div>
        </div>

        <div class="code-preview__buttons">
          <button
            type="button"
            class="code-preview__button code-preview__toggle"
            aria-expanded="${isExpanded ? 'true' : 'false'}"
            aria-controls="${sourceGroupId}">
            Source
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;

    if(!pre.parentNode || pre.parentNode.nodeType === 9)
    {
      return;
    }

    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = codePreview;
    const codePreviewElement = tempDiv.firstElementChild;

    pre.parentNode.insertBefore(codePreviewElement, pre.nextSibling);
    pre.remove();

    if(adjacentPre)
    {
      adjacentPre.remove();
    }
  });

  // Wrap code preview scripts in anonymous helpers so they don't run in the global scope
  doc.querySelectorAll('.code-preview__preview script').forEach(script =>
  {
    if(script.type === 'module')
    {
      // Modules are already scoped
      script.textContent = script.innerHTML;
    }
    else
    {
      // Wrap non-modules in an anonymous function so they don't run in the global scope
      script.textContent = `(() => { ${script.innerHTML} })();`;
    }
  });

  return doc;
};
