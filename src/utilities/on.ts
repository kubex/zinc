type OnEvent = Event & { selectedTarget: EventTarget; path: EventTarget[] };

interface OnEventListener {
  (evt: OnEvent): void;
}

export function on(delegate: EventTarget, eventName: string, targetSelector: string, callback: OnEventListener) {
  function _fn(e: OnEvent) {
    const path = e.path || (e.composedPath?.());
    let t: Element | null = (path?.[0] || e.target) as Element;
    do {
      if (!targetSelector || (t.matches && t.matches(targetSelector))) {
        e.selectedTarget = t;
        return callback(e);
      }

      // stop traversing up the dom once we reach the delegate
      if (delegate === t) {
        break;
      }
    }
    while ((t = t.parentElement));

    return false;
  }

  delegate.addEventListener(eventName, _fn);
  return () => delegate.removeEventListener(eventName, _fn);
}
