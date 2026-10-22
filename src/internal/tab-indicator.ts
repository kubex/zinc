import {EASE_DRAWER, EASE_OUT, parseDuration, prefersReducedMotion} from './animate';

const SQUISH = 'tab-indicator-squish';

function token(style: CSSStyleDeclaration, name: string, fallback: string) {
  return parseDuration(style.getPropertyValue(name).trim() || fallback);
}

/**
 * Squishes a sliding tab indicator's height to `--zn-navbar-tab-indicator-squash` during
 * `--zn-navbar-tab-indicator-delay`, then lets it recover as it travels. Does nothing unless a squash is set.
 */
export function squishTabIndicator(indicator: HTMLElement) {
  const style = getComputedStyle(indicator);
  const squash = parseFloat(style.getPropertyValue('--zn-navbar-tab-indicator-squash'));
  if (!squash || squash === 1 || prefersReducedMotion()) {
    return;
  }

  const delay = token(style, '--zn-navbar-tab-indicator-delay', '0ms');
  const total = delay + token(style, '--zn-navbar-tab-indicator-duration', '300ms');
  // A squish cut short by another tab change carries on from where it was rather than jumping back to full height
  const from = style.scale === 'none' ? '1 1' : style.scale;
  indicator.getAnimations().filter(animation => animation.id === SQUISH).forEach(animation => animation.cancel());

  const animation = indicator.animate([
    {scale: from, easing: EASE_OUT},
    {scale: `1 ${squash}`, offset: delay > 0 ? delay / total : 0.25, easing: EASE_DRAWER},
    {scale: '1 1'},
  ], {duration: total});
  animation.id = SQUISH;
}
