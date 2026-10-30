/** Where a selection card renders its image, relative to the card's text. */
export type SelectionCardImagePosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Where a selection card renders its radio/checkbox indicator. `start` keeps the standard
 * inline position, except on a plain contained radio or checkbox which hides it like `none`.
 */
export type SelectionCardControlPosition =
  | 'start'
  | 'none'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
