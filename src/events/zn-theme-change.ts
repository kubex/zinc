import type {ThemeEditorDevice, ThemeEditorMode} from '../components/theme-editor/theme-editor.component';

export type ZnThemeChangeEvent = CustomEvent<{
  values: {light: Record<string, unknown>; dark: Record<string, unknown>};
  mode: ThemeEditorMode;
  device: ThemeEditorDevice;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-theme-change': ZnThemeChangeEvent;
  }
}
