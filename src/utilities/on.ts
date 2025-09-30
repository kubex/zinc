type OnEvent = Event & { selectedTarget: EventTarget; path: EventTarget[] };

interface OnEventListener {
  (evt: OnEvent): void;
}

export function on(delegate: EventTarget, eventName: string, targetSelector: string, callback: OnEventListener) {
  function _fn(e: OnEvent) {
    const path = e.composedPath?.() || e.path || [e.target];

    for (const node of path) {
      if (node instanceof Element && node.matches(targetSelector)) {
        e.selectedTarget = node;
        return callback(e);
      }

      // stop traversing up the dom once we reach the delegate
      if (node === delegate) {
        break;
      }
    }

    return false;
  }

  delegate.addEventListener(eventName, _fn);
  return () => delegate.removeEventListener(eventName, _fn);
}
