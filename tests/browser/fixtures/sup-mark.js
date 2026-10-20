// Extension mark sederhana untuk menguji opsi `extensions` + `sanitize.allowTags`.
import { Mark } from '@tiptap/core';

export const Sup = Mark.create({
  name: 'sup',
  parseHTML: () => [{ tag: 'sup' }],
  renderHTML: () => ['sup', 0],
  addKeyboardShortcuts() {
    return { 'Mod-.': () => this.editor.commands.toggleMark('sup') };
  },
});
