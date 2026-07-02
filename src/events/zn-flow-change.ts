import type {FlowState} from '../components/flow-builder/flow.types';

export type ZnFlowChangeEvent = CustomEvent<{ state: FlowState }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-flow-change': ZnFlowChangeEvent;
  }
}
