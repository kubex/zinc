import type {FlowGroup, FlowNodeType} from './flow.types';

/**
 * Holds the set of {@link FlowNodeType}s available to a flow builder. This is
 * the modular extension point: register custom node types here and the steps panel
 * and inspector pick them up automatically.
 */
export class FlowRegistry {
  private types = new Map<string, FlowNodeType>();

  register(type: FlowNodeType): this {
    this.types.set(type.type, type);
    return this;
  }

  registerAll(types: FlowNodeType[]): this {
    types.forEach(t => this.register(t));
    return this;
  }

  get(type: string): FlowNodeType | undefined {
    return this.types.get(type);
  }

  has(type: string): boolean {
    return this.types.has(type);
  }

  all(): FlowNodeType[] {
    return Array.from(this.types.values());
  }

  byGroup(group: FlowGroup): FlowNodeType[] {
    return this.all().filter(t => t.group === group);
  }

  /** Map of category name -> types, preserving insertion order, for one group. */
  categories(group: FlowGroup): Map<string, FlowNodeType[]> {
    const out = new Map<string, FlowNodeType[]>();
    for (const type of this.byGroup(group)) {
      const key = type.category ?? '';
      const bucket = out.get(key) ?? [];
      bucket.push(type);
      out.set(key, bucket);
    }
    return out;
  }

  clear(): void {
    this.types.clear();
  }
}
