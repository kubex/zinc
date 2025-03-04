function stringToHTML(str: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body;
}

function removeScripts(node: any) {
  node.querySelectorAll('script').forEach((script: any) => {
    script.remove();
  });
}

function isPossiblyDangerousAttribute(name: string, value: string) {
  if (['src', 'href', 'xlink:href'].includes(name)) {
    if (value.includes('javascript:') || value.includes('data:text/html')) return true;
  }

  if (name.startsWith('on')) return true;

  return false;
}

function removeAttributes(elem: any) {
  const attributes = elem.attributes;
  for (let i = attributes.length - 1; i >= 0; i--) {
    if (isPossiblyDangerousAttribute(attributes[i].name, attributes[i].value)) {
      elem.removeAttributeNode(attributes[i]);
    }
  }
}

function clean(html: HTMLElement) {
  const nodes = html.children;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i] as HTMLElement;
    removeAttributes(node);
    clean(node);
  }
}

export function cleanHTML(message: string) {
  const html = stringToHTML(message);
  removeScripts(html);
  clean(html);
  return html.innerHTML;
}
