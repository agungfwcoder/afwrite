// Ikon SVG inline (bentuk mengikuti Lucide, lisensi ISC).
const svg = (body) =>
  `<svg class="afw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  redo: svg('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>'),
  codeblock: svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
  image: svg('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
  embed: svg('<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>'),
  hr: svg('<path d="M3 12h18"/><path d="M8 6h8" opacity=".35"/><path d="M8 18h8" opacity=".35"/>'),
  sizeNormal: svg('<path d="M3 3h18"/><path d="M3 21h18"/><rect x="7" y="7" width="10" height="10" rx="1.5"/>'),
  sizeWide: svg('<path d="M3 3h18"/><path d="M3 21h18"/><rect x="4" y="7" width="16" height="10" rx="1.5"/>'),
  sizeFull: svg('<path d="M3 3h18"/><path d="M3 21h18"/><rect x="1" y="7" width="22" height="10" rx="1.5"/>'),
  alt: svg('<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>'),
  trash: svg('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'),
  paragraph: svg('<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>'),
  plus: svg('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  close: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  edit: svg('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>'),
  external: svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
  unlink: svg('<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" x2="8" y1="2" y2="5"/><line x1="2" x2="5" y1="8" y2="8"/><line x1="16" x2="16" y1="19" y2="22"/><line x1="19" x2="22" y1="16" y2="16"/>'),
  bold: svg('<path d="M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8"/>'),
  italic: svg('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
  link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  h2: svg('<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>'),
  h3: svg('<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>'),
  quote: svg('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>'),
  ul: svg('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),
  ol: svg('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>'),
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl+';
const alt = isMac ? '⌥' : 'Alt+';
const shift = isMac ? '⇧' : 'Shift+';

// Bubble toolbar (muncul saat teks diblok).
export const BUBBLE = [
  [
    { command: 'bold', shortcut: `${mod}B` },
    { command: 'italic', shortcut: `${mod}I` },
    { command: 'link', shortcut: `${mod}K` },
  ],
  [
    { command: 'h2', shortcut: `${mod}${alt}2` },
    { command: 'h3', shortcut: `${mod}${alt}3` },
    { command: 'quote', shortcut: `${mod}${shift}9` },
  ],
];

// Toolbar default, dikelompokkan. Setiap grup dipisah garis tipis.
export const TOOLBAR = [
  [
    { command: 'bold', shortcut: `${mod}B` },
    { command: 'italic', shortcut: `${mod}I` },
    { command: 'link', shortcut: `${mod}K` },
  ],
  [
    { command: 'h2', shortcut: `${mod}${alt}2` },
    { command: 'h3', shortcut: `${mod}${alt}3` },
    { command: 'quote', shortcut: `${mod}${shift}9` },
    { command: 'codeblock', shortcut: `${mod}${alt}C` },
  ],
  [
    { command: 'ul', shortcut: `${mod}${shift}8` },
    { command: 'ol', shortcut: `${mod}${shift}7` },
  ],
  [
    { command: 'undo', shortcut: `${mod}Z` },
    { command: 'redo', shortcut: `${mod}${shift}Z` },
  ],
];
