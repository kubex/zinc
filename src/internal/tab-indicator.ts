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

const SLIDE = 'tab-indicator-slide';
// Enough samples that the stretch reads as a curve, not steps
const SLIDE_FRAMES = 40;

export interface IndicatorEdges {
  left: number;
  right: number;
}

/** Eased progress of one edge at each sample time, as the browser itself evaluates the easing. */
function edgeProgress(easing: string, duration: number, delay: number) {
  let effect: KeyframeEffect;
  try {
    effect = new KeyframeEffect(null, null, {duration, delay, easing, fill: 'both'});
  } catch {
    effect = new KeyframeEffect(null, null, {duration, delay, easing: 'ease', fill: 'both'});
  }
  const timing = new Animation(effect);
  return (time: number) => {
    timing.currentTime = time;
    return effect.getComputedTiming().progress ?? 1;
  };
}

/**
 * Slides an indicator, already placed at `to` by `left` and `width`, from the box `from` using only `transform`, so the
 * browser can run it off the main thread while the new tab loads. The edge heading for the new tab moves on
 * `--zn-navbar-tab-indicator-duration`/`-easing`/`-delay`, the other on the `-trail-` tokens, stretching the indicator mid-move.
 */
export function slideTabIndicator(indicator: HTMLElement, from: IndicatorEdges, to: IndicatorEdges) {
  indicator.getAnimations().filter(animation => animation.id === SLIDE).forEach(animation => animation.cancel());
  const width = to.right - to.left;
  if (width <= 0 || prefersReducedMotion()) {
    return;
  }

  const style = getComputedStyle(indicator);
  const easing = style.getPropertyValue('--zn-navbar-tab-indicator-easing').trim() || 'cubic-bezier(0.4, 0, 0.2, 1)';
  const leadDuration = token(style, '--zn-navbar-tab-indicator-duration', '300ms');
  const leadDelay = token(style, '--zn-navbar-tab-indicator-delay', '0ms');
  const trailDuration = token(style, '--zn-navbar-tab-indicator-trail-duration', `${leadDuration}ms`);
  const trailDelay = token(style, '--zn-navbar-tab-indicator-trail-delay', `${leadDelay}ms`);
  const trailEasing = style.getPropertyValue('--zn-navbar-tab-indicator-trail-easing').trim() || easing;
  const lead = edgeProgress(easing, leadDuration, leadDelay);
  const trail = edgeProgress(trailEasing, trailDuration, trailDelay);
  const forward = to.left > from.left;
  const total = Math.max(leadDelay + leadDuration, trailDelay + trailDuration);

  const keyframes: Keyframe[] = [];
  for (let frame = 0; frame <= SLIDE_FRAMES; frame++) {
    const time = total * frame / SLIDE_FRAMES;
    const left = from.left + (to.left - from.left) * (forward ? trail : lead)(time);
    const right = from.right + (to.right - from.right) * (forward ? lead : trail)(time);
    keyframes.push({transform: `translateX(${left - to.left}px) scaleX(${Math.max(right - left, 0) / width})`});
  }

  const animation = indicator.animate(keyframes, {duration: total});
  animation.id = SLIDE;
}
