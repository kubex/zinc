import type {FlowConnection} from '../components/flow-builder/flow.types';

export type ZnFlowConnectEvent = CustomEvent<{ connection: FlowConnection }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-flow-connect': ZnFlowConnectEvent;
  }
}
