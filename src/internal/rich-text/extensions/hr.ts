import type {Extension} from '../extension';

/** A divider between blocks. */
export const hr: Extension = {
  name: 'hr',
  atoms: [{name: 'hr', selector: 'hr', block: true, create: () => document.createElement('hr')}],
};
