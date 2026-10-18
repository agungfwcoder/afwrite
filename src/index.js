import './style.css';

export { Editor } from './core/editor.js';
export { COMMANDS } from './core/commands.js';
export { BLOCKS } from './core/blocks.js';
export { normalizeUrl } from './core/url.js';
export { sanitize, textToHtml } from './core/sanitize.js';
export { toJSON, fromJSON } from './core/model.js';
export { getStrings, LOCALES } from './i18n.js';
export { BUBBLE, ICONS, TOOLBAR, headingItem, withHeadings } from './icons.js';
export { wysiwygComponent } from './alpine.js';
import plugin from './alpine.js';

export { plugin };
export default plugin;

// Alpine yang dimuat lewat <script> (window.Alpine): plugin didaftarkan otomatis saat Alpine mulai.
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => window.Alpine?.plugin(plugin));
}
