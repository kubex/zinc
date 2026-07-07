import type {PageState} from '../components/page-builder/page.types';

export type ZnPageChangeEvent = CustomEvent<{ state: PageState }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-page-change': ZnPageChangeEvent;
  }
}
