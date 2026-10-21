# afwrite documentation site

Built on the [Nuxt UI Docs](https://ui.nuxt.com) template (Nuxt 4 + Nuxt Content, MIT license,
see `LICENSE`). The in-page editor demos use the library source directly from `../src`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (.output), pages are prerendered
npm run preview
```

- Pages: `content/` (Markdown + MDC components). Order follows the numeric prefix of file/folder names.
- Live editor: the `::editor-demo` component (`app/components/content/EditorDemo.vue`),
  with `options`, `content`, and `output` props.
- Site identity (title, colors, links): `app/app.config.ts`.
