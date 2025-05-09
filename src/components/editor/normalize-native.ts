export const normalizeNative = (nativeRange: any) => {
  // document.getSelection model has properties startContainer and endContainer
  // shadow.getSelection model has baseNode and focusNode
  // Unify formats to always look like document.getSelection

  if (nativeRange) {
    const range = nativeRange;
    if (range.baseNode) {
      range.startContainer = nativeRange.baseNode;
      range.endContainer = nativeRange.focusNode;
      range.startOffset = nativeRange.baseOffset;
      range.endOffset = nativeRange.focusOffset;

      if (range.endOffset < range.startOffset) {
        range.startContainer = nativeRange.focusNode;
        range.endContainer = nativeRange.baseNode;
        range.startOffset = nativeRange.focusOffset;
        range.endOffset = nativeRange.baseOffset;
      }
    }

    if (range.startContainer) {
      return {
        start: {node: range.startContainer, offset: range.startOffset},
        end: {node: range.endContainer, offset: range.endOffset},
        native: range
      };
    }
  }
  return null;
}
