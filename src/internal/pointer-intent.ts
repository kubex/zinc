import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tells a control whether its latest state change came from a pointer press, so keyboard and
 * programmatic changes (arrow keys, select-all, value sync) can skip their animation.
 */
export class PointerIntentController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private pressed = false;
  private readonly handlePointerDown = () => (this.pressed = true);
  private readonly handleKeyDown = () => (this.pressed = false);
  // A press that changed nothing (dragged off, disabled) mustn't leak into the next change
  private readonly handleClick = () => setTimeout(() => (this.pressed = false));

  constructor(host: ReactiveControllerHost & HTMLElement) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    this.host.addEventListener('pointerdown', this.handlePointerDown);
    this.host.addEventListener('keydown', this.handleKeyDown);
    this.host.addEventListener('click', this.handleClick);
  }

  hostDisconnected() {
    this.host.removeEventListener('pointerdown', this.handlePointerDown);
    this.host.removeEventListener('keydown', this.handleKeyDown);
    this.host.removeEventListener('click', this.handleClick);
  }

  /** Whether the change being handled now was pointer-initiated. Call synchronously from the state-change handler. */
  consume() {
    const pressed = this.pressed;
    this.pressed = false;
    return pressed;
  }
}
