export function deepQuerySelectorAll(selector: string, element: Element, stopSelector: string): Element[]
{
  const arr = [];

  const traverser = (node, sub: boolean) =>
  {
    // 1. decline all nodes that are not elements
    if(node.nodeType !== Node.ELEMENT_NODE || (sub && stopSelector && node.matches(stopSelector)))
    {
      return;
    }

    // 2. add the node to the array, if it matches the selector
    if(node.matches(selector))
    {
      arr.push(node);
    }

    // 3. loop through the children
    const children = node.children;
    if(children.length)
    {
      for(const child of children)
      {
        traverser(child, true);
      }
    }

    // 4. check for shadow DOM, and loop through it's children
    const shadowRoot = node.shadowRoot;
    if(shadowRoot)
    {
      const shadowChildren = shadowRoot.children;
      for(const shadowChild of shadowChildren)
      {
        traverser(shadowChild, true);
      }
    }
  };

  traverser(element, false);

  return arr;
}
