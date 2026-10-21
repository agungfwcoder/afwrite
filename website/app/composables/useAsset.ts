// URL berkas di public/ dengan baseURL (GitHub Pages: /afwrite/) dan ?v= dari isi berkasnya
// (assetVersions di nuxt.config.ts). Pakai untuk logo, favicon, ikon, dan og.png.
export function useAsset(file: string) {
  const { app, public: config } = useRuntimeConfig()
  const version = (config.assetVersions as Record<string, string> | undefined)?.[file]
  return `${app.baseURL}${file}${version ? `?v=${version}` : ''}`
}
