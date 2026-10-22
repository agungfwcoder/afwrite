// Kerangka markup UI vanilla yang disuntikkan ke elemen `.afw`. Isinya statis; daftar tombol dan
// semua nilai dinamis dipasang oleh src/afwrite.js. Dipakai juga oleh adapter Alpine (src/alpine.js).
//
// Atribut penanda (dibaca sekali saat dipasang):
//   data-afw-action  method yang dipanggil saat tombol diklik
//   data-afw-label   kunci teks untuk title & aria-label (data-afw-key: shortcut di title)
//   data-afw-icon    ikon dari icons.js
//   data-afw-text    kunci teks untuk isi elemen

export const TEMPLATE = `
<div class="afw-toolbar" role="toolbar"></div>

<div class="afw-draft" role="status" style="display: none">
  <span class="afw-draft-text"></span>
  <button type="button" class="afw-draft-btn afw-draft-primary" data-afw-action="restoreDraft" data-afw-text="draftRestore"></button>
  <button type="button" class="afw-draft-btn" data-afw-action="discardDraft" data-afw-text="draftDiscard"></button>
</div>

<div class="afw-body">
  <div data-afw-editor></div>
  <button type="button" class="afw-handle" draggable="true" tabindex="-1" data-afw-label="dragBlock" data-afw-icon="grip"></button>
  <button type="button" class="afw-plus" data-afw-label="addBlock" data-afw-icon="plus"></button>
</div>

<div class="afw-footer" style="display: none">
  <span class="afw-stats-words"></span>
  <span aria-hidden="true">·</span>
  <span class="afw-stats-minutes"></span>
</div>

<div class="afw-bubble afw-bubble-main" role="toolbar">
  <div class="afw-bubble-row afw-bubble-format"></div>

  <!-- Bukan elemen form: editor biasanya berada di dalam form halaman, dan form
       bertingkat dibuang browser. Enter ditangani langsung di input. -->
  <div class="afw-bubble-row afw-link-form">
    <input type="text" class="afw-link-input" autocomplete="off" spellcheck="false">
    <button type="button" class="afw-btn afw-btn-inverse" data-afw-action="applyInput" data-afw-label="save" data-afw-key="Enter" data-afw-icon="check"></button>
    <button type="button" class="afw-btn afw-btn-inverse afw-link-remove" data-afw-action="removeLink" data-afw-label="removeLink" data-afw-icon="unlink"></button>
    <button type="button" class="afw-btn afw-btn-inverse" data-afw-action="cancelInput" data-afw-label="cancel" data-afw-key="Esc" data-afw-icon="close"></button>
    <span class="afw-link-error" style="display: none"></span>
  </div>

  <div class="afw-bubble-row afw-bubble-linkinfo">
    <a class="afw-link-preview" target="_blank" rel="noopener noreferrer">
      <span class="afw-link-href"></span>
      <span class="afw-link-preview-icon" data-afw-icon="external"></span>
    </a>
    <span class="afw-sep"></span>
    <button type="button" class="afw-btn afw-btn-inverse" data-afw-action="editLink" data-afw-label="editLink" data-afw-icon="edit"></button>
    <button type="button" class="afw-btn afw-btn-inverse" data-afw-action="unlink" data-afw-label="removeLink" data-afw-icon="unlink"></button>
  </div>
</div>

<div class="afw-bubble afw-mediabar" role="toolbar" data-afw-label="mediaToolbarLabel">
  <div class="afw-bubble-row">
    <div class="afw-group afw-media-sizes"></div>
    <button type="button" class="afw-btn afw-btn-inverse afw-media-image" data-afw-action="replaceImage" data-afw-label="replaceImage" data-afw-icon="replace"></button>
    <button type="button" class="afw-btn afw-btn-inverse afw-media-image afw-media-alt" data-afw-action="editAlt" data-afw-label="altText" data-afw-icon="alt"></button>
    <button type="button" class="afw-btn afw-btn-inverse" data-afw-action="removeMedia" data-afw-label="removeMedia" data-afw-key="Backspace" data-afw-icon="trash"></button>
  </div>
</div>

<div class="afw-bubble afw-pop" role="toolbar">
  <div class="afw-bubble-row afw-pop-align"></div>
  <div class="afw-pop-colors"></div>
</div>

<div class="afw-toast" role="status" aria-live="polite"></div>

<!-- Slash menu: item dipasang di antara judul dan pesan kosong. -->
<div class="afw-menu" role="listbox" data-afw-label="blocksTitle">
  <div class="afw-menu-title" data-afw-text="blocksTitle"></div>
  <div class="afw-menu-empty" data-afw-text="noResults" style="display: none"></div>
</div>
`;
