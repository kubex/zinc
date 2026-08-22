/** Where a selection card renders its image, relative to the card's text. */
export type SelectionCardImagePosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Where a selection card renders its radio/checkbox indicator. `start` keeps the standard
 * inline position; `none` hides the indicator so the card itself shows the selected state.
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
