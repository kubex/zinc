import type {Picker, SearchIndex} from 'emoji-mart';

export interface EmojiMart {
  Picker: typeof Picker;
  SearchIndex: typeof SearchIndex;
  data: Record<string, unknown>;
}

let promise: Promise<EmojiMart> | undefined;

// emoji-mart and its data set are large, so they load lazily into their own
// chunks and are initialised once, on first use.
export function loadEmojiMart(): Promise<EmojiMart> {
  promise ??= (async () => {
    const [mart, dataModule] = await Promise.all([
      import('emoji-mart'),
      import('@emoji-mart/data'),
    ]);
    const data = dataModule.default as Record<string, unknown>;
    try {
      void mart.init({data});
    } catch {
      // no-op if already initialised
    }
    return {Picker: mart.Picker, SearchIndex: mart.SearchIndex, data};
  })();
  return promise;
}
