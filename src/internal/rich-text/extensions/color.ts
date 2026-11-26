import type {Extension} from '../extension';

/** Text colour, as any CSS colour; the editor's palette uses names such as `red`. */
export const color: Extension = {
  name: 'color',
  inline: [{
    name: 'color',
    tag: 'SPAN',
    match: el => !!(el as HTMLElement).style.color,
    create: value => {
      const span = document.createElement('span');
      span.style.color = String(value);
      return span;
    },
    value: el => (el as HTMLElement).style.color,
  }],
};
