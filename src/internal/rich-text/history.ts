export interface Snapshot {
  html: string;
  selection: {index: number; length: number} | null;
}

// Keystrokes closer together than this undo as one step
const MERGE_WINDOW = 500;
const LIMIT = 100;
// Characters of HTML kept for undo; an inserted photo alone can be millions
const BUDGET = 20_000_000;

export class History {
  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  private current: Snapshot;
  private lastTyped = 0;

  constructor(initial: Snapshot) {
    this.current = initial;
  }

  reset(snapshot: Snapshot) {
    this.undoStack = [];
    this.redoStack = [];
    this.current = snapshot;
    this.lastTyped = 0;
  }

  record(snapshot: Snapshot, typing = false) {
    if (snapshot.html === this.current.html) {
      this.current = snapshot;
      return;
    }
    const now = Date.now();
    const merge = typing && now - this.lastTyped < MERGE_WINDOW;
    this.lastTyped = typing ? now : 0;
    if (!merge) {
      this.undoStack.push(this.current);
      this.trim();
    }
    this.redoStack = [];
    this.current = snapshot;
  }

  // Drops the oldest steps past the limits, keeping the latest so one undo always works
  private trim() {
    let size = this.undoStack.reduce((sum, step) => sum + step.html.length, 0);
    while (this.undoStack.length > 1 && (this.undoStack.length > LIMIT || size > BUDGET)) {
      size -= this.undoStack.shift()!.html.length;
    }
  }

  undo(): Snapshot | null {
    const previous = this.undoStack.pop();
    if (!previous) return null;
    this.redoStack.push(this.current);
    this.current = previous;
    this.lastTyped = 0;
    return previous;
  }

  redo(): Snapshot | null {
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(this.current);
    this.trim();
    this.current = next;
    this.lastTyped = 0;
    return next;
  }
}
