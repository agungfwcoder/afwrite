import { BRAND } from '../brand'
import pkg from '../../package.json'

// Gaya halaman dokumentasi mengikuti referensi "Docs — Instalasi" (mode gelap zinc-950 + aksen emerald),
// dengan padanan mode terang.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    },
    pageHeader: {
      slots: {
        root: 'relative border-0 pt-10 pb-0',
        wrapper: 'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4',
        headline: 'mb-3 text-[13px] font-normal text-muted flex items-center gap-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-sun before:content-[\'\']',
        title: 'text-4xl sm:text-[44px] leading-[1.1] font-extrabold tracking-[-0.03em] text-highlighted',
        description: 'text-lg leading-[1.6] text-muted'
      },
      variants: {
        title: {
          true: { description: 'mt-3' }
        }
      }
    },
    pageAside: {
      slots: {
        root: 'py-8'
      }
    },
    contentSurround: {
      slots: {
        root: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
        link: 'group flex flex-col gap-1 p-5 rounded-xl border border-default bg-muted hover:border-emerald-600 hover:bg-elevated outline-primary/25 focus-visible:outline-3 transition-colors',
        linkLeading: 'flex items-center gap-1.5 p-0 mb-0 rounded-none bg-transparent group-hover:bg-transparent ring-0 text-[13px] text-muted',
        linkLeadingIcon: 'size-3.5 shrink-0 text-muted',
        linkTitle: 'font-bold text-base text-highlighted truncate',
        linkDescription: 'text-sm leading-normal text-muted line-clamp-2'
      },
      variants: {
        direction: {
          right: { link: 'items-end text-end' }
        }
      }
    },
    prose: {
      p: {
        base: 'my-0 mt-4 first:mt-0 leading-[1.75]'
      },
      h2: {
        slots: {
          base: 'mt-14 mb-0 pt-8 border-t border-default text-[26px] leading-tight font-bold tracking-[-0.02em]',
          leading: 'top-9'
        }
      },
      h3: {
        slots: {
          base: 'text-lg font-bold mt-8 mb-3'
        }
      },
      a: {
        base: 'text-emerald-600 dark:text-emerald-300 hover:text-emerald-500 dark:hover:text-emerald-200 underline underline-offset-3 decoration-current/40 border-0 font-normal'
      },
      code: {
        variants: {
          color: {
            neutral: 'border border-default bg-elevated text-zinc-800 dark:text-zinc-200'
          }
        },
        base: 'px-1.5 py-0.5 text-[13px] font-medium rounded-[5px]'
      },
      pre: {
        slots: {
          root: 'my-4',
          header: 'border border-default border-b-0 bg-muted rounded-t-xl ps-4 pe-2 py-2.5 text-[13px]',
          filename: 'text-default text-[13px]',
          base: 'border border-default bg-muted rounded-xl px-5 py-[18px] text-[13px] leading-[1.8]'
        },
        variants: {
          filename: {
            true: { root: 'my-4 [&>pre]:rounded-t-none [&>pre]:my-0' }
          }
        }
      },
      cardGroup: {
        base: 'grid grid-cols-1 sm:grid-cols-2 gap-3 my-8 *:my-0'
      },
      card: {
        slots: {
          base: 'grid grid-cols-[20px_1fr] gap-x-3.5 gap-y-0.5 p-[18px] sm:p-[18px] [&>a]:contents rounded-xl bg-muted hover:border-emerald-600 hover:bg-elevated',
          icon: 'col-start-1 row-start-1 row-span-2 size-5 mt-0.5 mb-0',
          title: 'col-start-2 row-start-1 font-bold',
          description: 'col-start-2 row-start-2 text-sm leading-normal'
        }
      },
      callout: {
        slots: {
          base: 'rounded-xl px-4 py-3.5 my-5 text-sm/[1.65]'
        }
      },
      steps: {
        variants: {
          level: {
            3: '[&>h3]:before:size-8 [&>h3]:before:bg-emerald-600 [&>h3]:before:text-white [&>h3]:before:font-bold [&>h3]:before:-ms-[50.5px] [&>h3]:before:-mt-0.5 [&>h3]:before:ring-default'
          }
        }
      },
      table: {
        slots: {
          root: 'my-5 rounded-xl border border-default bg-muted',
          base: 'border-spacing-0 rounded-xl'
        }
      },
      th: {
        base: 'py-3 px-4 bg-elevated text-highlighted border-0 border-b border-default first:border-s-0'
      },
      td: {
        base: 'py-3.5 px-4 border-0 border-b border-default first:border-s-0 [tr:last-child>&]:border-b-0'
      }
    }
  },
  seo: {
    siteName: BRAND
  },
  header: {
    title: BRAND,
    version: `v${pkg.version.split('.')[0]}`, // hanya versi mayor (lihat CHANGELOG)
    to: '/',
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    nav: [
      { label: 'Dokumentasi', to: '/memulai', match: '^/(memulai(?!/demo)|panduan|integrasi|lainnya/(pengembangan|kredit))' },
      { label: 'Coba langsung', to: '/memulai/demo', match: '^/memulai/demo' },
      { label: 'Catatan rilis', to: '/lainnya/changelog', match: '^/lainnya/changelog' }
    ],
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/agungfwcoder/afwrite',
      'target': '_blank',
      'aria-label': 'Repositori GitHub'
    }]
  },
  footer: {
    credits: `${BRAND} · MIT · Dibangun dengan Tiptap, ProseMirror & Nuxt UI · © ${new Date().getFullYear()}`,
    colorMode: false,
    links: []
  },
  toc: {
    title: 'Di halaman ini',
    bottom: {
      title: 'Tautan',
      edit: 'https://github.com/agungfwcoder/afwrite/edit/main/website/content',
      links: [{
        icon: 'i-lucide-play',
        label: 'Coba editornya',
        to: '/memulai/demo'
      }, {
        icon: 'i-lucide-scroll-text',
        label: 'Catatan rilis',
        to: '/lainnya/changelog'
      }, {
        icon: 'i-lucide-circle-plus',
        label: 'Laporkan masalah',
        to: 'https://github.com/agungfwcoder/afwrite/issues',
        target: '_blank'
      }]
    }
  }
})
