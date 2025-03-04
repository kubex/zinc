import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * ThemeController is a reactive controller that listens for theme changes
 * and updates the theme property on the host element.
 *
 * if you want to reflect the theme attribute to the host element, you can use
 * the following code:
 *
 * ```ts
 * import { ThemeController } from "@zinc/internal/theme";
 *
 * export default class MyElement extends HTMLElement {
 *    @property({ reflect: true }) t = '';
 *    ...
 *  ```
 */
export class ThemeController implements ReactiveController {
  host: ReactiveControllerHost & HTMLElement;

  t: string = '';

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.getDefaultTheme();
    window.addEventListener('theme-change', this.handleThemeEventUpdate.bind(this));
  }

  hostDisconnected() {
    window.removeEventListener('theme-change', this.handleThemeEventUpdate.bind(this));
  }

  handleThemeEventUpdate(e: CustomEvent) {
    if (e && e.detail['theme']) {
      this.t = e.detail['theme'];
      return;
    }

    if (e && e.detail) {
      this.t = e.detail;
      return;
    }

    this.getDefaultTheme();
  }

  getDefaultTheme() {
    this.t = document.documentElement.getAttribute('t')
      || window.document.documentElement.getAttribute('t')
      || window.document.body.getAttribute('t')
      || 'light';
  }
}
