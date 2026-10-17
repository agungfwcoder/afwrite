import './style.css';

export { Editor } from './core/editor.js';
export { COMMANDS } from './core/commands.js';
export { normalizeUrl } from './core/url.js';
export { sanitize, textToHtml } from './core/sanitize.js';
export { ICONS, TOOLBAR } from './icons.js';
export { wysiwygComponent } from './alpine.js';
import plugin from './alpine.js';

export { plugin };
export default plugin;

// Pemakaian lewat <script> (UMD/CDN): daftar otomatis saat Alpine mulai.
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => window.Alpine?.plugin(plugin));
}
