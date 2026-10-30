import { getOffset } from './offset.js';

const locks = new Set();

/** Returns the width of the document's scrollbar */
function getScrollbarWidth() {
  const documentWidth = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - documentWidth);
}

/**
 * Prevents body scrolling. Keeps track of which elements requested a lock so multiple levels of locking are possible
 * without premature unlocking.
 */
export function lockBodyScrolling(lockingEl: HTMLElement) {
  locks.add(lockingEl);

  // When the first lock is created, set the scroll lock size to match the scrollbar's width to prevent content from
  // shifting. We only do this on the first lock because the scrollbar width will measure zero after overflow is hidden.
  if (!document.body.classList.contains('zn-scroll-lock')) {
    const scrollbarWidth = getScrollbarWidth(); // must be measured before the `zn-scroll-lock` class is applied
    document.body.classList.add('zn-scroll-lock');
    document.body.style.setProperty('--zn-scroll-lock-size', `${scrollbarWidth}px`);
  }
}

/**
 * Unlocks body scrolling. Scrolling will only be unlocked once all elements that requested a lock call this method.
 */
export function unlockBodyScrolling(lockingEl: HTMLElement) {
  locks.delete(lockingEl);

  if (locks.size === 0) {
    document.body.classList.remove('zn-scroll-lock');
    document.body.style.removeProperty('--zn-scroll-lock-size');
  }
}

/** Scrolls an element into view of its container. If the element is already in view, nothing will happen. */
export function scrollIntoView(
  element: HTMLElement,
  container: HTMLElement,
  direction: 'horizontal' | 'vertical' | 'both' = 'vertical',
  behavior: 'smooth' | 'auto' = 'smooth'
) {
  const offset = getOffset(element, container);
  const offsetTop = offset.top + container.scrollTop;
  const offsetLeft = offset.left + container.scrollLeft;
  const minX = container.scrollLeft;
  const maxX = container.scrollLeft + container.offsetWidth;
  const minY = container.scrollTop;
  const maxY = container.scrollTop + container.offsetHeight;

  if (direction === 'horizontal' || direction === 'both') {
    if (offsetLeft < minX) {
      container.scrollTo({ left: offsetLeft, behavior });
    } else if (offsetLeft + element.clientWidth > maxX) {
      container.scrollTo({ left: offsetLeft - container.offsetWidth + element.clientWidth, behavior });
    }
  }

  if (direction === 'vertical' || direction === 'both') {
    if (offsetTop < minY) {
      container.scrollTo({ top: offsetTop, behavior });
    } else if (offsetTop + element.clientHeight > maxY) {
      container.scrollTo({ top: offsetTop - container.offsetHeight + element.clientHeight, behavior });
    }
  }
}

/**
 * Every ancestor of `element`, itself included, that is scrolled away from the top. Shadow
 * boundaries are crossed, so a host's own scroller and the app's outer one are both found.
 */
export function getScrolledAncestors(element: Element | null | undefined): Element[] {
  const scrolled: Element[] = [];
  let node: Node | null | undefined = element;

  while (node) {
    if (node instanceof Element && node.scrollTop > 0) {
      scrolled.push(node);
    }
    node = node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode;
  }

  return scrolled;
}

// A display: contents host has no box of its own, so it starts where its first rendered part does.
function topOf(host: HTMLElement): number {
  const rect = host.getBoundingClientRect();
  if (rect.height > 0) {
    return rect.top;
  }

  const parts = Array.from(host.shadowRoot?.children ?? []).flatMap(child =>
    child instanceof HTMLSlotElement ? child.assignedElements() : [child]
  );
  const tops = parts.map(part => part.getBoundingClientRect()).filter(box => box.height > 0).map(box => box.top);
  return tops.length ? Math.min(...tops) : Infinity;
}

/**
 * Shows a newly selected tab from its start. Scrollers inside `host` return to their top; scrollers around it only
 * scroll back far enough to show the top of `host`, leaving the reader's place alone while the tabs are in view.
 */
export function revealTop(containers: Iterable<Element>, host: HTMLElement) {
  for (const container of containers) {
    if (host.shadowRoot?.contains(container)) {
      container.scrollTo({ top: 0 });
      continue;
    }

    // Measured per scroller, as scrolling an inner one moves the tabs
    const top = topOf(host);
    const viewTop = container === document.scrollingElement ? 0 : container.getBoundingClientRect().top;
    if (top < viewTop) {
      container.scrollBy({ top: top - viewTop });
    }
  }
}
