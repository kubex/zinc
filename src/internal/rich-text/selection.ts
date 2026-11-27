import type {Point} from './positions';

type ComposedSelection = Selection & {getComposedRanges?: (...args: unknown[]) => StaticRange[]};

function composedRange(selection: ComposedSelection, shadow: ShadowRoot): AbstractRange | undefined {
  try {
    return selection.getComposedRanges!({shadowRoots: [shadow]})[0];
  } catch {
    // Safari before the options-object signature takes the roots as arguments
    return selection.getComposedRanges!(shadow)[0];
  }
}

/**
 * The selection inside `root`, or null when it lies elsewhere. Each engine exposes a selection in a shadow root
 * differently: Chromium on the shadow root, WebKit through getComposedRanges, Gecko through the document.
 */
export function readRange(root: HTMLElement): Range | null {
  const host = root.getRootNode();
  const selection = document.getSelection() as ComposedSelection | null;
  let found: AbstractRange | null | undefined = null;
  try {
    const shadowSelection = host instanceof ShadowRoot
      ? (host as ShadowRoot & {getSelection?: () => Selection | null}).getSelection?.()
      : undefined;
    if (shadowSelection !== undefined) {
      found = shadowSelection?.rangeCount ? shadowSelection.getRangeAt(0) : null;
    } else if (host instanceof ShadowRoot && selection?.getComposedRanges) {
      found = composedRange(selection, host);
    } else {
      found = selection?.rangeCount ? selection.getRangeAt(0) : null;
    }
  } catch {
    return null;
  }
  if (!found || !root.contains(found.startContainer) || !root.contains(found.endContainer)) return null;

  const range = document.createRange();
  try {
    range.setStart(found.startContainer, found.startOffset);
    range.setEnd(found.endContainer, found.endOffset);
  } catch {
    // WebKit's composed ranges are static, so one read mid-edit can point past text that has since been split
    return null;
  }
  return range;
}

export function hasFocus(root: HTMLElement) {
  return (root.getRootNode() as Document | ShadowRoot).activeElement === root;
}

export function writeRange(root: HTMLElement, start: Point, end: Point = start) {
  if (!hasFocus(root)) root.focus({preventScroll: true});
  // addRange doesn't reach into a shadow root in WebKit; setBaseAndExtent does in every engine
  document.getSelection()?.setBaseAndExtent(start[0], start[1], end[0], end[1]);
}
