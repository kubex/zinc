function stringToHTML(str: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body;
}

function removeScripts(node: HTMLElement) {
  node.querySelectorAll('script').forEach((script) => {
    script.remove();
  });
}

function isPossiblyDangerousAttribute(name: string, value: string): boolean {
  if (['src', 'href', 'xlink:href'].includes(name)) {
    // eslint-disable-next-line no-script-url -- defensively matching the scheme we want to strip
    if (value.includes('javascript:') || value.includes('data:text/html')) return true;
  }

  return name.startsWith('on');
}

function removeAttributes(elem: Element) {
  const attributes = elem.attributes;
  for (let i = attributes.length - 1; i >= 0; i--) {
    if (isPossiblyDangerousAttribute(attributes[i].name, attributes[i].value)) {
      elem.removeAttributeNode(attributes[i]);
    }
  }
}

function clean(html: Element) {
  const nodes = html.children;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    removeAttributes(node);
    clean(node);
  }
}

/** Strip scripts and event/handler attributes from an untrusted HTML string. */
export function cleanHTML(message: string): string {
  const html = stringToHTML(message);
  removeScripts(html);
  clean(html);
  return html.innerHTML;
}
