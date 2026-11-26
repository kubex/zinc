import {colorDataProvider} from "../../../data-select/providers/color-data-provider";
import {shortcutLabel} from "../../../../internal/rich-text/keymap";
import type {EditorFeatureConfig} from "../../editor.component";
import type {Formats} from "../../../../internal/rich-text/rich-editor";
import type {Shortcut} from "../../../../internal/rich-text/keymap";
import type ZnEditorTool from "./tool/tool.component";

export type ToolGroup = 'block' | 'mark' | 'list' | 'insert' | 'color' | 'ai' | 'custom' | 'history';

/**
 * One toolbar tool. `format` and `value` are what the toolbar passes to its format handler, so a renderer only shows
 * tools and never decides what they do.
 */
export interface ToolDef {
  id: string;
  label: string;
  icon: string;
  group: ToolGroup;
  format?: string;
  value?: string;
  /** A menu shows its options; a picker opens a date or emoji picker beside it. */
  kind: 'button' | 'menu' | 'picker';
  options?: ToolDef[];
  isActive?: (formats: Formats) => boolean;
  shortcut?: Shortcut;
  /** Part of the small toolbar that `compact` shows. */
  compact?: boolean;
  /** Shown only in that small toolbar, where it stands in for something the full one has elsewhere. */
  compactOnly?: boolean;
  /** Offered in the `/` menu as well, under its label. */
  slash?: boolean;
  keywords?: string;
}

// The palette, saved as these values and drawn from them, so a swatch matches its text in every theme and viewer.
// Keep in step with the theme's light-mode colours that zn-color-select shows; a toolbar test compares them.
const COLOR_VALUES: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  orange: '#f97316',
  yellow: '#ffdb0f',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  green: '#22c55e',
  pink: '#ec4899',
  gray: '#66768e',
};

const probe = document.createElement('span');

// The editor reads a colour back as the browser writes it, rgb() for a hex value
function sameColor(a: unknown, b: string) {
  if (typeof a !== 'string' || !a) return false;
  probe.style.color = b;
  const expected = probe.style.color;
  probe.style.color = a;
  return probe.style.color === expected;
}

/** The tool's label with its shortcut, as a tooltip shows it. */
export function toolTitle(tool: ToolDef) {
  return tool.shortcut ? `${tool.label} (${shortcutLabel(tool.shortcut)})` : tool.label;
}

const mark = (id: string, label: string, icon: string, key?: string): ToolDef => ({
  id, label, icon, group: 'mark', format: id, kind: 'button', slash: true, keywords: id,
  isActive: f => !!f[id],
  shortcut: key ? {key} : undefined,
});

const block = (id: string, label: string, icon: string, format: string, value?: string): ToolDef => ({
  id, label, icon, group: 'block', format, value, kind: 'button', slash: true, keywords: `${format},${id}`,
  isActive: value === undefined ? f => !!f[format] : f => String(f[format] ?? '') === value,
});

const listTool = (id: string, label: string, icon: string, value: string): ToolDef => ({
  id, label, icon, group: 'list', format: 'list', value, kind: 'button', slash: true, keywords: `list,${value}`,
  isActive: f => f.list === value,
});

const insert = (id: string, label: string, icon: string, kind: ToolDef['kind'] = 'button'): ToolDef => ({
  id, label, icon, group: 'insert', format: id, kind, slash: true, keywords: id,
});

/** The tools an editor offers, in toolbar order, from its feature flags and its slotted `zn-editor-tool`s. */
export function toolsFor(config: EditorFeatureConfig, customTools: ZnEditorTool[] = []): ToolDef[] {
  const paragraph: ToolDef = {
    id: 'paragraph', label: 'Paragraph', icon: 'pilcrow@lu', group: 'block', format: 'header', value: '',
    kind: 'button', slash: true, keywords: 'header,paragraph,normal',
    isActive: f => !f.header && !f.blockquote && !f['code-block'],
  };
  const blocks: ToolDef[] = [
    paragraph,
    block('heading-1', 'Heading 1', 'heading-1@lu', 'header', '1'),
    block('heading-2', 'Heading 2', 'heading-2@lu', 'header', '2'),
    block('blockquote', 'Quote', 'text-quote@lu', 'blockquote'),
    ...(config.codeBlocksEnabled ? [block('code-block', 'Code block', 'square-code@lu', 'code-block')] : []),
  ];
  const colors: ToolDef[] = [
    {id: 'color-unset', label: 'Default', icon: 'brush-cleaning@lu', group: 'color', format: 'color', value: '',
      kind: 'button', isActive: f => !f.color},
    ...colorDataProvider.getData.map(({key, value}): ToolDef => ({
      id: `color-${key}`, label: value, icon: `color:${key}`, group: 'color', format: 'color', value: COLOR_VALUES[key],
      kind: 'button',
      // Older content saved the palette's names, which browsers draw as their own colours
      isActive: f => sameColor(f.color, COLOR_VALUES[key]) || f.color === key,
    })),
  ];

  const refine: ToolDef = {id: 'refine', label: 'Refine with AI', icon: 'sparkles@lu', group: 'ai', format: 'ai-refine', kind: 'button'};
  const codeBlock = blocks.find(tool => tool.id === 'code-block');
  const tools: ToolDef[] = [
    {id: 'block', label: 'Text style', icon: 'pilcrow@lu', group: 'block', kind: 'menu', options: blocks},
    mark('bold', 'Bold', 'bold@lu', 'b'),
    mark('italic', 'Italic', 'italic@lu', 'i'),
    mark('underline', 'Underline', 'underline@lu', 'u'),
    mark('strike', 'Strikethrough', 'strikethrough@lu'),
    ...(config.codeEnabled ? [mark('code', 'Inline code', 'code@lu')] : []),
    listTool('bullet', 'Bulleted list', 'list@lu', 'bullet'),
    listTool('ordered', 'Numbered list', 'list-ordered@lu', 'ordered'),
    listTool('checked', 'Checklist', 'list-todo@lu', 'checked'),
    ...(config.linksEnabled ? [{...insert('link', 'Link', 'link@lu'), isActive: (f: Formats) => !!f.link, shortcut: {key: 'k'}}] : []),
    ...(config.linksEnabled ? [{...insert('unlink', 'Remove link', 'unlink@lu'), slash: false, compactOnly: true}] : []),
    ...(config.imagesEnabled ? [insert('image', 'Image', 'image@lu')] : []),
    ...(config.videosEnabled ? [insert('video', 'Video', 'video@lu')] : []),
    ...(config.attachmentsEnabled ? [insert('attachment', 'Attachment', 'paperclip@lu')] : []),
    ...(config.dividersEnabled ? [insert('divider', 'Divider', 'minus@lu')] : []),
    ...(config.datesEnabled ? [insert('date', 'Date', 'calendar@lu', 'picker')] : []),
    ...(config.emojisEnabled ? [insert('emoji', 'Emoji', 'smile-plus@lu', 'picker')] : []),
    {id: 'color', label: 'Text colour', icon: 'palette@lu', group: 'color', kind: 'menu', options: colors},
    {id: 'clean', label: 'Clear formatting', icon: 'remove-formatting@lu', group: 'color', format: 'clean',
      kind: 'button', slash: true, keywords: 'clean,clear'},
    ...(config.aiEnabled ? [refine] : []),
    ...customTools.map((tool): ToolDef => ({
      id: tool.key || `${tool.handler}-${tool.uri ?? ''}`,
      label: tool.label,
      icon: tool.icon,
      group: 'custom',
      format: tool.handler,
      value: tool.uri,
      kind: 'button',
      slash: tool.contextMenu,
      // A tool that applies a format shows as pressed when the text has it, as a built-in would
      isActive: tool.handler === 'dialog' ? undefined : f => tool.uri ? f[tool.handler] === tool.uri : !!f[tool.handler],
    })),
    {...insert('undo', 'Undo', 'undo@lu'), group: 'history', slash: false, shortcut: {key: 'z'}},
    {...insert('redo', 'Redo', 'redo@lu'), group: 'history', slash: false, shortcut: {key: 'z', shift: true}},
  ];

  const compactIds = new Set(['undo', 'redo', 'bold', 'italic', 'link', 'unlink', 'bullet', 'ordered', 'date', 'emoji']);
  tools.forEach(tool => {
    if (compactIds.has(tool.id) || tool.group === 'custom') tool.compact = true;
  });
  // The compact bar has no block menu, so its code block is a button of its own
  if (codeBlock) {
    tools.splice(tools.findIndex(tool => tool.id === 'checked') + 1, 0,
      {...codeBlock, id: 'code-block-button', group: 'list', compact: true, compactOnly: true, slash: false});
  }
  return tools;
}

/** Every tool a menu or the `/` menu can apply, with menu options flattened in. */
export function flattenTools(tools: ToolDef[]): ToolDef[] {
  return tools.flatMap(tool => tool.kind === 'menu' ? tool.options ?? [] : [tool]);
}
