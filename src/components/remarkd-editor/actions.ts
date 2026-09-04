import type {SlashMenuItem} from '../slash-menu';

export type ActionGroup =
  'text' | 'lists' | 'admonitions' | 'blocks' | 'structured' | 'media' | 'objects' | 'breaks' | 'logic' | 'inline';

/** What an inline action wraps the selection in. `after` defaults to `before`. */
export interface InlineMark {
  before: string;
  after?: string;
  placeholder?: string;
}

export interface EditorAction {
  /** Stable id, used for toolbar keys and tests. */
  key: string;
  label: string;
  icon: string;
  group: ActionGroup;
  /** Extra search terms for the slash menu, e.g. "bold" finds Strong. */
  keywords?: string[];
  /** Block actions: spliced in as a new block. */
  prefix?: string;
  /** Inline actions: applied to the selection in the open block. */
  inline?: InlineMark;
  /** Where the caret lands within `prefix`. Defaults to the end. */
  caretOffset?: number;
  /** Actions that open their own picker instead of inserting text. */
  opens?: 'image' | 'include' | 'link';
}

/** Toolbar order, most-used first — the last groups are the first to collapse. */
export const ACTION_GROUPS: { id: ActionGroup; label: string }[] = [
  {id: 'text', label: 'Text'},
  // Bold/italic/code are the most-reached actions in any editor — kept right after Text so
  // they are among the last groups to collapse, not the first.
  {id: 'inline', label: 'Inline'},
  {id: 'lists', label: 'Lists'},
  {id: 'admonitions', label: 'Admonitions'},
  {id: 'blocks', label: 'Blocks'},
  {id: 'structured', label: 'Structured'},
  {id: 'media', label: 'Media'},
  {id: 'objects', label: 'Objects'},
  {id: 'breaks', label: 'Breaks'},
  {id: 'logic', label: 'Logic'},
];

export const EDITOR_ACTIONS: EditorAction[] = [
  // Text
  {key: 'text', label: 'Text', icon: 'text@lu', group: 'text', prefix: ''},
  {key: 'paragraphs', label: 'Paragraph', icon: 'pilcrow@lu', group: 'text', prefix: ''},
  {key: 'heading', label: 'Heading 1', icon: 'heading-1@lu', group: 'text', prefix: '# '},
  {key: 'h2', label: 'Heading 2', icon: 'heading-2@lu', group: 'text', prefix: '## '},
  {key: 'h3', label: 'Heading 3', icon: 'heading-3@lu', group: 'text', prefix: '### '},
  {key: 'asciidoc-section', label: 'Section', icon: 'section@lu', group: 'text', prefix: '== '},
  {key: 'attributes-title', label: 'Title', icon: 'captions@lu', group: 'text', prefix: '.'},

  // Lists
  {key: 'unordered-list', label: 'Bullet list', icon: 'list@lu', group: 'lists', prefix: '- ', keywords: ['bullet', 'ul']},
  {key: 'ordered-list', label: 'Numbered list', icon: 'list-ordered@lu', group: 'lists', prefix: '1. ', keywords: ['ol']},
  {key: 'checkboxes', label: 'Checklist', icon: 'list-todo@lu', group: 'lists', prefix: '- [ ] ', keywords: ['task', 'todo']},
  {key: 'definition-list', label: 'Definition list', icon: 'book-a@lu', group: 'lists', prefix: 'Term:: Definition'},

  // Admonitions
  {key: 'admonition', label: 'Note', icon: 'info@lu', group: 'admonitions', prefix: 'NOTE: '},
  {key: 'tip', label: 'Tip', icon: 'lightbulb@lu', group: 'admonitions', prefix: 'TIP: '},
  {key: 'warning', label: 'Warning', icon: 'triangle-alert@lu', group: 'admonitions', prefix: 'WARNING: '},
  {key: 'important', label: 'Important', icon: 'circle-alert@lu', group: 'admonitions', prefix: 'IMPORTANT: '},
  {key: 'caution', label: 'Caution', icon: 'shield-alert@lu', group: 'admonitions', prefix: 'CAUTION: '},
  {key: 'danger', label: 'Danger', icon: 'octagon-alert@lu', group: 'admonitions', prefix: 'DANGER: '},
  {key: 'success', label: 'Success', icon: 'circle-check@lu', group: 'admonitions', prefix: 'SUCCESS: '},
  {key: 'notice', label: 'Notice', icon: 'megaphone@lu', group: 'admonitions', prefix: 'NOTICE: '},

  // Blocks — caretOffset lands inside the delimiters
  {key: 'code-fence', label: 'Code', icon: 'code@lu', group: 'blocks', prefix: '```\n\n```', caretOffset: 4},
  {key: 'blockquotes', label: 'Quote', icon: 'quote@lu', group: 'blocks', prefix: '____\n\n____', caretOffset: 5},
  {key: 'verse', label: 'Verse', icon: 'feather@lu', group: 'blocks', prefix: '[verse]\n____\n\n____', caretOffset: 13},
  {key: 'sidebar-block', label: 'Sidebar', icon: 'panel-right@lu', group: 'blocks', prefix: '****\n\n****', caretOffset: 5},
  {key: 'example-block', label: 'Example', icon: 'square-dashed@lu', group: 'blocks', prefix: '====\n\n====', caretOffset: 5},
  {key: 'literal-block', label: 'Literal', icon: 'file-code@lu', group: 'blocks', prefix: '....\n\n....', caretOffset: 5},
  {key: 'listing-block', label: 'Listing', icon: 'terminal@lu', group: 'blocks', prefix: '----\n\n----', caretOffset: 5},
  {key: 'generic-container', label: 'Container', icon: 'box@lu', group: 'blocks', prefix: '!!!!\n\n!!!!', caretOffset: 5},
  {key: 'hardbreaks', label: 'Hard breaks', icon: 'wrap-text@lu', group: 'blocks', prefix: '[%hardbreaks]\n', keywords: ['line breaks']},

  // Structured
  {key: 'tabs', label: 'Tabs', icon: 'app-window@lu', group: 'structured', prefix: '_|_#first [name=First]\nFirst content', caretOffset: 16},
  {key: 'steps', label: 'Steps', icon: 'list-checks@lu', group: 'structured', prefix: '_|- First step\nDo first', caretOffset: 4},
  {key: 'callout-block', label: 'Callout', icon: 'message-square-code@lu', group: 'structured', prefix: '<1> '},

  // Media
  {key: 'asciidoc-image', label: 'Image', icon: 'image@lu', group: 'media', opens: 'image'},
  {key: 'video', label: 'Video', icon: 'video@lu', group: 'media', prefix: '{{video:ID source=youtube}}', caretOffset: 8},
  {key: 'include', label: 'Include', icon: 'blocks@lu', group: 'media', opens: 'include'},
  // The path placeholder is load-bearing: `t::partial::` with an empty path makes parse() throw.
  {key: 'partial', label: 'Partial', icon: 'file-stack@lu', group: 'media', prefix: 't::partial::path/to/file.remarkd', caretOffset: 12},
  {key: 'reference-list', label: 'Reference list', icon: 'book-marked@lu', group: 'media', prefix: '{{reflist}}'},

  // Objects
  {key: 'button-object', label: 'Button', icon: 'mouse-pointer-click@lu', group: 'objects', prefix: '{{button:action text="Label" href=/}}', caretOffset: 9},
  {key: 'object-macros', label: 'Link object', icon: 'external-link@lu', group: 'objects', prefix: '{{link:https:// text=Label}}', caretOffset: 7},
  {key: 'meter', label: 'Meter', icon: 'gauge@lu', group: 'objects', prefix: '{{meter id=progress min=0 max=10 value=5}}', caretOffset: 11},
  {key: 'object-attributes', label: 'Break object', icon: 'separator-horizontal@lu', group: 'objects', prefix: '{{br}}'},

  // Breaks
  {key: 'horizontal-rule', label: 'Divider', icon: 'minus@lu', group: 'breaks', prefix: '---', keywords: ['rule', 'hr']},
  {key: 'page-break', label: 'Page break', icon: 'scissors-line-dashed@lu', group: 'breaks', prefix: '<<<'},
  {key: 'line-continuation', label: 'Line continuation', icon: 'corner-down-left@lu', group: 'breaks', prefix: ' \\'},

  // Logic — marked in the preview, never evaluated
  {key: 'document-attributes', label: 'Variable', icon: 'variable@lu', group: 'logic', prefix: ':name: value', caretOffset: 1, keywords: ['attribute', 'variable']},
  {key: 'conditionals', label: 'If defined', icon: 'git-branch@lu', group: 'logic', prefix: 'ifdef::flag[]\n\nendif::[]', caretOffset: 7},
  {key: 'ifndef', label: 'If not defined', icon: 'git-branch-minus@lu', group: 'logic', prefix: 'ifndef::flag[]\n\nendif::[]', caretOffset: 8},
  {key: 'iftrue', label: 'If true', icon: 'toggle-right@lu', group: 'logic', prefix: 'iftrue::flag[Shown]', caretOffset: 8},
  {key: 'iffalse', label: 'If false', icon: 'toggle-left@lu', group: 'logic', prefix: 'iffalse::flag[Shown]', caretOffset: 9},
  {key: 'ifempty', label: 'If empty', icon: 'square@lu', group: 'logic', prefix: 'ifempty::flag[Shown]', caretOffset: 9},
  {key: 'ifnempty', label: 'If not empty', icon: 'square-check@lu', group: 'logic', prefix: 'ifnempty::flag[Shown]', caretOffset: 10},
  {key: 'ifeval', label: 'If expression', icon: 'equal@lu', group: 'logic', prefix: 'ifeval::[1 > 0]\n\nendif::[]', caretOffset: 9},

  // Inline — applied to the selection in the open block
  {key: 'inline-formatting', label: 'Strong', icon: 'bold@lu', group: 'inline', keywords: ['bold'], inline: {before: '**', placeholder: 'text'}},
  {key: 'emphasis', label: 'Emphasis', icon: 'italic@lu', group: 'inline', keywords: ['italic'], inline: {before: '__', placeholder: 'text'}},
  {key: 'inline-code', label: 'Code', icon: 'square-code@lu', group: 'inline', inline: {before: '`', placeholder: 'code'}},
  {key: 'underline', label: 'Underline', icon: 'underline@lu', group: 'inline', inline: {before: '___', placeholder: 'text'}},
  {key: 'strike', label: 'Strikethrough', icon: 'strikethrough@lu', group: 'inline', keywords: ['delete'], inline: {before: '~~', placeholder: 'text'}},
  {key: 'subscript', label: 'Subscript', icon: 'subscript@lu', group: 'inline', inline: {before: '~', placeholder: '2'}},
  {key: 'superscript', label: 'Superscript', icon: 'superscript@lu', group: 'inline', inline: {before: '^', placeholder: '2'}},
  {key: 'keyboard', label: 'Keyboard', icon: 'keyboard@lu', group: 'inline', keywords: ['kbd', 'shortcut'], inline: {before: 'kbd:[', after: ']', placeholder: 'Ctrl+C'}},
  {key: 'footnote', label: 'Footnote', icon: 'asterisk@lu', group: 'inline', inline: {before: 'footnote:[', after: ']', placeholder: 'Note'}},
  {key: 'tooltip', label: 'Tooltip', icon: 'message-circle-question-mark@lu', group: 'inline', keywords: ['term'], inline: {before: '{', after: '}(Explanation)', placeholder: 'Term'}},
  {key: 'cross-reference', label: 'Cross reference', icon: 'link-2@lu', group: 'inline', keywords: ['xref'], inline: {before: '<<', after: '>>', placeholder: 'section,Label'}},
  {key: 'links-and-images', label: 'Link', icon: 'link@lu', group: 'inline', inline: {before: '[', after: '](https://)', placeholder: 'Label'}},
  {key: 'document-link', label: 'Link to article', icon: 'file-symlink@lu', group: 'inline', keywords: ['article', 'document', 'kb'], opens: 'link'},
  {key: 'passthrough', label: 'Passthrough', icon: 'shield@lu', group: 'inline', keywords: ['raw', 'literal'], inline: {before: 'pass:[', after: ']', placeholder: 'raw'}},
  {key: 'curly-bang-passthrough', label: 'Literal braces', icon: 'braces@lu', group: 'inline', inline: {before: '{!', after: '!}', placeholder: 'raw'}},
];

/** The registry as slash menu entries. Picker actions insert nothing; the menu emits their action id. */
export function slashItems(actions: EditorAction[]): SlashMenuItem[] {
  const label = (id: ActionGroup) => ACTION_GROUPS.find(group => group.id === id)?.label;
  return actions.map(action => {
    if (action.opens) {
      return {label: action.label, icon: action.icon, action: action.opens, group: label(action.group), keywords: action.keywords};
    }
    // Inline actions have no textarea selection to wrap from the slash menu, so insert the
    // whole construct with the caret at the placeholder — a bare `before` would leave the
    // mark unclosed (`**` with nothing selected to wrap).
    const {before, after = before, placeholder = ''} = action.inline ?? {before: action.prefix ?? ''};
    return {
      label: action.label,
      icon: action.icon,
      group: label(action.group),
      keywords: action.keywords,
      value: action.inline ? before + placeholder + after : before,
      caretOffset: action.inline ? before.length : action.caretOffset,
    };
  });
}
