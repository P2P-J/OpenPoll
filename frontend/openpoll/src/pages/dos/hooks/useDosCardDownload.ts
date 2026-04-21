import { toPng } from 'html-to-image'
import { useCallback } from 'react'

export function useDosCardDownload() {
  return useCallback(async (el: HTMLElement | null, typeId: string) => {
    if (!el) return
    try {
      const dataUrl = await toPng(el, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFF9E6',
      })
      const link = document.createElement('a')
      link.download = `openpoll-dos-${typeId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('[useDosCardDownload] 저장 실패:', err)
      throw err
    }
  }, [])
}
