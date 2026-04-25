import { useStore } from '../store'
import { t, type TranslationKey } from '../utils/i18n'

export function useLang() {
  const lang = useStore(s => s.ui.lang)
  return {
    lang,
    t: (key: TranslationKey) => t(lang, key),
  }
}
