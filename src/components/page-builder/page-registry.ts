import type {PageSectionType} from './page.types';

/**
 * Holds the set of {@link PageSectionType}s available to a page builder.
 * Register custom section types here (or via slotted templates) and the
 * palette and inspector pick them up automatically.
 */
export class PageSectionRegistry {
  private types = new Map<string, PageSectionType>();

  register(type: PageSectionType): this {
    this.types.set(type.type, type);
    return this;
  }

  registerAll(types: PageSectionType[]): this {
    types.forEach(t => this.register(t));
    return this;
  }

  get(type: string): PageSectionType | undefined {
    return this.types.get(type);
  }

  has(type: string): boolean {
    return this.types.has(type);
  }

  all(): PageSectionType[] {
    return Array.from(this.types.values());
  }

  /** Map of category name -> types, preserving insertion order. Uncategorised under ''. */
  categories(): Map<string, PageSectionType[]> {
    const out = new Map<string, PageSectionType[]>();
    for (const type of this.all()) {
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
