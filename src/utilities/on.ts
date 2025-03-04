type OnEvent = Event & { selectedTarget: EventTarget };

interface OnEventListener {
  (evt: OnEvent): void;
}

export function on(delegate: EventTarget, eventName: string, targetSelector: string, callback: OnEventListener) {
  function _fn(e: any) {
    const path = e.path || (e.composedPath && e.composedPath());
    let t = path && path[0] || e.target;
    do {
      if ((!targetSelector) || (t.matches && t.matches(targetSelector))) {
        e.selectedTarget = t;
        return callback(e);
      }

      // stop traversing up the dom once we reach the delegate
      if (delegate === t) {
        break;
      }
    }
    while ((t = t.parentElement || (t.getRootNode() && t.getRootNode().host)));
  }

  delegate.addEventListener(eventName, _fn);
  return () => delegate.removeEventListener(eventName, _fn);
}
