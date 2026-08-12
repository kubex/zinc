import {caretRectFrom, getCaretCoordinates} from '../../utilities/caret-position';
import {filterSlashItems} from './slash-menu-items';
import {SLASH_ITEM_SELECT} from './slash-menu.component';
import type {CaretCoordinates, TextField} from '../../utilities/caret-position';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {SlashMenuItem} from './slash-menu-items';
import type {VirtualElement} from '../popup';
import type ZnSlashMenu from './slash-menu.component';

export interface SlashMenuControllerOptions {
  /**
   * Resolves the menu to render results into. Called the first time the menu is needed, so the host
   * can render it lazily; may return a promise (e.g. after awaiting `updateComplete`).
   */
  menu: () => ZnSlashMenu | null | Promise<ZnSlashMenu | null>;
  /** The available items, unfiltered. Receives the current query so lists can be resolved remotely. */
  items: (query: string) => SlashMenuItem[] | Promise<SlashMenuItem[]>;
  /** The characters that open the menu. Defaults to `/`. */
  trigger?: () => string;
  /** Called before an item is inserted. Return `false` to handle the item yourself. */
  onSelect?: (item: SlashMenuItem, query: string) => boolean;
  /** Called after an item's value has been written into the field. */
  onInsert?: (item: SlashMenuItem, value: string) => void;
}

/** Queries longer than this are treated as prose the user never meant as a menu search. */
const MAX_QUERY_LENGTH = 40;

/**
 * Drives a slash menu for a plain `<textarea>` or `<input>`: watches the caret for the trigger
 * sequence, resolves and filters items, and inserts the chosen value.
 *
 * The host owns the field and the menu element; this controller owns the interaction.
 */
export class SlashMenuController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly options: SlashMenuControllerOptions;
  private readonly caretAnchor: VirtualElement = {
    getBoundingClientRect: () => this.caretRect()
  };

  private field: TextField | null = null;
  private menu: ZnSlashMenu | null = null;
  private triggerIndex = -1;
  private query = '';
  /** Trigger position the user dismissed with Escape; the menu stays shut until they move off it. */
  private dismissedIndex = -1;
  private resolveToken = 0;
  private inserting = false;
  private isOpen = false;
  private listening = false;
  /** Caret measurement is the expensive part of positioning, so the last one is reused. */
  private measured?: {value: string; index: number; width: number; coordinates: CaretCoordinates};

  constructor(host: ReactiveControllerHost & HTMLElement, options: SlashMenuControllerOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  /** Whether the menu is currently showing. */
  get open(): boolean {
    return this.isOpen;
  }

  hostConnected() {
    this.addListeners();
  }

  hostDisconnected() {
    // The field is kept, so reconnecting the host resumes where it left off
    this.removeListeners();
  }

  /** Starts watching a field. Safe to call repeatedly with the same field. */
  attach(field: TextField) {
    if (this.field === field && this.listening) return;

    this.removeListeners();
    this.field = field;
    this.caretAnchor.contextElement = field;
    this.addListeners();
  }

  /** Stops watching the current field and closes the menu. */
  detach() {
    this.removeListeners();
    this.field = null;
  }

  private addListeners() {
    const field = this.field;
    if (!field || this.listening) return;

    // Capture phase, so menu navigation keys are claimed before the host's own key handling
    field.addEventListener('keydown', this.handleKeyDown, {capture: true});
    field.addEventListener('input', this.handleInput);
    field.addEventListener('keyup', this.handleKeyUp);
    field.addEventListener('click', this.handleCaretMove);
    field.addEventListener('blur', this.handleBlur);
    field.addEventListener('scroll', this.handleScroll);
    this.listening = true;
  }

  private removeListeners() {
    const field = this.field;
    if (!field || !this.listening) return;

    this.close();
    field.removeEventListener('keydown', this.handleKeyDown, {capture: true});
    field.removeEventListener('input', this.handleInput);
    field.removeEventListener('keyup', this.handleKeyUp);
    field.removeEventListener('click', this.handleCaretMove);
    field.removeEventListener('blur', this.handleBlur);
    field.removeEventListener('scroll', this.handleScroll);
    this.listening = false;
  }

  /** Closes the menu without marking the trigger as dismissed. */
  close() {
    this.resolveToken++;
    this.triggerIndex = -1;
    this.query = '';

    if (this.isOpen) {
      this.isOpen = false;
      this.menu?.hide();
      this.field?.setAttribute('aria-expanded', 'false');
    }
  }

  /** Opens the menu at the caret, as a toolbar button or keyboard shortcut would. */
  requestOpen() {
    this.dismissedIndex = -1;
    this.detect();
  }

  private caretRect(): DOMRect {
    const field = this.field;
    if (!field) return new DOMRect();

    const index = this.triggerIndex >= 0 ? this.triggerIndex : (field.selectionStart ?? 0);
    const width = field.clientWidth;
    const cached = this.measured;

    if (!cached || cached.index !== index || cached.width !== width || cached.value !== field.value) {
      this.measured = {value: field.value, index, width, coordinates: getCaretCoordinates(field, index)};
    }

    return caretRectFrom(field, this.measured!.coordinates);
  }

  private readonly handleInput = () => this.detect();

  private readonly handleCaretMove = () => this.detect();

  private readonly handleKeyUp = (event: KeyboardEvent) => {
    // The vertical arrows belong to the open menu, and its keydown handler stopped them from moving
    // the caret — re-detecting here would rebuild the list and drop the user's place in it
    if (this.isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) return;

    // Typing is covered by `input`; this catches caret moves that don't change the value
    if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
      this.detect();
    }
  };

  private readonly handleBlur = () => this.close();

  private readonly handleScroll = () => {
    if (this.isOpen) this.menu?.reposition();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isOpen || event.isComposing) return;

    const claim = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (event.key) {
      case 'Escape':
        claim();
        this.dismissedIndex = this.triggerIndex;
        this.close();
        return;

      case 'ArrowDown':
        claim();
        this.menu?.moveActive(1);
        return;

      case 'ArrowUp':
        claim();
        this.menu?.moveActive(-1);
        return;

      case 'Enter':
      case 'Tab': {
        if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;

        const item = this.menu?.activeItem;
        if (!item) {
          this.close();
          return;
        }

        claim();
        this.select(item);
      }
    }
  };

  private readonly handleItemSelect = (event: Event) => {
    const {item} = (event as CustomEvent<{item: SlashMenuItem}>).detail;
    if (item) this.select(item);
  };

  private detect() {
    if (this.inserting) return;

    const field = this.field;
    if (!field || field.disabled || field.readOnly) {
      this.close();
      return;
    }

    const trigger = this.options.trigger?.() || '/';
    const caret = field.selectionStart;
    // Only a collapsed caret opens the menu — a selection means the user is doing something else
    if (!trigger || caret === null || field.selectionEnd !== caret) {
      this.close();
      return;
    }

    const value = field.value;
    const index = value.lastIndexOf(trigger, Math.max(0, caret - trigger.length));
    if (index === -1 || index + trigger.length > caret) {
      this.close();
      return;
    }

    // The trigger only counts at the start of a word
    const preceding = index > 0 ? value.charAt(index - 1) : '';
    if (preceding !== '' && !/\s/.test(preceding)) {
      this.close();
      return;
    }

    const query = value.slice(index + trigger.length, caret);
    if (query.length > MAX_QUERY_LENGTH || /[\r\n]/.test(query)) {
      this.close();
      return;
    }

    if (index === this.dismissedIndex) {
      this.close();
      return;
    }

    this.triggerIndex = index;
    this.query = query;
    void this.resolve(query);
  }

  private async resolve(query: string) {
    const token = ++this.resolveToken;

    let items: SlashMenuItem[] = [];
    try {
      items = await this.options.items(query);
    } catch (error: unknown) {
      console.warn('slash menu items could not be resolved', error);
    }

    if (token !== this.resolveToken) return;

    const matches = filterSlashItems(items, query);
    if (!matches.length) {
      this.close();
      return;
    }

    const menu = await this.options.menu();
    if (!menu || token !== this.resolveToken) return;

    if (menu !== this.menu) {
      this.menu?.removeEventListener(SLASH_ITEM_SELECT, this.handleItemSelect);
      menu.addEventListener(SLASH_ITEM_SELECT, this.handleItemSelect);
      this.menu = menu;
    }

    menu.anchor = this.caretAnchor;
    menu.query = query;
    menu.items = matches;

    if (!this.isOpen) {
      this.isOpen = true;
      this.dismissedIndex = -1;
      menu.show();
      this.field?.setAttribute('aria-expanded', 'true');
      this.field?.setAttribute('aria-haspopup', 'listbox');
    }

    await menu.updateComplete;
    if (this.isOpen) menu.reposition();
  }

  private select(item: SlashMenuItem) {
    const field = this.field;
    const start = this.triggerIndex;
    const end = field?.selectionStart ?? start;
    const query = this.query;
    const trigger = this.options.trigger?.() || '/';

    if (item.disabled) return;

    this.close();
    if (!field || start < 0) return;

    const cancelled = this.options.onSelect?.(item, query) === false;
    const value = cancelled ? '' : (item.value ?? '');

    // A handler may have rewritten the field already; only touch text we still recognise as ours
    if (field.value.slice(start, end) !== trigger + query) return;

    // The trigger and query are a command rather than content, so they go either way
    this.replace(field, start, end, value, item);

    if (!cancelled && value) this.options.onInsert?.(item, value);
  }

  private replace(field: TextField, start: number, end: number, value: string, item: SlashMenuItem) {
    this.inserting = true;
    try {
      field.focus({preventScroll: true});
      field.setSelectionRange(start, end);

      // execCommand keeps the field's native undo history intact; setRangeText does not
      let handled = false;
      try {
        handled = field.ownerDocument.execCommand('insertText', false, value);
      } catch {
        handled = false;
      }

      if (!handled) {
        field.setRangeText(value, start, end, 'end');
        field.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
      }

      const offset = Math.min(Math.max(item.caretOffset ?? value.length, 0), value.length);
      field.setSelectionRange(start + offset, start + offset);
    } finally {
      this.inserting = false;
    }

    this.host.requestUpdate();
  }
}
