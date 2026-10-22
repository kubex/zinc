let registered = false;

/** Registers `--rotate` so the cosmic border's gradient can animate; `@property` rules inside a shadow root are ignored. */
export function registerCosmicBorder() {
  if (registered || !window.CSS.registerProperty) {
    return;
  }

  registered = true;
  try {
    window.CSS.registerProperty({name: '--rotate', syntax: '<angle>', inherits: false, initialValue: '0deg'});
  } catch {
    // Already registered by another copy of zinc on the page
  }
}
