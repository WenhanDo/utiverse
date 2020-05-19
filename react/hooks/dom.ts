import { useEffect, useMemo, useCallback, useState } from 'react'
import { throttle } from 'lodash'

const hasWindow = typeof window !== 'undefined'

/**
 * 监听窗口尺寸变化事件
 */
export const useResizeListener = (handler?: () => void, wait = 50) => {
  const throttled = useMemo(() => handler && throttle(handler, wait), [handler])
  useEffect(() => {
    if (hasWindow && throttled) {
      window.addEventListener('resize', throttled)
      return () => window.removeEventListener('resize', throttled)
    }
    return undefined
  }, [throttled])
}

const getTargetDimensions = (target: Element | Window) => {
  if (target === window) {
    return {
      top: 0,
      left: 0,
      width: window?.innerWidth,
      height: window?.innerHeight,
    } as const
  }

  return (target as Element).getBoundingClientRect()
}

/**
 * 获取目标元素 top/left/right/height
 */
export const useTargetDimensions = (
  target: Element | Window = window,
  flag = true,
) => {
  const [dimensions, setDimensions] = useState(
    getTargetDimensions(target),
  )

  const handleResize = useCallback(() => {
    setDimensions(getTargetDimensions(target))
  }, [setDimensions])
  useResizeListener(flag ? handleResize : undefined)

  useEffect(() => {
    setDimensions(getTargetDimensions(target))
  }, [target, setDimensions])
  return dimensions
}
