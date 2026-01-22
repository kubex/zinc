import {formCollections} from "./form";
import {getTabbableElements} from "./tabbable";
import type {ZincFormControl} from "./zinc-element";

/**
 * WeakMap of navigation controllers to keep one controller per form
 */
const formNavigationControllers: WeakMap<HTMLFormElement, FormNavigationController> = new WeakMap();

export class FormNavigationController {
  private readonly form: HTMLFormElement;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.form.addEventListener('keydown', this.handleKeyDown, true);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      if (hasModifier) {
        return;
      }

      if (event.isComposing) {
        return;
      }

      if (event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement;
      if (this.isSelectOption(target)) {
        event.preventDefault();
        setTimeout(() => {
          const selectElement = this.findParentSelect(target);
          if (selectElement) {
            this.focusNextControl(selectElement);
          }
        }, 0);
        return;
      }

      if (this.shouldSkipEnterKey(target)) {
        return;
      }

      // Check if we're in a group (radio-group or checkbox-group)
      const group = this.findParentGroup(target);
      if (group) {
        event.preventDefault();
        const moved = this.focusNextInGroup(target, group);
        // If we couldn't move within the group (we're at the last item)
        if (!moved) {
          this.focusNextControl(group);
        }
        return;
      }

      event.preventDefault();

      if (this.areRequiredFieldsFilled()) {
        this.submitForm();
      } else {
        this.focusNextControl(target);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

      if (!hasModifier && !event.defaultPrevented) {
        const group = this.findParentGroup(target);
        if (group) {
          event.preventDefault();
          const moved = this.focusNextInGroup(target, group);
          if (!moved) {
            this.focusNextControl(group);
          }
          return;
        }

        // Individual checkboxes and toggles (not in a group)
        if (tagName === 'ZN-CHECKBOX' || tagName === 'ZN-TOGGLE') {
          event.preventDefault();
          this.focusNextControl(target);
        }
      }
    }

    if (event.key === 'ArrowUp') {
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

      if (!hasModifier && !event.defaultPrevented) {
        const group = this.findParentGroup(target);
        if (group) {
          event.preventDefault();
          const moved = this.focusPreviousInGroup(target, group);
          if (!moved) {
            this.focusPreviousControl(group);
          }
          return;
        }

        if (tagName === 'ZN-CHECKBOX' || tagName === 'ZN-TOGGLE') {
          event.preventDefault();
          this.focusPreviousControl(target);
        }
      }
    }
  };

  private shouldSkipEnterKey(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'zn-textarea' || tagName === 'textarea') {
      return true;
    }

    if (tagName === 'zn-input' || tagName === 'input') {
      const type = element.getAttribute('type');
      if (type === 'search') {
        return true;
      }
    }

    return tagName === 'button' || tagName === 'zn-button';
  }

  private shouldExcludeFromNavigation(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'button' || tagName === 'zn-button';
  }

  private isSelectOption(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'zn-option';
  }

  private findParentSelect(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;
    while (current) {
      if (current.tagName.toLowerCase() === 'zn-select') {
        return current;
      }

      const rootNode = current.getRootNode();
      if (rootNode instanceof ShadowRoot) {
        current = rootNode.host as HTMLElement;
      } else if (current.parentElement) {
        current = current.parentElement;
      } else {
        break;
      }
    }
    return null;
  }

  private findParentGroup(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;
    while (current) {
      const tagName = current.tagName;
      if (tagName === 'ZN-RADIO-GROUP' || tagName === 'ZN-CHECKBOX-GROUP') {
        return current;
      }

      const rootNode = current.getRootNode();
      if (rootNode instanceof ShadowRoot) {
        current = rootNode.host as HTMLElement;
      } else if (current.parentElement) {
        current = current.parentElement;
      } else {
        break;
      }
    }
    return null;
  }

  private getGroupItems(group: HTMLElement): HTMLElement[] {
    const itemTagName = group.tagName === 'ZN-RADIO-GROUP' ? 'ZN-RADIO' : 'ZN-CHECKBOX';
    const items: HTMLElement[] = [];
    const walker = document.createTreeWalker(
      group,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const element = node as HTMLElement;
          if (element.tagName === itemTagName) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      items.push(node as HTMLElement);
    }

    return items;
  }

  private focusNextInGroup(currentElement: HTMLElement, group: HTMLElement): boolean {
    const items = this.getGroupItems(group);
    if (items.length === 0) {
      return false;
    }

    let currentIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i] === currentElement || items[i].contains(currentElement)) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex >= 0 && currentIndex < items.length - 1) {
      const nextItem = items[currentIndex + 1];
      if (typeof nextItem.focus === 'function') {
        nextItem.focus();
        return true;
      }
    }

    return false;
  }

  private focusPreviousInGroup(currentElement: HTMLElement, group: HTMLElement): boolean {
    const items = this.getGroupItems(group);
    if (items.length === 0) {
      return false;
    }

    let currentIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i] === currentElement || items[i].contains(currentElement)) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex > 0) {
      const previousItem = items[currentIndex - 1];
      if (typeof previousItem.focus === 'function') {
        previousItem.focus();
        return true;
      }
    }

    return false;
  }

  private areRequiredFieldsFilled(): boolean {
    const controls = formCollections.get(this.form);

    if (!controls) {
      return true;
    }

    for (const control of controls) {
      const formControl = control as ZincFormControl;

      if (!formControl.name) {
        continue;
      }

      if (formControl.disabled) {
        continue;
      }

      const value = formControl.value;
      const hasValue = value !== undefined && value !== null && value !== '';
      if (!hasValue) {
        return false;
      }

      if (typeof formControl.checkValidity === 'function' && !formControl.checkValidity()) {
        return false;
      }
    }

    return true;
  }

  private getNavigableControls(): HTMLElement[] {
    const tabbableElements = getTabbableElements(this.form);
    const navigableControls: HTMLElement[] = [];
    const seen = new Set<HTMLElement>();

    for (const el of tabbableElements) {
      const tagName = el.tagName.toLowerCase();

      const isZincControl = [
        'zn-input',
        'zn-select',
        'zn-datepicker',
        'zn-textarea',
        'zn-file',
        'zn-checkbox',
        'zn-radio',
        'zn-radio-group',
        'zn-toggle'
      ].includes(tagName);

      if (isZincControl) {
        // Special handling for radios inside radio groups
        if (tagName === 'zn-radio') {
          // Check if this radio is inside a radio-group
          const radioGroup = el.closest('zn-radio-group') as HTMLElement | null;
          if (radioGroup) {
            // Add the radio-group instead of the individual radio
            if (!seen.has(radioGroup)) {
              seen.add(radioGroup);
              if (!this.shouldExcludeFromNavigation(radioGroup)) {
                navigableControls.push(radioGroup);
              }
            }
            continue;
          }
        }

        if (seen.has(el)) {
          continue;
        }
        seen.add(el);

        if (this.shouldExcludeFromNavigation(el)) {
          continue;
        }

        navigableControls.push(el);
        continue;
      }

      const hostElement = (el.getRootNode() as ShadowRoot).host as HTMLElement;
      if (hostElement && hostElement !== this.form) {
        const hostTagName = hostElement.tagName.toLowerCase();
        const isHostZincControl = [
          'zn-input',
          'zn-select',
          'zn-datepicker',
          'zn-textarea',
          'zn-file',
          'zn-checkbox',
          'zn-radio',
          'zn-radio-group',
          'zn-toggle'
        ].includes(hostTagName);

        if (isHostZincControl) {
          // Special handling for radios inside radio groups
          if (hostTagName === 'zn-radio') {
            // Check if this radio is inside a radio-group
            const radioGroup = hostElement.closest('zn-radio-group') as HTMLElement | null;
            if (radioGroup) {
              // Add the radio-group instead of the individual radio
              if (!seen.has(radioGroup)) {
                seen.add(radioGroup);
                if (!this.shouldExcludeFromNavigation(radioGroup)) {
                  navigableControls.push(radioGroup);
                }
              }
              continue;
            }
          }

          if (seen.has(hostElement)) {
            continue;
          }
          seen.add(hostElement);

          if (this.shouldExcludeFromNavigation(hostElement)) {
            continue;
          }

          navigableControls.push(hostElement);
          continue;
        }
      }

      const isNativeControl = ['input', 'select'].includes(tagName);
      if (isNativeControl) {
        if (seen.has(el)) {
          continue;
        }
        seen.add(el);

        const type = el.getAttribute('type');
        if (type === 'search') {
          continue;
        }

        navigableControls.push(el);
      }
    }

    return navigableControls;
  }

  private findCurrentControlIndex(currentElement: HTMLElement, navigableControls: HTMLElement[]): number {
    for (let i = 0; i < navigableControls.length; i++) {
      const control = navigableControls[i];
      if (control === currentElement) {
        return i;
      }

      const rootNode = currentElement.getRootNode();
      if (rootNode instanceof ShadowRoot && rootNode.host === control) {
        return i;
      }

      if (control.contains(currentElement)) {
        return i;
      }

      if (currentElement.contains(control)) {
        return i;
      }
    }

    return -1;
  }

  private focusNextControl(currentElement: HTMLElement) {
    const navigableControls = this.getNavigableControls();
    const currentIndex = this.findCurrentControlIndex(currentElement, navigableControls);

    if (currentIndex >= 0 && currentIndex < navigableControls.length - 1) {
      const nextControl = navigableControls[currentIndex + 1];

      if (typeof nextControl.focus === 'function') {
        nextControl.focus();

        const tagName = nextControl.tagName.toLowerCase();
        if (tagName === 'zn-select') {
          const selectElement = nextControl as HTMLElement & { show?: () => Promise<void> };
          if (typeof selectElement.show === 'function') {
            setTimeout(() => {
              void selectElement.show?.();
            }, 0);
          }
        }
      }
    }
  }

  private focusPreviousControl(currentElement: HTMLElement) {
    const navigableControls = this.getNavigableControls();
    const currentIndex = this.findCurrentControlIndex(currentElement, navigableControls);

    if (currentIndex > 0) {
      const previousControl = navigableControls[currentIndex - 1];

      if (typeof previousControl.focus === 'function') {
        previousControl.focus();

        const tagName = previousControl.tagName.toLowerCase();
        if (tagName === 'zn-select') {
          const selectElement = previousControl as HTMLElement & { show?: () => Promise<void> };
          if (typeof selectElement.show === 'function') {
            setTimeout(() => {
              void selectElement.show?.();
            }, 0);
          }
        }
      }
    }
  }

  private submitForm() {
    const submitButton = this.form.querySelector<HTMLButtonElement>('[type="submit"]');

    if (submitButton) {
      submitButton.click();
    } else if (typeof this.form.requestSubmit === 'function') {
      this.form.requestSubmit();
    } else {
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      this.form.dispatchEvent(submitEvent);
    }
  }

  destroy() {
    this.form.removeEventListener('keydown', this.handleKeyDown, true);
  }
}

/**
 * Gets or creates a FormNavigationController for the given form
 */
export function getFormNavigationController(form: HTMLFormElement): FormNavigationController {
  let controller = formNavigationControllers.get(form);

  if (!controller) {
    controller = new FormNavigationController(form);
    formNavigationControllers.set(form, controller);
  }

  return controller;
}
