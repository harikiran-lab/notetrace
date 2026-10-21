const inter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const system = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_THEMES = [
  { id: 'default', name: 'Original', body: inter, title: "'Newsreader', Georgia, serif" },
  { id: 'manrope', name: 'Manrope', body: "'Manrope', " + inter },
  { id: 'nunito', name: 'Nunito Sans', body: "'Nunito Sans', " + inter },
  { id: 'lora', name: 'Lora', body: "'Lora', Georgia, serif" },
  { id: 'mono', name: 'Roboto Mono', body: "'Roboto Mono', ui-monospace, monospace" },
  { id: 'system', name: 'System', body: system },
];

export function fontThemeFor(value) {
  return FONT_THEMES.find(theme => theme.id === value) || FONT_THEMES[0];
}

export function applyFontTheme(value, root = document.documentElement) {
  const theme = fontThemeFor(value);
  root.style.setProperty('--font-sans', theme.body);
  root.style.setProperty('--font-note-title', theme.title || theme.body);
}
