import { useEffect, useRef } from 'react';
import { create } from 'afwrite';
import 'afwrite/style.css';

// <Afwrite value={html} onChange={setHtml} options={{ lang: 'en', upload }} />
export function Afwrite({ value = '', onChange, options }) {
  const host = useRef(null);
  const editor = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const instance = create(host.current, { ...options, content: value });
    instance.on('change', ({ html }) => onChangeRef.current?.(html));
    editor.current = instance;
    return () => {
      instance.destroy();
      editor.current = null;
    };
  }, []); // opsi dibaca sekali saat dipasang

  // Nilai dari luar -> editor (dilewati bila isinya sama, agar kursor tidak melompat).
  useEffect(() => {
    const instance = editor.current;
    if (!instance) return;
    const current = instance.getHTML();
    if (value !== current && instance.editor.normalizeHTML(value) !== current) instance.setHTML(value);
  }, [value]);

  // React tidak merender isi div ini; isinya milik afwrite.
  return <div ref={host} />;
}
