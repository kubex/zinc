import {getBasePath} from "./utilities/base-path";

const observer = new MutationObserver((mutations) => {
  for (const {addedNodes} of mutations) {
    for (const node of addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        discover(node as Element);
      }
    }
  }
});

/**
 * Checks a node for undefined elements and attempts to register them
 */
export async function discover(root: Element | ShadowRoot) {
  const rootTagName = root instanceof Element ? root.tagName.toLowerCase() : '';
  const rootIsZincElement = rootTagName?.startsWith('zn-');
  const tags = [...root.querySelectorAll(':not(:defined)')]
    .map(el => el.tagName.toLowerCase())
    .filter(tag => tag.startsWith('zn-'));

  // If the root element is an undefined Zinc component, add it to the list
  if (rootIsZincElement && !customElements.get(rootTagName)) {
    tags.push(rootTagName);
  }

  // Make the list unique
  const tagsToRegister = [...new Set(tags)];

  await Promise.allSettled(tagsToRegister.map(tagName => register(tagName)));
}

/**
 * Registers an element by tag name.
 */
function register(tagName: string): Promise<void> {
  // If the element is already defined, there's nothing more to do
  if (customElements.get(tagName)) {
    return Promise.resolve();
  }

  const tagWithoutPrefix = tagName.replace(/^zn-/i, '');
  const path = getBasePath(`components/${tagWithoutPrefix}/${tagWithoutPrefix}.js`);

  // Register it
  return new Promise((resolve, reject) => {
    // @ts-expect-error  Dynamic imports are only supported when the --module flag is set to es2020, es2022, esnext,
    // commonjs, amd, system, umd, node16, or nodenext
    import(path).then(() => resolve()).catch(() => reject(new Error(`Unable to autoload <${tagName}> from ${path}`)));
  });
}

// Initial discovery
discover(document.body);

// Listen for new undefined elements
observer.observe(document.documentElement, {subtree: true, childList: true});
