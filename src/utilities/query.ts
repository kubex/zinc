export function deepQuery<T extends Element = Element>(
  selector: string,
  root: Document | ShadowRoot | Element = document,
): T | null {
  const direct = root.querySelector<T>(selector);
  if (direct) return direct;
  for (const el of root.querySelectorAll<Element>('*')) {
    if (el.shadowRoot) {
      const hit = deepQuery<T>(selector, el.shadowRoot);
      if (hit) return hit;
    }
  }
  return null;
}

export function deepQueryAll<T extends Element = Element>(
  selector: string,
  root: Document | ShadowRoot | Element = document,
  out: T[] = [],
): T[] {
  out.push(...root.querySelectorAll<T>(selector));
  for (const el of root.querySelectorAll<Element>('*')) {
    if (el.shadowRoot) deepQueryAll<T>(selector, el.shadowRoot, out);
  }
  return out;
}

export function deepQuerySelectorAll(selector: string, element: Element, stopSelector: string): Element[] {
  const arr: Element[] = [];

  const traverser = (node: Element, sub: boolean) => {
    if (!node) {
      return;
    }

    // 1. decline all nodes that are not elements
    if ((node.nodeType !== Node.ELEMENT_NODE) || (sub && stopSelector && node.matches(stopSelector))) {
      return;
    }

    // 2. add the node to the array, if it matches the selector
    if (node.matches(selector)) {
      arr.push(node);
    }

    // 3. loop through the children
    const children = node.children;
    if (children.length) {
      for (const child of children) {
        traverser(child, true);
      }
    }

    // 4. check for shadow DOM, and loop through it's children
    const shadowRoot = node.shadowRoot;
    if (shadowRoot) {
      const shadowChildren = shadowRoot.children;
      for (const shadowChild of shadowChildren) {
        traverser(shadowChild, true);
      }
    }
  };

  traverser(element, false);

  return arr;
}
