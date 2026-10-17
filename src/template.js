// Markup UI default yang disuntikkan komponen Alpine ke dalam elemen `.afw`.
// Konten editor tidak ada di sini; diisi lewat Editor.setHTML() (sudah disanitasi).

const buttonGroup = (list, extraClass = '') => `
  <template x-for="(group, gi) in ${list}" :key="gi">
    <div class="afw-group">
      <span class="afw-sep" x-show="gi > 0"></span>
      <template x-for="item in group" :key="item.command">
        <button type="button" class="afw-btn ${extraClass}"
                :class="{ 'afw-is-active': isActive(item.command) }"
                :title="\`\${t(item.command)} (\${item.shortcut})\`"
                :aria-label="t(item.command)"
                :aria-pressed="isActive(item.command)"
                :aria-disabled="isDisabled(item.command)"
                @mousedown.prevent
                @click="exec(item.command)"
                x-html="icon(item.command)"></button>
      </template>
    </div>
  </template>`;

export const TEMPLATE = `
<div class="afw-toolbar" role="toolbar" :aria-label="t('toolbarLabel')" x-show="showToolbar && !readOnly"
     @keydown.arrow-right.prevent="moveFocus($event, 1)" @keydown.arrow-left.prevent="moveFocus($event, -1)"
     @keydown.home.prevent="moveFocus($event, -Infinity)" @keydown.end.prevent="moveFocus($event, Infinity)">
  ${buttonGroup('toolbar')}
</div>

<div class="afw-body">
  <div data-afw-editor x-ignore></div>

  <button type="button" class="afw-plus" :class="{ 'afw-is-open': plus.visible }"
          :style="\`top: \${plus.y}px\`"
          :title="t('addBlock')" :aria-label="t('addBlock')"
          @mousedown.prevent @click="openBlockMenu()"
          x-html="icon('plus')"></button>
</div>

<div class="afw-footer" x-show="showStats" x-cloak>
  <span x-text="stats.words + ' ' + t('words')"></span>
  <span aria-hidden="true">·</span>
  <span x-text="stats.minutes + ' ' + t('minutesRead')"></span>
</div>

<!-- Bubble toolbar -->
<!-- Elemen melayang memakai class (bukan x-show) agar ukurannya bisa langsung diukur. -->
<div class="afw-bubble" x-ref="bubble"
     :class="{ 'afw-is-open': bubble.open, 'afw-is-ready': bubble.ready }"
     :style="\`left: \${bubble.x}px; top: \${bubble.y}px\`"
     role="toolbar" :aria-label="t('toolbarLabel')"
     @keydown.escape.prevent.stop="cancelInput()">

  <div class="afw-bubble-row" :class="{ 'afw-is-hidden': bubble.mode !== 'format' }">
    ${buttonGroup('bubbleItems', 'afw-btn-inverse')}
  </div>

  <!-- Bukan elemen form: editor biasanya berada di dalam form halaman, dan form
       bertingkat dibuang browser. Enter ditangani langsung di input. -->
  <!-- Satu input untuk beberapa keperluan: URL link, link video, dan alt text gambar. -->
  <div class="afw-bubble-row afw-link-form" :class="{ 'afw-is-hidden': bubble.mode !== 'input' }">
    <input type="text" class="afw-link-input" x-ref="linkInput" x-model="bubble.url"
           :placeholder="inputPlaceholder()" :aria-label="inputPlaceholder()"
           autocomplete="off" spellcheck="false"
           @input="bubble.error = ''"
           @keydown.enter.prevent="applyInput()"
           @blur="onInputBlur()">
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('save') + ' (Enter)'" x-bind:aria-label="t('save')" @mousedown.prevent @click="applyInput()" x-html="icon('check')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" :class="{ 'afw-is-hidden': !(bubble.purpose === 'link' && bubble.hasLink) }" x-bind:title="t('removeLink')" x-bind:aria-label="t('removeLink')" @mousedown.prevent @click="removeLink()" x-html="icon('unlink')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('cancel') + ' (Esc)'" x-bind:aria-label="t('cancel')" @mousedown.prevent @click="cancelInput()" x-html="icon('close')"></button>
    <span class="afw-link-error" x-show="bubble.error" x-text="bubble.error"></span>
  </div>

  <div class="afw-bubble-row" :class="{ 'afw-is-hidden': bubble.mode !== 'linkinfo' }">
    <a class="afw-link-preview" :href="bubble.href" target="_blank" rel="noopener noreferrer"
       :title="bubble.href" @mousedown.prevent>
      <span x-text="bubble.href"></span>
      <span class="afw-link-preview-icon" x-html="icon('external')"></span>
    </a>
    <span class="afw-sep"></span>
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('editLink')" x-bind:aria-label="t('editLink')" @mousedown.prevent @click="openLinkInput({ href: bubble.href })" x-html="icon('edit')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" x-bind:title="t('removeLink')" x-bind:aria-label="t('removeLink')" @mousedown.prevent @click="exec('unlink')" x-html="icon('unlink')"></button>
  </div>
</div>

<!-- Toolbar media (gambar / video / pemisah yang sedang dipilih) -->
<div class="afw-bubble afw-mediabar" x-ref="mediabar"
     :class="{ 'afw-is-open': media.open, 'afw-is-ready': media.ready }"
     :style="\`left: \${media.x}px; top: \${media.y}px\`"
     role="toolbar" :aria-label="t('mediaToolbarLabel')">
  <div class="afw-bubble-row">
    <template x-if="media.kind !== 'divider'">
      <div class="afw-group">
        <template x-for="size in mediaSizes" :key="size.value">
          <button type="button" class="afw-btn afw-btn-inverse"
                  :class="{ 'afw-is-active': media.size === size.value }"
                  :title="t(size.label)" :aria-label="t(size.label)" :aria-pressed="media.size === size.value"
                  @mousedown.prevent @click="setMediaSize(size.value)"
                  x-html="icon(size.icon)"></button>
        </template>
        <span class="afw-sep"></span>
      </div>
    </template>
    <button type="button" class="afw-btn afw-btn-inverse" x-show="media.kind === 'image'"
            :class="{ 'afw-is-active': !!media.alt }"
            :title="t('altText')" :aria-label="t('altText')"
            @mousedown.prevent @click="editAlt()" x-html="icon('alt')"></button>
    <button type="button" class="afw-btn afw-btn-inverse" :title="t('removeMedia') + ' (Backspace)'" :aria-label="t('removeMedia')"
            @mousedown.prevent @click="removeMedia()" x-html="icon('trash')"></button>
  </div>
</div>

<!-- Pesan error (mis. upload gagal) -->
<div class="afw-toast" role="status" aria-live="polite" :class="{ 'afw-is-open': toast.open }" x-text="toast.message"></div>

<!-- Slash menu -->
<div class="afw-menu" x-ref="menu"
     :class="{ 'afw-is-open': slash.open, 'afw-is-ready': slash.ready }"
     :style="\`left: \${slash.x}px; top: \${slash.y}px\`"
     role="listbox" :id="uid + '-menu'" :aria-label="t('blocksTitle')">
  <div class="afw-menu-title" x-text="t('blocksTitle')"></div>
  <template x-for="(item, i) in slash.items" :key="item.command">
    <button type="button" class="afw-menu-item" role="option" tabindex="-1" :id="uid + '-opt-' + i"
            :class="{ 'afw-is-active': i === slash.index }"
            :aria-selected="i === slash.index"
            @mousedown.prevent
            @mousemove="hoverSlash(i)"
            @click="applySlash(i)">
      <span class="afw-menu-icon" x-html="icon(item.command)"></span>
      <span class="afw-menu-text">
        <span class="afw-menu-label" x-text="item.label"></span>
        <span class="afw-menu-desc" x-text="item.description"></span>
      </span>
      <kbd class="afw-menu-kbd" x-show="item.markdown" x-text="item.markdown"></kbd>
    </button>
  </template>
  <div class="afw-menu-empty" x-show="!slash.items.length" x-text="t('noResults')"></div>
</div>

<template x-if="name">
  <input type="hidden" :name="name" :value="html">
</template>
`;
