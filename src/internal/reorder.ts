import type {FormControlController} from './form';
import type {ReactiveController, ReactiveControllerHost} from 'lit';

/** A component whose keyed items can be dragged, or moved by keyboard, into a new order. */
export interface ReorderHost extends ReactiveControllerHost, HTMLElement {
  /** The item keys in their current order. */
  reorderKeys: () => string[];

  /** Shows the items in a new order. */
  applyReorder: (keys: string[]) => void;

  /** The row drawn for an item, measured to slide it from its old position. */
  reorderRow: (key: string) => HTMLElement | null;

  /** Whether an item is pinned where it is; nothing can move past it either. */
  reorderLocked?: (key: string) => boolean;

  /** Submits the form after each reorder when set: to this URL, or the form's own action when empty. */
  formAction?: string;

  disabled?: boolean;
}

export interface ReorderOptions {
  /** Submits through the host's form, which announces the form so a host page can intercept the submit. */
  formControl?: FormControlController;

  /** Fields for a temporary form when the host has a `formaction` but no form of its own. */
  fallbackFields?: () => [string, string][];

  /** Keys that move the focused item. With `alt`, plain arrows are left to navigate between items. */
  modifier?: 'none' | 'alt';

  /** Focuses an item after it moves by keyboard. */
  focus?: (key: string) => void;
}

type ReorderEvent = 'zn-change' | 'zn-reorder';

/**
 * Drag-and-drop and keyboard reordering for a keyed list, with the change announced through `zn-change` and
 * `zn-reorder` and, when the host has a `formaction`, submitted with its form.
 */
export class ReorderController implements ReactiveController {
  /** The item being dragged, styled as its placeholder. Set a frame after the drag starts. */
  draggedKey: string | null = null;

  /** Whether a drag is under way, for transitions while items shift. */
  isDragging = false;

  private readonly host: ReorderHost;
  private readonly options: ReorderOptions;
  private dragKey: string | null = null;
  private startOrder: string[] = [];

  constructor(host: ReorderHost, options: ReorderOptions = {}) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostConnected() {
    // Nothing to set up; the host wires the event handlers to its own rows.
  }

  private keys() {
    return this.host.reorderKeys();
  }

  isLocked(key: string) {
    return this.host.reorderLocked?.(key) ?? false;
  }

  /** A move is allowed when neither the moved item nor any item it would shift past is locked. */
  canMove(fromIndex: number, toIndex: number) {
    const keys = this.keys();
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= keys.length || toIndex >= keys.length) return false;
    if (this.isLocked(keys[fromIndex])) return false;
    const [low, high] = fromIndex < toIndex ? [fromIndex + 1, toIndex] : [toIndex, fromIndex - 1];
    for (let i = low; i <= high; i++) {
      if (this.isLocked(keys[i])) return false;
    }
    return true;
  }

  canStep(key: string, step: number) {
    const index = this.keys().indexOf(key);
    return index !== -1 && this.canMove(index, index + step);
  }

  /** Moves an item and announces the new order. */
  move(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || !this.canMove(fromIndex, toIndex)) return false;
    this.reorder(moved(this.keys(), fromIndex, toIndex));
    this.commit();
    return true;
  }

  step(key: string, step: number) {
    const index = this.keys().indexOf(key);
    return this.move(index, index + step);
  }

  /** Arrow keys move the item one place and Home/End to either end. Returns whether the key was handled. */
  handleKeyDown(event: KeyboardEvent, key: string) {
    if (this.host.disabled) return false;
    if ((this.options.modifier ?? 'none') === 'alt' && !event.altKey) return false;

    const keys = this.keys();
    const index = keys.indexOf(key);
    if (index === -1) return false;

    const target = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: 0,
      End: keys.length - 1,
    }[event.key];
    if (target === undefined || target === index || target < 0 || target >= keys.length) return false;

    event.preventDefault();
    if (this.move(index, target)) {
      void this.host.updateComplete.then(() => this.options.focus?.(key));
    }
    return true;
  }

  handleDragStart(event: DragEvent, key: string) {
    if (this.host.disabled || this.isLocked(key)) {
      event.preventDefault();
      return;
    }

    this.dragKey = key;
    this.startOrder = this.keys();
    this.isDragging = true;
    this.host.requestUpdate();
    // Styling the row as a placeholder before the browser snapshots it would fade the drag image too
    requestAnimationFrame(() => {
      if (this.isDragging) {
        this.draggedKey = key;
        this.host.requestUpdate();
      }
    });

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    }
  }

  /**
   * Moves the dragged item to the hovered one's place, once the pointer crosses that item's midpoint. Pass no key
   * for the space between items: the drop is still accepted there, so letting go in a gap keeps the new order.
   */
  handleDragOver(event: DragEvent, key?: string | null) {
    if (!this.isDragging) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (!key || !this.dragKey || this.dragKey === key) return;

    const keys = this.keys();
    const fromIndex = keys.indexOf(this.dragKey);
    const toIndex = keys.indexOf(key);
    const row = this.host.reorderRow(key);
    if (fromIndex === -1 || toIndex === -1 || !row) return;

    // Rows of different heights would otherwise flip back and forth
    const rect = row.getBoundingClientRect();
    const pastMidpoint = event.clientY > rect.top + rect.height / 2;
    if (fromIndex < toIndex !== pastMidpoint) return;
    if (!this.canMove(fromIndex, toIndex)) return;

    this.reorder(moved(keys, fromIndex, toIndex));
  }

  handleDrop(event: DragEvent) {
    // Dragover has already moved the item into place; dragend announces the change
    event.preventDefault();
  }

  handleDragEnd(event: DragEvent) {
    if (!this.isDragging) return;

    const startOrder = this.startOrder;
    this.dragKey = null;
    this.draggedKey = null;
    this.isDragging = false;
    this.host.requestUpdate();

    // Escape, or a drop outside the list, cancels the drag
    if (event.dataTransfer?.dropEffect === 'none') {
      this.reorder(startOrder);
      return;
    }
    if (startOrder.join('\n') === this.keys().join('\n')) return;

    this.commit();
  }

  /** Shows the new order, sliding each row from its old position. */
  reorder(keys: string[]) {
    const before = new Map(this.keys().map(key => [key, this.host.reorderRow(key)?.getBoundingClientRect().top]));
    this.host.applyReorder(keys);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    void this.host.updateComplete.then(() => {
      for (const key of keys) {
        const row = this.host.reorderRow(key);
        const top = before.get(key);
        if (!row || top === undefined) continue;
        const delta = top - row.getBoundingClientRect().top;
        if (delta) {
          row.animate([{transform: `translateY(${delta}px)`}, {transform: 'none'}], {duration: 150, easing: 'ease-out'});
        }
      }
    });
  }

  private commit() {
    this.emit('zn-change');
    this.emit('zn-reorder');
    this.submit();
  }

  private emit(name: ReorderEvent) {
    this.host.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true}));
  }

  /** Submits the host's form when it has a `formaction`. */
  private submit() {
    const formAction = this.host.formAction;
    if (formAction === undefined || formAction === null) return;

    const formControl = this.options.formControl;
    if (formControl?.getForm()) {
      // Submitting through the controller announces the form before it is submitted, which is what lets a host
      // page intercept the submit: a submit event raised on a form inside a shadow root never reaches the document.
      const submitter = document.createElement('input');
      submitter.type = 'submit';
      if (formAction) {
        submitter.setAttribute('formaction', formAction);
      }
      formControl.submit(submitter);
      return;
    }

    if (!formAction) return;
    const form = document.createElement('form');
    form.method = 'post';
    form.action = formAction;
    form.hidden = true;
    for (const [name, value] of this.options.fallbackFields?.() ?? []) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.append(input);
    }
    document.body.append(form);
    // requestSubmit raises a cancellable submit event, so a host page can handle it rather than navigating
    form.requestSubmit();
    form.remove();
  }
}

function moved(keys: string[], fromIndex: number, toIndex: number) {
  const order = [...keys];
  const [item] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, item);
  return order;
}
